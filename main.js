var translation = 0;
var rotation=0.0;
var speed=0.4,gravity;
var posiY=0;
var flag=0;
var obstacle_translation=0;
var obstacle_translation1=0;
var obstacle_rotation=0.0;
var rot=0, rotat=0;
const canvas = document.querySelector('#glcanvas');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
var a= [], collision1_index=0;
var b= [];
var score=0;
var mode=0;
// var s = Document.getElementbyId('s');
// s.innerHTML=score;

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
    attribute vec2 aVCoord;
    attribute vec3 aVertexNormal;

    uniform mat4 uNormalMatrix;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;
    varying highp vec2 vTexCoord;
    varying highp vec3 vLighting;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
      vTexCoord = aVCoord;

      highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
      highp vec3 directionalLightColor = vec3(1, 1, 1);
      highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

       highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);
       highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
      vLighting = ambientLight + (directionalLightColor * directional);
    }
  `;

  // Fragment shader program

  const fsSource = `
    varying lowp vec4 vColor;
    varying highp vec2 vTexCoord;
    varying highp vec3 vLighting;

    uniform sampler2D uSampler;

    void main(void) {
      // gl_FragColor = vColor;
      gl_FragColor = texture2D(uSampler, vTexCoord);

      highp vec4 texelColor = texture2D(uSampler, vTexCoord);
      gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);

    }
  `;

    const fsSourceGreyScale = `
    #ifdef GL_ES
    precision mediump float;
    #endif
    varying lowp vec4 vColor;

    void main(void) {
        float gray = (vColor.r + vColor.g + vColor.b) / 3.0;
        vec3 grayscale = vec3(gray);

        gl_FragColor = vec4(grayscale, vColor.a);
    }
  `;


  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
  const shaderGreyScaleProgram = initShaderProgram(gl, vsSource, fsSourceGreyScale);

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aVevrtexColor and also
  // look up uniform locations.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
      vertexTexture: gl.getAttribLocation(shaderProgram, 'aVCoord'),
      vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),

    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
      sampler: gl.getUniformLocation(shaderProgram, 'uSampler'),

    },
  };

  const programGreyscaleInfo = {
    program: shaderGreyScaleProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderGreyScaleProgram, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderGreyScaleProgram, 'aVertexColor'),
      vertexTexture: gl.getAttribLocation(shaderGreyScaleProgram, 'aVCoord'),
      vertexNormal: gl.getAttribLocation(shaderGreyScaleProgram, 'aVertexNormal'),

    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderGreyScaleProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderGreyScaleProgram, 'uModelViewMatrix'),
      normalMatrix: gl.getUniformLocation(shaderGreyScaleProgram, 'uNormalMatrix'),
      sampler: gl.getUniformLocation(shaderGreyScaleProgram, 'uSampler'),

    },
  };

  

  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  const buffers = initBuffers(gl);
  const buffers1 = initObstaclesBuffers(gl);
  const buffers2 = initObstaclesStationaryBuffers(gl);

  var then = 0;
  texture = loadTexture(gl, './tunnel.jpg');
  texture1 = loadTexture(gl, './block.jpg');
  texture2 = loadTexture(gl, './block1.jpg');

  // Draw the scene repeatedly
  function render(now) {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;
    // score++;

    if(mode==0){
      drawScene(gl, programInfo, buffers, deltaTime, texture);
      drawObstaclesScene(gl, programInfo, buffers1, deltaTime, texture1);
      drawObstaclesStationaryScene(gl, programInfo, buffers2, deltaTime,texture2);

    }
    else{
      drawScene(gl,programGreyscaleInfo, buffers, deltaTime, texture);
      drawObstaclesScene(gl, programGreyscaleInfo, buffers1, deltaTime, texture1);
      drawObstaclesStationaryScene(gl, programGreyscaleInfo, buffers2, deltaTime,texture2);

    }

    
    requestAnimationFrame(render);
    translation +=0.3;
    obstacle_translation+=0.3;
    obstacle_translation1+=0.3;

    // rotation -= 0.02;
    Mousetrap.bind('a', function() { 
      rotation+=0.09;
      rotat+=0.05;
       });
    Mousetrap.bind('d', function() { 
      rotation-=0.09;
      rotat-=0.05;
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

    for(i=0;i<1000;i++)
      if(b[i]>-2 && b[i]<0){
        if(Math.cos(rotat)>0.7071 && Math.cos(rotat)>-0.7071 || Math.cos(rotat)<0.7071 && Math.cos(rotat)>-0.7071 )
          console.log("Collision1");
      }
    Mousetrap.bind('w', function() {
           if(mode==0){
            mode=1;
           }
           else{
            mode=0;
           }

       });

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

function loadTexture(gl, url) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([10, 20, 255, 220]);
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                pixel);

  const image = new Image();
  image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  srcFormat, srcType, image);
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
       gl.generateMipmap(gl.TEXTURE_2D);
    } else {
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = url;
  return texture;
}

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}
