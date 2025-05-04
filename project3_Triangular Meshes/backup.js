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


// [TO-DO] Complete the implementation of the following class.

class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
	constructor()
	{
		//Vertex shader
		const objVS =`
			attribute vec4 a_position;
			attribute vec2 a_texCoord;
			varying vec2 v_texCoord;
			uniform mat4 u_permMatrix;
			uniform mat4 u_mvp
			void main(){
				gl_Position = u_mvp * u_permMatrix * a_position;
				v_texCoord = a_texCoord;
			}
		`;

		//Fragment shader
		const objFS =`
			precision mediump float;
			varying vec2 v_texCoord;

			uniform sampler2D u_texture;
			uniform bool u_showTexture;

			void main()
			{                   
			if (u_showTexture) {
			gl_FragColor = texture2D(u_texture, v_texCoord);
			} else {gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
			 }
			}
		`;

		// Compile shaders
		const vs = this._compileShader(objVS, gl.VERTEX_SHADER);
		const fs = this._compileShader(objFS, gl.FRAGMENT_SHADER);

		// Links the program shader
		this.program = gl.createProgram();
		gl.attachShader(this.program, vs);
		gl.attachShader(this.program, fs);
		gl.linkProgram(this.program);

		// Obtain atttributes location
		this.a_position = gl.getAttribLocation(this.program, "a_position");
		this.a_texCoord = gl.getAttribLocation(this.program, "a_texCoord");

		// Inizializes triangles
		this.numTriangles = 0;

		
		
	}
	}
	// Function to compilare a shader
	_compileShader(source, type) 
	{
		const shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);

		// Error check
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.error("Shader compile error:", gl.getShaderInfoLog(shader));
		}
		return shader;
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

	//takes buffers.positionBuffer, buffers.texCoordBuffer 
	setMesh( vertPos, texCoords )
	{
		//Create and loads the buffer of vertices
		this.positionBuffer = gl.createBuffer();//Create buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);//bind the buffer to ARRAY_BUFFER
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);//Load the buffer
		
		//Create and loads the buffer of texture coordinates
		this.texCoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

		// [TO-DO] Update the contents of the vertex buffer objects.
		this.numTriangles = vertPos.length / 9;
	}
	
	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ( swap )
	{
		gl.useProgram(this.program);

		let permMatrix = [
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		];


		if (swap){
			permMatrix = [
				1, 0, 0, 0,
				0, 0, 1, 0,
				0, 1, 0, 0,
				0, 0, 0, 1
			];
		}
		// Trova la location della uniform nel vertex shader
		const u_permMatrix = gl.getUniformLocation(this.program, "u_permMatrix");

		// Passa la matrice allo shader
		gl.uniformMatrix4fv(u_permMatrix, false, new Float32Array(permMatrix));

		// [TO-DO] Set the uniform parameter(s) of the vertex shader
	}
	
	// This method is called to draw the triangular mesh.
	// The argument is the transformation matrix, the same matrix returned
	// by the GetModelViewProjection function above.
	draw( trans )
	{
		gl.useProgram(this.program);

		// Bind vertex buffer e attrib
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.enableVertexAttribArray(this.a_position);
		gl.vertexAttribPointer(this.a_position, 3, gl.FLOAT, false, 0, 0);
	
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
		gl.enableVertexAttribArray(this.a_texCoord);
		gl.vertexAttribPointer(this.a_texCoord, 2, gl.FLOAT, false, 0, 0);
	
		// Imposta la matrice di trasformazione
		const u_mpv = gl.getUniformLocation(this.program, "u_mvp");
		gl.uniformMatrix4fv(u_mpv, false, new Float32Array(trans));
		
		if (this.texture) {
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, this.texture);
		}
		
		
		// [TO-DO] Complete the WebGL initializations before drawing
		gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles*3 );
		const u_texture = gl.getUniformLocation(this.program, "u_texture");
		gl.uniform1i(u_texture, 0); // usa texture unit 0
	}
	
	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture( img )
	{
		// [TO-DO] Bind the texture
		gl.useProgram(this.program);

		this.texture = gl.createTexture();
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);

		// You can set the texture image data using the following command.
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img );

		// Imposta parametri base
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		// Bind uniform sampler2D alla texture unit 0
		const u_texture = gl.getUniformLocation(this.program, "u_texture");
		gl.uniform1i(u_texture, 0);

		// [TO-DO] Now that we have a texture, it might be a good idea to set
		// some uniform parameter(s) of the fragment shader, so that it uses the texture.
	}
	
	// This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture( show )
	{
		gl.useProgram(this.program);

		const u_showTexture = gl.getUniformLocation(this.program, "u_showTexture");
		gl.uniform1i(u_showTexture, show ? 1 : 0);// [TO-DO] set the uniform parameter(s) of the fragment shader to specify if it should use the texture.
	}
	

