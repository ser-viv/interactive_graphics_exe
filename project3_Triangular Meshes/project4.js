// This function takes the projection matrix, the translation, and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// The given projection matrix is also a 4x4 matrix stored as an array in column-major order.
// You can use the MatrixMult function defined in project4.html to multiply two 4x4 matrices in the same format.
function GetModelViewProjection( projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY )
{
	// [TO-DO] Modify the code below to form the transformation matrix.
	var trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];
	var Mrotx = [
		1, 0, 0, 0,
		0, Math.cos(rotationX), Math.sin(rotationX), 0,
		0, -Math.sin(rotationX), Math.cos(rotationX), 0,
		0, 0, 0, 1
	];

	var Mroty = [
		Math.cos(rotationY), 0, -Math.sin(rotationY), 0,
		0, 1, 0, 0,
		Math.sin(rotationY), 0, Math.cos(rotationY), 0,
		0, 0, 0, 1
	];

	var rot1 = MatrixMult( Mrotx, Mroty );
	trans = MatrixMult( trans, rot1 );
	var mvp = MatrixMult( projectionMatrix, trans );
	return mvp;
}

var meshVS = `
	attribute vec3 vpos;
	attribute vec2 tex;

	uniform mat4 mat;
	uniform bool swapYZ;
	
	varying vec2 vtex;

	void main()
	{
		if (swapYZ)
			gl_Position = mat* vec4(vpos.x, vpos.z, vpos.y, 1);
		else
			gl_Position = mat * vec4(vpos, 1);
		vtex = tex;
	}
`;

var meshFS = `
	precision mediump float;

	varying vec2 vtex;
	
	uniform sampler2D samp;
	uniform bool show;

	void main()
	{
		if (show)
			gl_FragColor = texture2D(samp, vtex);
		else
			gl_FragColor = vec4(1, gl_FragCoord.z*gl_FragCoord.z, 0, 1);
	}
`;
// [TO-DO] Complete the implementation of the following class.

class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
	constructor()
	{
		this.program = InitShaderProgram(meshVS, meshFS);

		//Get the attribute and uniform locations
		this.vpAttrLoc = gl.getAttribLocation(this.program, "vpos");
		this.tcAttrLoc = gl.getAttribLocation(this.program, "tex");
		this.mpvUnifLoc = gl.getUniformLocation(this.program, "mat");
		this.samplerUnifLoc = gl.getUniformLocation(this.program, "samp");
		this.showUnifLoc = gl.getUniformLocation(this.program, "show");
		this.swapYZLoc = gl.getUniformLocation(this.program, "swapYZ");

		//Create the vertex buffer object
		this.numTriangles = 0;
		this.vertexBuffer = gl.createBuffer();
		this.texCoordBuffer = gl.createBuffer();
		this.vertPos = [];
		this.texCoords = [];
		this.showBool = true;
		this.hasTexture = false;
		this.swapYZBool = false;


	}
	
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions
	// and an array of 2D texture coordinates.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords )
	{
		// [TO-DO] Update the contents of the vertex buffer objects.
		this.vertPos = vertPos;
		this.texCoords = texCoords;

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

		
		this.numTriangles = vertPos.length / 3;
	}
	
	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ( swap )
	{
		
		// [TO-DO] Set the uniform parameter(s) of the vertex shader
		if (swap)
			this.swapYZBool = true;
		else
			this.swapYZBool = false;
		this.draw(this.trans);
	}
	
	// This method is called to draw the triangular mesh.
	// The argument is the transformation matrix, the same matrix returned
	// by the GetModelViewProjection function above.
	draw( trans )
	{
		// [TO-DO] Complete the WebGL initializations before drawing

		gl.useProgram(this.program);

		this.trans = trans;
		gl.uniformMatrix4fv(this.mpvUnifLoc, false, trans);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.vertexAttribPointer(this.vpAttrLoc, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.vpAttrLoc);

		gl.uniform1i(this.showUnifLoc, this.showBool && this.hasTexture);
		gl.uniform1i(this.swapYZLoc, this.swapYZBool);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
		gl.vertexAttribPointer(this.tcAttrLoc, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.tcAttrLoc);


		gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles );
	}
	
	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture( img )
	{
		// [TO-DO] Bind the texture
		this.texture = gl.createTexture();

		// Bind the texture
		gl.bindTexture( gl.TEXTURE_2D, this.texture );
		// You can set the texture image data using the following command.
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img );

		// Generate the mipmap
		gl.generateMipmap( gl.TEXTURE_2D );

		// Set the texture parameters
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );

		gl.activeTexture( gl.TEXTURE0 );
		gl.bindTexture( gl.TEXTURE_2D, this.texture );
		console.log("texture bound to unit 0");

		gl.useProgram(this.program);

		gl.uniform1i(this.samplerUnifLoc, 0);
		this.hasTexture = true;
		// [TO-DO] Now that we have a texture, it might be a good idea to set
		// some uniform parameter(s) of the fragment shader, so that it uses the texture.
	}
	
	// This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture( show )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify if it should use the texture.
		if (show)
			this.showBool = true;
		else
			this.showBool = false;
		this.draw(this.trans);
	}
	
}
