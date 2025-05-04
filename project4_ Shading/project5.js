// This function takes the translation and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// You can use the MatrixMult function defined in project5.html to multiply two 4x4 matrices in the same format.
function GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
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
	var trans = MatrixMult( trans, Mrotx );
	var trans =MatrixMult( trans, Mroty );
	//var mv = trans;
	return trans;
}


// [TO-DO] Complete the implementation of the following class.
var meshVS = `
	attribute vec3 vpos;
	attribute vec2 tex;
	attribute vec3 v;

	uniform mat4 mat;
	uniform mat3 mn;
	uniform mat4 mv;
	uniform bool swapYZ;
	
	varying vec2 vtex;
	varying vec3 norm;
	varying vec3 pos;

	void main()
	{
		vec4 pos4;
		if (swapYZ)
		{
			pos4 = vec4(vpos.x, vpos.z, vpos.y, 1);
			norm = mn * vec3(v.x, v.z, v.y);
		}
		else
		{
			pos4 = vec4(vpos, 1);
			norm = mn* v;
		}
		gl_Position = mat * pos4;
		pos = vec3(mv * pos4);
		vtex = tex;
	}
`;

var meshFS = `
	precision mediump float;
	
	uniform sampler2D samp;
	uniform float alpha;
	uniform bool show;
	varying vec2 vtex;
	varying vec3 norm;
	varying vec3 pos;
	uniform vec3 lightdir;

	void main()
	{
		vec3 norm = normalize(norm);
		vec3 cameradir = normalize(-pos);
		vec4 ks = vec4(1.0,1.0,1.0,1.0);
		vec4 kd;
		if (show)
			kd = texture2D(samp, vtex);
		else
			kd= vec4(1, gl_FragCoord.z*gl_FragCoord.z, 0, 1);
			
		float costh = max(0.0, dot(norm,lightdir));
		vec4 diff = kd * costh;
		
		vec3 h = normalize(lightdir + cameradir );
		float cosphi = max(0.0, dot(norm, h ));
		vec4 spec = ks * pow(cosphi, alpha) ;
		
		float a = 0.10;
		vec4 amb = a *kd;
		
		gl_FragColor = diff + spec + amb;
	}
`;
class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
	constructor()
	{
		// [TO-DO] initializations
		this.program = InitShaderProgram(meshVS, meshFS);

		//Get the attribute and uniform locations
		this.vpAttrLoc = gl.getAttribLocation(this.program, "vpos");
		this.tcAttrLoc = gl.getAttribLocation(this.program, "tex");
		this.mpvUnifLoc = gl.getUniformLocation(this.program, "mat");
		this.samplerUnifLoc = gl.getUniformLocation(this.program, "samp");
		this.showUnifLoc = gl.getUniformLocation(this.program, "show");
		this.swapYZLoc = gl.getUniformLocation(this.program, "swapYZ");
		
		this.nAttrLoc = gl.getAttribLocation(this.program, "v");
		this.mvUnifLoc = gl.getUniformLocation(this.program, "mv");
		this.mnUnifLoc = gl.getUniformLocation(this.program, "mn");
		this.lightdirUnifloc = gl.getUniformLocation(this.program, "lightdir");
		this.alphaUnifLoc = gl.getUniformLocation(this.program, "alpha");

		//Create the vertex buffer object
		this.numTriangles = 0;
		this.vertexBuffer = gl.createBuffer();
		this.texCoordBuffer = gl.createBuffer();
		this.vertPos = [];
		this.texCoords = [];
		this.showBool = true;
		this.hasTexture = false;
		this.swapYZBool = false;
		this.normalsBuffer = gl.createBuffer();
		this.alpha = 100;
		this.lightdir = [0, 0, 0];
		
		
		
	}
	
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions,
	// an array of 2D texture coordinates, and an array of vertex normals.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex and every three consecutive 
	// elements in the normals array form a vertex normal.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords, normals )
	{
		this.vertPos = vertPos;
		this.texCoords = texCoords;
		this.normals = normals;

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
	
	
		// [TO-DO] Update the contents of the vertex buffer objects.
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
		this.draw(this.mat, this.mv, this.normal);
	}
	
	// This method is called to draw the triangular mesh.
	// The arguments are the model-view-projection transformation matrixMVP,
	// the model-view transformation matrixMV, the same matrix returned
	// by the GetModelViewProjection function above, and the normal
	// transformation matrix, which is the inverse-transpose of matrixMV.
	draw( matrixMVP, matrixMV, matrixNormal )
	{
		// [TO-DO] Complete the WebGL initializations before drawing
		gl.useProgram(this.program);

		this.mat = matrixMVP;
		gl.uniformMatrix4fv(this.mpvUnifLoc, false, matrixMVP);

		this.mv = matrixMV;
		gl.uniformMatrix4fv(this.mvUnifLoc, false, matrixMV);
		
		this.normal = matrixNormal;
		gl.uniformMatrix3fv(this.mnUnifLoc, false, matrixNormal);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.vertexAttribPointer(this.vpAttrLoc, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.vpAttrLoc);

		gl.uniform1i(this.showUnifLoc, this.showBool && this.hasTexture);
		gl.uniform1i(this.swapYZLoc, this.swapYZBool);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
		gl.vertexAttribPointer(this.tcAttrLoc, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.tcAttrLoc);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
		gl.vertexAttribPointer(this.nAttrLoc, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.nAttrLoc);

		gl.uniform3fv(this.lightdirUnifloc, this.lightdir);
		gl.uniform1f(this.alphaUnifLoc, this.alpha);

		gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles );
	}
	
	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture( img )
	{
		// [TO-DO] Bind the texture
		this.texture = gl.createTexture();

		gl.bindTexture( gl.TEXTURE_2D, this.texture );
		// You can set the texture image data using the following command.
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img );

		gl.generateMipmap( gl.TEXTURE_2D );

		// Set the texture parameters
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );

		gl.activeTexture( gl.TEXTURE0 );
		gl.bindTexture( gl.TEXTURE_2D, this.texture );

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
		this.draw(this.mat, this.mv, this.normal);
	}
	
	// This method is called to set the incoming light direction
	setLightDir( x, y, z )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the light direction.
		this.lightdir = [x, y, z];
	}
	
	// This method is called to set the shininess of the material
	setShininess( shininess )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the shininess.
		this.alpha = shininess;
	}
}
