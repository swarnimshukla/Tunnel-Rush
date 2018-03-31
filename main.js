var translation = 0;
var rotation=0.0;
var speed=0.4,gravity;
var posiY=0;
var flag=0;
var obstacle_translation=0;
var obstacle_rotation=0.0;
var rot=0, rotat=0;
const canvas = document.querySelector('#glcanvas');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
var a= [], collision1_index=0;
var collision2= [];

main();

//
// Start here
//
function main() {

  // If we don't have a GL context, give up now

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Vertex shader program

  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
  `;

  // Fragment shader program

  const fsSource = `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
    }
  `;

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aVevrtexColor and also
  // look up uniform locations.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
    },
  };

  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  const buffers = initBuffers(gl);
  const buffers1 = initObstaclesBuffers(gl);
  const buffers2 = initObstaclesStationaryBuffers(gl);

  var then = 0;

  // Draw the scene repeatedly
  function render(now) {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;

    drawScene(gl, programInfo, buffers, deltaTime);
    drawObstaclesScene(gl, programInfo, buffers1, deltaTime);
    drawObstaclesStationaryScene(gl, programInfo, buffers2, deltaTime);

    requestAnimationFrame(render);
    translation +=0.3;
    obstacle_translation+=0.3;
    // rotation -= 0.02;
    Mousetrap.bind('a', function() { 
      rotation+=0.09;
      rotat-=0.05;
       });
    Mousetrap.bind('d', function() { 
      rotation-=0.09;
      rotat+=0.05;
       });
    Mousetrap.bind('space', function() {
           flag=1;
       });
    if(flag==1){
     gravity= -0.020;    
     posiY += speed;
     speed += gravity;
     if(posiY<0){
      posiY=0;
      flag=0;
      speed=0.4;
     }
    }
    for(i=0;i<1000;i++)
      if(a[i]>-2 && a[i]<0){
        if(Math.cos(rot)<0.7071 && Math.cos(rot)>-0.7071)
          console.log("Collision");
      }
    // console.log(rot);     
  }
  requestAnimationFrame(render);
}


//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

