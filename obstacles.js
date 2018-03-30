//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple three-dimensional cube.
function initObstaclesBuffers(gl) {

  // Create a buffer for the cube's vertex positions.

  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now create an array of positions for the cube.
   
      var positions= [];

      var n=8,ran, i, index=0;
      var p = 3.14159, angle = 0, theta=(2*p)/n;
      positions[index++]= 4*Math.cos(angle);
      positions[index++]= 4*Math.sin(angle); 
      positions[index++]= 0;
      angle+=theta;
      positions[index++]= 4*Math.cos(angle);
      positions[index++]= 4*Math.sin(angle); 
      positions[index++]= 0;
      angle+=theta;
      angle+=theta;
      angle+=theta;
      positions[index++]= 4*Math.cos(angle);
      positions[index++]= 4*Math.sin(angle); 
      positions[index++]= 0;
      angle+=theta;
      positions[index++]= 4*Math.cos(angle);
      positions[index++]= 4*Math.sin(angle); 
      positions[index++]= 0;
      
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    
  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.


  // Now set up the colors for the faces. We'll use solid colors
  // for each face.
    const faceColors = [
        // [1.0,  1.0,  1.0,  1.0],    // Front face: white
        [1.0,  0.0,  0.0,  1.0],    // Back face: red
        // [0.0,  1.0,  0.0,  1.0],    // Top face: green
        // [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
        // [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
        // [1.0,  0.5,  0.0,  1.0],    // Left face: purple
        // [1.0,  0.0,  1.0,  1.0],    // Left face: purple
        // [0.3,  0.3,  1.0,  1.0],    // Left face: purple
  
      ];
  
      // Convert the array of colors into a table for all the vertices.
  
      var colors = [];
  
      for (var j = 0; j < faceColors.length; ++j) {
        const c = faceColors[j];
  
        // Repeat each color four times for the four vertices of the face
        colors = colors.concat(c, c, c, c);
      }
  
      const colorBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  
      // Build the element array buffer; this specifies the indices
      // into the vertex arrays for each face's vertices.
  
      const indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  
      // This array defines each face as two triangles, using the
      // indices into the vertex array to specify each triangle's
      // position.
      
      const indices = [
        0,  1,  2,      0,  2,  3,    // front
      ];
  
      // Now send the element array to GL
  
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
          new Uint16Array(indices), gl.STATIC_DRAW);
  
    return {
      position: positionBuffer,
      color: colorBuffer,
      indices: indexBuffer,
    };
}

//
// Draw the scene.
//
function drawObstaclesScene(gl, programInfo, buffers1, deltaTime) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  var loop1,cou=0;
  for(loop1 =1; loop1 < 1000;loop1++){
    // var randomnumber = Math.floor(Math.random() * (7 - 0 + 1)) + 0;
    
    if(loop1%18==0){
        const modelViewMatrix = mat4.create();
          // Now move the drawing position a bit to where we want to
          // start drawing the square.
          mat4.translate(modelViewMatrix,     // destination matrix
                         modelViewMatrix,     // matrix to translate
                         [-0.0, 2.5 - posiY, -4.0*loop1+150+obstacle_translation]);  // amount to translate
          mat4.rotate(modelViewMatrix,  // destination matrix
                      modelViewMatrix,  // matrix to rotate
                      rot,     // amount to rotate in radians
                      [0, 0, 1]);       // axis to rotate around (Z)
          
          // Tell WebGL how to pull out the positions from the position
          // buffer into the vertexPosition attribute
          {
            const numComponents = 3;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers1.position);
            gl.vertexAttribPointer(
                programInfo.attribLocations.vertexPosition,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            gl.enableVertexAttribArray(
                programInfo.attribLocations.vertexPosition);
          }
    
          // Tell WebGL how to pull out the colors from the color buffer
          // into the vertexColor attribute.
          {
            const numComponents = 4;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers1.color);
            gl.vertexAttribPointer(
                programInfo.attribLocations.vertexColor,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            gl.enableVertexAttribArray(
                programInfo.attribLocations.vertexColor);
          }
    
          // Tell WebGL which indices to use to index the vertices
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers1.indices);
    
          // Tell WebGL to use our program when drawing
    
          gl.useProgram(programInfo.program);
    
          // Set the shader uniforms
    
          gl.uniformMatrix4fv(
              programInfo.uniformLocations.projectionMatrix,
              false,
              projectionMatrix);
          gl.uniformMatrix4fv(
              programInfo.uniformLocations.modelViewMatrix,
              false,
              modelViewMatrix);
    
          {
            const vertexCount = 6;
            const type = gl.UNSIGNED_SHORT;
            const offset = 0;
            gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
        }
    } 
  
    //   Update the rotation for the next draw
  
    rot += (deltaTime*0.002);
  }
}
