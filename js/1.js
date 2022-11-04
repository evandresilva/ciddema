// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"eOZP":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.throwWarning = throwWarning;
exports.throwError = throwError;
exports.generateUUID = generateUUID;
exports.isPowerOf2 = isPowerOf2;
exports.lerp = lerp;

/***
 Throw a console warning with the passed arguments
 ***/
let warningThrown = 0;

function throwWarning() {
  if (warningThrown > 100) {
    return;
  } else if (warningThrown === 100) {
    console.warn("Curtains: too many warnings thrown, stop logging.");
  } else {
    const args = Array.prototype.slice.call(arguments);
    console.warn.apply(console, args);
  }

  warningThrown++;
}
/***
 Throw a console error with the passed arguments
 ***/


function throwError() {
  const args = Array.prototype.slice.call(arguments);
  console.error.apply(console, args);
}
/***
 Generates an universal unique identifier
 ***/


function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    let r = Math.random() * 16 | 0,
        v = c === 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16).toUpperCase();
  });
}
/***
 Check whether a number is power of 2

 params:
 @value (float): number to check
 ***/


function isPowerOf2(value) {
  return (value & value - 1) === 0;
}
/***
 Linear interpolation between two numbers

 params:
 @start (float): value to lerp
 @end (float): end value to use for lerp
 @amount (float): amount of lerp
 ***/


function lerp(start, end, amount) {
  return (1 - amount) * start + amount * end;
}
},{}],"IiTt":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Scene = void 0;

var _utils = require("../utils/utils.js");

/***
 Here we create our Scene object
 The Scene will stack all the objects that will be drawn (planes and shader passes) in different arrays, and call them in the right order to be drawn.

 Based on the concept exposed here https://webglfundamentals.org/webgl/lessons/webgl-drawing-multiple-things.html
 The idea is to optimize the order of the rendered object so that the WebGL calls are kept to a strict minimum

 Planes will be placed in two groups: opaque (drawn first) and transparent (drawn last) objects
 We will also group them by their program IDs (planes that shares their programs are stacked together)

 params:
 @renderer (Renderer class object): our renderer class object

 returns :
 @this: our Scene
 ***/
class Scene {
  constructor(renderer) {
    this.type = "Scene";

    if (!renderer || renderer.type !== "Renderer") {
      (0, _utils.throwError)(this.type + ": Renderer not passed as first argument", renderer);
    } else if (!renderer.gl) {
      (0, _utils.throwError)(this.type + ": Renderer WebGL context is undefined", renderer);
    }

    this.renderer = renderer;
    this.gl = renderer.gl;
    this.initStacks();
  }
  /***
   Init our Scene stacks object
   ***/


  initStacks() {
    this.stacks = {
      "opaque": {
        length: 0,
        programs: [],
        order: []
      },
      "transparent": {
        length: 0,
        programs: [],
        order: []
      },
      "renderPasses": [],
      "scenePasses": []
    };
  }
  /*** RESET STACKS ***/

  /***
   Reset the plane stacks (used when disposing a plane)
   ***/


  resetPlaneStacks() {
    // clear the plane stacks
    this.stacks.opaque = {
      length: 0,
      programs: [],
      order: []
    };
    this.stacks.transparent = {
      length: 0,
      programs: [],
      order: []
    }; // rebuild them with the new plane indexes

    for (let i = 0; i < this.renderer.planes.length; i++) {
      this.addPlane(this.renderer.planes[i]);
    }
  }
  /***
   Reset the shader pass stacks (used when disposing a shader pass)
   ***/


  resetShaderPassStacks() {
    // now rebuild the drawStacks
    // start by clearing all drawstacks
    this.stacks.scenePasses = [];
    this.stacks.renderPasses = []; // restack our planes with new indexes

    for (let i = 0; i < this.renderer.shaderPasses.length; i++) {
      this.renderer.shaderPasses[i].index = i;

      if (this.renderer.shaderPasses[i]._isScenePass) {
        this.stacks.scenePasses.push(this.renderer.shaderPasses[i].index);
      } else {
        this.stacks.renderPasses.push(this.renderer.shaderPasses[i].index);
      }
    } // reset the scenePassIndex if needed


    if (this.stacks.scenePasses.length === 0) {
      this.renderer.state.scenePassIndex = null;
    }
  }
  /*** ADDING PLANES ***/

  /***
   Add a new entry to our opaque and transparent programs arrays
   ***/


  initProgramStack(programID) {
    this.stacks["opaque"]["programs"]["program-" + programID] = [];
    this.stacks["transparent"]["programs"]["program-" + programID] = [];
  }
  /***
   This function will stack planes by opaqueness/transparency, program ID and then indexes
   Stack order drawing process:
   - draw opaque then transparent planes
   - for each of those two stacks, iterate through the existing programs (following the "order" array) and draw their respective planes
   This is done to improve speed, notably when using shared programs, and reduce GL calls
     params:
   @plane (Plane object): plane to add to our scene
   ***/


  addPlane(plane) {
    if (!this.stacks["opaque"]["programs"]["program-" + plane._program.id]) {
      this.initProgramStack(plane._program.id);
    }

    const stackType = plane._transparent ? "transparent" : "opaque";
    let stack = this.stacks[stackType];

    if (stackType === "transparent") {
      stack["programs"]["program-" + plane._program.id].unshift(plane.index); // push to the order array only if it's not already in there


      if (!stack["order"].includes(plane._program.id)) {
        stack["order"].unshift(plane._program.id);
      }
    } else {
      stack["programs"]["program-" + plane._program.id].push(plane.index); // push to the order array only if it's not already in there


      if (!stack["order"].includes(plane._program.id)) {
        stack["order"].push(plane._program.id);
      }
    }

    stack.length++;
  }
  /***
   This function will remove a plane from our scene. This just reset the plane stacks for now.
   Useful if we'd want to change the way our draw stacks work and keep the logic separated from our renderer
     params:
   @plane (Plane object): plane to remove from our scene
   ***/


  removePlane(plane) {
    this.resetPlaneStacks();
  }
  /***
   Changing the position of a plane inside the correct plane stack to render it on top of the others
   ***/


  movePlaneToFront(plane) {
    const drawType = plane._transparent ? "transparent" : "opaque";
    let stack = this.stacks[drawType]["programs"]["program-" + plane._program.id];
    stack = stack.filter(index => index !== plane.index);

    if (drawType === "transparent") {
      stack.unshift(plane.index);
    } else {
      stack.push(plane.index);
    }

    this.stacks[drawType]["programs"]["program-" + plane._program.id] = stack; // update order array

    this.stacks[drawType]["order"] = this.stacks[drawType]["order"].filter(programID => programID !== plane._program.id);
    this.stacks[drawType]["order"].push(plane._program.id);
  }
  /*** ADDING POST PROCESSING ***/

  /***
   Add a shader pass to the stack
     params:
   @shaderPass (ShaderPass object): shaderPass to add to our scene
   ***/


  addShaderPass(shaderPass) {
    if (!shaderPass._isScenePass) {
      this.stacks.renderPasses.push(shaderPass.index);
    } else {
      this.stacks.scenePasses.push(shaderPass.index);
    }
  }
  /***
   This function will remove a shader pass from our scene. This just reset the shaderPass stacks for now.
   Useful if we'd want to change the way our draw stacks work and keep the logic separated from our renderer
     params:
   @shaderPass (ShaderPass object): shader pass to remove from our scene
   ***/


  removeShaderPass(shaderPass) {
    this.resetShaderPassStacks();
  }
  /*** DRAWING SCENE ***/

  /***
   Loop through one of our stack (opaque or transparent objects) and draw its planes
   ***/


  drawStack(stackType) {
    for (let i = 0; i < this.stacks[stackType]["order"].length; i++) {
      const programID = this.stacks[stackType]["order"][i];
      const program = this.stacks[stackType]["programs"]["program-" + programID];

      for (let j = 0; j < program.length; j++) {
        const plane = this.renderer.planes[program[j]]; // be sure the plane exists

        if (plane) {
          // draw the plane
          plane._startDrawing();
        }
      }
    }
  }
  /***
   Enable the first Shader pass scene pass
   ***/


  enableShaderPass() {
    if (this.stacks.scenePasses.length && this.stacks.renderPasses.length === 0 && this.renderer.planes.length) {
      this.renderer.state.scenePassIndex = 0;
      this.renderer.bindFrameBuffer(this.renderer.shaderPasses[this.stacks.scenePasses[0]].target);
    }
  }
  /***
   Draw the shader passes
   ***/


  drawShaderPasses() {
    // if we got one or multiple scene passes after the render passes, bind the first scene pass here
    if (this.stacks.scenePasses.length && this.stacks.renderPasses.length && this.renderer.planes.length) {
      this.renderer.state.scenePassIndex = 0;
      this.renderer.bindFrameBuffer(this.renderer.shaderPasses[this.stacks.scenePasses[0]].target);
    } // first the render passes


    for (let i = 0; i < this.stacks.renderPasses.length; i++) {
      this.renderer.shaderPasses[this.stacks.renderPasses[i]]._startDrawing();
    } // then the scene passes


    if (this.stacks.scenePasses.length > 0) {
      for (let i = 0; i < this.stacks.scenePasses.length; i++) {
        this.renderer.shaderPasses[this.stacks.scenePasses[i]]._startDrawing();
      }
    }
  }
  /***
   Draw our scene content
   ***/


  draw() {
    // enable first frame buffer for shader passes if needed
    this.enableShaderPass(); // loop on our stacked planes

    this.drawStack("opaque"); // draw transparent planes if needed

    if (this.stacks["transparent"].length) {
      // clear our depth buffer to display transparent objects
      this.gl.clearDepth(1.0);
      this.gl.clear(this.gl.DEPTH_BUFFER_BIT);
      this.drawStack("transparent");
    } // now render the shader passes


    this.drawShaderPasses();
  }

}

exports.Scene = Scene;
},{"../utils/utils.js":"eOZP"}],"wJ4d":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CacheManager = void 0;

/***
 Here we create a CacheManager class object
 This will store geometries attributes arrays, textures and WebGL programs in arrays
 This helps speed up slow synchronous CPU operations such as WebGL shaders compilations, images decoding, etc.

 returns :
 @this: our CacheManager class object
 ***/
class CacheManager {
  constructor() {
    // never clear cached geometries
    this.geometries = [];
    this.clear();
  }
  /***
   Clear WebGL context depending cache arrays (used on init and context restoration)
   ***/


  clear() {
    // only cache images textures for now
    this.textures = []; // cached programs

    this.programs = [];
  }
  /*** GEOMETRIES ***/

  /***
   Check if this geometry is already in our cached geometries array
     params:
   @definitionID (integer): the geometry ID
   ***/


  getGeometryFromID(definitionID) {
    return this.geometries.find(element => element.id === definitionID);
  }
  /***
   Add a geometry to our cache if not already in it
     params:
   @definitionID  (integer): the geometry ID to add to our cache
   @vertices (array): vertices coordinates array to add to our cache
   @uvs (array): uvs coordinates array to add to our cache
   ***/


  addGeometry(definitionID, vertices, uvs) {
    this.geometries.push({
      id: definitionID,
      vertices: vertices,
      uvs: uvs
    });
  }
  /*** PROGRAMS ***/

  /***
   Compare two shaders strings to detect whether they are equal or not
     params:
   @firstShader (string): shader code
   @secondShader (string): shader code
     returns:
   @isSameShader (bool): whether both shaders are equal or not
   ***/


  isSameShader(firstShader, secondShader) {
    return firstShader.localeCompare(secondShader) === 0;
  }
  /***
   Returns a program from our cache if this program's vertex and fragment shaders code are the same as the one provided
     params:
   @vsCode (string): vertex shader code
   @fsCode (string): fragment shader code
     returns:
   @program (Program class object or null): our program if it has been found
   ***/


  getProgramFromShaders(vsCode, fsCode) {
    return this.programs.find(element => {
      return this.isSameShader(element.vsCode, vsCode) && this.isSameShader(element.fsCode, fsCode);
    });
  }
  /***
   Add a program to our cache
     params :
   @program (Program class object) : program to add to our cache
   ***/


  addProgram(program) {
    this.programs.push(program);
  }
  /*** TEXTURES ***/

  /***
   Check if this source is already in our cached textures array
     params :
   @source (HTML element) : html image, video or canvas element (only images for now)
   ***/


  getTextureFromSource(source) {
    // return the texture if the source is the same and if it's not the same texture
    return this.textures.find(element => element.source && element.source.src === source.src && element.uuid !== element.uuid);
  }
  /***
   Add a texture to our cache if not already in it
     params :
   @texture (Texture class object) : texture to add to our cache
   ***/


  addTexture(texture) {
    const cachedTexture = this.getTextureFromSource(texture.source);

    if (!cachedTexture) {
      this.textures.push(texture);
    }
  }
  /***
   Removes a texture from the cache array
     params :
   @texture (Texture class object) : texture to remove from our cache
   ***/


  removeTexture(texture) {
    // remove from our textures array
    this.textures = this.textures.filter(element => element.uuid !== texture.uuid);
  }

}

exports.CacheManager = CacheManager;
},{}],"GzVu":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CallbackQueueManager = void 0;

/***
 Here we create a CallbackQueueManager class object
 This allows to store callbacks in a queue array with a timeout of 0 to be executed on next render call

 returns:
 @this: our CallbackQueueManager class object
 ***/
class CallbackQueueManager {
  constructor() {
    this.clear();
  }
  /***
   Clears our queue array (used on init)
   ***/


  clear() {
    this.queue = [];
  }
  /***
   Adds a callback to our queue list with a timeout of 0
     params:
   @callback (function): the callback to execute on next render call
   @keep (bool): whether to keep calling that callback on each rendering call or not (act as a setInterval). Default to false
     returns:
   @queueItem: the queue item. Allows to keep a track of it and set its keep property to false when needed
   ***/


  add(callback, keep = false) {
    const queueItem = {
      callback,
      keep,
      timeout: null // keep a reference to the timeout so we can safely delete if afterwards

    };
    queueItem.timeout = setTimeout(() => {
      this.queue.push(queueItem);
    }, 0);
    return queueItem;
  }
  /***
   Executes all callbacks in the queue and remove the ones that have their keep property set to false.
   Called at the beginning of each render call
   ***/


  execute() {
    // execute queue callbacks list
    this.queue.map(entry => {
      if (entry.callback) {
        entry.callback();
      } // clear our timeout


      clearTimeout(this.queue.timeout);
    }); // remove all items that have their keep property set to false

    this.queue = this.queue.filter(entry => entry.keep);
  }

}

exports.CallbackQueueManager = CallbackQueueManager;
},{}],"MgHa":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Renderer = void 0;

var _Scene = require("./Scene.js");

var _CacheManager = require("../utils/CacheManager.js");

var _CallbackQueueManager = require("../utils/CallbackQueueManager.js");

var _utils = require("../utils/utils.js");

/***
 Here we create our Renderer object
 It will create our WebGL context and handle everything that relates to it
 Will create a container, append a canvas, handle WebGL extensions, context lost/restoration events
 Will create a Scene class object that will keep tracks of all added objects
 Will also handle all global WebGL commands, like clearing scene, binding frame buffers, setting depth, blend func, etc.
 Will use a state object to handle all those commands and keep a track of what is being drawned to avoid redundant WebGL calls.

 params:
 @Curtainsparams see Curtains class object

 @onError (function): called when there has been an error while initiating the WebGL context
 @onContextLost (function): called when the WebGL context is lost
 @onContextRestored (function): called when the WebGL context is restored
 @onSceneChange (function): called every time an object has been added/removed from the scene

 returns :
 @this: our Renderer
***/
class Renderer {
  constructor({
    // inherited from Curtains class object
    alpha,
    antialias,
    premultipliedAlpha,
    depth,
    failIfMajorPerformanceCaveat,
    preserveDrawingBuffer,
    stencil,
    container,
    pixelRatio,
    renderingScale,
    production,
    // callbacks passed by the Curtains class object on instantiation
    onError,
    onContextLost,
    onContextRestored,
    onDisposed,
    onSceneChange
  }) {
    this.type = "Renderer"; // context attributes

    this.alpha = alpha;
    this.antialias = antialias;
    this.premultipliedAlpha = premultipliedAlpha;
    this.depth = depth;
    this.failIfMajorPerformanceCaveat = failIfMajorPerformanceCaveat;
    this.preserveDrawingBuffer = preserveDrawingBuffer;
    this.stencil = stencil;
    this.container = container;
    this.pixelRatio = pixelRatio;
    this._renderingScale = renderingScale;
    this.production = production; // callbacks

    this.onError = onError;
    this.onContextLost = onContextLost;
    this.onContextRestored = onContextRestored;
    this.onDisposed = onDisposed; // keep sync between Curtains objects arrays and renderer objects arrays

    this.onSceneChange = onSceneChange; // managing our webgl draw states

    this.initState(); // create the canvas

    this.canvas = document.createElement("canvas"); // set our webgl context

    const glAttributes = {
      alpha: this.alpha,
      premultipliedAlpha: this.premultipliedAlpha,
      antialias: this.antialias,
      depth: this.depth,
      failIfMajorPerformanceCaveat: this.failIfMajorPerformanceCaveat,
      preserveDrawingBuffer: this.preserveDrawingBuffer,
      stencil: this.stencil
    }; // try webgl2 context first

    this.gl = this.canvas.getContext("webgl2", glAttributes);
    this._isWebGL2 = !!this.gl; // fallback to webgl1

    if (!this.gl) {
      this.gl = this.canvas.getContext("webgl", glAttributes) || this.canvas.getContext("experimental-webgl", glAttributes);
    } // WebGL context could not be created


    if (!this.gl) {
      if (!this.production) (0, _utils.throwWarning)(this.type + ": WebGL context could not be created");
      this.state.isActive = false;

      if (this.onError) {
        this.onError();
      }

      return;
    }

    this.initRenderer();
  }
  /***
   Set/reset our context state object
   ***/


  initState() {
    this.state = {
      // if we are currently rendering
      isActive: true,
      isContextLost: true,
      drawingEnabled: true,
      forceRender: false,
      // current program ID
      currentProgramID: null,
      // if we're using depth test or not
      setDepth: null,
      // face culling
      cullFace: null,
      // current frame buffer ID
      frameBufferID: null,
      // current scene pass ID
      scenePassIndex: null,
      // textures
      activeTexture: null,
      unpackAlignment: null,
      flipY: null,
      premultiplyAlpha: null
    };
  }
  /***
   Add a callback queueing manager (execute functions on the next render call, see CallbackQueueManager class object)
   ***/


  initCallbackQueueManager() {
    this.nextRender = new _CallbackQueueManager.CallbackQueueManager();
  }
  /***
   Init our renderer
   ***/


  initRenderer() {
    this.planes = [];
    this.renderTargets = [];
    this.shaderPasses = []; // context is not lost

    this.state.isContextLost = false; // callback queue

    this.initCallbackQueueManager(); // set blend func

    this.setBlendFunc(); // enable depth by default

    this.setDepth(true); // texture cache

    this.cache = new _CacheManager.CacheManager(); // init our scene

    this.scene = new _Scene.Scene(this); // get webgl extensions

    this.getExtensions(); // handling context

    this._contextLostHandler = this.contextLost.bind(this);
    this.canvas.addEventListener("webglcontextlost", this._contextLostHandler, false);
    this._contextRestoredHandler = this.contextRestored.bind(this);
    this.canvas.addEventListener("webglcontextrestored", this._contextRestoredHandler, false);
  }
  /***
   Get all available WebGL extensions based on WebGL used version
   Called on init and on context restoration
   ***/


  getExtensions() {
    this.extensions = [];

    if (this._isWebGL2) {
      this.extensions['EXT_color_buffer_float'] = this.gl.getExtension('EXT_color_buffer_float');
      this.extensions['OES_texture_float_linear'] = this.gl.getExtension('OES_texture_float_linear');
      this.extensions['EXT_texture_filter_anisotropic'] = this.gl.getExtension('EXT_texture_filter_anisotropic');
      this.extensions['WEBGL_lose_context'] = this.gl.getExtension('WEBGL_lose_context');
    } else {
      this.extensions['OES_vertex_array_object'] = this.gl.getExtension('OES_vertex_array_object');
      this.extensions['OES_texture_float'] = this.gl.getExtension('OES_texture_float');
      this.extensions['OES_texture_float_linear'] = this.gl.getExtension('OES_texture_float_linear');
      this.extensions['OES_texture_half_float'] = this.gl.getExtension('OES_texture_half_float');
      this.extensions['OES_texture_half_float_linear'] = this.gl.getExtension('OES_texture_half_float_linear');
      this.extensions['EXT_texture_filter_anisotropic'] = this.gl.getExtension('EXT_texture_filter_anisotropic');
      this.extensions['OES_element_index_uint'] = this.gl.getExtension('OES_element_index_uint');
      this.extensions['OES_standard_derivatives'] = this.gl.getExtension('OES_standard_derivatives');
      this.extensions['EXT_sRGB'] = this.gl.getExtension('EXT_sRGB');
      this.extensions['WEBGL_depth_texture'] = this.gl.getExtension('WEBGL_depth_texture');
      this.extensions['WEBGL_draw_buffers'] = this.gl.getExtension('WEBGL_draw_buffers');
      this.extensions['WEBGL_lose_context'] = this.gl.getExtension('WEBGL_lose_context');
    }
  }
  /*** HANDLING CONTEXT LOST/RESTORE ***/

  /***
   Called when the WebGL context is lost
   ***/


  contextLost(event) {
    this.state.isContextLost = true; // do not try to restore the context if we're disposing everything!

    if (!this.state.isActive) return;
    event.preventDefault();
    this.nextRender.add(() => this.onContextLost && this.onContextLost());
  }
  /***
   Call this method to restore your context
   ***/


  restoreContext() {
    // do not try to restore the context if we're disposing everything!
    if (!this.state.isActive) return;
    this.initState();

    if (this.gl && this.extensions['WEBGL_lose_context']) {
      this.extensions['WEBGL_lose_context'].restoreContext();
    } else {
      if (!this.gl && !this.production) {
        (0, _utils.throwWarning)(this.type + ": Could not restore the context because the context is not defined");
      } else if (!this.extensions['WEBGL_lose_context'] && !this.production) {
        (0, _utils.throwWarning)(this.type + ": Could not restore the context because the restore context extension is not defined");
      }

      if (this.onError) {
        this.onError();
      }
    }
  }
  /***
   Check that all objects and textures have been restored
     returns:
   @isRestored (bool): whether everything has been restored or not
   ***/


  isContextexFullyRestored() {
    let isRestored = true;

    for (let i = 0; i < this.renderTargets.length; i++) {
      if (!this.renderTargets[i].textures[0]._canDraw) {
        isRestored = false;
      }

      break;
    }

    if (isRestored) {
      for (let i = 0; i < this.planes.length; i++) {
        if (!this.planes[i]._canDraw) {
          isRestored = false;
          break;
        } else {
          for (let j = 0; j < this.planes[i].textures.length; j++) {
            if (!this.planes[i].textures[j]._canDraw) {
              isRestored = false;
              break;
            }
          }
        }
      }
    }

    if (isRestored) {
      for (let i = 0; i < this.shaderPasses.length; i++) {
        if (!this.shaderPasses[i]._canDraw) {
          isRestored = false;
          break;
        } else {
          for (let j = 0; j < this.shaderPasses[i].textures.length; j++) {
            if (!this.shaderPasses[i].textures[j]._canDraw) {
              isRestored = false;
              break;
            }
          }
        }
      }
    }

    return isRestored;
  }
  /***
   Called when the WebGL context is restored
   ***/


  contextRestored() {
    this.getExtensions(); // set blend func

    this.setBlendFunc(); // enable depth by default

    this.setDepth(true); // clear texture and programs cache

    this.cache.clear(); // reset draw stacks

    this.scene.initStacks(); // we need to reset everything : planes programs, shaders, buffers and textures !

    for (let i = 0; i < this.renderTargets.length; i++) {
      this.renderTargets[i]._restoreContext();
    }

    for (let i = 0; i < this.planes.length; i++) {
      this.planes[i]._restoreContext();
    } // same goes for shader passes


    for (let i = 0; i < this.shaderPasses.length; i++) {
      this.shaderPasses[i]._restoreContext();
    } // callback if everything is restored


    const isRestoredQueue = this.nextRender.add(() => {
      const isRestored = this.isContextexFullyRestored();

      if (isRestored) {
        isRestoredQueue.keep = false; // start drawing again

        this.state.isContextLost = false;

        if (this.onContextRestored) {
          this.onContextRestored();
        } // we've changed the objects, keep Curtains class in sync with our renderer


        this.onSceneChange(); // force next frame render whatever our drawing flag value

        this.needRender();
      }
    }, true);
  }
  /*** SIZING ***/

  /***
   Updates pixelRatio property
   ***/


  setPixelRatio(pixelRatio) {
    this.pixelRatio = pixelRatio;
  }
  /***
   Set/reset container sizes and WebGL viewport sizes
   ***/


  setSize() {
    if (!this.gl) return; // get our container bounding client rectangle

    const containerBoundingRect = this.container.getBoundingClientRect(); // use the bounding rect values

    this._boundingRect = {
      width: containerBoundingRect.width * this.pixelRatio,
      height: containerBoundingRect.height * this.pixelRatio,
      top: containerBoundingRect.top * this.pixelRatio,
      left: containerBoundingRect.left * this.pixelRatio
    }; // iOS Safari > 8+ has a known bug due to navigation bar appearing/disappearing
    // this causes wrong bounding client rect calculations, especially negative top value when it shouldn't
    // to fix this we'll use a dirty but useful workaround
    // first we check if we're on iOS Safari

    const isSafari = !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if (isSafari && iOS) {
      // if we are on iOS Safari we'll need a custom function to retrieve our container absolute top position
      function getTopOffset(el) {
        let topOffset = 0;

        while (el && !isNaN(el.offsetTop)) {
          topOffset += el.offsetTop - el.scrollTop;
          el = el.offsetParent;
        }

        return topOffset;
      } // use it to update our top value


      this._boundingRect.top = getTopOffset(this.container) * this.pixelRatio;
    }

    this.canvas.style.width = Math.floor(this._boundingRect.width / this.pixelRatio) + "px";
    this.canvas.style.height = Math.floor(this._boundingRect.height / this.pixelRatio) + "px";
    this.canvas.width = Math.floor(this._boundingRect.width * this._renderingScale);
    this.canvas.height = Math.floor(this._boundingRect.height * this._renderingScale);
    this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
  }
  /***
   Resize all our elements: planes, shader passes and render targets
   Their textures will be resized as well
   ***/


  resize() {
    // resize the planes only if they are fully initiated
    for (let i = 0; i < this.planes.length; i++) {
      if (this.planes[i]._canDraw) {
        this.planes[i].resize();
      }
    } // resize the shader passes only if they are fully initiated


    for (let i = 0; i < this.shaderPasses.length; i++) {
      if (this.shaderPasses[i]._canDraw) {
        this.shaderPasses[i].resize();
      }
    } // resize the render targets


    for (let i = 0; i < this.renderTargets.length; i++) {
      this.renderTargets[i].resize();
    } // be sure we'll update the scene even if drawing is disabled


    this.needRender();
  }
  /*** CLEAR SCENE ***/

  /***
   Clear our WebGL scene colors and depth
   ***/


  clear() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }
  /*** FRAME BUFFER OBJECTS ***/

  /***
   Called to bind or unbind a FBO
     params:
   @frameBuffer (frameBuffer): if frameBuffer is not null, bind it, unbind it otherwise
   @cancelClear (bool / undefined): if we should cancel clearing the frame buffer (typically on init & resize)
   ***/


  bindFrameBuffer(frameBuffer, cancelClear) {
    let bufferId = null;

    if (frameBuffer) {
      bufferId = frameBuffer.index; // new frame buffer, bind it

      if (bufferId !== this.state.frameBufferID) {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, frameBuffer._frameBuffer);
        this.gl.viewport(0, 0, frameBuffer._size.width, frameBuffer._size.height); // if we should clear the buffer content

        if (frameBuffer._shouldClear && !cancelClear) {
          this.clear();
        }
      }
    } else if (this.state.frameBufferID !== null) {
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
      this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
    }

    this.state.frameBufferID = bufferId;
  }
  /*** DEPTH ***/

  /***
   Called to set whether the renderer will handle depth test or not
   Depth test is enabled by default
     params:
   @setDepth (boolean): if we should enable or disable the depth test
   ***/


  setDepth(setDepth) {
    if (setDepth && !this.state.depthTest) {
      this.state.depthTest = setDepth; // enable depth test

      this.gl.enable(this.gl.DEPTH_TEST);
    } else if (!setDepth && this.state.depthTest) {
      this.state.depthTest = setDepth; // disable depth test

      this.gl.disable(this.gl.DEPTH_TEST);
    }
  }
  /*** BLEND FUNC ***/

  /***
   Called to set the blending function (transparency)
   ***/


  setBlendFunc() {
    // allows transparency
    // based on how three.js solves this
    this.gl.enable(this.gl.BLEND);

    if (this.premultipliedAlpha) {
      this.gl.blendFuncSeparate(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
    } else {
      this.gl.blendFuncSeparate(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
    }
  }
  /*** FACE CULLING ***/

  /***
   Called to set whether we should cull an object face or not
     params:
   @cullFace (boolean): what face we should cull
   ***/


  setFaceCulling(cullFace) {
    if (this.state.cullFace !== cullFace) {
      this.state.cullFace = cullFace;

      if (cullFace === "none") {
        this.gl.disable(this.gl.CULL_FACE);
      } else {
        // default to back face culling
        const faceCulling = cullFace === "front" ? this.gl.FRONT : this.gl.BACK;
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.cullFace(faceCulling);
      }
    }
  }
  /***
   Tell WebGL to use the specified program if it's not already in use
     params:
   @program (object): a program object
   ***/


  useProgram(program) {
    if (this.state.currentProgramID === null || this.state.currentProgramID !== program.id) {
      this.gl.useProgram(program.program);
      this.state.currentProgramID = program.id;
    }
  }
  /*** PLANES ***/

  /***
   Removes a Plane element (that has already been disposed) from the scene and the planes array
     params:
   @plane (Plane object): the plane to remove
   ***/


  removePlane(plane) {
    if (!this.gl) return; // remove from our planes array

    this.planes = this.planes.filter(element => element.uuid !== plane.uuid); // remove from scene stacks

    this.scene.removePlane(plane);
    plane = null; // clear the buffer to clean scene

    if (this.gl) this.clear(); // we've removed an object, keep Curtains class in sync with our renderer

    this.onSceneChange();
  }
  /*** POST PROCESSING ***/

  /***
   Completely remove a RenderTarget element
     params:
   @renderTarget (RenderTarget object): the render target to remove
   ***/


  removeRenderTarget(renderTarget) {
    if (!this.gl) return; // loop through all planes that might use that render target and reset it

    for (let i = 0; i < this.planes.length; i++) {
      if (this.planes[i].target && this.planes[i].target.uuid === renderTarget.uuid) {
        this.planes[i].target = null;
      }
    }

    this.renderTargets = this.renderTargets.filter(element => element.uuid !== renderTarget.uuid); // update render target indexes

    for (let i = 0; i < this.renderTargets.length; i++) {
      this.renderTargets[i].index = i;
    }

    renderTarget = null; // clear the buffer to clean scene

    if (this.gl) this.clear(); // we've removed an object, keep Curtains class in sync with our renderer

    this.onSceneChange();
  }
  /*** SHADER PASSES ***/

  /***
   Removes a ShaderPass element (that has already been disposed) from the scene and the shaderPasses array
     params:
   @shaderPass (ShaderPass object): the shader pass to remove
   ***/


  removeShaderPass(shaderPass) {
    if (!this.gl) return; // remove from shaderPasses our array

    this.shaderPasses = this.shaderPasses.filter(element => element.uuid !== shaderPass.uuid); // remove from scene stacks

    this.scene.removeShaderPass(shaderPass);
    shaderPass = null; // clear the buffer to clean scene

    if (this.gl) this.clear(); // we've removed an object, keep Curtains class in sync with our renderer

    this.onSceneChange();
  }
  /***
   Enables the render loop
   ***/


  enableDrawing() {
    this.state.drawingEnabled = true;
  }
  /***
   Disables the render loop
   ***/


  disableDrawing() {
    this.state.drawingEnabled = false;
  }
  /***
   Forces the rendering of the next frame, even if disabled
   ***/


  needRender() {
    this.state.forceRender = true;
  }
  /***
   Called at each draw call to render our scene and its content
   Also execute our nextRender callback queue
   ***/


  render() {
    if (!this.gl) return; // clear scene first

    this.clear(); // draw our scene content

    this.scene.draw();
  }
  /*** DISPOSING ***/

  /***
   Delete all cached programs
   ***/


  deletePrograms() {
    // delete all programs from manager
    for (let i = 0; i < this.cache.programs.length; i++) {
      const program = this.cache.programs[i];
      this.gl.deleteProgram(program.program);
    }
  }
  /***
   Dispose our WebGL context and all its objects
   ***/


  dispose() {
    if (!this.gl) return;
    this.state.isActive = false; // be sure to delete all planes

    while (this.planes.length > 0) {
      this.removePlane(this.planes[0]);
    } // we need to delete the shader passes also


    while (this.shaderPasses.length > 0) {
      this.removeShaderPass(this.shaderPasses[0]);
    } // finally we need to delete the render targets


    while (this.renderTargets.length > 0) {
      this.removeRenderTarget(this.renderTargets[0]);
    } // wait for all planes to be deleted before stopping everything


    let disposeQueue = this.nextRender.add(() => {
      if (this.planes.length === 0 && this.shaderPasses.length === 0 && this.renderTargets.length === 0) {
        // clear from callback queue
        disposeQueue.keep = false;
        this.deletePrograms(); // clear the buffer to clean scene

        this.clear();
        this.canvas.removeEventListener("webgllost", this._contextLostHandler, false);
        this.canvas.removeEventListener("webglrestored", this._contextRestoredHandler, false); // lose context

        if (this.gl && this.extensions['WEBGL_lose_context']) {
          this.extensions['WEBGL_lose_context'].loseContext();
        } // clear canvas state


        this.canvas.width = this.canvas.width;
        this.gl = null; // remove canvas from DOM

        this.container.removeChild(this.canvas);
        this.container = null;
        this.canvas = null;
        this.onDisposed && this.onDisposed();
      }
    }, true);
  }

}

exports.Renderer = Renderer;
},{"./Scene.js":"IiTt","../utils/CacheManager.js":"wJ4d","../utils/CallbackQueueManager.js":"GzVu","../utils/utils.js":"eOZP"}],"rhfM":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ScrollManager = void 0;

/***
 Here we create a ScrollManager class object
 This keeps track of our scroll position, scroll deltas and triggers an onScroll callback
 Could either listen to the native scroll event or be hooked to any scroll (natural or virtual) scroll event

 params:
 @xOffset (float): scroll along X axis
 @yOffset (float): scroll along Y axis
 @lastXDelta (float): last scroll delta along X axis
 @lastYDelta (float): last scroll delta along Y axis

 @shouldWatch (bool): if the scroll manager should listen to the scroll event or not. Default to true.

 @onScroll (function): callback to execute each time the scroll values changed

 returns:
 @this: our ScrollManager class object
 ***/
class ScrollManager {
  constructor({
    xOffset = 0,
    yOffset = 0,
    lastXDelta = 0,
    lastYDelta = 0,
    shouldWatch = true,
    onScroll = () => {}
  } = {}) {
    this.xOffset = xOffset;
    this.yOffset = yOffset;
    this.lastXDelta = lastXDelta;
    this.lastYDelta = lastYDelta;
    this.shouldWatch = shouldWatch;
    this.onScroll = onScroll; // keep a ref to our scroll event

    this.handler = this.scroll.bind(this, true);

    if (this.shouldWatch) {
      window.addEventListener("scroll", this.handler, {
        passive: true
      });
    }
  }
  /***
   Called by the scroll event listener
   ***/


  scroll() {
    this.updateScrollValues(window.pageXOffset, window.pageYOffset);
  }
  /***
   Updates the scroll manager X and Y scroll values as well as last X and Y deltas
   Internally called by the scroll handler
   Could be called externally as well if the user wants to handle the scroll by himself
     params:
   @x (float): scroll value along X axis
   @y (float): scroll value along Y axis
   ***/


  updateScrollValues(x, y) {
    // get our scroll delta values
    const lastScrollXValue = this.xOffset;
    this.xOffset = x;
    this.lastXDelta = lastScrollXValue - this.xOffset;
    const lastScrollYValue = this.yOffset;
    this.yOffset = y;
    this.lastYDelta = lastScrollYValue - this.yOffset;

    if (this.onScroll) {
      this.onScroll(this.lastXDelta, this.lastYDelta);
    }
  }
  /***
   Dispose our scroll manager (just remove our event listner if it had been added previously)
   ***/


  dispose() {
    if (this.shouldWatch) {
      window.removeEventListener("scroll", this.handler, {
        passive: true
      });
    }
  }

}

exports.ScrollManager = ScrollManager;
},{}],"Fjgn":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Curtains = void 0;

var _Renderer = require("./Renderer.js");

var _ScrollManager = require("../utils/ScrollManager.js");

var _utils = require("../utils/utils.js");

/***
 Here we create our Curtains object


 params:
 @container (HTML element or string, optional): the container HTML element or ID that will hold our canvas. Could be set later if not passed as parameter here

 (WebGL context parameters)
 @alpha (bool, optional): whether the WebGL context should handle transparency. Default to true.
 @premultipliedAlpha (bool, optional): whether the WebGL context should handle premultiplied alpha. Default to false.
 @antialias (bool, optional): whether the WebGL context should use the default antialiasing. When using render targets, WebGL disables antialiasing, so you can safely set this to false to improve the performance. Default to true.
 @depth (bool, optional): whether the WebGL context should handle depth. Default to true.
 @failIfMajorPerformanceCaveat (bool, optional): whether the WebGL context creation should fail in case of major performance caveat. Default to true.
 @preserveDrawingBuffer (bool, optional): whether the WebGL context should preserve the drawing buffer. Default to false.
 @stencil (bool, optional): whether the WebGL context should handle stencil. Default to false.

 @autoResize (bool, optional): Whether the library should listen to the window resize event and actually resize the scene. Set it to false if you want to handle this by yourself using the resize() method. Default to true.
 @autoRender (bool, optional): Whether the library should create a request animation frame loop to render the scene. Set it to false if you want to handle this by yourself using the render() method. Default to true.
 @watchScroll (bool, optional): Whether the library should listen to the window scroll event. Set it to false if you want to handle this by yourself. Default to true.

 @pixelRatio (float, optional): Defines the pixel ratio value. Use it to limit it on init to increase performance. Default to window.devicePixelRatio.
 @renderingScale (float, optional): Use it to downscale your rendering canvas. May improve performance but will decrease quality. Default to 1 (minimum: 0.25, maximum: 1).

 @production (bool, optional): Whether the library should throw useful console warnings and errors and check shaders and programs compilation status. Default to false.

 returns :
 @this: our Renderer
 ***/
class Curtains {
  constructor({
    // renderer container
    container,
    // webgl params
    alpha = true,
    premultipliedAlpha = false,
    antialias = true,
    depth = true,
    failIfMajorPerformanceCaveat = true,
    preserveDrawingBuffer = false,
    stencil = false,
    autoResize = true,
    autoRender = true,
    watchScroll = true,
    pixelRatio = window.devicePixelRatio || 1,
    renderingScale = 1,
    production = false
  } = {}) {
    this.type = "Curtains"; // if we should use auto resize (default to true)

    this._autoResize = autoResize; // if we should use auto render (default to true)

    this._autoRender = autoRender; // if we should watch the scroll (default to true)

    this._watchScroll = watchScroll; // pixel ratio and rendering scale

    this.pixelRatio = pixelRatio; // rendering scale

    renderingScale = isNaN(renderingScale) ? 1 : parseFloat(renderingScale);
    this._renderingScale = Math.max(0.25, Math.min(1, renderingScale)); // webgl context parameters

    this.premultipliedAlpha = premultipliedAlpha;
    this.alpha = alpha;
    this.antialias = antialias;
    this.depth = depth;
    this.failIfMajorPerformanceCaveat = failIfMajorPerformanceCaveat;
    this.preserveDrawingBuffer = preserveDrawingBuffer;
    this.stencil = stencil;
    this.production = production;
    this.errors = false; // if a container has been provided, proceed to init

    if (container) {
      this.setContainer(container);
    } else if (!this.production) {
      (0, _utils.throwWarning)(this.type + ": no container provided in the initial parameters. Use setContainer() method to set one later and initialize the WebGL context");
    }
  }
  /***
   Set up our Curtains container and start initializing everything
   Called on Curtains instancing if a params container has been provided, could be call afterwards else
   Useful with JS frameworks to init our Curtains class globally and then set the container in a canvas component afterwards to fully instantiate everything
     params:
   @container (HTML element or string): the container HTML element or ID that will hold our canvas
   ***/


  setContainer(container) {
    if (!container) {
      let container = document.createElement("div");
      container.setAttribute("id", "curtains-canvas");
      document.body.appendChild(container);
      this.container = container;
      if (!this.production) (0, _utils.throwWarning)('Curtains: no valid container HTML element or ID provided, created a div with "curtains-canvas" ID instead');
    } else {
      if (typeof container === "string") {
        container = document.getElementById(container);

        if (!container) {
          let container = document.createElement("div");
          container.setAttribute("id", "curtains-canvas");
          document.body.appendChild(container);
          this.container = container;
          if (!this.production) (0, _utils.throwWarning)('Curtains: no valid container HTML element or ID provided, created a div with "curtains-canvas" ID instead');
        } else {
          this.container = container;
        }
      } else if (container instanceof Element) {
        this.container = container;
      }
    }

    this._initCurtains();
  }
  /***
   Initialize everything that the class will need: WebGL renderer, scroll manager, sizes, listeners
   Then starts our animation frame loop if needed
   ***/


  _initCurtains() {
    this.planes = [];
    this.renderTargets = [];
    this.shaderPasses = []; // init webgl context

    this._initRenderer();

    if (!this.gl) return; // scroll

    this._initScroll(); // sizes


    this._setSize(); // event listeners


    this._addListeners(); // we are ready to go


    this.container.appendChild(this.canvas); // watermark

    console.log("curtains.js - v7.1"); // start rendering

    this._animationFrameID = null;

    if (this._autoRender) {
      this._animate();
    }
  }
  /*** WEBGL CONTEXT ***/

  /***
   Initialize the Renderer class object
   ***/


  _initRenderer() {
    this.renderer = new _Renderer.Renderer({
      alpha: this.alpha,
      antialias: this.antialias,
      premulitpliedAlpha: this.premultipliedAlpha,
      depth: this.depth,
      failIfMajorPerformanceCaveat: this.failIfMajorPerformanceCaveat,
      preserveDrawingBuffer: this.preserveDrawingBuffer,
      stencil: this.stencil,
      container: this.container,
      pixelRatio: this.pixelRatio,
      renderingScale: this._renderingScale,
      production: this.production,
      onError: () => this._onRendererError(),
      onContextLost: () => this._onRendererContextLost(),
      onContextRestored: () => this._onRendererContextRestored(),
      onDisposed: () => this._onRendererDisposed(),
      // keep sync between renderer planes, shader passes and render targets arrays and the Curtains ones
      onSceneChange: () => this._keepSync()
    });
    this.gl = this.renderer.gl;
    this.canvas = this.renderer.canvas;
  }
  /***
   Force our renderer to restore the WebGL context
   ***/


  restoreContext() {
    this.renderer.restoreContext();
  }
  /***
   This just handles our drawing animation frame
   ***/


  _animate() {
    this.render();
    this._animationFrameID = window.requestAnimationFrame(this._animate.bind(this));
  }
  /*** RENDERING ***/

  /***
   Enables rendering
   ***/


  enableDrawing() {
    this.renderer.enableDrawing();
  }
  /***
   Disables rendering
   ***/


  disableDrawing() {
    this.renderer.disableDrawing();
  }
  /***
   Forces the rendering of the next frame, even if disabled
   ***/


  needRender() {
    this.renderer.needRender();
  }
  /***
   Executes a callback on next frame
     params:
   @callback (function): callback to execute on next frame
   ***/


  nextRender(callback) {
    this.renderer.nextRender.add(callback);
  }
  /***
   Tells our renderer to render the scene if the drawing is enabled
   ***/


  render() {
    // always execute callback queue
    this.renderer.nextRender.execute(); // If forceRender is true, force rendering this frame even if drawing is not enabled.
    // If not, only render if enabled.

    if (!this.renderer.state.drawingEnabled && !this.renderer.state.forceRender) {
      return;
    } // reset forceRender


    if (this.renderer.state.forceRender) {
      this.renderer.state.forceRender = false;
    } // Curtains onRender callback


    if (this._onRenderCallback) {
      this._onRenderCallback();
    }

    this.renderer.render();
  }
  /*** LISTENERS ***/

  /***
   Adds our resize event listener if needed
   ***/


  _addListeners() {
    // handling window resize event
    this._resizeHandler = null;

    if (this._autoResize) {
      this._resizeHandler = this.resize.bind(this, true);
      window.addEventListener("resize", this._resizeHandler, false);
    }
  }
  /*** SIZING ***/

  /***
   Set the pixel ratio property and update everything by calling the resize() method
   ***/


  setPixelRatio(pixelRatio, triggerCallback) {
    this.pixelRatio = parseFloat(Math.max(pixelRatio, 1)) || 1;
    this.renderer.setPixelRatio(pixelRatio); // apply new pixel ratio to all our elements but don't trigger onAfterResize callback

    this.resize(triggerCallback);
  }
  /***
   Set our renderer container and canvas sizes and update the scroll values
   ***/


  _setSize() {
    this.renderer.setSize(); // update scroll values ass well

    if (this._scrollManager.shouldWatch) {
      this._scrollManager.xOffset = window.pageXOffset;
      this._scrollManager.yOffset = window.pageYOffset;
    }
  }
  /***
   Useful to get our container bounding rectangle without triggering a reflow/layout
     returns :
   @boundingRectangle (object): an object containing our container bounding rectangle (width, height, top and left properties)
   ***/


  getBoundingRect() {
    return this.renderer._boundingRect;
  }
  /***
   Resize our container and the renderer
     params:
   @triggerCallback (bool): Whether we should trigger onAfterResize callback
   ***/


  resize(triggerCallback) {
    if (!this.gl) return;

    this._setSize();

    this.renderer.resize();
    this.nextRender(() => {
      if (this._onAfterResizeCallback && triggerCallback) {
        this._onAfterResizeCallback();
      }
    });
  }
  /*** SCROLL ***/

  /***
   Init our ScrollManager class object
   ***/


  _initScroll() {
    this._scrollManager = new _ScrollManager.ScrollManager({
      // init values
      xOffset: window.pageXOffset,
      yOffset: window.pageYOffset,
      lastXDelta: 0,
      lastYDelta: 0,
      shouldWatch: this._watchScroll,
      onScroll: (lastXDelta, lastYDelta) => this._updateScroll(lastXDelta, lastYDelta)
    });
  }
  /***
   Handles the different values associated with a scroll event (scroll and delta values)
   If no plane watch the scroll then those values won't be retrieved to avoid unnecessary reflow calls
   If at least a plane is watching, update all watching planes positions based on the scroll values
   And force render for at least one frame to actually update the scene
   ***/


  _updateScroll(lastXDelta, lastYDelta) {
    for (let i = 0; i < this.planes.length; i++) {
      // if our plane is watching the scroll, update its position
      if (this.planes[i].watchScroll) {
        this.planes[i].updateScrollPosition(lastXDelta, lastYDelta);
      }
    } // be sure we'll update the scene even if drawing is disabled


    this.renderer.needRender();
    this._onScrollCallback && this._onScrollCallback();
  }
  /***
   Updates the scroll manager X and Y scroll values as well as last X and Y deltas
   Internally called by the scroll handler if at least one plane is watching the scroll
   Could be called externally as well if the user wants to handle the scroll by himself
     params:
   @x (float): scroll value along X axis
   @y (float): scroll value along Y axis
   ***/


  updateScrollValues(x, y) {
    this._scrollManager.updateScrollValues(x, y);
  }
  /***
   Returns last delta scroll values
     returns:
   @delta (object): an object containing X and Y last delta values
   ***/


  getScrollDeltas() {
    return {
      x: this._scrollManager.lastXDelta,
      y: this._scrollManager.lastYDelta
    };
  }
  /***
   Returns last window scroll values
     returns:
   @scrollValues (object): an object containing X and Y last scroll values
   ***/


  getScrollValues() {
    return {
      x: this._scrollManager.xOffset,
      y: this._scrollManager.yOffset
    };
  }
  /*** ADDING / REMOVING OBJECTS TO THE RENDERER ***/

  /***
   Always keep sync between renderer and Curtains scene objects when adding/removing objects
   ***/


  _keepSync() {
    this.planes = this.renderer.planes;
    this.shaderPasses = this.renderer.shaderPasses;
    this.renderTargets = this.renderer.renderTargets;
  }
  /*** UTILS ***/

  /***
   Linear interpolation helper defined in utils
   ***/


  lerp(start, end, amount) {
    return (0, _utils.lerp)(start, end, amount);
  }
  /*** EVENTS ***/

  /***
   This is called each time our container has been resized
     params :
   @callback (function) : a function to execute
     returns :
   @this: our Curtains element to handle chaining
   ***/


  onAfterResize(callback) {
    if (callback) {
      this._onAfterResizeCallback = callback;
    }

    return this;
  }
  /***
   This is called when an error has been detected
     params:
   @callback (function): a function to execute
     returns:
   @this: our Curtains element to handle chaining
   ***/


  onError(callback) {
    if (callback) {
      this._onErrorCallback = callback;
    }

    return this;
  }
  /***
   This triggers the onError callback and is called by the renderer when an error has been detected
   ***/


  _onRendererError() {
    // be sure that the callback has been registered and only call the global error callback once
    setTimeout(() => {
      if (this._onErrorCallback && !this.errors) {
        this._onErrorCallback();
      }

      this.errors = true;
    }, 0);
  }
  /***
   This is called once our context has been lost
     params:
   @callback (function): a function to execute
     returns:
   @this: our Curtains element to handle chaining
   ***/


  onContextLost(callback) {
    if (callback) {
      this._onContextLostCallback = callback;
    }

    return this;
  }
  /***
   This triggers the onContextLost callback and is called by the renderer when the context has been lost
   ***/


  _onRendererContextLost() {
    this._onContextLostCallback && this._onContextLostCallback();
  }
  /***
   This is called once our context has been restored
     params:
   @callback (function): a function to execute
     returns:
   @this: our Curtains element to handle chaining
   ***/


  onContextRestored(callback) {
    if (callback) {
      this._onContextRestoredCallback = callback;
    }

    return this;
  }
  /***
   This triggers the onContextRestored callback and is called by the renderer when the context has been restored
   ***/


  _onRendererContextRestored() {
    this._onContextRestoredCallback && this._onContextRestoredCallback();
  }
  /***
   This is called once at each request animation frame call
     params:
   @callback (function): a function to execute
     returns:
   @this: our Curtains element to handle chaining
   ***/


  onRender(callback) {
    if (callback) {
      this._onRenderCallback = callback;
    }

    return this;
  }
  /***
   This is called each time window is scrolled and if our scrollManager is active
     params :
   @callback (function) : a function to execute
     returns :
   @this: our Curtains element to handle chaining
   ***/


  onScroll(callback) {
    if (callback) {
      this._onScrollCallback = callback;
    }

    return this;
  }
  /*** DESTROYING ***/

  /***
   Dispose everything
   ***/


  dispose() {
    this.renderer.dispose();
  }
  /***
   This is called when the renderer has finished disposing all the WebGL stuff
   ***/


  _onRendererDisposed() {
    // cancel animation frame
    this._animationFrameID && window.cancelAnimationFrame(this._animationFrameID); // remove event listeners

    this._resizeHandler && window.removeEventListener("resize", this._resizeHandler, false);
    this._scrollManager && this._scrollManager.dispose();
  }

}

exports.Curtains = Curtains;
},{"./Renderer.js":"MgHa","../utils/ScrollManager.js":"rhfM","../utils/utils.js":"eOZP"}],"KBJ4":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Uniforms = void 0;

var _utils = require("../utils/utils.js");

/***
 Uniforms class manages uniforms setting and updating

 params:
 @renderer (Renderer class object): our renderer class object
 @program (object): our mesh's Program (see Program class object)
 @shared (bool): whether the program is shared or not

 @uniforms (object): our uniforms object:
 - name (string): uniform name to use in your shaders
 - type (uniform type): uniform type. Will try to detect it if not set (see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniform)
 - value (float / int / Vec2 / Vec3 / Mat4 / array): initial value of the uniform

 returns:
 @this: our Uniforms manager
***/
class Uniforms {
  constructor(renderer, program, shared, uniforms) {
    this.type = "Uniforms";

    if (!renderer || renderer.type !== "Renderer") {
      (0, _utils.throwError)(this.type + ": Renderer not passed as first argument", renderer);
    } else if (!renderer.gl) {
      (0, _utils.throwError)(this.type + ": Renderer WebGL context is undefined", renderer);
    }

    this.renderer = renderer;
    this.gl = renderer.gl;
    this.program = program;
    this.shared = shared;
    this.uniforms = {};

    if (uniforms) {
      for (const key in uniforms) {
        const uniform = uniforms[key]; // fill our uniform object

        this.uniforms[key] = {
          name: uniform.name,
          type: uniform.type,
          value: uniform.value,
          lastValue: uniform.value,
          update: null
        };
      }
    }
  }
  /***
   Set uniforms WebGL function based on their types
     params :
   @uniform (object): the uniform
   ***/


  handleUniformSetting(uniform) {
    switch (uniform.type) {
      case "1i":
        uniform.update = this.setUniform1i.bind(this);
        break;

      case "1iv":
        uniform.update = this.setUniform1iv.bind(this);
        break;

      case "1f":
        uniform.update = this.setUniform1f.bind(this);
        break;

      case "1fv":
        uniform.update = this.setUniform1fv.bind(this);
        break;

      case "2i":
        uniform.update = this.setUniform2i.bind(this);
        break;

      case "2iv":
        uniform.update = this.setUniform2iv.bind(this);
        break;

      case "2f":
        uniform.update = this.setUniform2f.bind(this);
        break;

      case "2fv":
        uniform.update = this.setUniform2fv.bind(this);
        break;

      case "3i":
        uniform.update = this.setUniform3i.bind(this);
        break;

      case "3iv":
        uniform.update = this.setUniform3iv.bind(this);
        break;

      case "3f":
        uniform.update = this.setUniform3f.bind(this);
        break;

      case "3fv":
        uniform.update = this.setUniform3fv.bind(this);
        break;

      case "4i":
        uniform.update = this.setUniform4i.bind(this);
        break;

      case "4iv":
        uniform.update = this.setUniform4iv.bind(this);
        break;

      case "4f":
        uniform.update = this.setUniform4f.bind(this);
        break;

      case "4fv":
        uniform.update = this.setUniform4fv.bind(this);
        break;

      case "mat2":
        uniform.update = this.setUniformMatrix2fv.bind(this);
        break;

      case "mat3":
        uniform.update = this.setUniformMatrix3fv.bind(this);
        break;

      case "mat4":
        uniform.update = this.setUniformMatrix4fv.bind(this);
        break;

      default:
        if (!this.renderer.production) (0, _utils.throwWarning)(this.type + ": This uniform type is not handled : ", uniform.type);
    }
  }
  /***
   Auto detect the format of the uniform (check if its a float, an integer, a Vector, a Matrix, an array...)
     params :
   @uniform (object): the uniform
   ***/


  setInternalFormat(uniform) {
    if (uniform.value.type === "Vec2") {
      uniform._internalFormat = "Vec2";
    } else if (uniform.value.type === "Vec3") {
      uniform._internalFormat = "Vec3";
    } else if (uniform.value.type === "Mat4") {
      uniform._internalFormat = "Mat4";
    } else if (uniform.value.type === "Quat") {
      uniform._internalFormat = "Quat";
    } else if (Array.isArray(uniform.value)) {
      uniform._internalFormat = "array";
    } else if (uniform.value.constructor === Float32Array) {
      uniform._internalFormat = "mat";
    } else {
      uniform._internalFormat = "float";
    }
  }
  /***
   This inits our uniforms
   Sets its internal format and type if not provided then upload the uniform
   ***/


  setUniforms() {
    // set our uniforms if we got some
    if (this.uniforms) {
      for (const key in this.uniforms) {
        let uniform = this.uniforms[key]; // set our uniform location

        uniform.location = this.gl.getUniformLocation(this.program, uniform.name); // handle Vec2, Vec3, Mat4, floats, arrays, etc

        if (!uniform._internalFormat) {
          this.setInternalFormat(uniform);
        }

        if (!uniform.type) {
          if (uniform._internalFormat === "Vec2") {
            uniform.type = "2f";
          } else if (uniform._internalFormat === "Vec3") {
            uniform.type = "3f";
          } else if (uniform._internalFormat === "Mat4") {
            uniform.type = "mat4";
          } else if (uniform._internalFormat === "array") {
            if (uniform.value.length === 4) {
              uniform.type = "4f";
              if (!this.renderer.production) (0, _utils.throwWarning)(this.type + ": No uniform type declared for " + uniform.name + ", applied a 4f (array of 4 floats) uniform type");
            } else if (uniform.value.length === 3) {
              uniform.type = "3f";
              if (!this.renderer.production) (0, _utils.throwWarning)(this.type + ": No uniform type declared for " + uniform.name + ", applied a 3f (array of 3 floats) uniform type");
            } else if (uniform.value.length === 2) {
              uniform.type = "2f";
              if (!this.renderer.production) (0, _utils.throwWarning)(this.type + ": No uniform type declared for " + uniform.name + ", applied a 2f (array of 2 floats) uniform type");
            }
          } else if (uniform._internalFormat === "mat") {
            if (uniform.value.length === 16) {
              uniform.type = "mat4";
              if (!this.renderer.production) (0, _utils.throwWarning)(this.type + ": No uniform type declared for " + uniform.name + ", applied a mat4 (4x4 matrix array) uniform type");
            } else if (uniform.value.length === 9) {
              uniform.type = "mat3";
              if (!this.renderer.production) (0, _utils.throwWarning)(this.type + ": No uniform type declared for " + uniform.name + ", applied a mat3 (3x3 matrix array) uniform type");
            } else if (uniform.value.length === 4) {
              uniform.type = "mat2";
              if (!this.renderer.production) (0, _utils.throwWarning)(this.type + ": No uniform type declared for " + uniform.name + ", applied a mat2 (2x2 matrix array) uniform type");
            }
          } else {
            uniform.type = "1f";
            if (!this.renderer.production) (0, _utils.throwWarning)(this.type + ": No uniform type declared for " + uniform.name + ", applied a 1f (float) uniform type");
          }
        } // set the uniforms update functions


        this.handleUniformSetting(uniform); // update the uniform

        uniform.update && uniform.update(uniform);
      }
    }
  }
  /***
   This updates all uniforms of an object that were set by the user
   It is called at each draw call
   ***/


  updateUniforms() {
    if (this.uniforms) {
      for (const key in this.uniforms) {
        const uniform = this.uniforms[key];
        let shouldUpdate = false;

        if (!this.shared) {
          if (!uniform.value.length && uniform.value !== uniform.lastValue) {
            shouldUpdate = true;
            uniform.lastValue = uniform.value;
          } else if (uniform._internalFormat === "Vec2" && !uniform.value.equals(uniform.lastValue)) {
            shouldUpdate = true;
            uniform.lastValue.copy(uniform.value);
          } else if (uniform._internalFormat === "Vec3" && !uniform.value.equals(uniform.lastValue)) {
            shouldUpdate = true;
            uniform.lastValue.copy(uniform.value);
          } else if (uniform._internalFormat === "Quat" && !uniform.value.equals(uniform.lastValue)) {
            shouldUpdate = true;
            uniform.lastValue.copy(uniform.value);
          } else if (JSON.stringify(uniform.value) !== JSON.stringify(uniform.lastValue)) {
            // compare two arrays
            shouldUpdate = true; // copy array

            uniform.lastValue = Array.from(uniform.value);
          }
        } else {
          shouldUpdate = true;
        }

        if (shouldUpdate) {
          // update our uniforms
          uniform.update && uniform.update(uniform);
        }
      }
    }
  }
  /***
   Use appropriate WebGL uniform setting function based on the uniform type
     params :
   @uniform (object): the uniform
   ***/


  setUniform1i(uniform) {
    this.gl.uniform1i(uniform.location, uniform.value);
  }

  setUniform1iv(uniform) {
    this.gl.uniform1iv(uniform.location, uniform.value);
  }

  setUniform1f(uniform) {
    this.gl.uniform1f(uniform.location, uniform.value);
  }

  setUniform1fv(uniform) {
    this.gl.uniform1fv(uniform.location, uniform.value);
  }

  setUniform2i(uniform) {
    uniform._internalFormat === "Vec2" ? this.gl.uniform2i(uniform.location, uniform.value.x, uniform.value.y) : this.gl.uniform2i(uniform.location, uniform.value[0], uniform.value[1]);
  }

  setUniform2iv(uniform) {
    uniform._internalFormat === "Vec2" ? this.gl.uniform2iv(uniform.location, [uniform.value.x, uniform.value.y]) : this.gl.uniform2iv(uniform.location, uniform.value);
  }

  setUniform2f(uniform) {
    uniform._internalFormat === "Vec2" ? this.gl.uniform2f(uniform.location, uniform.value.x, uniform.value.y) : this.gl.uniform2f(uniform.location, uniform.value[0], uniform.value[1]);
  }

  setUniform2fv(uniform) {
    uniform._internalFormat === "Vec2" ? this.gl.uniform2fv(uniform.location, [uniform.value.x, uniform.value.y]) : this.gl.uniform2fv(uniform.location, uniform.value);
  }

  setUniform3i(uniform) {
    uniform._internalFormat === "Vec3" ? this.gl.uniform3i(uniform.location, uniform.value.x, uniform.value.y, uniform.value.z) : this.gl.uniform3i(uniform.location, uniform.value[0], uniform.value[1], uniform.value[2]);
  }

  setUniform3iv(uniform) {
    uniform._internalFormat === "Vec3" ? this.gl.uniform3iv(uniform.location, [uniform.value.x, uniform.value.y, uniform.value.z]) : this.gl.uniform3iv(uniform.location, uniform.value);
  }

  setUniform3f(uniform) {
    uniform._internalFormat === "Vec3" ? this.gl.uniform3f(uniform.location, uniform.value.x, uniform.value.y, uniform.value.z) : this.gl.uniform3f(uniform.location, uniform.value[0], uniform.value[1], uniform.value[2]);
  }

  setUniform3fv(uniform) {
    uniform._internalFormat === "Vec3" ? this.gl.uniform3fv(uniform.location, [uniform.value.x, uniform.value.y, uniform.value.z]) : this.gl.uniform3fv(uniform.location, uniform.value);
  }

  setUniform4i(uniform) {
    uniform._internalFormat === "Quat" ? this.gl.uniform4i(uniform.location, uniform.value.elements[0], uniform.value.elements[1], uniform.value.elements[2], uniform.value[3]) : this.gl.uniform4i(uniform.location, uniform.value[0], uniform.value[1], uniform.value[2], uniform.value[3]);
  }

  setUniform4iv(uniform) {
    uniform._internalFormat === "Quat" ? this.gl.uniform4iv(uniform.location, [uniform.value.elements[0], uniform.value.elements[1], uniform.value.elements[2], uniform.value[3]]) : this.gl.uniform4iv(uniform.location, uniform.value);
  }

  setUniform4f(uniform) {
    uniform._internalFormat === "Quat" ? this.gl.uniform4f(uniform.location, uniform.value.elements[0], uniform.value.elements[1], uniform.value.elements[2], uniform.value[3]) : this.gl.uniform4f(uniform.location, uniform.value[0], uniform.value[1], uniform.value[2], uniform.value[3]);
  }

  setUniform4fv(uniform) {
    uniform._internalFormat === "Quat" ? this.gl.uniform4fv(uniform.location, [uniform.value.elements[0], uniform.value.elements[1], uniform.value.elements[2], uniform.value[3]]) : this.gl.uniform4fv(uniform.location, uniform.value);
  }

  setUniformMatrix2fv(uniform) {
    this.gl.uniformMatrix2fv(uniform.location, false, uniform.value);
  }

  setUniformMatrix3fv(uniform) {
    this.gl.uniformMatrix3fv(uniform.location, false, uniform.value);
  }

  setUniformMatrix4fv(uniform) {
    uniform._internalFormat === "Mat4" ? this.gl.uniformMatrix4fv(uniform.location, false, uniform.value.elements) : this.gl.uniformMatrix4fv(uniform.location, false, uniform.value);
  }

}

exports.Uniforms = Uniforms;
},{"../utils/utils.js":"eOZP"}],"Mb2O":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Program = void 0;

var _Uniforms = require("./Uniforms.js");

var _utils = require("../utils/utils.js");

/***
 Program class that creates, compiles and links the shaders
 Use a cache system to get already compiled shaders and save some CPU
 Also responsible for the creation, setting and updating of the uniforms (see Uniforms class object)

 params:
 @renderer (Renderer class object): our renderer class object

 @parent (Plane/ShaderPass class object): the mesh that will use that program
 @vertexShader (string): vertex shader as a string
 @fragmentShader (string): fragment shader as a string

 returns:
 @this: our newly created Program
 ***/
class Program {
  constructor(renderer, {
    parent,
    vertexShader,
    fragmentShader
  } = {}) {
    this.type = "Program";

    if (!renderer || renderer.type !== "Renderer") {
      (0, _utils.throwError)(this.type + ": Renderer not passed as first argument", renderer);
    } else if (!renderer.gl) {
      (0, _utils.throwError)(this.type + ": Renderer WebGL context is undefined", renderer);
    }

    this.renderer = renderer;
    this.gl = this.renderer.gl;
    this.parent = parent;
    this.vsCode = vertexShader;
    this.fsCode = fragmentShader;
    this.compiled = true;
    this.setupProgram();
  }
  /***
   Compile our WebGL shaders based on our written shaders
     params:
   @shaderCode (string): shader code
   @shaderType (shaderType): WebGL shader type (vertex or fragment)
     returns:
   @shader (compiled shader): our compiled shader
   ***/


  createShader(shaderCode, shaderType) {
    const shader = this.gl.createShader(shaderType);
    this.gl.shaderSource(shader, shaderCode);
    this.gl.compileShader(shader); // check shader compilation status only when not in production mode

    if (!this.renderer.production) {
      if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
        // shader debugging log as seen in THREE.js WebGLProgram source code
        const shaderTypeString = shaderType === this.gl.VERTEX_SHADER ? "vertex shader" : "fragment shader";
        const shaderSource = this.gl.getShaderSource(shader);
        let shaderLines = shaderSource.split('\n');

        for (let i = 0; i < shaderLines.length; i++) {
          shaderLines[i] = i + 1 + ': ' + shaderLines[i];
        }

        shaderLines = shaderLines.join("\n");
        (0, _utils.throwWarning)(this.type + ": Errors occurred while compiling the", shaderTypeString, ":\n", this.gl.getShaderInfoLog(shader));
        (0, _utils.throwError)(shaderLines);
        this.compiled = false;
        return null;
      }
    }

    return shader;
  }
  /***
   Compiles and creates new shaders
   ***/


  useNewShaders() {
    this.vertexShader = this.createShader(this.vsCode, this.gl.VERTEX_SHADER);
    this.fragmentShader = this.createShader(this.fsCode, this.gl.FRAGMENT_SHADER);

    if (!this.vertexShader || !this.fragmentShader) {
      if (!this.renderer.production) (0, _utils.throwWarning)(this.type + ": Unable to find or compile the vertex or fragment shader");
    }
  }

  /***
   Checks whether the program has already been registered before creating it
   If yes, use the compiled program if the program should be shared, or just use the compiled shaders to create a new one else with createProgram()
   If not, compile the shaders and call createProgram()
   ***/
  setupProgram() {
    let existingProgram = this.renderer.cache.getProgramFromShaders(this.vsCode, this.fsCode); // we found an existing program

    if (existingProgram) {
      // if we've decided to share existing programs, just return the existing one
      if (this.parent.shareProgram) {
        //return existingProgram;
        this.shared = true;
        this.vertexShader = existingProgram.vertexShader;
        this.fragmentShader = existingProgram.fragmentShader;
        this.program = existingProgram.program;
        this.id = existingProgram.id;
        this.activeTextures = existingProgram.activeTextures;
      } else {
        // we need to create a new program but we don't have to re compile the shaders
        this.vertexShader = existingProgram.vertexShader;
        this.fragmentShader = existingProgram.fragmentShader; // copy active textures as well

        this.activeTextures = existingProgram.activeTextures;
        this.createProgram();
      }
    } else {
      // compile the new shaders and create a new program
      this.useNewShaders();

      if (this.compiled) {
        this.createProgram();
      }
    }
  }
  /***
   Used internally to set up program based on the created shaders and attach them to the program
   Sets a list of active textures that are actually used by the shaders to avoid binding unused textures during draw calls
   Add the program to the cache
   ***/


  createProgram() {
    // set program id and type
    this.id = this.renderer.cache.programs.length;
    this.shared = this.parent.shareProgram; // we need to create a new shader program

    this.program = this.gl.createProgram(); // if shaders are valid, go on

    this.gl.attachShader(this.program, this.vertexShader);
    this.gl.attachShader(this.program, this.fragmentShader);
    this.gl.linkProgram(this.program); // free the shaders handles

    this.gl.deleteShader(this.vertexShader);
    this.gl.deleteShader(this.fragmentShader); // TODO getProgramParameter even in production to avoid errors?
    // check the shader program creation status only when not in production mode

    if (!this.renderer.production) {
      if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
        (0, _utils.throwWarning)(this.type + ": Unable to initialize the shader program.");
        this.compiled = false;
        return;
      }
    } // store active textures (those that are used in the shaders) to avoid binding unused textures


    if (!this.activeTextures) {
      this.activeTextures = []; // check for program active textures

      let numUniforms = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_UNIFORMS);

      for (let i = 0; i < numUniforms; i++) {
        const activeUniform = this.gl.getActiveUniform(this.program, i); // if it's a texture add it to our activeTextures array

        if (activeUniform.type === this.gl.SAMPLER_2D) {
          this.activeTextures.push(activeUniform.name);
        }
      }
    } // add it to our program manager programs list


    this.renderer.cache.addProgram(this);
  }
  /*** UNIFORMS ***/

  /***
   Creates and attach the uniform handlers to our program
     params:
   @uniforms (object): an object describing our uniforms (see Uniforms class object)
   ***/


  createUniforms(uniforms) {
    this.uniformsManager = new _Uniforms.Uniforms(this.renderer, this.program, this.shared, uniforms); // set them right away

    this.setUniforms();
  }
  /***
   Sets our uniforms (used on init and on context restoration)
   ***/


  setUniforms() {
    // use this program
    this.renderer.useProgram(this);
    this.uniformsManager.setUniforms();
  }
  /***
   Updates our uniforms at each draw calls
   ***/


  updateUniforms() {
    // use this program
    this.renderer.useProgram(this);
    this.uniformsManager.updateUniforms();
  }

}

exports.Program = Program;
},{"./Uniforms.js":"KBJ4","../utils/utils.js":"eOZP"}],"rvin":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Geometry = void 0;

var _utils = require("../utils/utils.js");

/***
 Geometry class handles attributes, VertexArrayObjects (if available) and vertices/UVs set up

 params:
 @renderer (Renderer class object): our renderer class object

 @program (object): our mesh's Program (see Program class object)
 @width (int): number of vertices along width
 @height (int): number of vertices along height
 @id (int): an integer based on geometry's width and height and used to avoid redundant buffer binding calls

 returns:
 @this: our newly created Geometry
 ***/
class Geometry {
  constructor(renderer, {
    program = null,
    width = 1,
    height = 1
  } = {}) {
    this.type = "Geometry";

    if (!renderer || renderer.type !== "Renderer") {
      (0, _utils.throwError)(this.type + ": Renderer not passed as first argument", renderer);
    } else if (!renderer.gl) {
      (0, _utils.throwError)(this.type + ": Renderer WebGL context is undefined", renderer);
    }

    this.renderer = renderer;
    this.gl = this.renderer.gl; // unique plane buffers id based on width and height
    // used to get a geometry from cache

    this.definition = {
      id: width * height + width,
      width: width,
      height: height
    };
    this.setDefaultAttributes();
    this.setVerticesUVs();
  }
  /*** CONTEXT RESTORATION ***/

  /***
   Used internally to handle context restoration after the program has been successfully compiled again
   Reset the default attributes, the vertices and UVs and the program
   ***/


  restoreContext(program) {
    this.program = null;
    this.setDefaultAttributes();
    this.setVerticesUVs();
    this.setProgram(program);
  }
  /*** SET DEFAULT ATTRIBUTES ***/

  /***
   Our geometry default attributes that will handle the buffers
   We're just using vertices positions and texture coordinates
   ***/


  setDefaultAttributes() {
    // our plane default attributes
    // if we'd want to introduce custom attributes we'd merge them with those
    this.attributes = {
      vertexPosition: {
        name: "aVertexPosition",
        size: 3
      },
      textureCoord: {
        name: "aTextureCoord",
        size: 3
      }
    };
  }
  /***
   Set our vertices and texture coordinates array
   Get them from the cache if possible
   ***/


  setVerticesUVs() {
    // we need to create our geometry and material objects
    const cachedGeometry = this.renderer.cache.getGeometryFromID(this.definition.id);

    if (cachedGeometry) {
      this.attributes.vertexPosition.array = cachedGeometry.vertices;
      this.attributes.textureCoord.array = cachedGeometry.uvs;
    } else {
      this.computeVerticesUVs(); // TODO better caching? We could pass all attributes to cache and handle arrays in there

      this.renderer.cache.addGeometry(this.definition.id, this.attributes.vertexPosition.array, this.attributes.textureCoord.array);
    }
  }
  /***
   Called on init and on context restoration to set up the attribute buffers
   Use VertexArrayObjects whenever possible
   ***/


  setProgram(program) {
    this.program = program.program;
    this.initAttributes(); // use vertex array objects if available

    if (this.renderer._isWebGL2) {
      this._vao = this.gl.createVertexArray();
      this.gl.bindVertexArray(this._vao);
    } else if (this.renderer.extensions['OES_vertex_array_object']) {
      this._vao = this.renderer.extensions['OES_vertex_array_object'].createVertexArrayOES();
      this.renderer.extensions['OES_vertex_array_object'].bindVertexArrayOES(this._vao);
    }

    this.initializeBuffers();
  }
  /***
   This creates our mesh attributes and buffers by looping over it
   ***/


  initAttributes() {
    // loop through our attributes and create buffers and attributes locations
    for (const key in this.attributes) {
      this.attributes[key].location = this.gl.getAttribLocation(this.program, this.attributes[key].name);
      this.attributes[key].buffer = this.gl.createBuffer();
      this.attributes[key].numberOfItems = this.definition.width * this.definition.height * this.attributes[key].size * 2;
    }
  }
  /***
   This method is used internally to create our vertices coordinates and texture UVs
   we first create our UVs on a grid from [0, 0, 0] to [1, 1, 0]
   then we use the UVs to create our vertices coords
   ***/


  computeVerticesUVs() {
    // geometry vertices and UVs
    this.attributes.vertexPosition.array = [];
    this.attributes.textureCoord.array = [];
    const vertices = this.attributes.vertexPosition.array;
    const uvs = this.attributes.textureCoord.array;

    for (let y = 0; y < this.definition.height; y++) {
      const v = y / this.definition.height;

      for (let x = 0; x < this.definition.width; x++) {
        const u = x / this.definition.width; // uvs and vertices
        // our uvs are ranging from 0 to 1, our vertices range from -1 to 1
        // first triangle

        uvs.push(u);
        uvs.push(v);
        uvs.push(0);
        vertices.push((u - 0.5) * 2);
        vertices.push((v - 0.5) * 2);
        vertices.push(0);
        uvs.push(u + 1 / this.definition.width);
        uvs.push(v);
        uvs.push(0);
        vertices.push((u + 1 / this.definition.width - 0.5) * 2);
        vertices.push((v - 0.5) * 2);
        vertices.push(0);
        uvs.push(u);
        uvs.push(v + 1 / this.definition.height);
        uvs.push(0);
        vertices.push((u - 0.5) * 2);
        vertices.push((v + 1 / this.definition.height - 0.5) * 2);
        vertices.push(0); // second triangle

        uvs.push(u);
        uvs.push(v + 1 / this.definition.height);
        uvs.push(0);
        vertices.push((u - 0.5) * 2);
        vertices.push((v + 1 / this.definition.height - 0.5) * 2);
        vertices.push(0);
        uvs.push(u + 1 / this.definition.width);
        uvs.push(v);
        uvs.push(0);
        vertices.push((u + 1 / this.definition.width - 0.5) * 2);
        vertices.push((v - 0.5) * 2);
        vertices.push(0);
        uvs.push(u + 1 / this.definition.width);
        uvs.push(v + 1 / this.definition.height);
        uvs.push(0);
        vertices.push((u + 1 / this.definition.width - 0.5) * 2);
        vertices.push((v + 1 / this.definition.height - 0.5) * 2);
        vertices.push(0);
      }
    }
  }
  /***
   This method enables and binds our attributes buffers
   ***/


  initializeBuffers() {
    if (!this.attributes) return; // loop through our attributes

    for (const key in this.attributes) {
      // bind attribute buffer
      this.gl.enableVertexAttribArray(this.attributes[key].location);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.attributes[key].buffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.attributes[key].array), this.gl.STATIC_DRAW); // set where the attribute gets its data

      this.gl.vertexAttribPointer(this.attributes[key].location, this.attributes[key].size, this.gl.FLOAT, false, 0, 0);
    }
  }
  /***
   Used inside our draw call to set the correct plane buffers before drawing it
   ***/


  bindBuffers() {
    if (this._vao) {
      if (this.renderer._isWebGL2) {
        this.gl.bindVertexArray(this._vao);
      } else {
        this.renderer.extensions['OES_vertex_array_object'].bindVertexArrayOES(this._vao);
      }
    } else {
      // loop through our attributes to bind the buffers and set the attribute pointer
      for (const key in this.attributes) {
        this.gl.enableVertexAttribArray(this.attributes[key].location);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.attributes[key].buffer);
        this.gl.vertexAttribPointer(this.attributes[key].location, this.attributes[key].size, this.gl.FLOAT, false, 0, 0);
      }
    }
  }
  /***
   Draw a geometry
   ***/


  draw() {
    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.attributes.vertexPosition.numberOfItems);
  }
  /***
   Dispose a geometry (ie delete its vertex array objects and buffers)
   ***/


  dispose() {
    // delete buffers
    // each time we check for existing properties to avoid errors
    if (this._vao) {
      if (this.renderer._isWebGL2) {
        this.gl.deleteVertexArray(this._vao);
      } else {
        this.renderer.extensions['OES_vertex_array_object'].deleteVertexArrayOES(this._vao);
      }
    }

    for (const key in this.attributes) {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.attributes[key].buffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, 1, this.gl.STATIC_DRAW);
      this.gl.deleteBuffer(this.attributes[key].buffer);
    }

    this.attributes = null;
  }

}

exports.Geometry = Geometry;
},{"../utils/utils.js":"eOZP"}],"ceZz":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Mat4 = void 0;

/***
 Here we create a Mat4 class object
 This is a really basic Matrix4 class used for matrix calculations
 Highly based on https://github.com/mrdoob/three.js/blob/dev/src/math/Matrix4.js and http://glmatrix.net/docs/mat4.js.html

 params :
 @elements (Float32Array of length 16): our matrix array. Default to identity matrix.

 returns :
 @this: our Mat4 class object
 ***/
// TODO lot of (unused at the time) methods are missing
class Mat4 {
  constructor(elements = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])) {
    this.type = "Mat4";
    this.elements = elements;
  }
  /***
   Sets the matrix values from an array
     params:
   @array (array): an array of at least 16 elements
     returns:
   @this (Mat4 class object): this matrix after being set
   ***/


  setFromArray(array) {
    for (let i = 0; i < this.elements.length; i++) {
      this.elements[i] = array[i];
    }

    return this;
  }
  /***
   Copy another Mat4
     params:
   @matrix (Mat4 class object): matrix to copy
     returns:
   @this (Mat4 class object): this matrix after copy
   ***/


  copy(matrix) {
    const array = matrix.elements;
    this.elements[0] = array[0];
    this.elements[1] = array[1];
    this.elements[2] = array[2];
    this.elements[3] = array[3];
    this.elements[4] = array[4];
    this.elements[5] = array[5];
    this.elements[6] = array[6];
    this.elements[7] = array[7];
    this.elements[8] = array[8];
    this.elements[9] = array[9];
    this.elements[10] = array[10];
    this.elements[11] = array[11];
    this.elements[12] = array[12];
    this.elements[13] = array[13];
    this.elements[14] = array[14];
    this.elements[15] = array[15];
    return this;
  }
  /***
   Simple matrix multiplication helper
     params:
   @matrix (Mat4 class object): Mat4 to multiply with
     returns:
   @result (Mat4 class object): Mat4 after multiplication
   ***/


  multiply(matrix) {
    const a = this.elements;
    const b = matrix.elements;
    let result = new Mat4();
    result.elements[0] = b[0] * a[0] + b[1] * a[4] + b[2] * a[8] + b[3] * a[12];
    result.elements[1] = b[0] * a[1] + b[1] * a[5] + b[2] * a[9] + b[3] * a[13];
    result.elements[2] = b[0] * a[2] + b[1] * a[6] + b[2] * a[10] + b[3] * a[14];
    result.elements[3] = b[0] * a[3] + b[1] * a[7] + b[2] * a[11] + b[3] * a[15];
    result.elements[4] = b[4] * a[0] + b[5] * a[4] + b[6] * a[8] + b[7] * a[12];
    result.elements[5] = b[4] * a[1] + b[5] * a[5] + b[6] * a[9] + b[7] * a[13];
    result.elements[6] = b[4] * a[2] + b[5] * a[6] + b[6] * a[10] + b[7] * a[14];
    result.elements[7] = b[4] * a[3] + b[5] * a[7] + b[6] * a[11] + b[7] * a[15];
    result.elements[8] = b[8] * a[0] + b[9] * a[4] + b[10] * a[8] + b[11] * a[12];
    result.elements[9] = b[8] * a[1] + b[9] * a[5] + b[10] * a[9] + b[11] * a[13];
    result.elements[10] = b[8] * a[2] + b[9] * a[6] + b[10] * a[10] + b[11] * a[14];
    result.elements[11] = b[8] * a[3] + b[9] * a[7] + b[10] * a[11] + b[11] * a[15];
    result.elements[12] = b[12] * a[0] + b[13] * a[4] + b[14] * a[8] + b[15] * a[12];
    result.elements[13] = b[12] * a[1] + b[13] * a[5] + b[14] * a[9] + b[15] * a[13];
    result.elements[14] = b[12] * a[2] + b[13] * a[6] + b[14] * a[10] + b[15] * a[14];
    result.elements[15] = b[12] * a[3] + b[13] * a[7] + b[14] * a[11] + b[15] * a[15];
    return result;
  }
  /***
   Get matrix inverse
     returns:
   @result (Mat4 class object): inverted Mat4
   ***/


  getInverse() {
    const te = this.elements;
    const out = new Mat4();
    const oe = out.elements;
    let a00 = te[0],
        a01 = te[1],
        a02 = te[2],
        a03 = te[3];
    let a10 = te[4],
        a11 = te[5],
        a12 = te[6],
        a13 = te[7];
    let a20 = te[8],
        a21 = te[9],
        a22 = te[10],
        a23 = te[11];
    let a30 = te[12],
        a31 = te[13],
        a32 = te[14],
        a33 = te[15];
    let b00 = a00 * a11 - a01 * a10;
    let b01 = a00 * a12 - a02 * a10;
    let b02 = a00 * a13 - a03 * a10;
    let b03 = a01 * a12 - a02 * a11;
    let b04 = a01 * a13 - a03 * a11;
    let b05 = a02 * a13 - a03 * a12;
    let b06 = a20 * a31 - a21 * a30;
    let b07 = a20 * a32 - a22 * a30;
    let b08 = a20 * a33 - a23 * a30;
    let b09 = a21 * a32 - a22 * a31;
    let b10 = a21 * a33 - a23 * a31;
    let b11 = a22 * a33 - a23 * a32; // Calculate the determinant

    let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) {
      return null;
    }

    det = 1 / det;
    oe[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    oe[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    oe[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    oe[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    oe[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    oe[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    oe[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    oe[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    oe[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    oe[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    oe[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    oe[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    oe[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    oe[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    oe[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    oe[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
    return out;
  }
  /***
   Simple Mat4 scaling helper
     params :
   @vector (Vec3 class object): Vec3 representing scale along X, Y and Z axis
     returns :
   @result (Mat4 class object): Mat4 after scaling
   ***/


  scale(vector) {
    let a = this.elements;
    let result = new Mat4();
    result.elements[0] = vector.x * a[0 * 4 + 0];
    result.elements[1] = vector.x * a[0 * 4 + 1];
    result.elements[2] = vector.x * a[0 * 4 + 2];
    result.elements[3] = vector.x * a[0 * 4 + 3];
    result.elements[4] = vector.y * a[1 * 4 + 0];
    result.elements[5] = vector.y * a[1 * 4 + 1];
    result.elements[6] = vector.y * a[1 * 4 + 2];
    result.elements[7] = vector.y * a[1 * 4 + 3];
    result.elements[8] = vector.z * a[2 * 4 + 0];
    result.elements[9] = vector.z * a[2 * 4 + 1];
    result.elements[10] = vector.z * a[2 * 4 + 2];
    result.elements[11] = vector.z * a[2 * 4 + 3];

    if (a !== result.elements) {
      result.elements[12] = a[12];
      result.elements[13] = a[13];
      result.elements[14] = a[14];
      result.elements[15] = a[15];
    }

    return result;
  }
  /***
   Creates a matrix from a quaternion rotation, vector translation and vector scale, rotating and scaling around the given origin
   Equivalent for applying translation, rotation and scale matrices but much faster
   Source code from: http://glmatrix.net/docs/mat4.js.html
     params :
   @translation (Vec3 class object): translation vector
   @quaternion (Quat class object): rotation quaternion
   @scale (Vec3 class object): scale vector
   @origin (Vec3 class object): origin vector around which to scale and rotate
     returns :
   @this (Mat4 class object): matrix after transformations
   ***/


  composeFromOrigin(translation, quaternion, scale, origin) {
    let matrix = this.elements; // Quaternion math

    const x = quaternion.elements[0],
          y = quaternion.elements[1],
          z = quaternion.elements[2],
          w = quaternion.elements[3];
    const x2 = x + x;
    const y2 = y + y;
    const z2 = z + z;
    const xx = x * x2;
    const xy = x * y2;
    const xz = x * z2;
    const yy = y * y2;
    const yz = y * z2;
    const zz = z * z2;
    const wx = w * x2;
    const wy = w * y2;
    const wz = w * z2;
    const sx = scale.x;
    const sy = scale.y;
    const sz = scale.z; // scale along Z is always equal to 1 anyway

    const ox = origin.x;
    const oy = origin.y;
    const oz = origin.z;
    const out0 = (1 - (yy + zz)) * sx;
    const out1 = (xy + wz) * sx;
    const out2 = (xz - wy) * sx;
    const out4 = (xy - wz) * sy;
    const out5 = (1 - (xx + zz)) * sy;
    const out6 = (yz + wx) * sy;
    const out8 = (xz + wy) * sz;
    const out9 = (yz - wx) * sz;
    const out10 = (1 - (xx + yy)) * sz;
    matrix[0] = out0;
    matrix[1] = out1;
    matrix[2] = out2;
    matrix[3] = 0;
    matrix[4] = out4;
    matrix[5] = out5;
    matrix[6] = out6;
    matrix[7] = 0;
    matrix[8] = out8;
    matrix[9] = out9;
    matrix[10] = out10;
    matrix[11] = 0;
    matrix[12] = translation.x + ox - (out0 * ox + out4 * oy + out8 * oz);
    matrix[13] = translation.y + oy - (out1 * ox + out5 * oy + out9 * oz);
    matrix[14] = translation.z + oz - (out2 * ox + out6 * oy + out10 * oz);
    matrix[15] = 1;
    return this;
  }

}

exports.Mat4 = Mat4;
},{}],"V1SK":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Vec2 = void 0;

/***
 Here we create a Vec2 class object
 This is a really basic Vector2 class used for vector calculations
 Highly based on https://github.com/mrdoob/three.js/blob/dev/src/math/Vector2.js and http://glmatrix.net/docs/vec2.js.html

 params :
 @x (float): X component of our vector
 @y (float): Y component of our vector

 returns :
 @this: our Vec2 class object
 ***/
// TODO lot of (unused at the time) methods are missing
class Vec2 {
  constructor(x = 0, y = 0) {
    this.type = "Vec2";
    this.set(x, y);
  }
  /***
   Sets the vector from values
     params:
   @x (float): X component of our vector
   @y (float): Y component of our vector
     returns:
   @this (Vec2): this vector after being set
   ***/


  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }
  /***
   Adds a vector to this vector
     params:
   @vector (Vec2): vector to add
     returns:
   @this (Vec2): this vector after addition
   ***/


  add(vector) {
    this.x += vector.x;
    this.y += vector.y;
    return this;
  }
  /***
   Adds a scalar to this vector
     params:
   @value (float): number to add
     returns:
   @this (Vec2): this vector after addition
   ***/


  addScalar(value) {
    this.x += value;
    this.y += value;
    return this;
  }
  /***
   Subtracts a vector from this vector
     params:
   @vector (Vec2): vector to use for subtraction
     returns:
   @this (Vec2): this vector after subtraction
   ***/


  sub(vector) {
    this.x -= vector.x;
    this.y -= vector.y;
    return this;
  }
  /***
   Subtracts a scalar to this vector
     params:
   @value (float): number to use for subtraction
     returns:
   @this (Vec2): this vector after subtraction
   ***/


  subScalar(value) {
    this.x -= value;
    this.y -= value;
    return this;
  }
  /***
   Multiplies a vector with this vector
     params:
   @vector (Vec2): vector to use for multiplication
     returns:
   @this (Vec2): this vector after multiplication
   ***/


  multiply(vector) {
    this.x *= vector.x;
    this.y *= vector.y;
    return this;
  }
  /***
   Multiplies a scalar with this vector
     params:
   @value (float): number to use for multiplication
     returns:
   @this (Vec2): this vector after multiplication
   ***/


  multiplyScalar(value) {
    this.x *= value;
    this.y *= value;
    return this;
  }
  /***
   Copy a vector into this vector
     params:
   @vector (Vec2): vector to copy
     returns:
   @this (Vec2): this vector after copy
   ***/


  copy(vector) {
    this.x = vector.x;
    this.y = vector.y;
    return this;
  }
  /***
   Clone this vector
     returns:
   @vector (Vec2): cloned vector
   ***/


  clone() {
    return new Vec2(this.x, this.y);
  }
  /***
   Merges this vector with a vector when values are NaN. Mostly used internally.
     params:
   @vector (Vec2): vector to use for sanitization
     returns:
   @vector (Vec2): sanitized vector
   ***/


  sanitizeNaNValuesWith(vector) {
    this.x = isNaN(this.x) ? vector.x : parseFloat(this.x);
    this.y = isNaN(this.y) ? vector.y : parseFloat(this.y);
    return this;
  }
  /***
   Apply max values to this vector
     params:
   @vector (Vec2): vector representing max values
     returns:
   @vector (Vec2): vector with max values applied
   ***/


  max(vector) {
    this.x = Math.max(this.x, vector.x);
    this.y = Math.max(this.y, vector.y);
    return this;
  }
  /***
   Apply min values to this vector
     params:
   @vector (Vec2): vector representing min values
     returns:
   @vector (Vec2): vector with min values applied
   ***/


  min(vector) {
    this.x = Math.min(this.x, vector.x);
    this.y = Math.min(this.y, vector.y);
    return this;
  }
  /***
   Checks if 2 vectors are equal
     params:
   @vector (Vec2): vector to compare
     returns:
   @isEqual (bool): whether the vectors are equals or not
   ***/


  equals(vector) {
    return this.x === vector.x && this.y === vector.y;
  }
  /***
   Normalize this vector
     returns:
   @this (Vec2): normalized vector
   ***/


  normalize() {
    // normalize
    let len = this.x * this.x + this.y * this.y;

    if (len > 0) {
      len = 1 / Math.sqrt(len);
    }

    this.x *= len;
    this.y *= len;
    return this;
  }
  /***
   Calculates the dot product of 2 vectors
     params:
   @vector (Vec2): vector to use for dot product
     returns:
   @dotProduct (float): dot product of the 2 vectors
   ***/


  dot(vector) {
    return this.x * vector.x + this.y * vector.y;
  }

}

exports.Vec2 = Vec2;
},{}],"RQKC":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Texture = void 0;

var _Mat = require("../math/Mat4.js");

var _Vec = require("../math/Vec2.js");

var _utils = require("../utils/utils.js");

/***
 Texture class objects used by render targets, shader passes and planes.

 params:
 @renderer (Curtains renderer or Renderer class object): our curtains object OR our curtains renderer object

 @isFBOTexture (bool): Whether this texture is used by a render target/frame buffer object. Default to false
 @fromTexture (bool): Whether this texture should copy another texture right from init (and avoid creating a new webgl texture). Default to false
 @loader (TextureLoader class object): loader used to create that texture and load its source. Default to null

 @sampler (string): the texture sampler's name that will be used in the shaders

 @floatingPoint (string): texture floating point to apply. Could be "float", "half-float" or "none". Default to "none"

 @premultiplyAlpha (bool): Whether this texture should handle premultiplied alpha. Default to false
 @anisotropy (int): Texture anisotropy (see https://developer.mozilla.org/en-US/docs/Web/API/EXT_texture_filter_anisotropic). Default to 1
 @generateMipmap (bool): Whether to generate texture mipmaps (see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/generateMipmap). Default to true except for frame buffer objects textures.

 see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/samplerParameter
 @wrapS (GLenum): WebGL constant specifying the texture wrapping function for the texture coordinate S
 @wrapT (GLenum): WebGL constant specifying the texture wrapping function for the texture coordinate T
 @minFilter (GLenum): WebGL constant specifying the texture minification filter
 @magFilter (GLenum): WebGL constant specifying the texture magnification filter

 returns:
 @this: our newly created Texture class object
 ***/
class Texture {
  constructor(renderer, {
    isFBOTexture = false,
    fromTexture = false,
    loader,
    // texture sampler name
    sampler,
    // floating point textures
    floatingPoint = "none",
    // texture parameters
    premultiplyAlpha = false,
    anisotropy = 1,
    generateMipmap = null,
    wrapS,
    wrapT,
    minFilter,
    magFilter
  } = {}) {
    this.type = "Texture"; // we could pass our curtains object OR our curtains renderer object

    renderer = renderer && renderer.renderer || renderer;

    if (!renderer || renderer.type !== "Renderer") {
      (0, _utils.throwError)(this.type + ": Renderer not passed as first argument", renderer);
    } else if (!renderer.gl) {
      (0, _utils.throwError)(this.type + ": Renderer WebGL context is undefined", renderer);
    }

    this.renderer = renderer;
    this.gl = this.renderer.gl;
    this.uuid = (0, _utils.generateUUID)(); // texture parameters

    this._globalParameters = {
      // global gl context parameters
      unpackAlignment: 4,
      flipY: !isFBOTexture,
      premultiplyAlpha,
      // texImage2D properties
      floatingPoint: floatingPoint,
      type: this.gl.UNSIGNED_BYTE,
      internalFormat: this.gl.RGBA,
      format: this.gl.RGBA
    };
    this.parameters = {
      // per texture parameters
      anisotropy,
      generateMipmap: generateMipmap,
      wrapS: wrapS || this.gl.CLAMP_TO_EDGE,
      wrapT: wrapT || this.gl.CLAMP_TO_EDGE,
      minFilter: minFilter || this.gl.LINEAR,
      magFilter: magFilter || this.gl.LINEAR,
      _shouldUpdate: true
    }; // per texture state

    this._initState(); // is it a frame buffer object texture?
    // if it's not, type will change when the source will be loaded


    this.sourceType = isFBOTexture ? "fbo" : "empty";
    this._samplerName = sampler; // prepare texture sampler

    this._sampler = {
      isActive: false
    }; // we will always declare a texture matrix

    this._textureMatrix = {
      matrix: new _Mat.Mat4()
    };
    this.scale = new _Vec.Vec2(1, 1); // source loading and GPU uploading flags

    this._loader = loader;
    this._sourceLoaded = false;
    this._uploaded = false; // _willUpdate and shouldUpdate property are set to false by default
    // we will handle that in the setSource() method for videos and canvases

    this._willUpdate = false;
    this.shouldUpdate = false; // if we need to force a texture update

    this._forceUpdate = false; // custom user properties

    this.userData = {}; // useful flag to avoid binding texture that does not belong to current context

    this._canDraw = false; // is it set from an existing texture?

    if (fromTexture) {
      this._copyOnInit = true;
      this._copiedFrom = fromTexture; // everything else will be done when adding a parent to that texture

      return;
    }

    this._copyOnInit = false; // init our texture

    this._initTexture();
  }
  /***
   Init per-texture parameters state
   Called on init and on context restoration to force parameters settings
   ***/


  _initState() {
    this._state = {
      anisotropy: 1,
      generateMipmap: false,
      wrapS: null,
      wrapT: null,
      minFilter: null,
      magFilter: this.gl.LINEAR // default to gl.LINEAR

    };
  }
  /***
   Init our texture object
   ***/


  _initTexture() {
    // create our WebGL texture
    this._sampler.texture = this.gl.createTexture(); // bind the texture the target (TEXTURE_2D) of the active texture unit.

    this.gl.bindTexture(this.gl.TEXTURE_2D, this._sampler.texture);

    if (this.sourceType === "empty") {
      // draw a black plane before the real texture's content has been loaded
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this._globalParameters.internalFormat, 1, 1, 0, this._globalParameters.format, this._globalParameters.type, new Uint8Array([0, 0, 0, 255]));
      this._canDraw = true;
    }
  }
  /*** RESTORING CONTEXT ***/

  /***
   Restore a WebGL texture that is a copy
   Depending on whether it's a copy from start or not, just reset its uniforms or run the full init
   And finally copy our original texture back again
   ***/


  _restoreFromTexture() {
    // init again if needed
    if (!this._copyOnInit) {
      this._initTexture();
    } // a texture shouldn't be restored if it does not have a parent
    // since it's always the parent that calls the _restoreContext() method


    if (this._parent) {
      // set uniforms again
      this._setTextureUniforms(); // update the texture matrix uniform as well


      this._setSize();
    } // copy our texture again


    this.copy(this._copiedFrom);
    this._canDraw = true;
  }
  /***
   Restore our WebGL texture
   If it is an original texture, just re run the init function and eventually reset its source
   If it is a texture set from another texture, wait for the original texture to be ready first
   ***/


  _restoreContext() {
    // avoid binding that texture before reseting it
    this._canDraw = false;
    this._sampler.isActive = false;

    this._initState(); // force mip map regeneration if needed


    this._state.generateMipmap = false;
    this.parameters._shouldUpdate = true; // this is an original texture, reset it right away

    if (!this._copiedFrom) {
      this._initTexture();

      if (this._parent) {
        this._setParent();
      }

      if (this.source) {
        this.setSource(this.source); // cache again if it is an image
        // also since it's an image it has been uploaded in setSource()

        if (this.sourceType === "image") {
          this.renderer.cache.addTexture(this);
        } else {
          // force update
          this.needUpdate();
        }
      }

      this._canDraw = true;
    } else {
      // wait for the original texure to be ready before attempting to restore the copy
      const queue = this.renderer.nextRender.add(() => {
        if (this._copiedFrom._canDraw) {
          this._restoreFromTexture(); // remove from callback queue


          queue.keep = false;
        }
      }, true);
    }
  }
  /*** ADD PARENT ***/

  /***
   Adds a parent to a texture
   Sets its index, its parent and add it to the parent textures array as well
   Then runs _setParent() to set the size and uniforms if needed
   ***/


  addParent(parent) {
    if (!parent || parent.type !== "Plane" && parent.type !== "ShaderPass" && parent.type !== "RenderTarget") {
      if (!this.renderer.production) {
        (0, _utils.throwWarning)(this.type + ": cannot add texture as a child of ", parent, " because it is not a valid parent");
      }

      return;
    } // add parent property


    this._parent = parent; // update parent textures array

    this.index = this._parent.textures.length;

    this._parent.textures.push(this); // now set its parent for real


    this._setParent();
  }
  /***
   Sets the parent
   Basically sets the uniforms names and locations and sizes
   ***/


  _setParent() {
    // prepare texture sampler
    this._sampler.name = this._samplerName || "uSampler" + this.index; // we will always declare a texture matrix

    this._textureMatrix.name = this._samplerName ? this._samplerName + "Matrix" : "uTextureMatrix" + this.index; // if the parent has a program it means its not a render target texture

    if (this._parent._program) {
      if (!this._parent._program.compiled) {
        if (!this.renderer.production) {
          (0, _utils.throwWarning)(this.type + ": Unable to create the texture because the program is not valid");
        }

        return;
      } // set uniform


      this._setTextureUniforms();

      if (this._copyOnInit) {
        // copy the original texture on next render
        this.renderer.nextRender.add(() => this.copy(this._copiedFrom)); // we're done!

        return;
      }

      if (!this.source) {
        // set its size based on parent element size for now
        this._size = {
          width: this._parent._boundingRect.document.width,
          height: this._parent._boundingRect.document.height
        };
      } else if (this._parent.loader) {
        // we're adding a parent to a texture that already has a source
        // it means the source should have been loaded before the parent was set
        // add it to the right asset array if needed
        this._parent.loader._addSourceToParent(this.source, this.sourceType);
      }

      this._setSize();
    } else if (this._parent.type === "RenderTarget") {
      // its a render target texture, it has no uniform location and no texture matrix
      this._size = {
        width: this._parent._size && this._parent._size.width || this.renderer._boundingRect.width,
        height: this._parent._size && this._parent._size.height || this.renderer._boundingRect.height
      }; // updload to gpu

      this._upload(); // update render texture parameters because it will never be drawn (hence not called)


      this._updateTexParameters();

      this._canDraw = true;
    }
  }
  /***
   Checks if this texture has a parent
     return:
   @hasParent (bool): whether this texture has a parent or not
   ***/


  hasParent() {
    return !!this._parent;
  }
  /*** SEND DATA TO THE GPU ***/

  /***
   Check if our textures is effectively used in our shaders
   If so, set it to active, get its uniform locations and bind it to our texture unit
   ***/


  _setTextureUniforms() {
    // check if our texture is used in our program shaders
    // if so, get its uniform locations and bind it to our program
    for (let i = 0; i < this._parent._program.activeTextures.length; i++) {
      if (this._parent._program.activeTextures[i] === this._sampler.name) {
        // this texture is active
        this._sampler.isActive = true; // use the program and get our sampler and texture matrices uniforms

        this.renderer.useProgram(this._parent._program); // set our texture sampler uniform

        this._sampler.location = this.gl.getUniformLocation(this._parent._program.program, this._sampler.name); // texture matrix uniform

        this._textureMatrix.location = this.gl.getUniformLocation(this._parent._program.program, this._textureMatrix.name); // tell the shader we bound the texture to our indexed texture unit

        this.gl.uniform1i(this._sampler.location, this.index);
      }
    }
  }
  /***
   This copies an already existing Texture object to our texture
   DEPRECATED
     params:
   @texture (Texture): texture to set from
   ***/


  setFromTexture(texture) {
    if (!this.renderer.production) {
      (0, _utils.throwWarning)(this.type + ": setFromTexture() is deprecated, use copy() instead");
    }

    this.copy(texture);
  }
  /***
   This copies an already existing Texture object to our texture
     params:
   @texture (Texture): texture to set from
   ***/


  copy(texture) {
    if (!texture || texture.type !== "Texture") {
      if (!this.renderer.production) {
        (0, _utils.throwWarning)(this.type + ": Unable to set the texture from texture:", texture);
      }

      return;
    } // copy states
    //this._globalParameters = texture._globalParameters;


    this.parameters = texture.parameters;
    this._state = texture._state; // copy source

    this._size = texture._size;
    this._sourceLoaded = texture._sourceLoaded;
    this._uploaded = texture._uploaded;
    this.sourceType = texture.sourceType;
    this.source = texture.source;
    this._videoFrameCallbackID = texture._videoFrameCallbackID; // copy texture

    this._sampler.texture = texture._sampler.texture; // keep a track from the original one

    this._copiedFrom = texture; // update its texture matrix if needed and we're good to go!

    if (this._parent && this._parent._program && (!this._canDraw || !this._textureMatrix.matrix)) {
      this._setSize();

      this._canDraw = true;
    } // force rendering


    this.renderer.needRender();
  }
  /*** LOADING SOURCES ***/

  /***
   This uses our source as texture
     params:
   @source (images/video/canvas): either an image, a video or a canvas
   ***/


  setSource(source) {
    // fire callback during load (useful for a loader)
    if (!this._sourceLoaded) {
      // texture source loaded callback
      this.renderer.nextRender.add(() => this._onSourceLoadedCallback && this._onSourceLoadedCallback());
    } // check for cache


    const cachedTexture = this.renderer.cache.getTextureFromSource(source); // if we have a cached texture, just copy it

    if (cachedTexture) {
      // force texture uploaded callback
      if (!this._uploaded) {
        // GPU uploading callback
        this.renderer.nextRender.add(() => this._onSourceUploadedCallback && this._onSourceUploadedCallback());
        this._uploaded = true;
      }

      this.copy(cachedTexture);
      this.resize();
      return;
    } // no cached texture, proceed normally


    this.source = source;

    if (this.sourceType === "empty") {
      if (source.tagName.toUpperCase() === "IMG") {
        this.sourceType = "image";
      } else if (source.tagName.toUpperCase() === "VIDEO") {
        this.sourceType = "video"; // a video should be updated by default
        // _willUpdate property will be set to true if the video has data to draw

        this.shouldUpdate = true;
      } else if (source.tagName.toUpperCase() === "CANVAS") {
        this.sourceType = "canvas"; // a canvas could change each frame so we need to update it by default

        this._willUpdate = true;
        this.shouldUpdate = true;
      } else if (!this.renderer.production) {
        (0, _utils.throwWarning)(this.type + ": this HTML tag could not be converted into a texture:", source.tagName);
      }
    }

    this._size = {
      width: this.source.naturalWidth || this.source.width || this.source.videoWidth,
      height: this.source.naturalHeight || this.source.height || this.source.videoHeight
    }; // our source is loaded now

    this._sourceLoaded = true; // no need to set WebGL active texture unit here, we'll do it at run time for each texture
    // binding the texture is enough

    this.gl.bindTexture(this.gl.TEXTURE_2D, this._sampler.texture);
    this.resize(); // upload our webgl texture only if it is an image
    // canvas and video textures will be updated anyway in the rendering loop
    // thanks to the shouldUpdate and _willUpdate flags

    if (this.sourceType === "image") {
      // generate mip maps if they have not been explicitly disabled
      this.parameters.generateMipmap = this.parameters.generateMipmap || this.parameters.generateMipmap === null;
      this.parameters._shouldUpdate = this.parameters.generateMipmap;
      this._state.generateMipmap = false;

      this._upload();
    } // update scene


    this.renderer.needRender();
  }
  /*** TEXTURE PARAMETERS ***/

  /***
   Updates textures parameters that depends on global WebGL context state
   Typically unpacking, flipY and premultiplied alpha
   Usually called before uploading a texture to the GPU
   ***/


  _updateGlobalTexParameters() {
    // unpack alignment
    if (this.renderer.state.unpackAlignment !== this._globalParameters.unpackAlignment) {
      this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, this._globalParameters.unpackAlignment);
      this.renderer.state.unpackAlignment = this._globalParameters.unpackAlignment;
    } // flip Y


    if (this.renderer.state.flipY !== this._globalParameters.flipY) {
      this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, this._globalParameters.flipY);
      this.renderer.state.flipY = this._globalParameters.flipY;
    } // premultiplied alpha


    if (this.renderer.state.premultiplyAlpha !== this._globalParameters.premultiplyAlpha) {
      this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this._globalParameters.premultiplyAlpha);
      this.renderer.state.premultiplyAlpha = this._globalParameters.premultiplyAlpha;
    } // floating point textures


    if (this._globalParameters.floatingPoint === "half-float") {
      if (this.renderer._isWebGL2 && this.renderer.extensions['EXT_color_buffer_float']) {
        this._globalParameters.internalFormat = this.gl.RGBA16F;
        this._globalParameters.type = this.gl.HALF_FLOAT;
      } else if (this.renderer.extensions['OES_texture_half_float']) {
        this._globalParameters.type = this.renderer.extensions['OES_texture_half_float'].HALF_FLOAT_OES;
      } else if (!this.renderer.production) {
        (0, _utils.throwWarning)(this.type + ": could not use half-float textures because the extension is not available");
      }
    } else if (this._globalParameters.floatingPoint === "float") {
      if (this.renderer._isWebGL2 && this.renderer.extensions['EXT_color_buffer_float']) {
        this._globalParameters.internalFormat = this.gl.RGBA16F;
        this._globalParameters.type = this.gl.FLOAT;
      } else if (this.renderer.extensions['OES_texture_float']) {
        this._globalParameters.type = this.renderer.extensions['OES_texture_half_float'].FLOAT;
      } else if (!this.renderer.production) {
        (0, _utils.throwWarning)(this.type + ": could not use float textures because the extension is not available");
      }
    }
  }
  /***
   Updates per-textures parameters
   Wrapping, filters, anisotropy and mipmaps generation
   Usually called after uploading a texture to the GPU
   ***/


  _updateTexParameters() {
    // be sure we're updating the right texture
    if (this.index && this.renderer.state.activeTexture !== this.index) {
      this._bindTexture(this);
    } // wrapS


    if (this.parameters.wrapS !== this._state.wrapS) {
      if (!this.renderer._isWebGL2 && (!(0, _utils.isPowerOf2)(this._size.width) || !(0, _utils.isPowerOf2)(this._size.height))) {
        this.parameters.wrapS = this.gl.CLAMP_TO_EDGE;
      } // handle wrong wrapS values


      if (this.parameters.wrapS !== this.gl.REPEAT && this.parameters.wrapS !== this.gl.CLAMP_TO_EDGE && this.parameters.wrapS !== this.gl.MIRRORED_REPEAT) {
        if (!this.renderer.production) {
          (0, _utils.throwWarning)(this.type + ": Wrong wrapS value", this.parameters.wrapS, "for this texture:", this, "\ngl.CLAMP_TO_EDGE wrapping will be used instead");
        }

        this.parameters.wrapS = this.gl.CLAMP_TO_EDGE;
      }

      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.parameters.wrapS);
      this._state.wrapS = this.parameters.wrapS;
    } // wrapT


    if (this.parameters.wrapT !== this._state.wrapT) {
      if (!this.renderer._isWebGL2 && (!(0, _utils.isPowerOf2)(this._size.width) || !(0, _utils.isPowerOf2)(this._size.height))) {
        this.parameters.wrapT = this.gl.CLAMP_TO_EDGE;
      } // handle wrong wrapT values


      if (this.parameters.wrapT !== this.gl.REPEAT && this.parameters.wrapT !== this.gl.CLAMP_TO_EDGE && this.parameters.wrapT !== this.gl.MIRRORED_REPEAT) {
        if (!this.renderer.production) {
          (0, _utils.throwWarning)(this.type + ": Wrong wrapT value", this.parameters.wrapT, "for this texture:", this, "\ngl.CLAMP_TO_EDGE wrapping will be used instead");
        }

        this.parameters.wrapT = this.gl.CLAMP_TO_EDGE;
      }

      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.parameters.wrapT);
      this._state.wrapT = this.parameters.wrapT;
    } // generate mip map only if it has a source


    if (this.parameters.generateMipmap && !this._state.generateMipmap && this.source) {
      if (!this.renderer._isWebGL2 && (!(0, _utils.isPowerOf2)(this._size.width) || !(0, _utils.isPowerOf2)(this._size.height))) {
        this.parameters.generateMipmap = false;
      } else {
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
      }

      this._state.generateMipmap = this.parameters.generateMipmap;
    } // min filter


    if (this.parameters.minFilter !== this._state.minFilter) {
      // WebGL1 and non PO2
      if (!this.renderer._isWebGL2 && (!(0, _utils.isPowerOf2)(this._size.width) || !(0, _utils.isPowerOf2)(this._size.height))) {
        this.parameters.minFilter = this.gl.LINEAR;
      } // at this point if generateMipmap is null it means we will generate them later on


      if (!this.parameters.generateMipmap && this.parameters.generateMipmap !== null) {
        this.parameters.minFilter = this.gl.LINEAR;
      } // handle wrong minFilter values


      if (this.parameters.minFilter !== this.gl.LINEAR && this.parameters.minFilter !== this.gl.NEAREST && this.parameters.minFilter !== this.gl.NEAREST_MIPMAP_NEAREST && this.parameters.minFilter !== this.gl.LINEAR_MIPMAP_NEAREST && this.parameters.minFilter !== this.gl.NEAREST_MIPMAP_LINEAR && this.parameters.minFilter !== this.gl.LINEAR_MIPMAP_LINEAR) {
        if (!this.renderer.production) {
          (0, _utils.throwWarning)(this.type + ": Wrong minFilter value", this.parameters.minFilter, "for this texture:", this, "\ngl.LINEAR filtering will be used instead");
        }

        this.parameters.minFilter = this.gl.LINEAR;
      }

      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.parameters.minFilter);
      this._state.minFilter = this.parameters.minFilter;
    } // mag filter


    if (this.parameters.magFilter !== this._state.magFilter) {
      if (!this.renderer._isWebGL2 && (!(0, _utils.isPowerOf2)(this._size.width) || !(0, _utils.isPowerOf2)(this._size.height))) {
        this.parameters.magFilter = this.gl.LINEAR;
      } // handle wrong magFilter values


      if (this.parameters.magFilter !== this.gl.LINEAR && this.parameters.magFilter !== this.gl.NEAREST) {
        if (!this.renderer.production) {
          (0, _utils.throwWarning)(this.type + ": Wrong magFilter value", this.parameters.magFilter, "for this texture:", this, "\ngl.LINEAR filtering will be used instead");
        }

        this.parameters.magFilter = this.gl.LINEAR;
      }

      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.parameters.magFilter);
      this._state.magFilter = this.parameters.magFilter;
    } // anisotropy


    const anisotropyExt = this.renderer.extensions['EXT_texture_filter_anisotropic'];

    if (anisotropyExt && this.parameters.anisotropy !== this._state.anisotropy) {
      const max = this.gl.getParameter(anisotropyExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
      this.parameters.anisotropy = Math.max(1, Math.min(this.parameters.anisotropy, max));
      this.gl.texParameterf(this.gl.TEXTURE_2D, anisotropyExt.TEXTURE_MAX_ANISOTROPY_EXT, this.parameters.anisotropy);
      this._state.anisotropy = this.parameters.anisotropy;
    }
  }
  /***
   Sets the texture wrapping for the texture coordinate S
     params:
   @wrapS (GLenum): WebGL constant specifying the texture wrapping function for the texture coordinate S
   ***/


  setWrapS(wrapS) {
    if (this.parameters.wrapS !== wrapS) {
      this.parameters.wrapS = wrapS;
      this.parameters._shouldUpdate = true;
    }
  }
  /***
   Sets the texture wrapping for the texture coordinate T
     params:
   @wrapT (GLenum): WebGL constant specifying the texture wrapping function for the texture coordinate T
   ***/


  setWrapT(wrapT) {
    if (this.parameters.wrapT !== wrapT) {
      this.parameters.wrapT = wrapT;
      this.parameters._shouldUpdate = true;
    }
  }
  /***
   Sets the texture minifaction filter value
     params:
   @minFilter (GLenum): WebGL constant specifying the texture minification filter
   ***/


  setMinFilter(minFilter) {
    if (this.parameters.minFilter !== minFilter) {
      this.parameters.minFilter = minFilter;
      this.parameters._shouldUpdate = true;
    }
  }
  /***
   Sets the texture magnifaction filter value
     params:
   @magFilter (GLenum): WebGL constant specifying the texture magnifaction filter
   ***/


  setMagFilter(magFilter) {
    if (this.parameters.magFilter !== magFilter) {
      this.parameters.magFilter = magFilter;
      this.parameters._shouldUpdate = true;
    }
  }
  /***
   Sets the texture anisotropy
     params:
   @anisotropy (int): Texture anisotropy value
   ***/


  setAnisotropy(anisotropy) {
    anisotropy = isNaN(anisotropy) ? this.parameters.anisotropy : anisotropy;

    if (this.parameters.anisotropy !== anisotropy) {
      this.parameters.anisotropy = anisotropy;
      this.parameters._shouldUpdate = true;
    }
  }
  /***
   This forces a texture to be updated on the next draw call
   ***/


  needUpdate() {
    this._forceUpdate = true;
  }
  /***
   This uses the requestVideoFrameCallback API to update the texture each time a new frame is displayed
   ***/


  _videoFrameCallback() {
    this._willUpdate = true;
    this.source.requestVideoFrameCallback(() => this._videoFrameCallback());
  }
  /***
   This updloads our texture to the GPU
   Called on init or inside our drawing loop if shouldUpdate property is set to true
   Typically used by videos or canvas
   ***/


  _upload() {
    // set parameters that need to be set before texture uploading
    this._updateGlobalTexParameters();

    if (this.source) {
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this._globalParameters.internalFormat, this._globalParameters.format, this._globalParameters.type, this.source);
    } else if (this.sourceType === "fbo") {
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this._globalParameters.internalFormat, this._size.width, this._size.height, 0, this._globalParameters.format, this._globalParameters.type, this.source);
    } // texture has been uploaded


    if (!this._uploaded) {
      // GPU uploading callback
      this.renderer.nextRender.add(() => this._onSourceUploadedCallback && this._onSourceUploadedCallback());
      this._uploaded = true;
    }
  }
  /*** TEXTURE SIZINGS ***/

  /***
   This is used to calculate how to crop/center an texture
     returns:
   @sizes (obj): an object containing plane sizes, source sizes and x and y offset to center the source in the plane
   ***/


  _getSizes() {
    // if this is a fbo texture, its size is the same as its parent
    if (this.sourceType === "fbo") {
      return {
        parentWidth: this._parent._boundingRect.document.width,
        parentHeight: this._parent._boundingRect.document.height,
        sourceWidth: this._parent._boundingRect.document.width,
        sourceHeight: this._parent._boundingRect.document.height,
        xOffset: 0,
        yOffset: 0
      };
    } // remember our ShaderPass objects don't have a scale property


    const scale = this._parent.scale ? new _Vec.Vec2(this._parent.scale.x, this._parent.scale.y) : new _Vec.Vec2(1, 1);
    const parentWidth = this._parent._boundingRect.document.width * scale.x;
    const parentHeight = this._parent._boundingRect.document.height * scale.y;
    const sourceWidth = this._size.width;
    const sourceHeight = this._size.height;
    const sourceRatio = sourceWidth / sourceHeight;
    const parentRatio = parentWidth / parentHeight; // center image in its container

    let xOffset = 0;
    let yOffset = 0;

    if (parentRatio > sourceRatio) {
      // means parent is larger
      yOffset = Math.min(0, parentHeight - parentWidth * (1 / sourceRatio));
    } else if (parentRatio < sourceRatio) {
      // means parent is taller
      xOffset = Math.min(0, parentWidth - parentHeight * sourceRatio);
    }

    return {
      parentWidth: parentWidth,
      parentHeight: parentHeight,
      sourceWidth: sourceWidth,
      sourceHeight: sourceHeight,
      xOffset: xOffset,
      yOffset: yOffset
    };
  }
  /***
   Set the texture scale and then update its matrix
     params:
   @scale (Vec2 object): scale to apply on X and Y axes
   ***/


  setScale(scale) {
    if (!scale.type || scale.type !== "Vec2") {
      if (!this.renderer.production) {
        (0, _utils.throwWarning)(this.type + ": Cannot set scale because the parameter passed is not of Vec2 type:", scale);
      }

      return;
    }

    scale.sanitizeNaNValuesWith(this.scale).max(new _Vec.Vec2(0.001, 0.001));

    if (!scale.equals(this.scale)) {
      this.scale.copy(scale);
      this.resize();
    }
  }
  /***
   Gets our texture and parent sizes and tells our texture matrix to update based on those values
   ***/


  _setSize() {
    // if we need to update the texture matrix uniform
    if (this._parent && this._parent._program) {
      const sizes = this._getSizes(); // always update texture matrix anyway


      this._updateTextureMatrix(sizes);
    }
  }
  /***
   This is used to crop/center a texture
   If the texture is using texture matrix then we just have to update its matrix
   If it is a render pass texture we also upload the texture with its new size on the GPU
   ***/


  resize() {
    if (this.sourceType === "fbo") {
      // update size based on parent sizes (RenderTarget or ShaderPass)
      this._size = {
        width: this._parent._size && this._parent._size.width || this._parent._boundingRect.document.width,
        height: this._parent._size && this._parent._size.height || this._parent._boundingRect.document.height
      }; // reupload only if its not a texture set from another texture (means its a RenderTarget texture)

      if (!this._copiedFrom) {
        this.gl.bindTexture(this.gl.TEXTURE_2D, this._sampler.texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this._globalParameters.internalFormat, this._size.width, this._size.height, 0, this._globalParameters.format, this._globalParameters.type, null);
      }
    } else if (this.source) {
      // reset texture sizes (useful for canvas because their dimensions might change on resize)
      this._size = {
        width: this.source.naturalWidth || this.source.width || this.source.videoWidth,
        height: this.source.naturalHeight || this.source.height || this.source.videoHeight
      };
    }

    this._setSize();
  }
  /***
   This updates our textures matrix uniform based on plane and sources sizes
     params:
   @sizes (object): object containing plane sizes, source sizes and x and y offset to center the source in the plane
   ***/


  _updateTextureMatrix(sizes) {
    // calculate scale to apply to the matrix
    let textureScale = new _Vec.Vec2(sizes.parentWidth / (sizes.parentWidth - sizes.xOffset), sizes.parentHeight / (sizes.parentHeight - sizes.yOffset)); // apply texture scale

    textureScale.x /= this.scale.x;
    textureScale.y /= this.scale.y; // translate texture to center it

    const textureTranslation = new _Mat.Mat4([1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, (1 - textureScale.x) / 2, (1 - textureScale.y) / 2, 0.0, 1.0]); // scale texture

    this._textureMatrix.matrix = textureTranslation.scale(textureScale); // update the texture matrix uniform

    this.renderer.useProgram(this._parent._program);
    this.gl.uniformMatrix4fv(this._textureMatrix.location, false, this._textureMatrix.matrix.elements);
  }
  /***
   This calls our loading callback and set our media as texture source
   ***/


  _onSourceLoaded(source) {
    // set the media as our texture source
    this.setSource(source); // add to the cache if needed

    if (this.sourceType === "image") {
      this.renderer.cache.addTexture(this);
    }
  }
  /*** DRAWING ***/

  /***
   This is used to set the WebGL context active texture and bind it
     params:
   @texture (texture object): Our texture object containing our WebGL texture and its index
   ***/


  _bindTexture() {
    if (this._canDraw) {
      if (this.renderer.state.activeTexture !== this.index) {
        // tell WebGL we want to affect the texture at the plane's index unit
        this.gl.activeTexture(this.gl.TEXTURE0 + this.index);
        this.renderer.state.activeTexture = this.index;
      } // bind the texture to the plane's index unit


      this.gl.bindTexture(this.gl.TEXTURE_2D, this._sampler.texture);
    }
  }
  /***
   This is called to draw the texture
   ***/


  _draw() {
    // only draw if the texture is active (used in the shader)
    if (this._sampler.isActive) {
      // bind the texture
      this._bindTexture(this); // if no videoFrameCallback check if the video is actually really playing


      if (this.sourceType === "video" && this.source && !this._videoFrameCallbackID && this.source.readyState >= this.source.HAVE_CURRENT_DATA && !this.source.paused) {
        this._willUpdate = true;
      }

      if (this._forceUpdate || this._willUpdate && this.shouldUpdate) {
        // force mipmaps regeneration if needed
        this._state.generateMipmap = false;

        this._upload();
      } // reset the video willUpdate flag


      if (this.sourceType === "video") {
        this._willUpdate = false;
      }

      this._forceUpdate = false;
    } // set parameters that need to be set after texture uploading


    if (this.parameters._shouldUpdate) {
      this._updateTexParameters();

      this.parameters._shouldUpdate = false;
    }
  }
  /*** EVENTS ***/

  /***
   This is called each time a source has been loaded for the first time
   TODO useless?
     params :
   @callback (function) : a function to execute
     returns :
   @this: our texture to handle chaining
   ***/


  onSourceLoaded(callback) {
    if (callback) {
      this._onSourceLoadedCallback = callback;
    }

    return this;
  }
  /***
   This is called each time a texture has been uploaded to the GPU for the first time
     params :
   @callback (function) : a function to execute
     returns :
   @this: our texture to handle chaining
   ***/


  onSourceUploaded(callback) {
    if (callback) {
      this._onSourceUploadedCallback = callback;
    }

    return this;
  }
  /*** DESTROYING ***/

  /***
   This is used to destroy a texture and free the memory space
   Usually used on a plane/shader pass/render target removal
     params:
   @force (bool, optional): force the texture to be deleted even if cached
   ***/


  _dispose(force = false) {
    if (this.sourceType === "video" || this.sourceType === "image" && !this.renderer.state.isActive) {
      // remove event listeners
      if (this._loader) {
        this._loader._removeSource(this);
      } // clear source


      this.source = null;
    } else if (this.sourceType === "canvas") {
      // clear all canvas states
      this.source.width = this.source.width; // clear source

      this.source = null;
    } // remove its parent


    this._parent = null; // do not delete original texture if this texture is a copy, or image texture if we're not destroying the context

    const shouldDelete = this.gl && !this._copiedFrom && (force || this.sourceType !== "image" || !this.renderer.state.isActive);

    if (shouldDelete) {
      // if the texture is in our textures cache array, remove it
      this.renderer.cache.removeTexture(this);
      this.gl.activeTexture(this.gl.TEXTURE0 + this.index);
      this.gl.bindTexture(this.gl.TEXTURE_2D, null);
      this.gl.deleteTexture(this._sampler.texture);
    }
  }

}

exports.Texture = Texture;
},{"../math/Mat4.js":"ceZz","../math/Vec2.js":"V1SK","../utils/utils.js":"eOZP"}],"mCwe":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TextureLoader = void 0;

var _Texture = require("../core/Texture.js");

var _utils = require("../utils/utils.js");

/*** TEXTURE LOADER CLASS ***/

/***
 An asset loader that handles images, videos and canvas loading
 Load the assets and create a Texture class object that will use those assets as sources

 params:
 @renderer (Curtains or Renderer class object): our curtains object OR our curtains renderer object
 @crossOrigin (string, optional): crossorigin policy to use

 returns :
 @this: our TextureLoader element
 ***/
// TODO create a new Image or Video element for each of this sources (allows to set crossorigin before src to avois CORS issues)?
// TODO load assets with a web worker?
class TextureLoader {
  constructor(renderer, crossOrigin = "anonymous") {
    this.type = "TextureLoader"; // we could pass our curtains object OR our curtains renderer object

    renderer = renderer && renderer.renderer || renderer; // throw warning if no renderer or webgl context

    if (!renderer || renderer.type !== "Renderer") {
      (0, _utils.throwError)(this.type + ": Renderer not passed as first argument", renderer);
    } else if (!renderer.gl) {
      (0, _utils.throwError)(this.type + ": Renderer WebGL context is undefined", renderer);
    } // renderer and webgl context


    this.renderer = renderer;
    this.gl = this.renderer.gl; // crossorigin policy to apply

    this.crossOrigin = crossOrigin; // keep a track of all sources loaded via this loader

    this.elements = [];
  }
  /***
   Keep a track of all sources loaded via this loader with an els array
   This allows to get clean refs to the event listeners to be able to remove them later
     params:
   @source (html element): html image, video or canvas element that has been loaded
   @texture (Texture class object): our newly created texture that will use that source
   @successCallback (function): reference to our success callback
   @errorCallback (function): reference to our error callback
   ***/


  _addElement(source, texture, successCallback, errorCallback) {
    const el = {
      source,
      texture,
      load: this._sourceLoaded.bind(this, source, texture, successCallback),
      error: this._sourceLoadError.bind(this, source, errorCallback)
    };
    this.elements.push(el);
    return el;
  }
  /***
   Handles media loading errors
     params:
   @source (html element): html image or video element that has failed to load
   @callback (function): function to execute
   @error (object): loading error
   ***/


  _sourceLoadError(source, callback, error) {
    // execute callback
    if (callback) {
      callback(source, error);
    }
  }
  /***
   Handles media loading success
     params:
   @source (html element): html image, video or canvas element that has been loaded
   @texture (Texture class object): our newly created texture that will use that source
   @callback (function): function to execute
   ***/


  _sourceLoaded(source, texture, callback) {
    // execute only once
    if (!texture._sourceLoaded) {
      texture._onSourceLoaded(source); // if this loader has a parent (means its a PlaneTextureLoader)


      if (this._parent) {
        // increment plane texture loader
        this._increment && this._increment();
        this.renderer.nextRender.add(() => this._parent._onLoadingCallback && this._parent._onLoadingCallback(texture));
      }
    } // execute callback


    if (callback) {
      callback(texture);
    }
  }
  /***
   Get the source type based on its file extension if it's a string or it's tag name if its a HTML element
     params:
   @source (html element or string): html image, video, canvas element or source url
     returns :
   @sourceType (string): either "image", "video", "canvas" or null if source type cannot be determined
   ***/


  _getSourceType(source) {
    let sourceType;

    if (typeof source === "string") {
      // from https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#Supported_image_formats
      if (source.match(/\.(jpeg|jpg|jfif|pjpeg|pjp|gif|bmp|png|webp|svg)$/) !== null) {
        sourceType = "image";
      } else if (source.match(/\.(webm|mp4|ogg|mov)$/) !== null) {
        sourceType = "video";
      }
    } else {
      if (source.tagName.toUpperCase() === "IMG") {
        sourceType = "image";
      } else if (source.tagName.toUpperCase() === "VIDEO") {
        sourceType = "video";
      } else if (source.tagName.toUpperCase() === "CANVAS") {
        sourceType = "canvas";
      }
    }

    return sourceType;
  }
  /***
   Create an image HTML element based on an image source url
     params:
   @source (string): source url
     returns :
   @image (HTML image element): an HTML image element
   ***/


  _createImage(source) {
    const image = new Image();
    image.crossOrigin = this.crossOrigin;
    image.src = source;
    return image;
  }
  /***
   Create a video HTML element based on a video source url
     params:
   @source (string): source url
     returns :
   @video (HTML video element): an HTML video element
   ***/


  _createVideo(source) {
    const video = document.createElement('video');
    video.crossOrigin = this.crossOrigin;
    video.src = source;
    return video;
  }
  /***
   This method loads one source
   It checks what type of source it is then use the right loader
     params:
   @source (html element): html image, video or canvas element
   @textureOptions (object): parameters to apply to the textures, such as sampler name, repeat wrapping, filters, anisotropy...
   @successCallback (function): function to execute when the source has been loaded
   @errorCallback (function): function to execute if the source fails to load
   ***/


  loadSource(source, textureOptions, successCallback, errorCallback) {
    // get source type to use the right loader
    const sourceType = this._getSourceType(source);

    switch (sourceType) {
      case "image":
        this.loadImage(source, textureOptions, successCallback, errorCallback);
        break;

      case "video":
        this.loadVideo(source, textureOptions, successCallback, errorCallback);
        break;

      case "canvas":
        this.loadCanvas(source, textureOptions, successCallback);
        break;

      default:
        this._sourceLoadError(source, errorCallback, "this source could not be converted into a texture: " + source);

        break;
    }
  }
  /***
   This method loads an array of sources by calling loadSource() for each one of them
     params:
   @sources (array of html elements / sources url): array of html images, videos, canvases element or sources url
   @texturesOptions (object): parameters to apply to the textures, such as sampler name, repeat wrapping, filters, anisotropy...
   @successCallback (function): function to execute when each source has been loaded
   @errorCallback (function): function to execute if a source fails to load
   ***/


  loadSources(sources, texturesOptions, successCallback, errorCallback) {
    for (let i = 0; i < sources.length; i++) {
      this.loadSource(sources[i], texturesOptions, successCallback, errorCallback);
    }
  }
  /***
   This method loads an image
   Creates a new texture object right away and once the image is loaded it uses it as our WebGL texture
     params:
   @source (image): html image element
   @textureOptions (object): parameters to apply to the textures, such as sampler name, repeat wrapping, filters, anisotropy...
   @successCallback (function): function to execute when the source has been loaded
   @errorCallback (function): function to execute if the source fails to load
   ***/


  loadImage(source, textureOptions = {}, successCallback, errorCallback) {
    if (typeof source === "string") {
      source = this._createImage(source);
    }

    source.crossOrigin = this.crossOrigin; // merge texture options with its parent textures options if needed

    if (this._parent) {
      textureOptions = Object.assign(textureOptions, this._parent._texturesOptions);
    } // check for cache


    const cachedTexture = this.renderer.cache.getTextureFromSource(source);

    if (cachedTexture) {
      const texture = new _Texture.Texture(this.renderer, {
        loader: this,
        fromTexture: cachedTexture,
        sampler: textureOptions.sampler || source.getAttribute("data-sampler"),
        premultiplyAlpha: textureOptions.premultiplyAlpha,
        anisotropy: textureOptions.anisotropy,
        generateMipmap: textureOptions.generateMipmap,
        wrapS: textureOptions.wrapS,
        wrapT: textureOptions.wrapT,
        minFilter: textureOptions.minFilter,
        magFilter: textureOptions.magFilter
      }); // execute sucess callback directly

      if (successCallback) {
        successCallback(texture);
      } // if there's a parent (PlaneTextureLoader) add texture and source to it


      this._parent && this._addToParent(texture, source, "image"); // that's all!

      return;
    } // create a new texture that will use our image later


    const texture = new _Texture.Texture(this.renderer, {
      loader: this,
      sampler: textureOptions.sampler || source.getAttribute("data-sampler"),
      premultiplyAlpha: textureOptions.premultiplyAlpha,
      anisotropy: textureOptions.anisotropy,
      generateMipmap: textureOptions.generateMipmap,
      wrapS: textureOptions.wrapS,
      wrapT: textureOptions.wrapT,
      minFilter: textureOptions.minFilter,
      magFilter: textureOptions.magFilter
    }); // add a new entry in our elements array

    const el = this._addElement(source, texture, successCallback, errorCallback); // If the image is in the cache of the browser,
    // the 'load' event might have been triggered
    // before we registered the event handler.


    if (source.complete) {
      this._sourceLoaded(source, texture, successCallback);
    } else if (source.decode) {
      source.decode().then(this._sourceLoaded.bind(this, source, texture, successCallback)).catch(() => {
        // fallback to classic load & error events
        source.addEventListener('load', el.load, false);
        source.addEventListener('error', el.error, false);
      });
    } else {
      source.addEventListener('load', el.load, false);
      source.addEventListener('error', el.error, false);
    } // if there's a parent (PlaneTextureLoader) add texture and source to it


    this._parent && this._addToParent(texture, source, "image");
  }
  /***
   This method loads an array of images by calling loadImage() for each one of them
     params:
   @sources (array of images / images url): array of html images elements or images url
   @texturesOptions (object): parameters to apply to the textures, such as sampler name, repeat wrapping, filters, anisotropy...
   @successCallback (function): function to execute when each source has been loaded
   @errorCallback (function): function to execute if a source fails to load
   ***/


  loadImages(sources, texturesOptions, successCallback, errorCallback) {
    for (let i = 0; i < sources.length; i++) {
      this.loadImage(sources[i], texturesOptions, successCallback, errorCallback);
    }
  }
  /***
   This method loads a video
   Creates a new texture object right away and once the video has enough data it uses it as our WebGL texture
     params:
   @source (video): html video element
   @textureOptions (object): parameters to apply to the textures, such as sampler name, repeat wrapping, filters, anisotropy...
   @successCallback (function): function to execute when the source has been loaded
   @errorCallback (function): function to execute if the source fails to load
   ***/


  loadVideo(source, textureOptions = {}, successCallback, errorCallback) {
    if (typeof source === "string") {
      source = this._createVideo(source);
    }

    source.preload = true;
    source.muted = true;
    source.loop = true;
    source.playsinline = true;
    source.crossOrigin = this.crossOrigin; // merge texture options with its parent textures options if needed

    if (this._parent) {
      textureOptions = Object.assign(textureOptions, this._parent._texturesOptions);
    } // create a new texture that will use our video later


    const texture = new _Texture.Texture(this.renderer, {
      loader: this,
      sampler: textureOptions.sampler || source.getAttribute("data-sampler"),
      premultiplyAlpha: textureOptions.premultiplyAlpha,
      anisotropy: textureOptions.anisotropy,
      generateMipmap: textureOptions.generateMipmap,
      wrapS: textureOptions.wrapS,
      wrapT: textureOptions.wrapT,
      minFilter: textureOptions.minFilter,
      magFilter: textureOptions.magFilter
    }); // add a new entry in our elements array

    const el = this._addElement(source, texture, successCallback, errorCallback); // handle our loaded data event inside the texture and tell our plane when the video is ready to play


    source.addEventListener('canplaythrough', el.load, false);
    source.addEventListener('error', el.error, false); // If the video is in the cache of the browser,
    // the 'canplaythrough' event might have been triggered
    // before we registered the event handler.

    if (source.readyState >= source.HAVE_FUTURE_DATA && successCallback) {
      this._sourceLoaded(source, texture, successCallback);
    } // start loading our video


    source.load(); // if there's a parent (PlaneTextureLoader) add texture and source to it

    this._addToParent && this._addToParent(texture, source, "video"); // if requestVideoFrameCallback exist, use it to update our video texture

    if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
      el.videoFrameCallback = texture._videoFrameCallback.bind(texture);
      texture._videoFrameCallbackID = source.requestVideoFrameCallback(el.videoFrameCallback);
    }
  }
  /***
   This method loads an array of images by calling loadVideo() for each one of them
     params:
   @sources (array of videos / videos url): array of html videos elements or videos url
   @texturesOptions (object): parameters to apply to the textures, such as sampler name, repeat wrapping, filters, anisotropy...
   @successCallback (function): function to execute when each source has been loaded
   @errorCallback (function): function to execute if a source fails to load
   ***/


  loadVideos(sources, texturesOptions, successCallback, errorCallback) {
    for (let i = 0; i < sources.length; i++) {
      this.loadVideo(sources[i], texturesOptions, successCallback, errorCallback);
    }
  }
  /***
   This method loads a canvas
   Creates a new texture object right away and uses the canvas as our WebGL texture
     params:
   @source (canvas): html canvas element
   @textureOptions (object): parameters to apply to the textures, such as sampler name, repeat wrapping, filters, anisotropy...
   @successCallback (function): function to execute when the source has been loaded
   ***/


  loadCanvas(source, textureOptions = {}, successCallback) {
    // merge texture options with its parent textures options if needed
    if (this._parent) {
      textureOptions = Object.assign(textureOptions, this._parent._texturesOptions);
    } // create a new texture that will use our source later


    const texture = new _Texture.Texture(this.renderer, {
      loader: this,
      sampler: textureOptions.sampler || source.getAttribute("data-sampler"),
      premultiplyAlpha: textureOptions.premultiplyAlpha,
      anisotropy: textureOptions.anisotropy,
      generateMipmap: textureOptions.generateMipmap,
      wrapS: textureOptions.wrapS,
      wrapT: textureOptions.wrapT,
      minFilter: textureOptions.minFilter,
      magFilter: textureOptions.magFilter
    }); // add a new entry in our elements array

    this._addElement(source, texture, successCallback, null); // canvas are directly loaded


    this._sourceLoaded(source, texture, successCallback); // if there's a parent (PlaneTextureLoader) add texture and source to it


    this._parent && this._addToParent(texture, source, "canvas");
  }
  /***
   This method loads an array of images by calling loadCanvas() for each one of them
     params:
   @sources (array of canvas): array of html canvases elements
   @texturesOptions (object): parameters to apply to the textures, such as sampler name, repeat wrapping, filters, anisotropy...
   @successCallback (function): function to execute when each source has been loaded
   ***/


  loadCanvases(sources, texturesOptions, successCallback) {
    for (let i = 0; i < sources.length; i++) {
      this.loadCanvas(sources[i], texturesOptions, successCallback);
    }
  }
  /*** REMOVING EVENT LISTENERS ***/

  /***
   Cleanly removes a texture source by removing its associated event listeners
     params:
   @texture (Texture class object): The texture that contains our source
   ***/


  _removeSource(texture) {
    // find our reference el in our els array
    const el = this.elements.find(element => element.texture.uuid === texture.uuid); // if we have an element, remove its associated event listeners

    if (el) {
      if (texture.sourceType === "image") {
        el.source.removeEventListener("load", el.load, false);
      } else if (texture.sourceType === "video") {
        // cancel video frame callback
        if (el.videoFrameCallback && texture._videoFrameCallbackID) {
          el.source.cancelVideoFrameCallback(texture._videoFrameCallbackID);
        }

        el.source.removeEventListener("canplaythrough", el.load, false); // empty source to properly delete video element and free the memory

        el.source.pause();
        el.source.removeAttribute("src");
        el.source.load();
      }

      el.source.removeEventListener("error", el.error, false);
    }
  }

}

exports.TextureLoader = TextureLoader;
},{"../core/Texture.js":"RQKC","../utils/utils.js":"eOZP"}],"dReS":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PlaneTextureLoader = void 0;

var _TextureLoader = require("./TextureLoader.js");

var _utils = require("../utils/utils.js");

/*** PLANE TEXTURE LOADER CLASS ***/

/***
 Extends our TextureLoader class to add sources loaded count, handle onComplete event
 Also adds the sources and textures to its defined parent

 params:
 @renderer (Curtains renderer or Renderer class object): our curtains object OR our curtains renderer object
 @parent (Plane or ShaderPass class object): The plane or shader pass that will use this loader

 @sourcesLoaded (int): Number of sources loaded
 @sourcesToLoad (int): Number of initial sources to load
 @complete (bool): Whether the loader has loaded all the initial sources
 @onComplete (function): Callback to execute when all the initial sources have been loaded

 returns :
 @this: our PlaneTextureLoader element
 ***/
class PlaneTextureLoader extends _TextureLoader.TextureLoader {
  constructor(renderer, parent, {
    sourcesLoaded = 0,
    sourcesToLoad = 0,
    complete = false,
    onComplete = () => {}
  } = {}) {
    super(renderer, parent.crossOrigin);
    this.type = "PlaneTextureLoader";
    this._parent = parent;

    if (this._parent.type !== "Plane" && this._parent.type !== "ShaderPass") {
      (0, _utils.throwWarning)(this.type + ": Wrong parent type assigned to this loader");
      this._parent = null;
    }

    this.sourcesLoaded = sourcesLoaded;
    this.sourcesToLoad = sourcesToLoad;
    this.complete = complete;
    this.onComplete = onComplete;
  }
  /*** TRACK LOADING ***/

  /***
   Sets the total number of assets to load before firing the onComplete event
     params:
   @size (int): our curtains object OR our curtains renderer object
   ***/


  _setLoaderSize(size) {
    this.sourcesToLoad = size;

    if (this.sourcesToLoad === 0) {
      this.complete = true;
      this.renderer.nextRender.add(() => this.onComplete && this.onComplete());
    }
  }
  /***
   Increment the number of sources loaded
   ***/


  _increment() {
    this.sourcesLoaded++;

    if (this.sourcesLoaded >= this.sourcesToLoad && !this.complete) {
      this.complete = true;
      this.renderer.nextRender.add(() => this.onComplete && this.onComplete());
    }
  }
  /*** UPDATE PARENT SOURCES AND TEXTURES ARAYS ***/

  /***
   Adds the source to the correct parent assets array
     params:
   @source (html element): html image, video or canvas element that has been loaded
   @sourceType (string): either "image", "video" or "canvas"
   ***/


  _addSourceToParent(source, sourceType) {
    // add the source if it is not already in the correct parent assets array
    if (sourceType === "image") {
      const parentAssetArray = this._parent["images"];
      const isInParent = parentAssetArray.find(element => element.src === source.src);
      !isInParent && parentAssetArray.push(source);
    } else if (sourceType === "video") {
      const parentAssetArray = this._parent["videos"];
      const isInParent = parentAssetArray.find(element => element.src === source.src);
      !isInParent && parentAssetArray.push(source);
    } else if (sourceType === "canvas") {
      const parentAssetArray = this._parent["canvases"];
      const isInParent = parentAssetArray.find(element => element.isEqualNode(source));
      !isInParent && parentAssetArray.push(source);
    }
  }
  /***
   Adds the loader parent to the newly created texture
   Also adds the source to the correct parent assets array
     params:
   @texture (Texture class object): our newly created texture
   @source (html element): html image, video or canvas element that has been loaded
   @sourceType (string): either "image", "video" or "canvas"
   ***/


  _addToParent(texture, source, sourceType) {
    this._addSourceToParent(source, sourceType); // add the texture to the parent


    this._parent && texture.addParent(this._parent);
  }

}

exports.PlaneTextureLoader = PlaneTextureLoader;
},{"./TextureLoader.js":"mCwe","../utils/utils.js":"eOZP"}],"gwkd":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const precisionMedium = `
precision mediump float;
`;

var _default = precisionMedium.replace(/\n/g, '');

exports.default = _default;
},{}],"RJgV":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const defaultAttributes = `
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
`;

var _default = defaultAttributes.replace(/\n/g, '');

exports.default = _default;
},{}],"q7pj":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const defaultVaryings = `
varying vec3 vVertexPosition;
varying vec2 vTextureCoord;
`;

var _default = defaultVaryings.replace(/\n/g, '');

exports.default = _default;
},{}],"tA1f":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _precisionMediumGlsl = _interopRequireDefault(require("./chunks/precision.medium.glsl.js"));

var _defaultAttributesGlsl = _interopRequireDefault(require("./chunks/default.attributes.glsl.js"));

var _defaultVaryingsGlsl = _interopRequireDefault(require("./chunks/default.varyings.glsl.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const planeVS = _precisionMediumGlsl.default + _defaultAttributesGlsl.default + _defaultVaryingsGlsl.default + `
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

void main() {
    vTextureCoord = aTextureCoord;
    vVertexPosition = aVertexPosition;
    
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}
`;

var _default = planeVS.replace(/\n/g, '');

exports.default = _default;
},{"./chunks/precision.medium.glsl.js":"gwkd","./chunks/default.attributes.glsl.js":"RJgV","./chunks/default.varyings.glsl.js":"q7pj"}],"d0wv":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _precisionMediumGlsl = _interopRequireDefault(require("./chunks/precision.medium.glsl.js"));

var _defaultVaryingsGlsl = _interopRequireDefault(require("./chunks/default.varyings.glsl.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const planeFS = _precisionMediumGlsl.default + _defaultVaryingsGlsl.default + `
void main() {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
}
`;

var _default = planeFS.replace(/\n/g, '');

exports.default = _default;
},{"./chunks/precision.medium.glsl.js":"gwkd","./chunks/default.varyings.glsl.js":"q7pj"}],"FteT":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _precisionMediumGlsl = _interopRequireDefault(require("./chunks/precision.medium.glsl.js"));

var _defaultAttributesGlsl = _interopRequireDefault(require("./chunks/default.attributes.glsl.js"));

var _defaultVaryingsGlsl = _interopRequireDefault(require("./chunks/default.varyings.glsl.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const shaderPassVS = _precisionMediumGlsl.default + _defaultAttributesGlsl.default + _defaultVaryingsGlsl.default + `
void main() {
    vTextureCoord = aTextureCoord;
    vVertexPosition = aVertexPosition;
    
    gl_Position = vec4(aVertexPosition, 1.0);
}
`;

var _default = shaderPassVS.replace(/\n/g, '');

exports.default = _default;
},{"./chunks/precision.medium.glsl.js":"gwkd","./chunks/default.attributes.glsl.js":"RJgV","./chunks/default.varyings.glsl.js":"q7pj"}],"GGOH":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _precisionMediumGlsl = _interopRequireDefault(require("./chunks/precision.medium.glsl.js"));

var _defaultVaryingsGlsl = _interopRequireDefault(require("./chunks/default.varyings.glsl.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const shaderPassFS = _precisionMediumGlsl.default + _defaultVaryingsGlsl.default + `
uniform sampler2D uRenderTexture;

void main() {
    gl_FragColor = texture2D(uRenderTexture, vTextureCoord);
}
`;

var _default = shaderPassFS.replace(/\n/g, '');

exports.default = _default;
},{"./chunks/precision.medium.glsl.js":"gwkd","./chunks/default.varyings.glsl.js":"q7pj"}],"uE4T":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Mesh = void 0;

var _Program = require("./Program.js");

var _Geometry = require("./Geometry.js");

var _Texture = require("./Texture.js");

var _PlaneTextureLoader = require("../loaders/PlaneTextureLoader.js");

var _utils = require("../utils/utils.js");

var _planeVertexGlsl = _interopRequireDefault(require("../shaders/plane.vertex.glsl.js"));

var _planeFragmentGlsl = _interopRequireDefault(require("../shaders/plane.fragment.glsl.js"));

var _shaderpassVertexGlsl = _interopRequireDefault(require("../shaders/shaderpass.vertex.glsl.js"));

var _shaderpassFragmentGlsl = _interopRequireDefault(require("../shaders/shaderpass.fragment.glsl.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// shaders

/***
 Here we create our Mesh object
 We will create an object containing the program that handles shaders and uniforms, a geometry that handles attributes
 Also handles anything that relates to textures creation and basic drawing operations

 params:
 @renderer (Curtains renderer or Renderer class object): our curtains object OR our curtains renderer object
 @type (string): Object type (should be either "Plane" or "ShaderPass")

 @shareProgram (bool): Whether the mesh should share its program with other meshes. Results in only one program compilation for multiple meshes, but all their uniforms need to be updated at runtime
 @vertexShaderID (string, optional): the vertex shader script ID. If not specified, will look for a data attribute data-vs-id on the plane HTML element.
 @fragmentShaderID (string, optional): the fragment shader script ID. If not specified, will look for a data attribute data-fs-id on the plane HTML element.
 @vertexShader (string, optional): the vertex shader as a string. Will look for a vertexShaderID if not specified.
 @fragmentShader (string, optional): the fragment shader as a string. Will look for a fragmentShaderID if not specified.
 @uniforms (object, optional): the uniforms that will be passed to the shaders.
 @widthSegments (int, optional): mesh definition along the X axis (1 by default)
 @heightSegments (int, optional): mesh definition along the Y axis (1 by default)
 @depthTest (bool, optional): if the mesh should enable or disable the depth test. Default to true.
 @cullFace (string, optional): which face of the mesh should be culled. Could either be "back", "front" or "none". Default to "back".
 @texturesOptions (object, optional): options and parameters to apply to the textures loaded by the mesh's loader. See the Texture class object.
 @crossorigin (string, optional): defines the crossOrigin process to load images if any (default to "anonymous").

 returns:
 @this: our Mesh element
 ***/
class Mesh {
  constructor(renderer, type = "Mesh", {
    // program
    shareProgram = false,
    vertexShaderID,
    fragmentShaderID,
    vertexShader,
    fragmentShader,
    uniforms = {},
    // geometry
    widthSegments = 1,
    heightSegments = 1,
    // drawing
    depthTest = true,
    cullFace = "back",
    // textures
    texturesOptions = {},
    crossOrigin = "anonymous"
  } = {}) {
    this.type = type; // we could pass our curtains object OR our curtains renderer object

    renderer = renderer && renderer.renderer || renderer;

    if (!renderer || renderer.type !== "Renderer") {
      (0, _utils.throwError)(this.type + ": Curtains not passed as first argument or Curtains Renderer is missing", renderer); // no renderer, we can't use the renderer nextRender method

      setTimeout(() => {
        if (this._onErrorCallback) {
          this._onErrorCallback();
        }
      }, 0);
    }

    this.renderer = renderer;
    this.gl = this.renderer.gl;

    if (!this.gl) {
      if (!this.renderer.production) (0, _utils.throwError)(this.type + ": Unable to create a " + this.type + " because the Renderer WebGl context is not defined"); // we should assume there's still no renderer here, so no nextRender method

      setTimeout(() => {
        if (this._onErrorCallback) {
          this._onErrorCallback();
        }
      }, 0);
    }

    this._canDraw = false; // whether to share programs or not (could enhance performance if a lot of planes use the same shaders)

    this.shareProgram = shareProgram; // depth test

    this._depthTest = depthTest; // face culling

    this.cullFace = cullFace;

    if (this.cullFace !== "back" && this.cullFace !== "front" && this.cullFace !== "none") {
      this.cullFace = "back";
    } // textures


    this.textures = []; // default textures options depends on the type of Mesh and WebGL context

    texturesOptions = Object.assign({
      premultiplyAlpha: false,
      anisotropy: 1,
      floatingPoint: "none",
      // accepts "none", "half-float" or "float"
      wrapS: this.gl.CLAMP_TO_EDGE,
      wrapT: this.gl.CLAMP_TO_EDGE,
      minFilter: this.gl.LINEAR,
      magFilter: this.gl.LINEAR
    }, texturesOptions);
    this._texturesOptions = texturesOptions;
    this.crossOrigin = crossOrigin; // handling shaders

    if (!vertexShader) {
      if (!vertexShaderID || !document.getElementById(vertexShaderID)) {
        if (!this.renderer.production && this.type === "Plane") {
          (0, _utils.throwWarning)("Plane: No vertex shader provided, will use a default one");
        }

        vertexShader = this.type === "Plane" ? _planeVertexGlsl.default : _shaderpassVertexGlsl.default;
      } else {
        vertexShader = document.getElementById(vertexShaderID).innerHTML;
      }
    }

    if (!fragmentShader) {
      if (!fragmentShaderID || !document.getElementById(fragmentShaderID)) {
        if (!this.renderer.production) (0, _utils.throwWarning)(this.type + ": No fragment shader provided, will use a default one");
        fragmentShader = this.type === "Plane" ? _planeFragmentGlsl.default : _shaderpassFragmentGlsl.default;
      } else {
        fragmentShader = document.getElementById(fragmentShaderID).innerHTML;
      }
    } // init sizes and loader


    this._initMesh(); // geometry
    // set plane attributes


    widthSegments = parseInt(widthSegments);
    heightSegments = parseInt(heightSegments);
    this._geometry = new _Geometry.Geometry(this.renderer, {
      width: widthSegments,
      height: heightSegments // using a special ID for shader passes to avoid weird buffer binding bugs on mac devices
      //id: this.type === "ShaderPass" ? 1 : widthSegments * heightSegments + widthSegments

    });
    this._program = new _Program.Program(this.renderer, {
      parent: this,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader
    });

    if (this._program.compiled) {
      // create and set program uniforms
      this._program.createUniforms(uniforms); // make uniforms accessible directly


      this.uniforms = this._program.uniformsManager.uniforms; // geometry
      // set plane attributes

      this._geometry.setProgram(this._program); // we've added a new object, keep Curtains class in sync with our renderer


      this.renderer.onSceneChange();
    } else {
      this.renderer.nextRender.add(() => this._onErrorCallback && this._onErrorCallback());
    }
  }

  _initMesh() {
    this.uuid = (0, _utils.generateUUID)(); // our Loader Class that will handle all medias loading process

    this.loader = new _PlaneTextureLoader.PlaneTextureLoader(this.renderer, this, {
      sourcesLoaded: 0,
      initSourcesToLoad: 0,
      // will change if there's any texture to load on init
      complete: false,
      onComplete: () => {
        this._onReadyCallback && this._onReadyCallback();
        this.renderer.needRender();
      }
    });
    this.images = [];
    this.videos = [];
    this.canvases = []; // allow the user to add custom data to the plane

    this.userData = {};
    this._canDraw = true;
  }
  /*** RESTORING CONTEXT ***/

  /***
   Used internally to handle context restoration
   ***/


  _restoreContext() {
    this._canDraw = false;

    if (this._matrices) {
      this._matrices = null;
    } // reset the used program based on our previous shaders code strings


    this._program = new _Program.Program(this.renderer, {
      parent: this,
      vertexShader: this._program.vsCode,
      fragmentShader: this._program.fsCode
    });

    if (this._program.compiled) {
      // reset geometry
      this._geometry.restoreContext(this._program); // create and set program uniforms


      this._program.createUniforms(this.uniforms); // make uniforms accessible directly


      this.uniforms = this._program.uniformsManager.uniforms; // program restored callback of Planes and ShaderPasses

      this._programRestored();
    }
  }
  /***
   This function adds a render target to a mesh
     params :
   @renderTarger (RenderTarget): the render target to add to that mesh
   ***/


  setRenderTarget(renderTarget) {
    if (!renderTarget || renderTarget.type !== "RenderTarget") {
      if (!this.renderer.production) {
        (0, _utils.throwWarning)(this.type + ": Could not set the render target because the argument passed is not a RenderTarget class object", renderTarget);
      }

      return;
    }

    this.target = renderTarget;
  }
  /*** IMAGES, VIDEOS AND CANVASES LOADING ***/

  /***
   This method creates a new Texture and adds it to the mesh
     params :
   @textureOptions (object, optional) : Parameters to apply to that texture (see Texture class). Will be merged with the mesh default textures options
     returns :
   @texture: our newly created texture
   ***/


  createTexture(textureOptions = {}) {
    // create a new texture with the specified options
    const texture = new _Texture.Texture(this.renderer, Object.assign(this._texturesOptions, textureOptions)); // add the texture to the mesh

    texture.addParent(this);
    return texture;
  }
  /***
   Shortcut for addParent() Texture class method
   ***/


  addTexture(texture) {
    if (!texture || texture.type !== "Texture") {
      if (!this.renderer.production) {
        (0, _utils.throwWarning)(this.type + ": cannot add ", texture, " to this " + this.type + " because it is not a valid texture");
      }

      return;
    }

    texture.addParent(this);
  }
  /***
   This method handles the sources loading process
     params :
   @sourcesArray (array): array of html images, videos or canvases elements
   @texturesOptions (object, optional) : Parameters to apply to those textures (see Texture class). Will be merged with the mesh default textures options
   @successCallback (function): callback to execute on source loading success
   @errorCallback (function): callback to execute on source loading error
   ***/


  loadSources(sourcesArray, texturesOptions = {}, successCallback, errorCallback) {
    for (let i = 0; i < sourcesArray.length; i++) {
      this.loadSource(sourcesArray[i], texturesOptions, successCallback, errorCallback);
    }
  }
  /***
   This method loads one source using our mesh loader (see PlaneTextureLoader class)
     params :
   @source (html element) : html image, video or canvas element
   @textureOptions (object, optional) : Parameters to apply to that texture (see Texture class). Will be merged with the mesh default textures options
   @successCallback (function): callback to execute on source loading success
   @errorCallback (function): callback to execute on source loading error
   ***/


  loadSource(source, textureOptions = {}, successCallback, errorCallback) {
    this.loader.loadSource(source, Object.assign(this._texturesOptions, textureOptions), texture => {
      successCallback && successCallback(texture);
    }, (source, error) => {
      if (!this.renderer.production) {
        (0, _utils.throwWarning)(this.type + ": this HTML tag could not be converted into a texture:", source.tagName);
      }

      errorCallback && errorCallback(source, error);
    });
  }
  /***
   This method loads an image using our mesh loader (see PlaneTextureLoader class)
     params :
   @source (image) : html image element
   @textureOptions (object, optional) : Parameters to apply to that texture (see Texture class). Will be merged with the mesh default textures options
   @successCallback (function): callback to execute on source loading success
   @errorCallback (function): callback to execute on source loading error
   ***/


  loadImage(source, textureOptions = {}, successCallback, errorCallback) {
    this.loader.loadImage(source, Object.assign(this._texturesOptions, textureOptions), texture => {
      successCallback && successCallback(texture);
    }, (source, error) => {
      if (!this.renderer.production) {
        (0, _utils.throwWarning)(this.type + ": There has been an error:\n", error, "\nwhile loading this image:\n", source);
      }

      errorCallback && errorCallback(source, error);
    });
  }
  /***
   This method loads a video using the mesh loader (see PlaneTextureLoader class)
     params :
   @source (video) : html video element
   @textureOptions (object, optional) : Parameters to apply to that texture (see Texture class). Will be merged with the mesh default textures options
   @successCallback (function): callback to execute on source loading success
   @errorCallback (function): callback to execute on source loading error
   ***/


  loadVideo(source, textureOptions = {}, successCallback, errorCallback) {
    this.loader.loadVideo(source, Object.assign(this._texturesOptions, textureOptions), texture => {
      successCallback && successCallback(texture);
    }, (source, error) => {
      if (!this.renderer.production) {
        (0, _utils.throwWarning)(this.type + ": There has been an error:\n", error, "\nwhile loading this video:\n", source);
      }

      errorCallback && errorCallback(source, error);
    });
  }
  /***
   This method loads a canvas using the mesh loader (see PlaneTextureLoader class)
     params :
   @source (canvas) : html canvas element
   @textureOptions (object, optional) : Parameters to apply to that texture (see Texture class). Will be merged with the mesh default textures options
   @successCallback (function): callback to execute on source loading success
   ***/


  loadCanvas(source, textureOptions = {}, successCallback) {
    this.loader.loadCanvas(source, Object.assign(this._texturesOptions, textureOptions), texture => {
      successCallback && successCallback(texture);
    });
  }
  /*** LOAD ARRAYS ***/

  /***
   Loads an array of images
     params :
   @imagesArray (array) : array of html image elements
   @texturesOptions (object, optional) : Parameters to apply to those textures (see Texture class). Will be merged with the mesh default textures options
   @successCallback (function): callback to execute on source loading success
   @errorCallback (function): callback to execute on source loading error
   ***/


  loadImages(imagesArray, texturesOptions = {}, successCallback, errorCallback) {
    for (let i = 0; i < imagesArray.length; i++) {
      this.loadImage(imagesArray[i], texturesOptions, successCallback, errorCallback);
    }
  }
  /***
   Loads an array of videos
     params :
   @videosArray (array) : array of html video elements
   @texturesOptions (object, optional) : Parameters to apply to those textures (see Texture class). Will be merged with the mesh default textures options
   @successCallback (function): callback to execute on source loading success
   @errorCallback (function): callback to execute on source loading error
   ***/


  loadVideos(videosArray, texturesOptions = {}, successCallback, errorCallback) {
    for (let i = 0; i < videosArray.length; i++) {
      this.loadVideo(videosArray[i], texturesOptions, successCallback, errorCallback);
    }
  }
  /***
   Loads an array of canvases
     params :
   @canvasesArray (array) : array of html canvas elements
   @texturesOptions (object, optional) : Parameters to apply to those textures (see Texture class). Will be merged with the mesh default textures options
   @successCallback (function): callback to execute on source loading success
   @errorCallback (function): callback to execute on source loading error
   ***/


  loadCanvases(canvasesArray, texturesOptions = {}, successCallback) {
    for (let i = 0; i < canvasesArray.length; i++) {
      this.loadCanvas(canvasesArray[i], texturesOptions, successCallback);
    }
  }
  /***
   This has to be called in order to play the planes videos
   We need this because on mobile devices we can't start playing a video without a user action
   Once the video has started playing we set an interval and update a new frame to our our texture at a 30FPS rate
   ***/


  playVideos() {
    for (let i = 0; i < this.textures.length; i++) {
      const texture = this.textures[i];

      if (texture.sourceType === "video") {
        const playPromise = texture.source.play(); // In browsers that don’t yet support this functionality,
        // playPromise won’t be defined.

        if (playPromise !== undefined) {
          playPromise.catch(error => {
            if (!this.renderer.production) (0, _utils.throwWarning)(this.type + ": Could not play the video : ", error);
          });
        }
      }
    }
  }
  /*** DRAW THE PLANE ***/

  /***
   We draw the plane, ie bind the buffers, set the active textures and draw it
   ***/


  _draw() {
    // enable/disable depth test
    this.renderer.setDepth(this._depthTest); // face culling

    this.renderer.setFaceCulling(this.cullFace); // update all uniforms set up by the user

    this._program.updateUniforms(); // bind plane attributes buffers


    this._geometry.bindBuffers(); // draw all our plane textures


    for (let i = 0; i < this.textures.length; i++) {
      // draw (bind and maybe update) our texture
      this.textures[i]._draw();
    } // the draw call!


    this._geometry.draw(); // reset active texture TODO useless?


    this.renderer.state.activeTexture = null; // callback after draw

    this._onAfterRenderCallback && this._onAfterRenderCallback();
  }
  /*** EVENTS ***/

  /***
   This is called each time a mesh can't be instanciated
     params :
   @callback (function) : a function to execute
     returns :
   @this: our plane to handle chaining
   ***/


  onError(callback) {
    if (callback) {
      this._onErrorCallback = callback;
    }

    return this;
  }
  /***
   This is called each time a mesh's image has been loaded. Useful to handle a loader
     params :
   @callback (function) : a function to execute
     returns :
   @this: our plane to handle chaining
   ***/


  onLoading(callback) {
    if (callback) {
      this._onLoadingCallback = callback;
    }

    return this;
  }
  /***
   This is called when a mesh is ready to be drawn
     params :
   @callback (function) : a function to execute
     returns :
   @this: our plane to handle chaining
   ***/


  onReady(callback) {
    if (callback) {
      this._onReadyCallback = callback;
    }

    return this;
  }
  /***
   This is called at each requestAnimationFrame call
     params :
   @callback (function) : a function to execute
     returns :
   @this: our plane to handle chaining
   ***/


  onRender(callback) {
    if (callback) {
      this._onRenderCallback = callback;
    }

    return this;
  }
  /***
   This is called at each requestAnimationFrame call for each mesh after the draw call
     params :
   @callback (function) : a function to execute
     returns :
   @this: our plane to handle chaining
   ***/


  onAfterRender(callback) {
    if (callback) {
      this._onAfterRenderCallback = callback;
    }

    return this;
  }
  /*** DESTROYING ***/

  /***
   Remove an element by calling the appropriate renderer method
   ***/


  remove() {
    // first we want to stop drawing it
    this._canDraw = false; // force unbinding frame buffer

    if (this.target) {
      this.renderer.bindFrameBuffer(null);
    } // delete all the webgl bindings


    this._dispose();

    if (this.type === "Plane") {
      this.renderer.removePlane(this);
    } else if (this.type === "ShaderPass") {
      // remove its render target first
      if (this.target) {
        this.target._shaderPass = null;
        this.target.remove();
        this.target = null;
      }

      this.renderer.removeShaderPass(this);
    }
  }
  /***
   This deletes all our mesh webgl bindings and its textures
   ***/


  _dispose() {
    if (this.gl) {
      // dispose our geometry
      this._geometry && this._geometry.dispose();

      if (this.target && this.type === "ShaderPass") {
        this.renderer.removeRenderTarget(this.target); // remove the first texture since it has been deleted with the render target

        this.textures.shift();
      } // unbind and delete the textures


      for (let i = 0; i < this.textures.length; i++) {
        this.textures[i]._dispose();
      }

      this.textures = null;
    }
  }

}

exports.Mesh = Mesh;
},{"./Program.js":"Mb2O","./Geometry.js":"rvin","./Texture.js":"RQKC","../loaders/PlaneTextureLoader.js":"dReS","../utils/utils.js":"eOZP","../shaders/plane.vertex.glsl.js":"tA1f","../shaders/plane.fragment.glsl.js":"d0wv","../shaders/shaderpass.vertex.glsl.js":"FteT","../shaders/shaderpass.fragment.glsl.js":"GGOH"}],"F2xI":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DOMMesh = void 0;

var _Mesh = require("./Mesh.js");

var _Vec = require("../math/Vec2.js");

var _utils = require("../utils/utils.js");

/***
 Here we create our DOMGLObject object
 We will extend our Mesh class object by adding HTML sizes helpers (bounding boxes getter/setter and mouse to mesh positioning)

 params:
 @renderer (Curtains renderer or Renderer class object): our curtains object OR our curtains renderer object
 @plane (html element): the html element that we will use for our DOMMesh object
 @type (string): Object type (should be either "Plane" or "ShaderPass")
 @Meshparams (object): see Mesh class object
 
 returns:
 @this: our BasePlane element
 ***/
// TODO raycasting inside mouseToPlaneCoords for Plane objects when transformed
class DOMMesh extends _Mesh.Mesh {
  constructor(renderer, htmlElement, type = "DOMMesh", {
    // Mesh params
    shareProgram,
    widthSegments,
    heightSegments,
    depthTest,
    cullFace,
    uniforms,
    vertexShaderID,
    fragmentShaderID,
    vertexShader,
    fragmentShader,
    texturesOptions,
    crossOrigin
  } = {}) {
    // handling HTML shaders scripts
    vertexShaderID = vertexShaderID || htmlElement && htmlElement.getAttribute("data-vs-id");
    fragmentShaderID = fragmentShaderID || htmlElement && htmlElement.getAttribute("data-fs-id");
    super(renderer, type, {
      shareProgram,
      widthSegments,
      heightSegments,
      depthTest,
      cullFace,
      uniforms,
      vertexShaderID,
      fragmentShaderID,
      vertexShader,
      fragmentShader,
      texturesOptions,
      crossOrigin
    }); // our HTML element

    this.htmlElement = htmlElement;

    if (!this.htmlElement || this.htmlElement.length === 0) {
      if (!this.renderer.production) (0, _utils.throwWarning)(this.type + ": The HTML element you specified does not currently exists in the DOM");
    } // set plane sizes


    this._setDocumentSizes();
  }
  /*** PLANE SIZES ***/

  /***
   Set our plane dimensions and positions relative to document
   Triggers reflow!
   ***/


  _setDocumentSizes() {
    // set our basic initial infos
    let planeBoundingRect = this.htmlElement.getBoundingClientRect();
    if (!this._boundingRect) this._boundingRect = {}; // set plane dimensions in document space

    this._boundingRect.document = {
      width: planeBoundingRect.width * this.renderer.pixelRatio,
      height: planeBoundingRect.height * this.renderer.pixelRatio,
      top: planeBoundingRect.top * this.renderer.pixelRatio,
      left: planeBoundingRect.left * this.renderer.pixelRatio
    };
  }

  /*** BOUNDING BOXES GETTERS ***/

  /***
   Useful to get our plane HTML element bounding rectangle without triggering a reflow/layout
     returns :
   @boundingRectangle (obj): an object containing our plane HTML element bounding rectangle (width, height, top, bottom, right and left properties)
   ***/
  getBoundingRect() {
    return {
      width: this._boundingRect.document.width,
      height: this._boundingRect.document.height,
      top: this._boundingRect.document.top,
      left: this._boundingRect.document.left,
      // right = left + width, bottom = top + height
      right: this._boundingRect.document.left + this._boundingRect.document.width,
      bottom: this._boundingRect.document.top + this._boundingRect.document.height
    };
  }
  /***
   Handles each plane resizing
   used internally when our container is resized
   TODO will soon be DEPRECATED!
   ***/


  planeResize() {
    if (!this.renderer.production) {
      (0, _utils.throwWarning)(this.type + ": planeResize() is deprecated, use resize() instead.");
    }

    this.resize();
  }
  /***
   Handles each plane resizing
   used internally when our container is resized
   ***/


  resize() {
    // reset plane dimensions
    this._setDocumentSizes(); // if this is a Plane object we need to update its perspective and positions


    if (this.type === "Plane") {
      // reset perspective
      this.setPerspective(this.camera.fov, this.camera.near, this.camera.far); // apply new position

      this._applyWorldPositions();
    } // resize all textures


    for (let i = 0; i < this.textures.length; i++) {
      this.textures[i].resize();
    } // handle our after resize event


    this.renderer.nextRender.add(() => this._onAfterResizeCallback && this._onAfterResizeCallback());
  }
  /*** INTERACTION ***/

  /***
   This function takes the mouse position relative to the document and returns it relative to our plane
   It ranges from -1 to 1 on both axis
     params :
   @mouseCoordinates (Vec2 object): coordinates of the mouse
     returns :
   @mousePosition (Vec2 object): the mouse position relative to our plane in WebGL space coordinates
   ***/


  mouseToPlaneCoords(mouseCoordinates) {
    // remember our ShaderPass objects don't have a scale property
    const scale = this.scale ? this.scale : new _Vec.Vec2(1, 1); // we need to adjust our plane document bounding rect to it's webgl scale

    const scaleAdjustment = new _Vec.Vec2((this._boundingRect.document.width - this._boundingRect.document.width * scale.x) / 2, (this._boundingRect.document.height - this._boundingRect.document.height * scale.y) / 2); // also we need to divide by pixel ratio

    const planeBoundingRect = {
      width: this._boundingRect.document.width * scale.x / this.renderer.pixelRatio,
      height: this._boundingRect.document.height * scale.y / this.renderer.pixelRatio,
      top: (this._boundingRect.document.top + scaleAdjustment.y) / this.renderer.pixelRatio,
      left: (this._boundingRect.document.left + scaleAdjustment.x) / this.renderer.pixelRatio
    }; // mouse position conversion from document to plane space

    return new _Vec.Vec2((mouseCoordinates.x - planeBoundingRect.left) / planeBoundingRect.width * 2 - 1, 1 - (mouseCoordinates.y - planeBoundingRect.top) / planeBoundingRect.height * 2);
  }
  /*** EVENTS ***/

  /***
   This is called each time a plane has been resized
     params :
   @callback (function) : a function to execute
     returns :
   @this: our plane to handle chaining
   ***/


  onAfterResize(callback) {
    if (callback) {
      this._onAfterResizeCallback = callback;
    }

    return this;
  }

}

exports.DOMMesh = DOMMesh;
},{"./Mesh.js":"uE4T","../math/Vec2.js":"V1SK","../utils/utils.js":"eOZP"}],"lfw1":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Vec3 = void 0;

/***
 Here we create a Vec3 class object
 This is a really basic Vector3 class used for vector calculations
 Highly based on https://github.com/mrdoob/three.js/blob/dev/src/math/Vector3.js and http://glmatrix.net/docs/vec3.js.html

 params :
 @x (float): X component of our vector
 @y (float): Y component of our vector
 @z (float): Z component of our vector

 returns :
 @this: our Vec3 class object
 ***/
// TODO lot of (unused at the time) methods are missing
class Vec3 {
  constructor(x = 0, y = 0, z = 0) {
    this.type = "Vec3";
    this.set(x, y, z);
  }
  /***
   Sets the vector from values
     params:
   @x (float): X component of our vector
   @y (float): Y component of our vector
   @z (float): Z component of our vector
     returns:
   @this (Vec2): this vector after being set
   ***/


  set(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }
  /***
   Adds a vector to this vector
     params:
   @vector (Vec3): vector to add
     returns:
   @this (Vec3): this vector after addition
   ***/


  add(vector) {
    this.x += vector.x;
    this.y += vector.y;
    this.z += vector.z;
    return this;
  }
  /***
   Adds a scalar to this vector
     params:
   @value (float): number to add
     returns:
   @this (Vec3): this vector after addition
   ***/


  addScalar(value) {
    this.x += value;
    this.y += value;
    this.z += value;
    return this;
  }
  /***
   Subtracts a vector from this vector
     params:
   @vector (Vec3): vector to use for subtraction
     returns:
   @this (Vec3): this vector after subtraction
   ***/


  sub(vector) {
    this.x -= vector.x;
    this.y -= vector.y;
    this.z -= vector.z;
    return this;
  }
  /***
   Subtracts a scalar to this vector
     params:
   @value (float): number to use for subtraction
     returns:
   @this (Vec3): this vector after subtraction
   ***/


  subScalar(value) {
    this.x -= value;
    this.y -= value;
    this.z -= value;
    return this;
  }
  /***
   Multiplies a vector with this vector
     params:
   @vector (Vec3): vector to use for multiplication
     returns:
   @this (Vec3): this vector after multiplication
   ***/


  multiply(vector) {
    this.x *= vector.x;
    this.y *= vector.y;
    this.z *= vector.z;
    return this;
  }
  /***
   Multiplies a scalar with this vector
     params:
   @value (float): number to use for multiplication
     returns:
   @this (Vec3): this vector after multiplication
   ***/


  multiplyScalar(value) {
    this.x *= value;
    this.y *= value;
    this.z *= value;
    return this;
  }
  /***
   Copy a vector into this vector
     params:
   @vector (Vec3): vector to copy
     returns:
   @this (Vec3): this vector after copy
   ***/


  copy(vector) {
    this.x = vector.x;
    this.y = vector.y;
    this.z = vector.z;
    return this;
  }
  /***
   Clone this vector
     returns:
   @vector (Vec3): cloned vector
   ***/


  clone() {
    return new Vec3(this.x, this.y, this.z);
  }
  /***
   Merges this vector with a vector when values are NaN. Mostly used internally.
     params:
   @vector (Vec3): vector to use for sanitization
     returns:
   @vector (Vec3): sanitized vector
   ***/


  sanitizeNaNValuesWith(vector) {
    this.x = isNaN(this.x) ? vector.x : parseFloat(this.x);
    this.y = isNaN(this.y) ? vector.y : parseFloat(this.y);
    this.z = isNaN(this.z) ? vector.z : parseFloat(this.z);
    return this;
  }
  /***
   Apply max values to this vector
     params:
   @vector (Vec3): vector representing max values
     returns:
   @vector (Vec3): vector with max values applied
   ***/


  max(vector) {
    this.x = Math.max(this.x, vector.x);
    this.y = Math.max(this.y, vector.y);
    this.z = Math.max(this.z, vector.z);
    return this;
  }
  /***
   Apply min values to this vector
     params:
   @vector (Vec3): vector representing min values
     returns:
   @vector (Vec3): vector with min values applied
   ***/


  min(vector) {
    this.x = Math.min(this.x, vector.x);
    this.y = Math.min(this.y, vector.y);
    this.z = Math.min(this.z, vector.z);
    return this;
  }
  /***
   Checks if 2 vectors are equal
     returns:
   @isEqual (bool): whether the vectors are equals or not
   ***/


  equals(vector) {
    return this.x === vector.x && this.y === vector.y && this.z === vector.z;
  }
  /***
   Normalize this vector
     returns:
   @this (Vec3): normalized vector
   ***/


  normalize() {
    // normalize
    let len = this.x * this.x + this.y * this.y + this.z * this.z;

    if (len > 0) {
      len = 1 / Math.sqrt(len);
    }

    this.x *= len;
    this.y *= len;
    this.z *= len;
    return this;
  }
  /***
   Calculates the dot product of 2 vectors
     returns:
   @dotProduct (float): dot product of the 2 vectors
   ***/


  dot(vector) {
    return this.x * vector.x + this.y * vector.y + this.z * vector.z;
  }
  /***
   Apply a matrix 4 to a point (vec3)
   Useful to convert a point position from plane local world to webgl space using projection view matrix for example
   Source code from: http://glmatrix.net/docs/vec3.js.html
     params :
   @matrix (array): 4x4 matrix used
     returns :
   @this (Vec3): this vector after matrix application
   ***/


  applyMat4(matrix) {
    const x = this.x,
          y = this.y,
          z = this.z;
    const mArray = matrix.elements;
    let w = mArray[3] * x + mArray[7] * y + mArray[11] * z + mArray[15];
    w = w || 1;
    this.x = (mArray[0] * x + mArray[4] * y + mArray[8] * z + mArray[12]) / w;
    this.y = (mArray[1] * x + mArray[5] * y + mArray[9] * z + mArray[13]) / w;
    this.z = (mArray[2] * x + mArray[6] * y + mArray[10] * z + mArray[14]) / w;
    return this;
  }
  /***
   Apply a quaternion (rotation in 3D space) to this vector
     params :
   @quaternion (Quat): quaternion to use
     returns :
   @this (Vec3): this vector after applying the transformation
   ***/


  applyQuat(quaternion) {
    const x = this.x,
          y = this.y,
          z = this.z;
    const qx = quaternion.elements[0],
          qy = quaternion.elements[1],
          qz = quaternion.elements[2],
          qw = quaternion.elements[3]; // calculate quat * vector

    const ix = qw * x + qy * z - qz * y;
    const iy = qw * y + qz * x - qx * z;
    const iz = qw * z + qx * y - qy * x;
    const iw = -qx * x - qy * y - qz * z; // calculate result * inverse quat

    this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    return this;
  }
  /***
   Project 3D coordinate to 2D point
     params:
   @camera (Camera): camera to use for projection
   ***/


  project(camera) {
    this.applyMat4(camera.viewMatrix).applyMat4(camera.projectionMatrix);
    return this;
  }
  /***
   Unproject 2D point to 3D coordinate
     params:
   @camera (Camera): camera to use for projection
   ***/


  unproject(camera) {
    this.applyMat4(camera.projectionMatrix.getInverse()).applyMat4(camera.worldMatrix);
    return this;
  }

}

exports.Vec3 = Vec3;
},{}],"nOhk":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Camera = void 0;

var _Vec = require("../math/Vec3.js");

var _Mat = require("../math/Mat4.js");

/***
 Here we create our Camera object
 Creates a perspective camera and its projection matrix (which is used by Plane's class objects)
 Uses a dirty _shouldUpdate flag used to determine if we should update the matrix

 params:
 @fov (float, optional): the perspective field of view. Should be greater than 0 and lower than 180. Default to 50.
 @near (float, optional): near plane, the closest point where a mesh vertex is drawn. Default to 0.1.
 @far (float, optional): far plane, farthest point where a mesh vertex is drawn. Default to 150.
 @width (float, optional): width used to calculate the camera aspect ratio. Default to the renderer container's width.
 @height (float, optional): height used to calculate the camera aspect ratio. Default to the renderer container's height.
 @pixelRatio (float, optional): pixel ratio used to calculate the camera aspect ratio. Default to the renderer's pixel ratio.

 returns:
 @this: our Mesh element
 ***/
class Camera {
  constructor({
    fov = 50,
    near = 0.1,
    far = 150,
    width,
    height,
    pixelRatio = 1
  } = {}) {
    this.position = new _Vec.Vec3();
    this.projectionMatrix = new _Mat.Mat4();
    this.worldMatrix = new _Mat.Mat4();
    this.viewMatrix = new _Mat.Mat4();
    this._shouldUpdate = false;
    this.setSize();
    this.setPerspective(fov, near, far, width, height, pixelRatio);
  }
  /***
   Sets the camera field of view
   Update the camera projection matrix only if the fov actually changed
     params:
   @fov (float, optional): field of view to use
   ***/


  setFov(fov) {
    fov = isNaN(fov) ? this.fov : parseFloat(fov); // clamp between 1 and 179

    fov = Math.max(1, Math.min(fov, 179));

    if (fov !== this.fov) {
      this.fov = fov;
      this.setPosition();
      this.setCSSPerspective();
      this._shouldUpdate = true;
    }
  }
  /***
   Sets the camera near plane value
   Update the camera projection matrix only if the near plane actually changed
     params:
   @near (float, optional): near plane value to use
   ***/


  setNear(near) {
    near = isNaN(near) ? this.near : parseFloat(near);
    near = Math.max(near, 0.01);

    if (near !== this.near) {
      this.near = near;
      this._shouldUpdate = true;
    }
  }
  /***
   Sets the camera far plane value
   Update the camera projection matrix only if the far plane actually changed
     params:
   @far (float, optional): far plane value to use
   ***/


  setFar(far) {
    far = isNaN(far) ? this.far : parseFloat(far);
    far = Math.max(far, 50);

    if (far !== this.far) {
      this.far = far;
      this._shouldUpdate = true;
    }
  }
  /***
   Sets the camera pixel ratio value
   Update the camera projection matrix only if the pixel ratio actually changed
     params:
   @pixelRatio (float, optional): pixelRatio value to use
   ***/


  setPixelRatio(pixelRatio) {
    if (pixelRatio !== this.pixelRatio) {
      this._shouldUpdate = true;
    }

    this.pixelRatio = pixelRatio;
  }
  /***
   Sets the camera width and height
   Update the camera projection matrix only if the width or height actually changed
     params:
   @width (float, optional): width value to use
   @height (float, optional): height value to use
   ***/


  setSize(width, height) {
    if (width !== this.width || height !== this.height) {
      this._shouldUpdate = true;
    }

    this.width = width;
    this.height = height;
  }
  /***
   Sets the camera perspective
   Update the camera projection matrix if our _shouldUpdate flag is true
     params:
   @fov (float, optional): field of view to use
   @near (float, optional): near plane value to use
   @far (float, optional): far plane value to use
   @width (float, optional): width value to use
   @height (float, optional): height value to use
   @pixelRatio (float, optional): pixelRatio value to use
   ***/


  setPerspective(fov, near, far, width, height, pixelRatio) {
    this.setPixelRatio(pixelRatio);
    this.setSize(width, height);
    this.setFov(fov);
    this.setNear(near);
    this.setFar(far);

    if (this._shouldUpdate) {
      this.updateProjectionMatrix();
    }
  }
  /***
   Sets the camera position based on its fov
   Used by the Plane class objects to scale the planes with the right amount
   ***/


  setPosition() {
    this.position.set(0, 0, Math.tan(Math.PI / 180 * 0.5 * this.fov) * 2.0); // update matrices

    this.worldMatrix.setFromArray([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, this.position.x, this.position.y, this.position.z, 1]);
    this.viewMatrix = this.viewMatrix.copy(this.worldMatrix).getInverse();
  }
  /***
   Sets a CSSPerspective property based on width, height, pixelRatio and fov
   Used to translate planes along the Z axis using pixel units as CSS would do
   ***/


  setCSSPerspective() {
    this.CSSPerspective = Math.pow(Math.pow(this.width / (2 * this.pixelRatio), 2) + Math.pow(this.height / (2 * this.pixelRatio), 2), 0.5) / (this.position.z * 0.5);
  }
  /***
   Updates the camera projection matrix
   ***/


  updateProjectionMatrix() {
    const aspect = this.width / this.height;
    const top = this.near * Math.tan(Math.PI / 180 * 0.5 * this.fov);
    const height = 2 * top;
    const width = aspect * height;
    const left = -0.5 * width;
    const right = left + width;
    const bottom = top - height;
    const x = 2 * this.near / (right - left);
    const y = 2 * this.near / (top - bottom);
    const a = (right + left) / (right - left);
    const b = (top + bottom) / (top - bottom);
    const c = -(this.far + this.near) / (this.far - this.near);
    const d = -2 * this.far * this.near / (this.far - this.near);
    this.projectionMatrix.setFromArray([x, 0, 0, 0, 0, y, 0, 0, a, b, c, -1, 0, 0, d, 0]);
  }
  /***
   Force the projection matrix to update (used in Plane class objects context restoration)
   ***/


  forceUpdate() {
    this._shouldUpdate = true;
  }
  /***
   Cancel the projection matrix update (used in Plane class objects after the projection matrix has been updated)
   ***/


  cancelUpdate() {
    this._shouldUpdate = false;
  }

}

exports.Camera = Camera;
},{"../math/Vec3.js":"lfw1","../math/Mat4.js":"ceZz"}],"CUq9":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Quat = void 0;

/***
 Here we create a Quat class object
 This is a really basic Quaternion class used for rotation calculations
 Highly based on https://github.com/mrdoob/three.js/blob/dev/src/math/Quaternion.js

 params :
 @elements (Float32Array of length 4): our quaternion array. Default to identity quaternion.

 returns :
 @this: our Quat class object
 ***/
// TODO lot of (unused at the time) methods are missing
class Quat {
  constructor(elements = new Float32Array([0, 0, 0, 1]), axisOrder = "XYZ") {
    this.type = "Quat";
    this.elements = elements; // rotation axis order

    this.axisOrder = axisOrder;
  }
  /***
   Sets the quaternion values from an array
     params:
   @array (array): an array of at least 4 elements
     returns:
   @this (Quat class object): this quaternion after being set
   ***/


  setFromArray(array) {
    this.elements[0] = array[0];
    this.elements[1] = array[1];
    this.elements[2] = array[2];
    this.elements[3] = array[3];
    return this;
  }
  /***
   Sets the quaternion axis order
     params:
   @axisOrder (string): an array of at least 4 elements
     returns:
   @this (Quat class object): this quaternion after axis order has been set
   ***/


  setAxisOrder(axisOrder) {
    // force uppercase for strict equality tests
    axisOrder = axisOrder.toUpperCase();

    switch (axisOrder) {
      case "XYZ":
      case "YXZ":
      case "ZXY":
      case "ZYX":
      case "YZX":
      case "XZY":
        this.axisOrder = axisOrder;
        break;

      default:
        // apply a default axis order
        this.axisOrder = "XYZ";
    }

    return this;
  }
  /***
   Copy a quaternion into this quaternion
     params:
   @vector (Quat): quaternion to copy
     returns:
   @this (Quat): this quaternion after copy
   ***/


  copy(quaternion) {
    this.elements = quaternion.elements;
    this.axisOrder = quaternion.axisOrder;
    return this;
  }
  /***
   Checks if 2 quaternions are equal
     returns:
   @isEqual (bool): whether the quaternions are equals or not
   ***/


  equals(quaternion) {
    return this.elements[0] === quaternion.elements[0] && this.elements[1] === quaternion.elements[1] && this.elements[2] === quaternion.elements[2] && this.elements[3] === quaternion.elements[3] && this.axisOrder === quaternion.axisOrder;
  }
  /***
   Sets a rotation quaternion using Euler angles and its axis order
     params:
   @vector (Vec3 class object): rotation vector to set our quaternion from
     returns :
   @this (Quat class object): quaternion after having applied the rotation
   ***/


  setFromVec3(vector) {
    const ax = vector.x * 0.5;
    const ay = vector.y * 0.5;
    const az = vector.z * 0.5;
    const cosx = Math.cos(ax);
    const cosy = Math.cos(ay);
    const cosz = Math.cos(az);
    const sinx = Math.sin(ax);
    const siny = Math.sin(ay);
    const sinz = Math.sin(az); // XYZ order

    if (this.axisOrder === "XYZ") {
      this.elements[0] = sinx * cosy * cosz + cosx * siny * sinz;
      this.elements[1] = cosx * siny * cosz - sinx * cosy * sinz;
      this.elements[2] = cosx * cosy * sinz + sinx * siny * cosz;
      this.elements[3] = cosx * cosy * cosz - sinx * siny * sinz;
    } else if (this.axisOrder === "YXZ") {
      this.elements[0] = sinx * cosy * cosz + cosx * siny * sinz;
      this.elements[1] = cosx * siny * cosz - sinx * cosy * sinz;
      this.elements[2] = cosx * cosy * sinz - sinx * siny * cosz;
      this.elements[3] = cosx * cosy * cosz + sinx * siny * sinz;
    } else if (this.axisOrder === "ZXY") {
      this.elements[0] = sinx * cosy * cosz - cosx * siny * sinz;
      this.elements[1] = cosx * siny * cosz + sinx * cosy * sinz;
      this.elements[2] = cosx * cosy * sinz + sinx * siny * cosz;
      this.elements[3] = cosx * cosy * cosz - sinx * siny * sinz;
    } else if (this.axisOrder === "ZYX") {
      this.elements[0] = sinx * cosy * cosz - cosx * siny * sinz;
      this.elements[1] = cosx * siny * cosz + sinx * cosy * sinz;
      this.elements[2] = cosx * cosy * sinz - sinx * siny * cosz;
      this.elements[3] = cosx * cosy * cosz + sinx * siny * sinz;
    } else if (this.axisOrder === "YZX") {
      this.elements[0] = sinx * cosy * cosz + cosx * siny * sinz;
      this.elements[1] = cosx * siny * cosz + sinx * cosy * sinz;
      this.elements[2] = cosx * cosy * sinz - sinx * siny * cosz;
      this.elements[3] = cosx * cosy * cosz - sinx * siny * sinz;
    } else if (this.axisOrder === "XZY") {
      this.elements[0] = sinx * cosy * cosz - cosx * siny * sinz;
      this.elements[1] = cosx * siny * cosz - sinx * cosy * sinz;
      this.elements[2] = cosx * cosy * sinz + sinx * siny * cosz;
      this.elements[3] = cosx * cosy * cosz + sinx * siny * sinz;
    }

    return this;
  }

}

exports.Quat = Quat;
},{}],"kazI":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Plane = void 0;

var _DOMMesh = require("./DOMMesh.js");

var _Camera = require("../camera/Camera.js");

var _Mat = require("../math/Mat4.js");

var _Vec = require("../math/Vec2.js");

var _Vec2 = require("../math/Vec3.js");

var _Quat = require("../math/Quat.js");

var _utils = require("../utils/utils.js");

/***
 Here we create our Plane object
 We will extend our DOMMesh class that handles all the WebGL part and basic HTML sizings

 Plane class will add:
 - sizing and positioning and everything that relates to the DOM like draw checks (frustum culling) and reenter/leave events
 - projection (using Camera class object) and view matrices and everything that is related like perspective, scale, rotation...

 params :
 @renderer (Curtains renderer or Renderer class object): our curtains object OR our curtains renderer object
 @plane (html element): the html element that we will use for our Plane object

 @Meshparams (object): see Mesh class object

 @alwaysDraw (boolean, optionnal): if the plane should always be drawn or if it should use frustum culling. Default to false.
 @visible (boolean, optional): if the plane should be drawn or not. Default to true.
 @transparent (boolean, optional): if the plane should handle transparency. Default to false.
 @drawCheckMargins (object, optional): defines the margins in pixels to add to the frustum culling check to determine if the plane should be drawn. Default to 0.
 @autoloadSources (boolean, optional): if the sources should be loaded on init automatically. Default to true
 @watchScroll (boolean, optional): if the plane should auto update its position based on the scroll value. Default to true.
 @fov (float, optional): defines the perspective field of view used by the camera. Default to 50.

 returns :
 @this: our Plane
 ***/
class Plane extends _DOMMesh.DOMMesh {
  constructor(renderer, htmlElement, {
    // Mesh params
    shareProgram,
    widthSegments,
    heightSegments,
    depthTest,
    cullFace,
    uniforms,
    vertexShaderID,
    fragmentShaderID,
    vertexShader,
    fragmentShader,
    texturesOptions,
    crossOrigin,
    // Plane specific params
    alwaysDraw = false,
    visible = true,
    transparent = false,
    drawCheckMargins = {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    },
    autoloadSources = true,
    watchScroll = true,
    fov = 50
  } = {}) {
    super(renderer, htmlElement, "Plane", {
      shareProgram,
      widthSegments,
      heightSegments,
      depthTest,
      cullFace,
      uniforms,
      vertexShaderID,
      fragmentShaderID,
      vertexShader,
      fragmentShader,
      texturesOptions,
      crossOrigin
    });
    this.index = this.renderer.planes.length; // used for FBOs

    this.target = null; // use frustum culling or not

    this.alwaysDraw = alwaysDraw; // should draw is set to true by default, we'll check it later

    this._shouldDraw = true;
    this.visible = visible; // if the plane has transparency

    this._transparent = transparent; // draw check margins in pixels
    // positive numbers means it can be displayed even when outside the viewport
    // negative numbers means it can be hidden even when inside the viewport

    this.drawCheckMargins = drawCheckMargins; // if we decide to load all sources on init or let the user do it manually

    this.autoloadSources = autoloadSources; // if we should watch scroll

    this.watchScroll = watchScroll; // define if we should update the plane's matrices when called in the draw loop

    this._updateMVMatrix = false; // init camera

    this.camera = new _Camera.Camera({
      fov: fov,
      width: this.renderer._boundingRect.width,
      height: this.renderer._boundingRect.height,
      pixelRatio: this.renderer.pixelRatio
    }); // if program is valid, go on

    if (this._program.compiled) {
      // init our plane
      this._initPlane(); // add our plane to the scene stack and the renderer array


      this.renderer.scene.addPlane(this);
      this.renderer.planes.push(this);
    }
  }
  /*** RESTORING CONTEXT ***/

  /***
   Used internally to handle context restoration after the program has been successfully compiled again
   ***/


  _programRestored() {
    if (this.target) {
      // reset its render target if needed
      this.setRenderTarget(this.renderer.renderTargets[this.target.index]);
    }

    this._initMatrices(); // set our initial perspective matrix


    this.setPerspective(this.camera.fov, this.camera.near, this.camera.far);

    this._applyWorldPositions(); // add the plane to our draw stack again as it have been emptied


    this.renderer.scene.addPlane(this); // reset textures

    for (let i = 0; i < this.textures.length; i++) {
      this.textures[i]._parent = this;

      this.textures[i]._restoreContext();
    }

    this._canDraw = true;
  }
  /***
   Init our basic plane values (transformations, positions, camera, sources)
   ***/


  _initPlane() {
    // init transformation values
    this._initTransformValues(); // init its position values


    this._initPositions(); // set camera values


    this.setPerspective(this.camera.fov, this.camera.near, this.camera.far); // load sources

    this._initSources();
  }
  /*** TRANSFORMATIONS, PROJECTION & MATRICES ***/

  /***
   Set/reset plane's transformation values: rotation, scale, translation, transform origin
   ***/


  _initTransformValues() {
    this.rotation = new _Vec2.Vec3(); // initial quaternion

    this.quaternion = new _Quat.Quat(); // translation in viewport coordinates

    this.relativeTranslation = new _Vec2.Vec3(); // translation in webgl coordinates

    this._translation = new _Vec2.Vec3(); // scale is a Vec3 with z always equal to 1

    this.scale = new _Vec2.Vec3(1, 1, 1); // set plane transform origin to center

    this.transformOrigin = new _Vec2.Vec3(0.5, 0.5, 0);
  }
  /***
   Reset our plane transformation values and HTML element if specified (and valid)
     params :
   @htmlElement (HTML element, optional) : if provided, new HTML element to use as a reference for sizes and position syncing.
   ***/


  resetPlane(htmlElement) {
    this._initTransformValues();

    if (htmlElement !== null && !!htmlElement) {
      this.htmlElement = htmlElement;
      this.updatePosition();
    } else if (!htmlElement && !this.renderer.production) {
      (0, _utils.throwWarning)(this.type + ": You are trying to reset a plane with a HTML element that does not exist. The old HTML element will be kept instead.");
    }
  }
  /***
   Init our plane position: set its matrices, its position and perspective
   ***/


  _initPositions() {
    // set its matrices
    this._initMatrices(); // apply our css positions


    this._applyWorldPositions();
  }
  /***
   Init our plane model view and projection matrices and set their uniform locations
   ***/


  _initMatrices() {
    // create our model view and projection matrix
    this._matrices = {
      mvMatrix: {
        name: "uMVMatrix",
        matrix: new _Mat.Mat4(),
        location: this.gl.getUniformLocation(this._program.program, "uMVMatrix")
      },
      pMatrix: {
        name: "uPMatrix",
        matrix: new _Mat.Mat4(),
        // will be set after
        location: this.gl.getUniformLocation(this._program.program, "uPMatrix")
      }
    };
  }
  /***
   Set our plane dimensions and positions relative to clip spaces
   ***/


  _setWorldSizes() {
    // dimensions and positions of our plane in the document and clip spaces
    // don't forget translations in webgl space are referring to the center of our plane and canvas
    const planeCenter = {
      x: this._boundingRect.document.width / 2 + this._boundingRect.document.left,
      y: this._boundingRect.document.height / 2 + this._boundingRect.document.top
    };
    const containerCenter = {
      x: this.renderer._boundingRect.width / 2 + this.renderer._boundingRect.left,
      y: this.renderer._boundingRect.height / 2 + this.renderer._boundingRect.top
    }; // our plane clip space informations

    this._boundingRect.world = {
      width: this._boundingRect.document.width / this.renderer._boundingRect.width,
      height: this._boundingRect.document.height / this.renderer._boundingRect.height,
      top: (containerCenter.y - planeCenter.y) / this.renderer._boundingRect.height,
      left: (planeCenter.x - containerCenter.x) / this.renderer._boundingRect.height
    }; // since our vertices values range from -1 to 1
    // we need to scale them under the hood relatively to our canvas
    // to display an accurately sized plane

    this._boundingRect.world.scale = {
      x: this.renderer._boundingRect.width / this.renderer._boundingRect.height * this._boundingRect.world.width / 2,
      y: this._boundingRect.world.height / 2
    };
  }
  /*** PLANES PERSPECTIVES, SCALES AND ROTATIONS ***/

  /***
   This will set our perspective matrix and update our perspective matrix uniform
   used internally at each draw call if needed
   ***/


  _setPerspectiveMatrix() {
    // update our matrix uniform only if we share programs or if we actually have updated its values
    if (this.shareProgram || !this.shareProgram && this.camera._shouldUpdate) {
      this.renderer.useProgram(this._program);
      this.gl.uniformMatrix4fv(this._matrices.pMatrix.location, false, this._matrices.pMatrix.matrix.elements);
    } // reset camera shouldUpdate flag


    this.camera.cancelUpdate();
  }
  /***
   This will set our perspective matrix new parameters (fov, near plane and far plane)
   used internally but can be used externally as well to change fov for example
     params :
   @fov (float): the field of view
   @near (float): the nearest point where object are displayed
   @far (float): the farthest point where object are displayed
   ***/


  setPerspective(fov, near, far) {
    this.camera.setPerspective(fov, near, far, this.renderer._boundingRect.width, this.renderer._boundingRect.height, this.renderer.pixelRatio); // force camera update on context restoration

    if (this.renderer.state.isContextLost) {
      this.camera.forceUpdate();
    }

    this._matrices.pMatrix.matrix = this.camera.projectionMatrix; // if camera settings changed update the mvMatrix as well cause we need to update z translation based on new fov

    this._updateMVMatrix = this.camera._shouldUpdate;
  }
  /***
   This will set our model view matrix
   used internally at each draw call if needed
   It will calculate our matrix based on its plane translation, rotation and scale
   ***/


  _setMVMatrix() {
    if (this._updateMVMatrix) {
      // translation
      // along the Z axis it's based on the relativeTranslation.z, CSSPerspective and camera Z position values
      // we're computing it here because it will change when our fov changes
      this._translation.z = -((1 - this.relativeTranslation.z / this.camera.CSSPerspective) / this.camera.position.z); // get transformation origin relative to world space

      const origin = new _Vec2.Vec3((this.transformOrigin.x * 2 - 1) * // between -1 and 1
      this._boundingRect.world.scale.x, -(this.transformOrigin.y * 2 - 1) // between -1 and 1
      * this._boundingRect.world.scale.y, this.transformOrigin.z); // get our transformation matrix

      let transformFromOrigin = new _Mat.Mat4().composeFromOrigin(this._translation, this.quaternion, this.scale, origin); // now scale our plane according to its world bounding rect

      const scaleMatrix = new _Mat.Mat4([this._boundingRect.world.scale.x, 0, 0, 0, 0, this._boundingRect.world.scale.y, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); // we've got our model view matrix

      this._matrices.mvMatrix.matrix = transformFromOrigin.multiply(scaleMatrix); // this is the result of our projection matrix * our mv matrix, useful for bounding box calculations and frustum culling

      this._matrices.mVPMatrix = this._matrices.pMatrix.matrix.multiply(this._matrices.mvMatrix.matrix); // check if we should draw the plane but only if everything has been initialized

      if (!this.alwaysDraw) {
        this._shouldDrawCheck();
      }
    } // update our matrix uniform only if we share programs or if we actually have updated its values


    if (this.shareProgram || !this.shareProgram && this._updateMVMatrix) {
      this.renderer.useProgram(this._program);
      this.gl.uniformMatrix4fv(this._matrices.mvMatrix.location, false, this._matrices.mvMatrix.matrix.elements);
    } // reset our flag


    this._updateMVMatrix = false;
  }
  /***
   This will set our plane scale
   used internally but can be used externally as well
     params :
   @scale (Vec2 object): scale to apply on X and Y axes
   ***/


  setScale(scale) {
    if (!scale.type || scale.type !== "Vec2") {
      if (!this.renderer.production) {
        (0, _utils.throwWarning)(this.type + ": Cannot set scale because the parameter passed is not of Vec2 type:", scale);
      }

      return;
    }

    scale.sanitizeNaNValuesWith(this.scale).max(new _Vec.Vec2(0.001, 0.001)); // only apply if values changed

    if (scale.x !== this.scale.x || scale.y !== this.scale.y) {
      this.scale.set(scale.x, scale.y, 1); // adjust textures size

      for (let i = 0; i < this.textures.length; i++) {
        this.textures[i].resize();
      } // we should update the plane mvMatrix


      this._updateMVMatrix = true;
    }
  }
  /***
   This will set our plane rotation
   used internally but can be used externally as well
     params :
   @rotation (Vec3 object): rotation to apply on X, Y and Z axes (in radians)
   ***/


  setRotation(rotation) {
    if (!rotation.type || rotation.type !== "Vec3") {
      if (!this.renderer.production) {
        (0, _utils.throwWarning)(this.type + ": Cannot set rotation because the parameter passed is not of Vec3 type:", rotation);
      }

      return;
    }

    rotation.sanitizeNaNValuesWith(this.rotation); // only apply if values changed

    if (!rotation.equals(this.rotation)) {
      this.rotation.copy(rotation);
      this.quaternion.setFromVec3(this.rotation); // we should update the plane mvMatrix

      this._updateMVMatrix = true;
    }
  }
  /***
   This will set our plane transform origin
   (0, 0, 0) means plane's top left corner
   (1, 1, 0) means plane's bottom right corner
   (0.5, 0.5, -1) means behind plane's center
     params :
   @origin (Vec3 object): coordinate of transformation origin X, Y and Z axes
   ***/


  setTransformOrigin(origin) {
    if (!origin.type || origin.type !== "Vec3") {
      if (!this.renderer.production) {
        (0, _utils.throwWarning)(this.type + ": Cannot set transform origin because the parameter passed is not of Vec3 type:", origin);
      }

      return;
    }

    origin.sanitizeNaNValuesWith(this.transformOrigin);

    if (!origin.equals(this.transformOrigin)) {
      this.transformOrigin.copy(origin);
      this._updateMVMatrix = true;
    }
  }
  /***
   This will set our plane translation by adding plane computed bounding box values and computed relative position values
   ***/


  _setTranslation() {
    // avoid unnecessary calculations if we don't have a users set relative position
    let worldPosition = new _Vec2.Vec3();

    if (!this.relativeTranslation.equals(worldPosition)) {
      worldPosition = this._documentToWorldSpace(this.relativeTranslation);
    }

    this._translation.set(this._boundingRect.world.left + worldPosition.x, this._boundingRect.world.top + worldPosition.y, this._translation.z); // we should update the plane mvMatrix


    this._updateMVMatrix = true;
  }
  /***
   This function takes pixel values along X and Y axis and convert them to clip space coordinates, and then apply the corresponding translation
   TODO deprecated and will be removed soon
     params :
   @translation (Vec3): translation to apply on X, Y and Z axes
   ***/


  setRelativePosition(translation) {
    if (!this.renderer.production) {
      (0, _utils.throwWarning)(this.type + ": setRelativePosition() is deprecated, use setRelativeTranslation() instead");
    }

    this.setRelativeTranslation(translation);
  }
  /***
   This function takes pixel values along X and Y axis and convert them to clip space coordinates, and then apply the corresponding translation
     params :
   @translation (Vec3): translation to apply on X, Y and Z axes
   ***/


  setRelativeTranslation(translation) {
    if (!translation.type || translation.type !== "Vec3") {
      if (!this.renderer.production) {
        (0, _utils.throwWarning)(this.type + ": Cannot set translation because the parameter passed is not of Vec3 type:", translation);
      }

      return;
    }

    translation.sanitizeNaNValuesWith(this.relativeTranslation); // only apply if values changed

    if (!translation.equals(this.relativeTranslation)) {
      this.relativeTranslation.copy(translation);

      this._setTranslation();
    }
  }
  /***
   This function takes pixel values along X and Y axis and convert them to clip space coordinates
     params :
   @vector (Vec3): position to convert on X, Y and Z axes
     returns :
   @worldPosition: plane's position in WebGL space
   ***/


  _documentToWorldSpace(vector) {
    const worldPosition = new _Vec2.Vec3(vector.x / (this.renderer._boundingRect.width / this.renderer.pixelRatio) * (this.renderer._boundingRect.width / this.renderer._boundingRect.height), -vector.y / (this.renderer._boundingRect.height / this.renderer.pixelRatio), vector.z);
    return worldPosition;
  }

  /*** FRUSTUM CULLING (DRAW CHECK) ***/

  /***
   Find the intersection point by adding a vector starting from a corner till we reach the near plane
     params:
   @refPoint (Vec3 class object): corner of the plane from which we start to iterate from
   @secondPoint (Vec3 class object): second point near the refPoint to get a direction to use for iteration
     returns:
   @intersection (Vec3 class object): intersection between our plane and the camera near plane
   ***/
  _getIntersection(refPoint, secondPoint) {
    // direction vector to add
    let direction = secondPoint.clone().sub(refPoint); // copy our corner refpoint

    let intersection = refPoint.clone(); // iterate till we reach near plane

    while (intersection.z > -1) {
      intersection.add(direction);
    }

    return intersection;
  }
  /***
   Get intersection points between a plane and the camera near plane
   When a plane gets clipped by the camera near plane, the clipped corner projected coords returned by _applyMat4() are erronate
   We need to find the intersection points using another approach
   Here I chose to use non clipped corners projected coords and a really small vector parallel to the plane's side
   We're adding that vector again and again to our corner projected coords until the Z coordinate matches the near plane: we got our intersection
     params:
   @corners (array): our original corners vertices coordinates
   @mvpCorners (array): the projected corners of our plane
   @clippedCorners (array): index of the corners that are clipped
     returns:
   @mvpCorners (array): the corrected projected corners of our plane
   ***/


  _getNearPlaneIntersections(corners, mvpCorners, clippedCorners) {
    // rebuild the clipped corners based on non clipped ones
    if (clippedCorners.length === 1) {
      // we will have 5 corners to check so we'll need to push a new entry in our mvpCorners array
      if (clippedCorners[0] === 0) {
        // top left is culled
        // get intersection iterating from top right
        mvpCorners[0] = this._getIntersection(mvpCorners[1], new _Vec2.Vec3(0.95, 1, 0).applyMat4(this._matrices.mVPMatrix)); // get intersection iterating from bottom left

        mvpCorners.push(this._getIntersection(mvpCorners[3], new _Vec2.Vec3(-1, -0.95, 0).applyMat4(this._matrices.mVPMatrix)));
      } else if (clippedCorners[0] === 1) {
        // top right is culled
        // get intersection iterating from top left
        mvpCorners[1] = this._getIntersection(mvpCorners[0], new _Vec2.Vec3(-0.95, 1, 0).applyMat4(this._matrices.mVPMatrix)); // get intersection iterating from bottom right

        mvpCorners.push(this._getIntersection(mvpCorners[2], new _Vec2.Vec3(1, -0.95, 0).applyMat4(this._matrices.mVPMatrix)));
      } else if (clippedCorners[0] === 2) {
        // bottom right is culled
        // get intersection iterating from bottom left
        mvpCorners[2] = this._getIntersection(mvpCorners[3], new _Vec2.Vec3(-0.95, -1, 0).applyMat4(this._matrices.mVPMatrix)); // get intersection iterating from top right

        mvpCorners.push(this._getIntersection(mvpCorners[1], new _Vec2.Vec3(1, 0.95, 0).applyMat4(this._matrices.mVPMatrix)));
      } else if (clippedCorners[0] === 3) {
        // bottom left is culled
        // get intersection iterating from bottom right
        mvpCorners[3] = this._getIntersection(mvpCorners[2], new _Vec2.Vec3(0.95, -1, 0).applyMat4(this._matrices.mVPMatrix)); // get intersection iterating from top left

        mvpCorners.push(this._getIntersection(mvpCorners[0], new _Vec2.Vec3(-1, 0.95, 0).applyMat4(this._matrices.mVPMatrix)));
      }
    } else if (clippedCorners.length === 2) {
      if (clippedCorners[0] === 0 && clippedCorners[1] === 1) {
        // top part of the plane is culled by near plane
        // find intersection using bottom corners
        mvpCorners[0] = this._getIntersection(mvpCorners[3], new _Vec2.Vec3(-1, -0.95, 0).applyMat4(this._matrices.mVPMatrix));
        mvpCorners[1] = this._getIntersection(mvpCorners[2], new _Vec2.Vec3(1, -0.95, 0).applyMat4(this._matrices.mVPMatrix));
      } else if (clippedCorners[0] === 1 && clippedCorners[1] === 2) {
        // right part of the plane is culled by near plane
        // find intersection using left corners
        mvpCorners[1] = this._getIntersection(mvpCorners[0], new _Vec2.Vec3(-0.95, 1, 0).applyMat4(this._matrices.mVPMatrix));
        mvpCorners[2] = this._getIntersection(mvpCorners[3], new _Vec2.Vec3(-0.95, -1, 0).applyMat4(this._matrices.mVPMatrix));
      } else if (clippedCorners[0] === 2 && clippedCorners[1] === 3) {
        // bottom part of the plane is culled by near plane
        // find intersection using top corners
        mvpCorners[2] = this._getIntersection(mvpCorners[1], new _Vec2.Vec3(1, 0.95, 0).applyMat4(this._matrices.mVPMatrix));
        mvpCorners[3] = this._getIntersection(mvpCorners[0], new _Vec2.Vec3(-1, 0.95, 0).applyMat4(this._matrices.mVPMatrix));
      } else if (clippedCorners[0] === 0 && clippedCorners[1] === 3) {
        // left part of the plane is culled by near plane
        // find intersection using right corners
        mvpCorners[0] = this._getIntersection(mvpCorners[1], new _Vec2.Vec3(0.95, 1, 0).applyMat4(this._matrices.mVPMatrix));
        mvpCorners[3] = this._getIntersection(mvpCorners[2], new _Vec2.Vec3(0.95, -1, 0).applyMat4(this._matrices.mVPMatrix));
      }
    } else if (clippedCorners.length === 3) {
      // get the corner that is not clipped
      let nonClippedCorner = 0;

      for (let i = 0; i < corners.length; i++) {
        if (!clippedCorners.includes(i)) {
          nonClippedCorner = i;
        }
      } // we will have just 3 corners so reset our mvpCorners array with just the visible corner


      mvpCorners = [mvpCorners[nonClippedCorner]];

      if (nonClippedCorner === 0) {
        // from top left corner to right
        mvpCorners.push(this._getIntersection(mvpCorners[0], new _Vec2.Vec3(-0.95, 1, 0).applyMat4(this._matrices.mVPMatrix))); // from top left corner to bottom

        mvpCorners.push(this._getIntersection(mvpCorners[0], new _Vec2.Vec3(-1, 0.95, 0).applyMat4(this._matrices.mVPMatrix)));
      } else if (nonClippedCorner === 1) {
        // from top right corner to left
        mvpCorners.push(this._getIntersection(mvpCorners[0], new _Vec2.Vec3(0.95, 1, 0).applyMat4(this._matrices.mVPMatrix))); // from top right corner to bottom

        mvpCorners.push(this._getIntersection(mvpCorners[0], new _Vec2.Vec3(1, 0.95, 0).applyMat4(this._matrices.mVPMatrix)));
      } else if (nonClippedCorner === 2) {
        // from bottom right corner to left
        mvpCorners.push(this._getIntersection(mvpCorners[0], new _Vec2.Vec3(0.95, -1, 0).applyMat4(this._matrices.mVPMatrix))); // from bottom right corner to top

        mvpCorners.push(this._getIntersection(mvpCorners[0], new _Vec2.Vec3(1, -0.95, 0).applyMat4(this._matrices.mVPMatrix)));
      } else if (nonClippedCorner === 3) {
        // from bottom left corner to right
        mvpCorners.push(this._getIntersection(mvpCorners[0], new _Vec2.Vec3(-0.95, -1, 0).applyMat4(this._matrices.mVPMatrix))); // from bottom left corner to top

        mvpCorners.push(this._getIntersection(mvpCorners[0], new _Vec2.Vec3(-1 - 0.95, 0).applyMat4(this._matrices.mVPMatrix)));
      }
    } else {
      // all 4 corners are culled! artificially apply wrong coords to force plane culling
      for (let i = 0; i < corners.length; i++) {
        mvpCorners[i][0] = 10000;
        mvpCorners[i][1] = 10000;
      }
    }

    return mvpCorners;
  }

  /***
   Useful to get our WebGL plane bounding box in the world space
   Takes all transformations into account
   Used internally for frustum culling
     returns :
   @boundingRectangle (obj): an object containing our plane WebGL element 4 corners coordinates: top left corner is [-1, 1] and bottom right corner is [1, -1]
   ***/
  _getWorldCoords() {
    const corners = [new _Vec2.Vec3(-1, 1, 0), // plane's top left corner
    new _Vec2.Vec3(1, 1, 0), // plane's top right corner
    new _Vec2.Vec3(1, -1, 0), // plane's bottom right corner
    new _Vec2.Vec3(-1, -1, 0) // plane's bottom left corner
    ]; // corners with model view projection matrix applied

    let mvpCorners = []; // eventual clipped corners

    let clippedCorners = []; // we are going to get our plane's four corners relative to our model view projection matrix

    for (let i = 0; i < corners.length; i++) {
      const mvpCorner = corners[i].applyMat4(this._matrices.mVPMatrix);
      mvpCorners.push(mvpCorner); // Z position is > 1 or < -1 means the corner is clipped

      if (Math.abs(mvpCorner.z) > 1) {
        clippedCorners.push(i);
      }
    } // near plane is clipping, get intersections between plane and near plane


    if (clippedCorners.length) {
      mvpCorners = this._getNearPlaneIntersections(corners, mvpCorners, clippedCorners);
    } // we need to check for the X and Y min and max values
    // use arbitrary integers that will be overriden anyway


    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (let i = 0; i < mvpCorners.length; i++) {
      const corner = mvpCorners[i];

      if (corner.x < minX) {
        minX = corner.x;
      }

      if (corner.x > maxX) {
        maxX = corner.x;
      }

      if (corner.y < minY) {
        minY = corner.y;
      }

      if (corner.y > maxY) {
        maxY = corner.y;
      }
    }

    return {
      top: maxY,
      right: maxX,
      bottom: minY,
      left: minX
    };
  }

  /***
   Transpose our plane corners coordinates from world space to document space
   Sets an object with the accurate plane WebGL bounding rect relative to document
   ***/
  _computeWebGLBoundingRect() {
    // get our world space bouding rect
    const worldBBox = this._getWorldCoords(); // normalize worldBBox to (0 -> 1) screen coordinates with [0, 0] being the top left corner and [1, 1] being the bottom right


    let screenBBox = {
      top: 1 - (worldBBox.top + 1) / 2,
      right: (worldBBox.right + 1) / 2,
      bottom: 1 - (worldBBox.bottom + 1) / 2,
      left: (worldBBox.left + 1) / 2
    };
    screenBBox.width = screenBBox.right - screenBBox.left;
    screenBBox.height = screenBBox.bottom - screenBBox.top; // return our values ranging from 0 to 1 multiplied by our canvas sizes + canvas top and left offsets

    this._boundingRect.worldToDocument = {
      width: screenBBox.width * this.renderer._boundingRect.width,
      height: screenBBox.height * this.renderer._boundingRect.height,
      top: screenBBox.top * this.renderer._boundingRect.height + this.renderer._boundingRect.top,
      left: screenBBox.left * this.renderer._boundingRect.width + this.renderer._boundingRect.left,
      // add left and width to get right property
      right: screenBBox.left * this.renderer._boundingRect.width + this.renderer._boundingRect.left + screenBBox.width * this.renderer._boundingRect.width,
      // add top and height to get bottom property
      bottom: screenBBox.top * this.renderer._boundingRect.height + this.renderer._boundingRect.top + screenBBox.height * this.renderer._boundingRect.height
    };
  }
  /***
   Returns our plane WebGL bounding rect relative to document
     returns :
   @boundingRectangle (obj): an object containing our plane WebGL element bounding rectangle (width, height, top, bottom, right and left properties)
   ***/


  getWebGLBoundingRect() {
    if (!this._matrices.mVPMatrix) {
      return this._boundingRect.document;
    } else if (!this._boundingRect.worldToDocument || this.alwaysDraw) {
      this._computeWebGLBoundingRect();
    }

    return this._boundingRect.worldToDocument;
  }
  /***
   Returns our plane WebGL bounding rectangle in document coordinates including additional drawCheckMargins
     returns :
   @boundingRectangle (obj): an object containing our plane WebGL element bounding rectangle including the draw check margins (top, bottom, right and left properties)
   ***/


  _getWebGLDrawRect() {
    this._computeWebGLBoundingRect();

    return {
      top: this._boundingRect.worldToDocument.top - this.drawCheckMargins.top,
      right: this._boundingRect.worldToDocument.right + this.drawCheckMargins.right,
      bottom: this._boundingRect.worldToDocument.bottom + this.drawCheckMargins.bottom,
      left: this._boundingRect.worldToDocument.left - this.drawCheckMargins.left
    };
  }
  /***
   This function checks if the plane is currently visible in the canvas and sets _shouldDraw property according to this test
   This is our real frustum culling check
   ***/


  _shouldDrawCheck() {
    // get plane bounding rect
    const actualPlaneBounds = this._getWebGLDrawRect(); // if we decide to draw the plane only when visible inside the canvas
    // we got to check if its actually inside the canvas


    if (Math.round(actualPlaneBounds.right) <= this.renderer._boundingRect.left || Math.round(actualPlaneBounds.left) >= this.renderer._boundingRect.left + this.renderer._boundingRect.width || Math.round(actualPlaneBounds.bottom) <= this.renderer._boundingRect.top || Math.round(actualPlaneBounds.top) >= this.renderer._boundingRect.top + this.renderer._boundingRect.height) {
      if (this._shouldDraw) {
        this._shouldDraw = false; // callback for leaving view

        this.renderer.nextRender.add(() => this._onLeaveViewCallback && this._onLeaveViewCallback());
      }
    } else {
      if (!this._shouldDraw) {
        // callback for entering view
        this.renderer.nextRender.add(() => this._onReEnterViewCallback && this._onReEnterViewCallback());
      }

      this._shouldDraw = true;
    }
  }
  /***
   This function returns if the plane is actually drawn (ie fully initiated, visible property set to true and not culled)
   ***/


  isDrawn() {
    return this._canDraw && this.visible && (this._shouldDraw || this.alwaysDraw);
  }
  /***
   This function uses our plane HTML Element bounding rectangle values and convert them to the world clip space coordinates, and then apply the corresponding translation
   ***/


  _applyWorldPositions() {
    // set our plane sizes and positions relative to the world clipspace
    this._setWorldSizes(); // set the translation values


    this._setTranslation();
  }
  /***
   This function updates the plane position based on its CSS positions and transformations values.
   Useful if the HTML element has been moved while the container size has not changed.
   ***/


  updatePosition() {
    // set the new plane sizes and positions relative to document by triggering getBoundingClientRect()
    this._setDocumentSizes(); // apply them


    this._applyWorldPositions();
  }
  /***
   This function updates the plane position based on the Curtains class scroll manager values
     params:
   @lastXDelta (float): last scroll value along X axis
   @lastYDelta (float): last scroll value along Y axis
   ***/


  updateScrollPosition(lastXDelta, lastYDelta) {
    // actually update the plane position only if last X delta or last Y delta is not equal to 0
    if (lastXDelta || lastYDelta) {
      // set new positions based on our delta without triggering reflow
      this._boundingRect.document.top += lastYDelta * this.renderer.pixelRatio;
      this._boundingRect.document.left += lastXDelta * this.renderer.pixelRatio; // apply them

      this._applyWorldPositions();
    }
  }

  /*** DEPTH AND RENDER ORDER ***/

  /***
   This function set/unset the depth test for that plane
     params :
   @shouldEnableDepthTest (bool): enable/disable depth test for that plane
   ***/
  enableDepthTest(shouldEnableDepthTest) {
    this._depthTest = shouldEnableDepthTest;
  }
  /***
   This function puts the plane at the end of the draw stack, allowing it to overlap any other plane
   ***/


  moveToFront() {
    // disable the depth test
    this.enableDepthTest(false);
    this.renderer.scene.movePlaneToFront(this);
  }
  /*** SOURCES ***/

  /***
   Load our initial sources if needed and calls onReady callback
   ***/


  _initSources() {
    // finally load every sources already in our plane html element
    // load plane sources
    let loaderSize = 0;

    if (this.autoloadSources) {
      // load images
      const imagesArray = [];

      for (let i = 0; i < this.htmlElement.getElementsByTagName("img").length; i++) {
        imagesArray.push(this.htmlElement.getElementsByTagName("img")[i]);
      }

      if (imagesArray.length > 0) {
        this.loadImages(imagesArray);
      } // load videos


      const videosArray = [];

      for (let i = 0; i < this.htmlElement.getElementsByTagName("video").length; i++) {
        videosArray.push(this.htmlElement.getElementsByTagName("video")[i]);
      }

      if (videosArray.length > 0) {
        this.loadVideos(videosArray);
      } // load canvases


      const canvasesArray = [];

      for (let i = 0; i < this.htmlElement.getElementsByTagName("canvas").length; i++) {
        canvasesArray.push(this.htmlElement.getElementsByTagName("canvas")[i]);
      }

      if (canvasesArray.length > 0) {
        this.loadCanvases(canvasesArray);
      }

      loaderSize = imagesArray.length + videosArray.length + canvasesArray.length;
    }

    this.loader._setLoaderSize(loaderSize);

    this._canDraw = true;
  }
  /*** DRAWING ***/

  /***
   Specific instructions for the Plane class to execute before drawing it
   ***/


  _startDrawing() {
    // check if our plane is ready to draw
    if (this._canDraw) {
      // even if our plane should not be drawn we still execute its onRender callback and update its uniforms
      if (this._onRenderCallback) {
        this._onRenderCallback();
      } // to improve webgl pipeline performace, we might want to update each texture that needs an update here
      // see https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices#texImagetexSubImage_uploads_particularly_with_videos_can_cause_pipeline_flushes
      // if we should render to a render target


      if (this.target) {
        this.renderer.bindFrameBuffer(this.target);
      } else if (this.renderer.state.scenePassIndex === null) {
        this.renderer.bindFrameBuffer(null);
      } // update our perspective matrix


      this._setPerspectiveMatrix(); // update our mv matrix


      this._setMVMatrix(); // now check if we really need to draw it and its textures


      if ((this.alwaysDraw || this._shouldDraw) && this.visible) {
        this._draw();
      }
    }
  }
  /*** EVENTS ***/

  /***
   This is called each time a plane is entering again the view bounding box
     params :
   @callback (function) : a function to execute
     returns :
   @this: our plane to handle chaining
   ***/


  onReEnterView(callback) {
    if (callback) {
      this._onReEnterViewCallback = callback;
    }

    return this;
  }
  /***
   This is called each time a plane is leaving the view bounding box
     params :
   @callback (function) : a function to execute
     returns :
   @this: our plane to handle chaining
   ***/


  onLeaveView(callback) {
    if (callback) {
      this._onLeaveViewCallback = callback;
    }

    return this;
  }

}

exports.Plane = Plane;
},{"./DOMMesh.js":"F2xI","../camera/Camera.js":"nOhk","../math/Mat4.js":"ceZz","../math/Vec2.js":"V1SK","../math/Vec3.js":"lfw1","../math/Quat.js":"CUq9","../utils/utils.js":"eOZP"}],"H8Ju":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RenderTarget = void 0;

var _Texture = require("../core/Texture.js");

var _utils = require("../utils/utils.js");

/***
 Here we create a RenderTarget class object

 params :
 @renderer (Curtains renderer or Renderer class object): our curtains object OR our curtains renderer object

 @shaderPass (ShaderPass class object): shader pass that will use that render target. Default to null
 @depth (bool, optional): whether to create a depth buffer (handle depth inside your render target). Default to false.
 @clear (bool, optional): whether the content of the render target should be cleared before being drawn. Should be set to false to handle ping-pong shading. Default to true.

 @minWidth (float, optional): minimum width of the render target
 @minHeight (float, optional): minimum height of the render target

 @texturesOptions (object, optional): options and parameters to apply to the render target texture. See the Texture class object.

 returns :
 @this: our RenderTarget class object
 ***/
class RenderTarget {
  constructor(renderer, {
    shaderPass,
    depth = false,
    clear = true,
    minWidth = 1024,
    minHeight = 1024,
    texturesOptions = {}
  } = {}) {
    this.type = "RenderTarget"; // we could pass our curtains object OR our curtains renderer object

    renderer = renderer && renderer.renderer || renderer;

    if (!renderer || renderer.type !== "Renderer") {
      (0, _utils.throwError)(this.type + ": Renderer not passed as first argument", renderer);
    } else if (!renderer.gl) {
      (0, _utils.throwError)(this.type + ": Renderer WebGL context is undefined", renderer);
    }

    this.renderer = renderer;
    this.gl = this.renderer.gl;
    this.index = this.renderer.renderTargets.length;
    this._shaderPass = shaderPass; // whether to create a render buffer

    this._depth = depth;
    this._shouldClear = clear;
    this._minSize = {
      width: minWidth * this.renderer.pixelRatio,
      height: minHeight * this.renderer.pixelRatio
    }; // default textures options depends on the type of Mesh and WebGL context

    texturesOptions = Object.assign({
      // set default sampler to "uRenderTexture" and isFBOTexture to true
      sampler: "uRenderTexture",
      isFBOTexture: true,
      premultiplyAlpha: false,
      anisotropy: 1,
      generateMipmap: false,
      floatingPoint: "none",
      wrapS: this.gl.CLAMP_TO_EDGE,
      wrapT: this.gl.CLAMP_TO_EDGE,
      minFilter: this.gl.LINEAR,
      magFilter: this.gl.LINEAR
    }, texturesOptions);
    this._texturesOptions = texturesOptions;
    this.userData = {};
    this.uuid = (0, _utils.generateUUID)();
    this.renderer.renderTargets.push(this); // we've added a new object, keep Curtains class in sync with our renderer

    this.renderer.onSceneChange();

    this._initRenderTarget();
  }
  /***
   Init our RenderTarget by setting its size, creating a textures array and then calling _createFrameBuffer()
   ***/


  _initRenderTarget() {
    this._setSize(); // create our render texture


    this.textures = []; // create our frame buffer

    this._createFrameBuffer();
  }
  /*** RESTORING CONTEXT ***/

  /***
   Restore a render target
   Basically just re init it
   ***/


  _restoreContext() {
    // reset size
    this._setSize(); // re create our frame buffer and restore its texture


    this._createFrameBuffer();
  }
  /***
   Sets our RenderTarget size based on its parent plane size
   ***/


  _setSize() {
    if (this._shaderPass && this._shaderPass._isScenePass) {
      this._size = {
        width: this.renderer._boundingRect.width,
        height: this.renderer._boundingRect.height
      };
    } else {
      this._size = {
        width: Math.max(this._minSize.width, this.renderer._boundingRect.width),
        height: Math.max(this._minSize.height, this.renderer._boundingRect.height)
      };
    }
  }
  /***
   Resizes our RenderTarget (only resize it if it's a ShaderPass scene pass FBO)
   ***/


  resize() {
    // resize render target only if its a child of a shader pass
    if (this._shaderPass) {
      this._setSize();

      this.textures[0].resize(); // cancel clear on resize

      this.renderer.bindFrameBuffer(this, true);

      if (this._depth) {
        this._bindDepthBuffer();
      }

      this.renderer.bindFrameBuffer(null);
    }
  }
  /***
   Binds our depth buffer
   ***/


  _bindDepthBuffer() {
    // render to our target texture by binding the framebuffer
    if (this._depthBuffer) {
      this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this._depthBuffer); // allocate renderbuffer

      this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, this._size.width, this._size.height); // attach renderbuffer

      this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, this._depthBuffer);
    }
  }
  /***
   Here we create our frame buffer object
   We're also adding a render buffer object to handle depth if needed
   ***/


  _createFrameBuffer() {
    this._frameBuffer = this.gl.createFramebuffer(); // cancel clear on init

    this.renderer.bindFrameBuffer(this, true); // if textures array is not empty it means we're restoring the context

    if (this.textures.length) {
      this.textures[0]._parent = this;

      this.textures[0]._restoreContext();
    } else {
      // create a texture
      const texture = new _Texture.Texture(this.renderer, this._texturesOptions); // adds the render target as parent and adds the texture to our textures array as well

      texture.addParent(this);
    } // attach the texture as the first color attachment
    // this.textures[0]._sampler.texture contains our WebGLTexture object


    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.textures[0]._sampler.texture, 0); // create a depth renderbuffer

    if (this._depth) {
      this._depthBuffer = this.gl.createRenderbuffer();

      this._bindDepthBuffer();
    }

    this.renderer.bindFrameBuffer(null);
  }
  /*** GET THE RENDER TARGET TEXTURE ***/

  /***
   Returns the render target's texture
     returns :
   @texture (Texture class object): our RenderTarget's texture
   ***/


  getTexture() {
    return this.textures[0];
  }
  /*** DESTROYING ***/

  /***
   Remove an element by calling the appropriate renderer method
   ***/


  remove() {
    // check if it is attached to a shader pass
    if (this._shaderPass) {
      if (!this.renderer.production) {
        (0, _utils.throwWarning)(this.type + ": You're trying to remove a RenderTarget attached to a ShaderPass. You should remove that ShaderPass instead:", this._shaderPass);
      }

      return;
    }

    this._dispose();

    this.renderer.removeRenderTarget(this);
  }
  /***
   Delete a RenderTarget buffers and its associated texture
   ***/


  _dispose() {
    if (this._frameBuffer) {
      this.gl.deleteFramebuffer(this._frameBuffer);
      this._frameBuffer = null;
    }

    if (this._depthBuffer) {
      this.gl.deleteRenderbuffer(this._depthBuffer);
      this._depthBuffer = null;
    }

    this.textures[0]._dispose();

    this.textures = [];
  }

}

exports.RenderTarget = RenderTarget;
},{"../core/Texture.js":"RQKC","../utils/utils.js":"eOZP"}],"cXQZ":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ShaderPass = void 0;

var _DOMMesh = require("../core/DOMMesh.js");

var _RenderTarget = require("./RenderTarget.js");

var _Texture = require("../core/Texture.js");

/*** SHADERPASS CLASS ***/

/***
 Here we create our ShaderPass object
 We will extend our DOMMesh class that handles all the WebGL part and basic HTML sizings
 ShaderPass class will add the frame buffer by creating a new RenderTarget class object

 params :
 @renderer (Curtains renderer or Renderer class object): our curtains object OR our curtains renderer object

 @Meshparams (object): see Mesh class object

 @depth (boolean, optionnal): whether the shader pass render target should use a depth buffer (see RenderTarget class object). Default to false.
 @clear (boolean, optional): whether the shader pass render target content should be cleared before being drawn (see RenderTarget class object). Default to true.
 @renderTarget (RenderTarget class object, optional): an already existing render target to use. Default to null.

 returns :
 @this: our ShaderPass element
 ***/
class ShaderPass extends _DOMMesh.DOMMesh {
  constructor(renderer, {
    // Mesh params
    shareProgram,
    widthSegments,
    heightSegments,
    depthTest,
    cullFace,
    uniforms,
    vertexShaderID,
    fragmentShaderID,
    vertexShader,
    fragmentShader,
    texturesOptions,
    crossOrigin,
    // ShaderPass specific params
    depth = false,
    clear = true,
    renderTarget
  }) {
    // force plane defintion to 1x1
    widthSegments = 1;
    heightSegments = 1; // always cull back face

    cullFace = "back"; // never share a program between shader passes

    shareProgram = false; // use the renderer container as our HTML element to create a DOMMesh object

    super(renderer, renderer.container, "ShaderPass", {
      shareProgram,
      widthSegments,
      heightSegments,
      depthTest,
      cullFace,
      uniforms,
      vertexShaderID,
      fragmentShaderID,
      vertexShader,
      fragmentShader,
      texturesOptions,
      crossOrigin
    }); // default to scene pass

    this._isScenePass = true;
    this.index = this.renderer.shaderPasses.length;
    this._depth = depth;
    this._shouldClear = clear;
    this.target = renderTarget;

    if (this.target) {
      // if there's a target defined it's not a scene pass
      this._isScenePass = false; // inherit clear param

      this._shouldClear = this.target._shouldClear;
    } // if the program is valid, go on


    if (this._program.compiled) {
      this._initShaderPass(); // add shader pass to our renderer shaderPasses array


      this.renderer.shaderPasses.push(this); // wait one tick before adding our shader pass to the scene to avoid flickering black screen for one frame

      this.renderer.nextRender.add(() => {
        this.renderer.scene.addShaderPass(this);
      });
    }
  }
  /*** RESTORING CONTEXT ***/

  /***
   Used internally to handle context restoration after the program has been successfully compiled again
   ***/


  _programRestored() {
    // we just need to re add the shader pass to the scene stack
    if (this._isScenePass) {
      this.renderer.scene.stacks.scenePasses.push(this.index);
    } else {
      this.renderer.scene.stacks.renderPasses.push(this.index);
    } // restore the textures


    for (let i = 0; i < this.textures.length; i++) {
      this.textures[i]._parent = this;

      this.textures[i]._restoreContext();
    }

    this._canDraw = true;
  }
  /***
   Here we init additionnal shader pass planes properties
   This mainly consists in creating our render texture and add a frame buffer object
   ***/


  _initShaderPass() {
    // create our frame buffer
    if (!this.target) {
      this._createFrameBuffer();
    } else {
      // set the render target
      this.setRenderTarget(this.target);
      this.target._shaderPass = this;
    } // create a texture from the render target texture


    const texture = new _Texture.Texture(this.renderer, {
      sampler: "uRenderTexture",
      isFBOTexture: true,
      fromTexture: this.target.getTexture()
    });
    texture.addParent(this); // onReady callback

    this.loader._setLoaderSize(0);

    this._canDraw = true; // be sure we'll update the scene even if drawing is disabled

    this.renderer.needRender();
  }
  /***
   Here we create our frame buffer object
   We're also adding a render buffer object to handle depth inside our shader pass
   ***/


  _createFrameBuffer() {
    const target = new _RenderTarget.RenderTarget(this.renderer, {
      shaderPass: this,
      clear: this._shouldClear,
      depth: this._depth,
      texturesOptions: this._texturesOptions
    });
    this.setRenderTarget(target);
  }
  /*** DRAWING ***/

  /***
   Specific instructions for the Shader pass class to execute before drawing it
   ***/


  _startDrawing() {
    // check if our plane is ready to draw
    if (this._canDraw) {
      // even if our plane should not be drawn we still execute its onRender callback and update its uniforms
      if (this._onRenderCallback) {
        this._onRenderCallback();
      } // to improve webgl pipeline performance, we might want to update each texture that needs an update here
      // see https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices#texImagetexSubImage_uploads_particularly_with_videos_can_cause_pipeline_flushes


      if (this._isScenePass) {
        // if this is a scene pass, check if theres one more coming next and eventually bind it
        if (this.renderer.state.scenePassIndex + 1 < this.renderer.scene.stacks.scenePasses.length) {
          this.renderer.bindFrameBuffer(this.renderer.shaderPasses[this.renderer.scene.stacks.scenePasses[this.renderer.state.scenePassIndex + 1]].target);
          this.renderer.state.scenePassIndex++;
        } else {
          this.renderer.bindFrameBuffer(null);
        }
      } else if (this.renderer.state.scenePassIndex === null) {
        // we are rendering a bunch of planes inside a render target, unbind it
        this.renderer.bindFrameBuffer(null);
      } // now check if we really need to draw it and its textures


      this._draw();
    }
  }

}

exports.ShaderPass = ShaderPass;
},{"../core/DOMMesh.js":"F2xI","./RenderTarget.js":"H8Ju","../core/Texture.js":"RQKC"}],"QDan":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PingPongPlane = void 0;

var _Plane = require("../core/Plane.js");

var _RenderTarget = require("../framebuffers/RenderTarget.js");

/*** FBO PING PONG PLANE CLASS ***/

/***
 A little helper to create a plane that will perform FBO ping pong
 This plane will use FBOs swapping, using these following steps:
 - create two render targets (read and write)
 - create a texture onto which we'll draw
 - before drawing our plane (onRender callback), apply the write pass as our plane render target
 - after drawing our plane (onAfterRender callback), swap the read and write pass and copy the read pass texture again

 params:
 @sampler (string): sampler name used to create our texture and that will be used inside your shader
 @planeParams: see Plane class object

 returns :
 @this: our PingPongPlane element
 ***/
class PingPongPlane extends _Plane.Plane {
  constructor(curtains, htmlElement, {
    sampler = "uPingPongTexture",
    // Plane params
    shareProgram,
    widthSegments,
    heightSegments,
    depthTest,
    cullFace,
    uniforms,
    vertexShaderID,
    fragmentShaderID,
    vertexShader,
    fragmentShader,
    texturesOptions,
    crossOrigin,
    alwaysDraw,
    visible,
    transparent,
    drawCheckMargins,
    autoloadSources,
    watchScroll,
    fov
  } = {}) {
    // force depthTest and autoloadSources to false
    depthTest = false;
    autoloadSources = false; // create our plane

    super(curtains, htmlElement, {
      shareProgram,
      widthSegments,
      heightSegments,
      depthTest,
      cullFace,
      uniforms,
      vertexShaderID,
      fragmentShaderID,
      vertexShader,
      fragmentShader,
      texturesOptions,
      crossOrigin,
      alwaysDraw,
      visible,
      transparent,
      drawCheckMargins,
      autoloadSources,
      watchScroll,
      fov
    }); // create 2 render targets

    this.readPass = new _RenderTarget.RenderTarget(curtains, {
      depth: false,
      clear: false,
      texturesOptions: texturesOptions
    });
    this.writePass = new _RenderTarget.RenderTarget(curtains, {
      depth: false,
      clear: false,
      texturesOptions: texturesOptions
    }); // create a texture where we'll draw

    this.createTexture({
      sampler: sampler,
      fromTexture: this.readPass.getTexture()
    }); // override onRender and onAfterRender callbacks

    this._onRenderCallback = () => {
      // update the render target
      this.writePass && this.setRenderTarget(this.writePass);
      this._onPingPongRenderCallback && this._onPingPongRenderCallback();
    };

    this._onAfterRenderCallback = () => {
      // swap FBOs and update texture
      if (this.readPass && this.writePass && this.textures[0]) {
        this._swapPasses();
      }

      this._onPingPongAfterRenderCallback && this._onPingPongAfterRenderCallback();
    };
  }
  /***
   After each draw call, we'll swap the 2 render targets and copy the read pass texture again
   ***/


  _swapPasses() {
    // swap read and write passes
    const tempFBO = this.readPass;
    this.readPass = this.writePass;
    this.writePass = tempFBO; // apply new texture

    this.textures[0].copy(this.readPass.getTexture());
  }
  /***
   Returns the created texture where we're writing
   ***/


  getTexture() {
    return this.textures[0];
  }
  /*** OVERRIDE USED EVENTS ***/

  /***
   This is called at each requestAnimationFrame call
     params :
   @callback (function) : a function to execute
     returns :
   @this: our plane to handle chaining
   ***/


  onRender(callback) {
    if (callback) {
      this._onPingPongRenderCallback = callback;
    }

    return this;
  }
  /***
   This is called at each requestAnimationFrame call
     params :
   @callback (function) : a function to execute
     returns :
   @this: our plane to handle chaining
   ***/


  onAfterRender(callback) {
    if (callback) {
      this._onPingPongAfterRenderCallback = callback;
    }

    return this;
  }

}

exports.PingPongPlane = PingPongPlane;
},{"../core/Plane.js":"kazI","../framebuffers/RenderTarget.js":"H8Ju"}],"BSPR":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FXAAPass = void 0;

var _ShaderPass = require("../framebuffers/ShaderPass.js");

/*** FXAAPASS CLASS ***/

/***
 Here we create our FXAAPass object
 This is just a regular ShaderPass with preset shaders and a resolution uniform

 params: see ShaderPas class object

 returns :
 @this: our FXAAPass element
 ***/
class FXAAPass {
  constructor(curtains, {
    // Mesh params
    depthTest,
    texturesOptions,
    crossOrigin,
    // ShaderPass specific params
    depth,
    clear,
    renderTarget
  } = {}) {
    // taken from https://github.com/spite/Wagner/blob/master/fragment-shaders/fxaa-fs.glsl
    const fragmentShader = `
            precision mediump float;
            
            varying vec3 vVertexPosition;
            varying vec2 vTextureCoord;
        
            uniform sampler2D uRenderTexture;
            
            uniform vec2 uResolution;
            
            #define FXAA_REDUCE_MIN   (1.0/128.0)
            #define FXAA_REDUCE_MUL   (1.0/8.0)
            #define FXAA_SPAN_MAX     8.0
            
            void main() {
                vec2 res = 1.0 / uResolution;
            
                vec3 rgbNW = texture2D(uRenderTexture, (vTextureCoord.xy + vec2(-1.0, -1.0) * res)).xyz;
                vec3 rgbNE = texture2D(uRenderTexture, (vTextureCoord.xy + vec2(1.0, -1.0) * res)).xyz;
                vec3 rgbSW = texture2D(uRenderTexture, (vTextureCoord.xy + vec2(-1.0, 1.0) * res)).xyz;
                vec3 rgbSE = texture2D(uRenderTexture, (vTextureCoord.xy + vec2(1.0, 1.0) * res)).xyz;
                vec4 rgbaM = texture2D(uRenderTexture, vTextureCoord.xy * res);
                vec3 rgbM = rgbaM.xyz;
                vec3 luma = vec3(0.299, 0.587, 0.114);
            
                float lumaNW = dot(rgbNW, luma);
                float lumaNE = dot(rgbNE, luma);
                float lumaSW = dot(rgbSW, luma);
                float lumaSE = dot(rgbSE, luma);
                float lumaM  = dot(rgbM,  luma);
                float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
                float lumaMax = max(lumaM, max(max(lumaNW, lumaNE) , max(lumaSW, lumaSE)));
            
                vec2 dir;
                dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
                dir.y = ((lumaNW + lumaSW) - (lumaNE + lumaSE));
            
                float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) * (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);
            
                float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
                dir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX),
                      max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),
                            dir * rcpDirMin)) * res;
                vec4 rgbA = (1.0/2.0) * (
                texture2D(uRenderTexture, vTextureCoord.xy + dir * (1.0/3.0 - 0.5)) +
                texture2D(uRenderTexture, vTextureCoord.xy + dir * (2.0/3.0 - 0.5)));
                vec4 rgbB = rgbA * (1.0/2.0) + (1.0/4.0) * (
                texture2D(uRenderTexture, vTextureCoord.xy + dir * (0.0/3.0 - 0.5)) +
                texture2D(uRenderTexture, vTextureCoord.xy + dir * (3.0/3.0 - 0.5)));
                float lumaB = dot(rgbB, vec4(luma, 0.0));
            
                if ((lumaB < lumaMin) || (lumaB > lumaMax)) {
                    gl_FragColor = rgbA;
                } else {
                    gl_FragColor = rgbB;
                }
            }
        `;
    const renderer = curtains.renderer || curtains;
    const uniforms = {
      resolution: {
        name: "uResolution",
        type: "2f",
        value: [renderer._boundingRect.width, renderer._boundingRect.height]
      }
    };
    this.pass = new _ShaderPass.ShaderPass(curtains, {
      // Mesh params
      depthTest,
      fragmentShader,
      uniforms,
      texturesOptions,
      crossOrigin,
      // ShaderPass specific params
      depth,
      clear,
      renderTarget
    });
    this.pass.onAfterResize(() => {
      this.pass.uniforms.resolution.value = [this.pass.renderer._boundingRect.width, this.pass.renderer._boundingRect.height];
    });
  }

}

exports.FXAAPass = FXAAPass;
},{"../framebuffers/ShaderPass.js":"cXQZ"}],"McdC":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Curtains", {
  enumerable: true,
  get: function () {
    return _Curtains.Curtains;
  }
});
Object.defineProperty(exports, "Plane", {
  enumerable: true,
  get: function () {
    return _Plane.Plane;
  }
});
Object.defineProperty(exports, "Texture", {
  enumerable: true,
  get: function () {
    return _Texture.Texture;
  }
});
Object.defineProperty(exports, "RenderTarget", {
  enumerable: true,
  get: function () {
    return _RenderTarget.RenderTarget;
  }
});
Object.defineProperty(exports, "ShaderPass", {
  enumerable: true,
  get: function () {
    return _ShaderPass.ShaderPass;
  }
});
Object.defineProperty(exports, "TextureLoader", {
  enumerable: true,
  get: function () {
    return _TextureLoader.TextureLoader;
  }
});
Object.defineProperty(exports, "Vec2", {
  enumerable: true,
  get: function () {
    return _Vec.Vec2;
  }
});
Object.defineProperty(exports, "Vec3", {
  enumerable: true,
  get: function () {
    return _Vec2.Vec3;
  }
});
Object.defineProperty(exports, "Mat4", {
  enumerable: true,
  get: function () {
    return _Mat.Mat4;
  }
});
Object.defineProperty(exports, "PingPongPlane", {
  enumerable: true,
  get: function () {
    return _PingPongPlane.PingPongPlane;
  }
});
Object.defineProperty(exports, "FXAAPass", {
  enumerable: true,
  get: function () {
    return _FXAAPass.FXAAPass;
  }
});

var _Curtains = require("./core/Curtains.js");

var _Plane = require("./core/Plane.js");

var _Texture = require("./core/Texture.js");

var _RenderTarget = require("./framebuffers/RenderTarget.js");

var _ShaderPass = require("./framebuffers/ShaderPass.js");

var _TextureLoader = require("./loaders/TextureLoader.js");

var _Vec = require("./math/Vec2.js");

var _Vec2 = require("./math/Vec3.js");

var _Mat = require("./math/Mat4.js");

var _PingPongPlane = require("./extras/PingPongPlane.js");

var _FXAAPass = require("./extras/FXAAPass.js");
},{"./core/Curtains.js":"Fjgn","./core/Plane.js":"kazI","./core/Texture.js":"RQKC","./framebuffers/RenderTarget.js":"H8Ju","./framebuffers/ShaderPass.js":"cXQZ","./loaders/TextureLoader.js":"mCwe","./math/Vec2.js":"V1SK","./math/Vec3.js":"lfw1","./math/Mat4.js":"ceZz","./extras/PingPongPlane.js":"QDan","./extras/FXAAPass.js":"BSPR"}],"yNZb":[function(require,module,exports) {
module.exports = "precision mediump float;\n#define GLSLIFY 1\n\n\n   varying vec3 vVertexPosition;\n   varying vec2 vTextureCoord;\n   varying vec2 vFirstTextureCoord;\n   varying vec2 vSecondTextureCoord;\n\n   // custom uniforms\n   uniform float uTransitionTimer;\n   uniform float uTimer;\n   uniform float uTo;\n   uniform float uFrom;\n\n   // our textures samplers\n   uniform sampler2D firstTexture;\n   uniform sampler2D secondTexture;\n   uniform sampler2D thirdTexture;\n   uniform sampler2D displacement;\n\n    vec4 getTextureByIndex(float index, vec2 vUv){\n        vec4 result;\n        if(index==0.){\n            result = texture2D(firstTexture,vUv);\n        }\n        if(index==1.){\n            result = texture2D(secondTexture,vUv);\n        }\n        if(index==2.){\n            result = texture2D(thirdTexture,vUv);\n        }\n        return result;\n    }\n    float circle (in vec2 uv, in float radius, in float sharpness) {\n        float dist = length(uv - vec2(0.5));\n        return 1. - smoothstep(radius-sharpness,radius,dist);\n    }\n   void main() {\n       float progress = fract(uTransitionTimer);\n\n       vec2 center = vec2(0.5);\n       vec2 centerVector = vFirstTextureCoord - center;\n       vec2 vUv = vFirstTextureCoord;\n\n        float circleProgress = circle(vTextureCoord, progress*0.9, 0.2);\n        float ease = progress*(2. - progress);\n        vec2 nextUV = vUv + centerVector * (circleProgress - 1.0) + centerVector * ( 1. - ease) * 0.;\n        vec2 currentUV = vUv - centerVector * circleProgress*0.5 - centerVector * progress * 0.2;\n\n        float currentTexture = mod(uFrom,3.);\n        float nextTexture =  mod(uTo, 3.);\n\n        vec4 current = getTextureByIndex(currentTexture, currentUV);\n        vec4 next = getTextureByIndex(nextTexture, nextUV);\n        \n        gl_FragColor = mix(current,next,circleProgress);\n   }";
},{}],"e9km":[function(require,module,exports) {
module.exports = "precision mediump float;\n#define GLSLIFY 1\n\n// default mandatory variables\nattribute vec3 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat4 uMVMatrix;\nuniform mat4 uPMatrix;\n\n// our texture matrices\n// displacement texture does not need to use them\nuniform mat4 firstTextureMatrix;\nuniform mat4 secondTextureMatrix;\n\n// custom variables\nvarying vec3 vVertexPosition;\nvarying vec2 vTextureCoord;\nvarying vec2 vFirstTextureCoord;\nvarying vec2 vSecondTextureCoord;\n\n// custom uniforms\nuniform float uTransitionTimer;\n\nvoid main() {\n    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);\n\n    // varyings\n    // use original texture coords for our displacement\n    vTextureCoord = aTextureCoord;\n    // use texture matrices for our videos\n    vFirstTextureCoord = (firstTextureMatrix * vec4(aTextureCoord, 0.0, 1.0)).xy;\n    vSecondTextureCoord = (secondTextureMatrix * vec4(aTextureCoord, 0.0, 1.0)).xy;\n    vVertexPosition = aVertexPosition;\n}";
},{}],"P74P":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._getCache = exports._getSetter = exports._missingPlugin = exports._round = exports._roundModifier = exports._config = exports._ticker = exports._plugins = exports._checkPlugin = exports._replaceRandom = exports._colorStringFilter = exports._sortPropTweensByPriority = exports._forEachName = exports._removeLinkedListItem = exports._setDefaults = exports._relExp = exports._renderComplexString = exports._isUndefined = exports._isString = exports._numWithUnitExp = exports._numExp = exports._getProperty = exports.shuffle = exports.interpolate = exports.unitize = exports.pipe = exports.mapRange = exports.toArray = exports.splitColor = exports.clamp = exports.getUnit = exports.normalize = exports.snap = exports.random = exports.distribute = exports.wrapYoyo = exports.wrap = exports.Circ = exports.Expo = exports.Sine = exports.Bounce = exports.SteppedEase = exports.Back = exports.Elastic = exports.Strong = exports.Quint = exports.Quart = exports.Cubic = exports.Quad = exports.Linear = exports.Power4 = exports.Power3 = exports.Power2 = exports.Power1 = exports.Power0 = exports.default = exports.gsap = exports.PropTween = exports.TweenLite = exports.TweenMax = exports.Tween = exports.TimelineLite = exports.TimelineMax = exports.Timeline = exports.Animation = exports.GSCache = void 0;

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}
/*!
 * GSAP 3.5.1
 * https://greensock.com
 *
 * @license Copyright 2008-2020, GreenSock. All rights reserved.
 * Subject to the terms at https://greensock.com/standard-license or for
 * Club GreenSock members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
*/

/* eslint-disable */


var _config = {
  autoSleep: 120,
  force3D: "auto",
  nullTargetWarn: 1,
  units: {
    lineHeight: ""
  }
},
    _defaults = {
  duration: .5,
  overwrite: false,
  delay: 0
},
    _bigNum = 1e8,
    _tinyNum = 1 / _bigNum,
    _2PI = Math.PI * 2,
    _HALF_PI = _2PI / 4,
    _gsID = 0,
    _sqrt = Math.sqrt,
    _cos = Math.cos,
    _sin = Math.sin,
    _isString = function _isString(value) {
  return typeof value === "string";
},
    _isFunction = function _isFunction(value) {
  return typeof value === "function";
},
    _isNumber = function _isNumber(value) {
  return typeof value === "number";
},
    _isUndefined = function _isUndefined(value) {
  return typeof value === "undefined";
},
    _isObject = function _isObject(value) {
  return typeof value === "object";
},
    _isNotFalse = function _isNotFalse(value) {
  return value !== false;
},
    _windowExists = function _windowExists() {
  return typeof window !== "undefined";
},
    _isFuncOrString = function _isFuncOrString(value) {
  return _isFunction(value) || _isString(value);
},
    _isTypedArray = typeof ArrayBuffer === "function" && ArrayBuffer.isView || function () {},
    // note: IE10 has ArrayBuffer, but NOT ArrayBuffer.isView().
_isArray = Array.isArray,
    _strictNumExp = /(?:-?\.?\d|\.)+/gi,
    //only numbers (including negatives and decimals) but NOT relative values.
_numExp = /[-+=.]*\d+[.e\-+]*\d*[e\-\+]*\d*/g,
    //finds any numbers, including ones that start with += or -=, negative numbers, and ones in scientific notation like 1e-8.
_numWithUnitExp = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g,
    _complexStringNumExp = /[-+=.]*\d+(?:\.|e-|e)*\d*/gi,
    //duplicate so that while we're looping through matches from exec(), it doesn't contaminate the lastIndex of _numExp which we use to search for colors too.
_relExp = /[+-]=-?[\.\d]+/,
    _delimitedValueExp = /[#\-+.]*\b[a-z\d-=+%.]+/gi,
    _globalTimeline,
    _win,
    _coreInitted,
    _doc,
    _globals = {},
    _installScope = {},
    _coreReady,
    _install = function _install(scope) {
  return (_installScope = _merge(scope, _globals)) && gsap;
},
    _missingPlugin = function _missingPlugin(property, value) {
  return console.warn("Invalid property", property, "set to", value, "Missing plugin? gsap.registerPlugin()");
},
    _warn = function _warn(message, suppress) {
  return !suppress && console.warn(message);
},
    _addGlobal = function _addGlobal(name, obj) {
  return name && (_globals[name] = obj) && _installScope && (_installScope[name] = obj) || _globals;
},
    _emptyFunc = function _emptyFunc() {
  return 0;
},
    _reservedProps = {},
    _lazyTweens = [],
    _lazyLookup = {},
    _lastRenderedFrame,
    _plugins = {},
    _effects = {},
    _nextGCFrame = 30,
    _harnessPlugins = [],
    _callbackNames = "",
    _harness = function _harness(targets) {
  var target = targets[0],
      harnessPlugin,
      i;
  _isObject(target) || _isFunction(target) || (targets = [targets]);

  if (!(harnessPlugin = (target._gsap || {}).harness)) {
    i = _harnessPlugins.length;

    while (i-- && !_harnessPlugins[i].targetTest(target)) {}

    harnessPlugin = _harnessPlugins[i];
  }

  i = targets.length;

  while (i--) {
    targets[i] && (targets[i]._gsap || (targets[i]._gsap = new GSCache(targets[i], harnessPlugin))) || targets.splice(i, 1);
  }

  return targets;
},
    _getCache = function _getCache(target) {
  return target._gsap || _harness(toArray(target))[0]._gsap;
},
    _getProperty = function _getProperty(target, property, v) {
  return (v = target[property]) && _isFunction(v) ? target[property]() : _isUndefined(v) && target.getAttribute && target.getAttribute(property) || v;
},
    _forEachName = function _forEachName(names, func) {
  return (names = names.split(",")).forEach(func) || names;
},
    //split a comma-delimited list of names into an array, then run a forEach() function and return the split array (this is just a way to consolidate/shorten some code).
_round = function _round(value) {
  return Math.round(value * 100000) / 100000 || 0;
},
    _arrayContainsAny = function _arrayContainsAny(toSearch, toFind) {
  //searches one array to find matches for any of the items in the toFind array. As soon as one is found, it returns true. It does NOT return all the matches; it's simply a boolean search.
  var l = toFind.length,
      i = 0;

  for (; toSearch.indexOf(toFind[i]) < 0 && ++i < l;) {}

  return i < l;
},
    _parseVars = function _parseVars(params, type, parent) {
  //reads the arguments passed to one of the key methods and figures out if the user is defining things with the OLD/legacy syntax where the duration is the 2nd parameter, and then it adjusts things accordingly and spits back the corrected vars object (with the duration added if necessary, as well as runBackwards or startAt or immediateRender). type 0 = to()/staggerTo(), 1 = from()/staggerFrom(), 2 = fromTo()/staggerFromTo()
  var isLegacy = _isNumber(params[1]),
      varsIndex = (isLegacy ? 2 : 1) + (type < 2 ? 0 : 1),
      vars = params[varsIndex],
      irVars;

  isLegacy && (vars.duration = params[1]);
  vars.parent = parent;

  if (type) {
    irVars = vars;

    while (parent && !("immediateRender" in irVars)) {
      // inheritance hasn't happened yet, but someone may have set a default in an ancestor timeline. We could do vars.immediateRender = _isNotFalse(_inheritDefaults(vars).immediateRender) but that'd exact a slight performance penalty because _inheritDefaults() also runs in the Tween constructor. We're paying a small kb price here to gain speed.
      irVars = parent.vars.defaults || {};
      parent = _isNotFalse(parent.vars.inherit) && parent.parent;
    }

    vars.immediateRender = _isNotFalse(irVars.immediateRender);
    type < 2 ? vars.runBackwards = 1 : vars.startAt = params[varsIndex - 1]; // "from" vars
  }

  return vars;
},
    _lazyRender = function _lazyRender() {
  var l = _lazyTweens.length,
      a = _lazyTweens.slice(0),
      i,
      tween;

  _lazyLookup = {};
  _lazyTweens.length = 0;

  for (i = 0; i < l; i++) {
    tween = a[i];
    tween && tween._lazy && (tween.render(tween._lazy[0], tween._lazy[1], true)._lazy = 0);
  }
},
    _lazySafeRender = function _lazySafeRender(animation, time, suppressEvents, force) {
  _lazyTweens.length && _lazyRender();
  animation.render(time, suppressEvents, force);
  _lazyTweens.length && _lazyRender(); //in case rendering caused any tweens to lazy-init, we should render them because typically when someone calls seek() or time() or progress(), they expect an immediate render.
},
    _numericIfPossible = function _numericIfPossible(value) {
  var n = parseFloat(value);
  return (n || n === 0) && (value + "").match(_delimitedValueExp).length < 2 ? n : _isString(value) ? value.trim() : value;
},
    _passThrough = function _passThrough(p) {
  return p;
},
    _setDefaults = function _setDefaults(obj, defaults) {
  for (var p in defaults) {
    p in obj || (obj[p] = defaults[p]);
  }

  return obj;
},
    _setKeyframeDefaults = function _setKeyframeDefaults(obj, defaults) {
  for (var p in defaults) {
    p in obj || p === "duration" || p === "ease" || (obj[p] = defaults[p]);
  }
},
    _merge = function _merge(base, toMerge) {
  for (var p in toMerge) {
    base[p] = toMerge[p];
  }

  return base;
},
    _mergeDeep = function _mergeDeep(base, toMerge) {
  for (var p in toMerge) {
    base[p] = _isObject(toMerge[p]) ? _mergeDeep(base[p] || (base[p] = {}), toMerge[p]) : toMerge[p];
  }

  return base;
},
    _copyExcluding = function _copyExcluding(obj, excluding) {
  var copy = {},
      p;

  for (p in obj) {
    p in excluding || (copy[p] = obj[p]);
  }

  return copy;
},
    _inheritDefaults = function _inheritDefaults(vars) {
  var parent = vars.parent || _globalTimeline,
      func = vars.keyframes ? _setKeyframeDefaults : _setDefaults;

  if (_isNotFalse(vars.inherit)) {
    while (parent) {
      func(vars, parent.vars.defaults);
      parent = parent.parent || parent._dp;
    }
  }

  return vars;
},
    _arraysMatch = function _arraysMatch(a1, a2) {
  var i = a1.length,
      match = i === a2.length;

  while (match && i-- && a1[i] === a2[i]) {}

  return i < 0;
},
    _addLinkedListItem = function _addLinkedListItem(parent, child, firstProp, lastProp, sortBy) {
  if (firstProp === void 0) {
    firstProp = "_first";
  }

  if (lastProp === void 0) {
    lastProp = "_last";
  }

  var prev = parent[lastProp],
      t;

  if (sortBy) {
    t = child[sortBy];

    while (prev && prev[sortBy] > t) {
      prev = prev._prev;
    }
  }

  if (prev) {
    child._next = prev._next;
    prev._next = child;
  } else {
    child._next = parent[firstProp];
    parent[firstProp] = child;
  }

  if (child._next) {
    child._next._prev = child;
  } else {
    parent[lastProp] = child;
  }

  child._prev = prev;
  child.parent = child._dp = parent;
  return child;
},
    _removeLinkedListItem = function _removeLinkedListItem(parent, child, firstProp, lastProp) {
  if (firstProp === void 0) {
    firstProp = "_first";
  }

  if (lastProp === void 0) {
    lastProp = "_last";
  }

  var prev = child._prev,
      next = child._next;

  if (prev) {
    prev._next = next;
  } else if (parent[firstProp] === child) {
    parent[firstProp] = next;
  }

  if (next) {
    next._prev = prev;
  } else if (parent[lastProp] === child) {
    parent[lastProp] = prev;
  }

  child._next = child._prev = child.parent = null; // don't delete the _dp just so we can revert if necessary. But parent should be null to indicate the item isn't in a linked list.
},
    _removeFromParent = function _removeFromParent(child, onlyIfParentHasAutoRemove) {
  child.parent && (!onlyIfParentHasAutoRemove || child.parent.autoRemoveChildren) && child.parent.remove(child);
  child._act = 0;
},
    _uncache = function _uncache(animation, child) {
  if (animation && (!child || child._end > animation._dur || child._start < 0)) {
    // performance optimization: if a child animation is passed in we should only uncache if that child EXTENDS the animation (its end time is beyond the end)
    var a = animation;

    while (a) {
      a._dirty = 1;
      a = a.parent;
    }
  }

  return animation;
},
    _recacheAncestors = function _recacheAncestors(animation) {
  var parent = animation.parent;

  while (parent && parent.parent) {
    //sometimes we must force a re-sort of all children and update the duration/totalDuration of all ancestor timelines immediately in case, for example, in the middle of a render loop, one tween alters another tween's timeScale which shoves its startTime before 0, forcing the parent timeline to shift around and shiftChildren() which could affect that next tween's render (startTime). Doesn't matter for the root timeline though.
    parent._dirty = 1;
    parent.totalDuration();
    parent = parent.parent;
  }

  return animation;
},
    _hasNoPausedAncestors = function _hasNoPausedAncestors(animation) {
  return !animation || animation._ts && _hasNoPausedAncestors(animation.parent);
},
    _elapsedCycleDuration = function _elapsedCycleDuration(animation) {
  return animation._repeat ? _animationCycle(animation._tTime, animation = animation.duration() + animation._rDelay) * animation : 0;
},
    // feed in the totalTime and cycleDuration and it'll return the cycle (iteration minus 1) and if the playhead is exactly at the very END, it will NOT bump up to the next cycle.
_animationCycle = function _animationCycle(tTime, cycleDuration) {
  return (tTime /= cycleDuration) && ~~tTime === tTime ? ~~tTime - 1 : ~~tTime;
},
    _parentToChildTotalTime = function _parentToChildTotalTime(parentTime, child) {
  return (parentTime - child._start) * child._ts + (child._ts >= 0 ? 0 : child._dirty ? child.totalDuration() : child._tDur);
},
    _setEnd = function _setEnd(animation) {
  return animation._end = _round(animation._start + (animation._tDur / Math.abs(animation._ts || animation._rts || _tinyNum) || 0));
},
    _alignPlayhead = function _alignPlayhead(animation, totalTime) {
  // adjusts the animation's _start and _end according to the provided totalTime (only if the parent's smoothChildTiming is true and the animation isn't paused). It doesn't do any rendering or forcing things back into parent timelines, etc. - that's what totalTime() is for.
  var parent = animation._dp;

  if (parent && parent.smoothChildTiming && animation._ts) {
    animation._start = _round(animation._dp._time - (animation._ts > 0 ? totalTime / animation._ts : ((animation._dirty ? animation.totalDuration() : animation._tDur) - totalTime) / -animation._ts));

    _setEnd(animation);

    parent._dirty || _uncache(parent, animation); //for performance improvement. If the parent's cache is already dirty, it already took care of marking the ancestors as dirty too, so skip the function call here.
  }

  return animation;
},

/*
_totalTimeToTime = (clampedTotalTime, duration, repeat, repeatDelay, yoyo) => {
	let cycleDuration = duration + repeatDelay,
		time = _round(clampedTotalTime % cycleDuration);
	if (time > duration) {
		time = duration;
	}
	return (yoyo && (~~(clampedTotalTime / cycleDuration) & 1)) ? duration - time : time;
},
*/
_postAddChecks = function _postAddChecks(timeline, child) {
  var t;

  if (child._time || child._initted && !child._dur) {
    //in case, for example, the _start is moved on a tween that has already rendered. Imagine it's at its end state, then the startTime is moved WAY later (after the end of this timeline), it should render at its beginning.
    t = _parentToChildTotalTime(timeline.rawTime(), child);

    if (!child._dur || _clamp(0, child.totalDuration(), t) - child._tTime > _tinyNum) {
      child.render(t, true);
    }
  } //if the timeline has already ended but the inserted tween/timeline extends the duration, we should enable this timeline again so that it renders properly. We should also align the playhead with the parent timeline's when appropriate.


  if (_uncache(timeline, child)._dp && timeline._initted && timeline._time >= timeline._dur && timeline._ts) {
    //in case any of the ancestors had completed but should now be enabled...
    if (timeline._dur < timeline.duration()) {
      t = timeline;

      while (t._dp) {
        t.rawTime() >= 0 && t.totalTime(t._tTime); //moves the timeline (shifts its startTime) if necessary, and also enables it. If it's currently zero, though, it may not be scheduled to render until later so there's no need to force it to align with the current playhead position. Only move to catch up with the playhead.

        t = t._dp;
      }
    }

    timeline._zTime = -_tinyNum; // helps ensure that the next render() will be forced (crossingStart = true in render()), even if the duration hasn't changed (we're adding a child which would need to get rendered). Definitely an edge case. Note: we MUST do this AFTER the loop above where the totalTime() might trigger a render() because this _addToTimeline() method gets called from the Animation constructor, BEFORE tweens even record their targets, etc. so we wouldn't want things to get triggered in the wrong order.
  }
},
    _addToTimeline = function _addToTimeline(timeline, child, position, skipChecks) {
  child.parent && _removeFromParent(child);
  child._start = _round(position + child._delay);
  child._end = _round(child._start + (child.totalDuration() / Math.abs(child.timeScale()) || 0));

  _addLinkedListItem(timeline, child, "_first", "_last", timeline._sort ? "_start" : 0);

  timeline._recent = child;
  skipChecks || _postAddChecks(timeline, child);
  return timeline;
},
    _scrollTrigger = function _scrollTrigger(animation, trigger) {
  return (_globals.ScrollTrigger || _missingPlugin("scrollTrigger", trigger)) && _globals.ScrollTrigger.create(trigger, animation);
},
    _attemptInitTween = function _attemptInitTween(tween, totalTime, force, suppressEvents) {
  _initTween(tween, totalTime);

  if (!tween._initted) {
    return 1;
  }

  if (!force && tween._pt && (tween._dur && tween.vars.lazy !== false || !tween._dur && tween.vars.lazy) && _lastRenderedFrame !== _ticker.frame) {
    _lazyTweens.push(tween);

    tween._lazy = [totalTime, suppressEvents];
    return 1;
  }
},
    _renderZeroDurationTween = function _renderZeroDurationTween(tween, totalTime, suppressEvents, force) {
  var prevRatio = tween.ratio,
      ratio = totalTime < 0 || !totalTime && prevRatio && !tween._start && tween._zTime > _tinyNum && !tween._dp._lock || (tween._ts < 0 || tween._dp._ts < 0) && tween.data !== "isFromStart" && tween.data !== "isStart" ? 0 : 1,
      // check parent's _lock because when a timeline repeats/yoyos and does its artificial wrapping, we shouldn't force the ratio back to 0. Also, if the tween or its parent is reversed and the totalTime is 0, we should go to a ratio of 0.
  repeatDelay = tween._rDelay,
      tTime = 0,
      pt,
      iteration,
      prevIteration;

  if (repeatDelay && tween._repeat) {
    // in case there's a zero-duration tween that has a repeat with a repeatDelay
    tTime = _clamp(0, tween._tDur, totalTime);
    iteration = _animationCycle(tTime, repeatDelay);
    prevIteration = _animationCycle(tween._tTime, repeatDelay);

    if (iteration !== prevIteration) {
      prevRatio = 1 - ratio;
      tween.vars.repeatRefresh && tween._initted && tween.invalidate();
    }
  }

  if (ratio !== prevRatio || force || tween._zTime === _tinyNum || !totalTime && tween._zTime) {
    if (!tween._initted && _attemptInitTween(tween, totalTime, force, suppressEvents)) {
      // if we render the very beginning (time == 0) of a fromTo(), we must force the render (normal tweens wouldn't need to render at a time of 0 when the prevTime was also 0). This is also mandatory to make sure overwriting kicks in immediately.
      return;
    }

    prevIteration = tween._zTime;
    tween._zTime = totalTime || (suppressEvents ? _tinyNum : 0); // when the playhead arrives at EXACTLY time 0 (right on top) of a zero-duration tween, we need to discern if events are suppressed so that when the playhead moves again (next time), it'll trigger the callback. If events are NOT suppressed, obviously the callback would be triggered in this render. Basically, the callback should fire either when the playhead ARRIVES or LEAVES this exact spot, not both. Imagine doing a timeline.seek(0) and there's a callback that sits at 0. Since events are suppressed on that seek() by default, nothing will fire, but when the playhead moves off of that position, the callback should fire. This behavior is what people intuitively expect.

    suppressEvents || (suppressEvents = totalTime && !prevIteration); // if it was rendered previously at exactly 0 (_zTime) and now the playhead is moving away, DON'T fire callbacks otherwise they'll seem like duplicates.

    tween.ratio = ratio;
    tween._from && (ratio = 1 - ratio);
    tween._time = 0;
    tween._tTime = tTime;
    suppressEvents || _callback(tween, "onStart");
    pt = tween._pt;

    while (pt) {
      pt.r(ratio, pt.d);
      pt = pt._next;
    }

    tween._startAt && totalTime < 0 && tween._startAt.render(totalTime, true, true);
    tween._onUpdate && !suppressEvents && _callback(tween, "onUpdate");
    tTime && tween._repeat && !suppressEvents && tween.parent && _callback(tween, "onRepeat");

    if ((totalTime >= tween._tDur || totalTime < 0) && tween.ratio === ratio) {
      ratio && _removeFromParent(tween, 1);

      if (!suppressEvents) {
        _callback(tween, ratio ? "onComplete" : "onReverseComplete", true);

        tween._prom && tween._prom();
      }
    }
  } else if (!tween._zTime) {
    tween._zTime = totalTime;
  }
},
    _findNextPauseTween = function _findNextPauseTween(animation, prevTime, time) {
  var child;

  if (time > prevTime) {
    child = animation._first;

    while (child && child._start <= time) {
      if (!child._dur && child.data === "isPause" && child._start > prevTime) {
        return child;
      }

      child = child._next;
    }
  } else {
    child = animation._last;

    while (child && child._start >= time) {
      if (!child._dur && child.data === "isPause" && child._start < prevTime) {
        return child;
      }

      child = child._prev;
    }
  }
},
    _setDuration = function _setDuration(animation, duration, skipUncache, leavePlayhead) {
  var repeat = animation._repeat,
      dur = _round(duration) || 0,
      totalProgress = animation._tTime / animation._tDur;
  totalProgress && !leavePlayhead && (animation._time *= dur / animation._dur);
  animation._dur = dur;
  animation._tDur = !repeat ? dur : repeat < 0 ? 1e10 : _round(dur * (repeat + 1) + animation._rDelay * repeat);
  totalProgress && !leavePlayhead ? _alignPlayhead(animation, animation._tTime = animation._tDur * totalProgress) : animation.parent && _setEnd(animation);
  skipUncache || _uncache(animation.parent, animation);
  return animation;
},
    _onUpdateTotalDuration = function _onUpdateTotalDuration(animation) {
  return animation instanceof Timeline ? _uncache(animation) : _setDuration(animation, animation._dur);
},
    _zeroPosition = {
  _start: 0,
  endTime: _emptyFunc
},
    _parsePosition = function _parsePosition(animation, position) {
  var labels = animation.labels,
      recent = animation._recent || _zeroPosition,
      clippedDuration = animation.duration() >= _bigNum ? recent.endTime(false) : animation._dur,
      //in case there's a child that infinitely repeats, users almost never intend for the insertion point of a new child to be based on a SUPER long value like that so we clip it and assume the most recently-added child's endTime should be used instead.
  i,
      offset;

  if (_isString(position) && (isNaN(position) || position in labels)) {
    //if the string is a number like "1", check to see if there's a label with that name, otherwise interpret it as a number (absolute value).
    i = position.charAt(0);

    if (i === "<" || i === ">") {
      return (i === "<" ? recent._start : recent.endTime(recent._repeat >= 0)) + (parseFloat(position.substr(1)) || 0);
    }

    i = position.indexOf("=");

    if (i < 0) {
      position in labels || (labels[position] = clippedDuration);
      return labels[position];
    }

    offset = +(position.charAt(i - 1) + position.substr(i + 1));
    return i > 1 ? _parsePosition(animation, position.substr(0, i - 1)) + offset : clippedDuration + offset;
  }

  return position == null ? clippedDuration : +position;
},
    _conditionalReturn = function _conditionalReturn(value, func) {
  return value || value === 0 ? func(value) : func;
},
    _clamp = function _clamp(min, max, value) {
  return value < min ? min : value > max ? max : value;
},
    getUnit = function getUnit(value) {
  return (value = (value + "").substr((parseFloat(value) + "").length)) && isNaN(value) ? value : "";
},
    // note: protect against padded numbers as strings, like "100.100". That shouldn't return "00" as the unit. If it's numeric, return no unit.
clamp = function clamp(min, max, value) {
  return _conditionalReturn(value, function (v) {
    return _clamp(min, max, v);
  });
},
    _slice = [].slice,
    _isArrayLike = function _isArrayLike(value, nonEmpty) {
  return value && _isObject(value) && "length" in value && (!nonEmpty && !value.length || value.length - 1 in value && _isObject(value[0])) && !value.nodeType && value !== _win;
},
    _flatten = function _flatten(ar, leaveStrings, accumulator) {
  if (accumulator === void 0) {
    accumulator = [];
  }

  return ar.forEach(function (value) {
    var _accumulator;

    return _isString(value) && !leaveStrings || _isArrayLike(value, 1) ? (_accumulator = accumulator).push.apply(_accumulator, toArray(value)) : accumulator.push(value);
  }) || accumulator;
},
    //takes any value and returns an array. If it's a string (and leaveStrings isn't true), it'll use document.querySelectorAll() and convert that to an array. It'll also accept iterables like jQuery objects.
toArray = function toArray(value, leaveStrings) {
  return _isString(value) && !leaveStrings && (_coreInitted || !_wake()) ? _slice.call(_doc.querySelectorAll(value), 0) : _isArray(value) ? _flatten(value, leaveStrings) : _isArrayLike(value) ? _slice.call(value, 0) : value ? [value] : [];
},
    shuffle = function shuffle(a) {
  return a.sort(function () {
    return .5 - Math.random();
  });
},
    // alternative that's a bit faster and more reliably diverse but bigger:   for (let j, v, i = a.length; i; j = Math.floor(Math.random() * i), v = a[--i], a[i] = a[j], a[j] = v); return a;
//for distributing values across an array. Can accept a number, a function or (most commonly) a function which can contain the following properties: {base, amount, from, ease, grid, axis, length, each}. Returns a function that expects the following parameters: index, target, array. Recognizes the following
distribute = function distribute(v) {
  if (_isFunction(v)) {
    return v;
  }

  var vars = _isObject(v) ? v : {
    each: v
  },
      //n:1 is just to indicate v was a number; we leverage that later to set v according to the length we get. If a number is passed in, we treat it like the old stagger value where 0.1, for example, would mean that things would be distributed with 0.1 between each element in the array rather than a total "amount" that's chunked out among them all.
  ease = _parseEase(vars.ease),
      from = vars.from || 0,
      base = parseFloat(vars.base) || 0,
      cache = {},
      isDecimal = from > 0 && from < 1,
      ratios = isNaN(from) || isDecimal,
      axis = vars.axis,
      ratioX = from,
      ratioY = from;

  if (_isString(from)) {
    ratioX = ratioY = {
      center: .5,
      edges: .5,
      end: 1
    }[from] || 0;
  } else if (!isDecimal && ratios) {
    ratioX = from[0];
    ratioY = from[1];
  }

  return function (i, target, a) {
    var l = (a || vars).length,
        distances = cache[l],
        originX,
        originY,
        x,
        y,
        d,
        j,
        max,
        min,
        wrapAt;

    if (!distances) {
      wrapAt = vars.grid === "auto" ? 0 : (vars.grid || [1, _bigNum])[1];

      if (!wrapAt) {
        max = -_bigNum;

        while (max < (max = a[wrapAt++].getBoundingClientRect().left) && wrapAt < l) {}

        wrapAt--;
      }

      distances = cache[l] = [];
      originX = ratios ? Math.min(wrapAt, l) * ratioX - .5 : from % wrapAt;
      originY = ratios ? l * ratioY / wrapAt - .5 : from / wrapAt | 0;
      max = 0;
      min = _bigNum;

      for (j = 0; j < l; j++) {
        x = j % wrapAt - originX;
        y = originY - (j / wrapAt | 0);
        distances[j] = d = !axis ? _sqrt(x * x + y * y) : Math.abs(axis === "y" ? y : x);
        d > max && (max = d);
        d < min && (min = d);
      }

      from === "random" && shuffle(distances);
      distances.max = max - min;
      distances.min = min;
      distances.v = l = (parseFloat(vars.amount) || parseFloat(vars.each) * (wrapAt > l ? l - 1 : !axis ? Math.max(wrapAt, l / wrapAt) : axis === "y" ? l / wrapAt : wrapAt) || 0) * (from === "edges" ? -1 : 1);
      distances.b = l < 0 ? base - l : base;
      distances.u = getUnit(vars.amount || vars.each) || 0; //unit

      ease = ease && l < 0 ? _invertEase(ease) : ease;
    }

    l = (distances[i] - distances.min) / distances.max || 0;
    return _round(distances.b + (ease ? ease(l) : l) * distances.v) + distances.u; //round in order to work around floating point errors
  };
},
    _roundModifier = function _roundModifier(v) {
  //pass in 0.1 get a function that'll round to the nearest tenth, or 5 to round to the closest 5, or 0.001 to the closest 1000th, etc.
  var p = v < 1 ? Math.pow(10, (v + "").length - 2) : 1; //to avoid floating point math errors (like 24 * 0.1 == 2.4000000000000004), we chop off at a specific number of decimal places (much faster than toFixed()

  return function (raw) {
    return Math.floor(Math.round(parseFloat(raw) / v) * v * p) / p + (_isNumber(raw) ? 0 : getUnit(raw));
  };
},
    snap = function snap(snapTo, value) {
  var isArray = _isArray(snapTo),
      radius,
      is2D;

  if (!isArray && _isObject(snapTo)) {
    radius = isArray = snapTo.radius || _bigNum;

    if (snapTo.values) {
      snapTo = toArray(snapTo.values);

      if (is2D = !_isNumber(snapTo[0])) {
        radius *= radius; //performance optimization so we don't have to Math.sqrt() in the loop.
      }
    } else {
      snapTo = _roundModifier(snapTo.increment);
    }
  }

  return _conditionalReturn(value, !isArray ? _roundModifier(snapTo) : _isFunction(snapTo) ? function (raw) {
    is2D = snapTo(raw);
    return Math.abs(is2D - raw) <= radius ? is2D : raw;
  } : function (raw) {
    var x = parseFloat(is2D ? raw.x : raw),
        y = parseFloat(is2D ? raw.y : 0),
        min = _bigNum,
        closest = 0,
        i = snapTo.length,
        dx,
        dy;

    while (i--) {
      if (is2D) {
        dx = snapTo[i].x - x;
        dy = snapTo[i].y - y;
        dx = dx * dx + dy * dy;
      } else {
        dx = Math.abs(snapTo[i] - x);
      }

      if (dx < min) {
        min = dx;
        closest = i;
      }
    }

    closest = !radius || min <= radius ? snapTo[closest] : raw;
    return is2D || closest === raw || _isNumber(raw) ? closest : closest + getUnit(raw);
  });
},
    random = function random(min, max, roundingIncrement, returnFunction) {
  return _conditionalReturn(_isArray(min) ? !max : roundingIncrement === true ? !!(roundingIncrement = 0) : !returnFunction, function () {
    return _isArray(min) ? min[~~(Math.random() * min.length)] : (roundingIncrement = roundingIncrement || 1e-5) && (returnFunction = roundingIncrement < 1 ? Math.pow(10, (roundingIncrement + "").length - 2) : 1) && Math.floor(Math.round((min + Math.random() * (max - min)) / roundingIncrement) * roundingIncrement * returnFunction) / returnFunction;
  });
},
    pipe = function pipe() {
  for (var _len = arguments.length, functions = new Array(_len), _key = 0; _key < _len; _key++) {
    functions[_key] = arguments[_key];
  }

  return function (value) {
    return functions.reduce(function (v, f) {
      return f(v);
    }, value);
  };
},
    unitize = function unitize(func, unit) {
  return function (value) {
    return func(parseFloat(value)) + (unit || getUnit(value));
  };
},
    normalize = function normalize(min, max, value) {
  return mapRange(min, max, 0, 1, value);
},
    _wrapArray = function _wrapArray(a, wrapper, value) {
  return _conditionalReturn(value, function (index) {
    return a[~~wrapper(index)];
  });
},
    wrap = function wrap(min, max, value) {
  // NOTE: wrap() CANNOT be an arrow function! A very odd compiling bug causes problems (unrelated to GSAP).
  var range = max - min;
  return _isArray(min) ? _wrapArray(min, wrap(0, min.length), max) : _conditionalReturn(value, function (value) {
    return (range + (value - min) % range) % range + min;
  });
},
    wrapYoyo = function wrapYoyo(min, max, value) {
  var range = max - min,
      total = range * 2;
  return _isArray(min) ? _wrapArray(min, wrapYoyo(0, min.length - 1), max) : _conditionalReturn(value, function (value) {
    value = (total + (value - min) % total) % total || 0;
    return min + (value > range ? total - value : value);
  });
},
    _replaceRandom = function _replaceRandom(value) {
  //replaces all occurrences of random(...) in a string with the calculated random value. can be a range like random(-100, 100, 5) or an array like random([0, 100, 500])
  var prev = 0,
      s = "",
      i,
      nums,
      end,
      isArray;

  while (~(i = value.indexOf("random(", prev))) {
    end = value.indexOf(")", i);
    isArray = value.charAt(i + 7) === "[";
    nums = value.substr(i + 7, end - i - 7).match(isArray ? _delimitedValueExp : _strictNumExp);
    s += value.substr(prev, i - prev) + random(isArray ? nums : +nums[0], isArray ? 0 : +nums[1], +nums[2] || 1e-5);
    prev = end + 1;
  }

  return s + value.substr(prev, value.length - prev);
},
    mapRange = function mapRange(inMin, inMax, outMin, outMax, value) {
  var inRange = inMax - inMin,
      outRange = outMax - outMin;
  return _conditionalReturn(value, function (value) {
    return outMin + ((value - inMin) / inRange * outRange || 0);
  });
},
    interpolate = function interpolate(start, end, progress, mutate) {
  var func = isNaN(start + end) ? 0 : function (p) {
    return (1 - p) * start + p * end;
  };

  if (!func) {
    var isString = _isString(start),
        master = {},
        p,
        i,
        interpolators,
        l,
        il;

    progress === true && (mutate = 1) && (progress = null);

    if (isString) {
      start = {
        p: start
      };
      end = {
        p: end
      };
    } else if (_isArray(start) && !_isArray(end)) {
      interpolators = [];
      l = start.length;
      il = l - 2;

      for (i = 1; i < l; i++) {
        interpolators.push(interpolate(start[i - 1], start[i])); //build the interpolators up front as a performance optimization so that when the function is called many times, it can just reuse them.
      }

      l--;

      func = function func(p) {
        p *= l;
        var i = Math.min(il, ~~p);
        return interpolators[i](p - i);
      };

      progress = end;
    } else if (!mutate) {
      start = _merge(_isArray(start) ? [] : {}, start);
    }

    if (!interpolators) {
      for (p in end) {
        _addPropTween.call(master, start, p, "get", end[p]);
      }

      func = function func(p) {
        return _renderPropTweens(p, master) || (isString ? start.p : start);
      };
    }
  }

  return _conditionalReturn(progress, func);
},
    _getLabelInDirection = function _getLabelInDirection(timeline, fromTime, backward) {
  //used for nextLabel() and previousLabel()
  var labels = timeline.labels,
      min = _bigNum,
      p,
      distance,
      label;

  for (p in labels) {
    distance = labels[p] - fromTime;

    if (distance < 0 === !!backward && distance && min > (distance = Math.abs(distance))) {
      label = p;
      min = distance;
    }
  }

  return label;
},
    _callback = function _callback(animation, type, executeLazyFirst) {
  var v = animation.vars,
      callback = v[type],
      params,
      scope;

  if (!callback) {
    return;
  }

  params = v[type + "Params"];
  scope = v.callbackScope || animation;
  executeLazyFirst && _lazyTweens.length && _lazyRender(); //in case rendering caused any tweens to lazy-init, we should render them because typically when a timeline finishes, users expect things to have rendered fully. Imagine an onUpdate on a timeline that reports/checks tweened values.

  return params ? callback.apply(scope, params) : callback.call(scope);
},
    _interrupt = function _interrupt(animation) {
  _removeFromParent(animation);

  animation.progress() < 1 && _callback(animation, "onInterrupt");
  return animation;
},
    _quickTween,
    _createPlugin = function _createPlugin(config) {
  config = !config.name && config["default"] || config; //UMD packaging wraps things oddly, so for example MotionPathHelper becomes {MotionPathHelper:MotionPathHelper, default:MotionPathHelper}.

  var name = config.name,
      isFunc = _isFunction(config),
      Plugin = name && !isFunc && config.init ? function () {
    this._props = [];
  } : config,
      //in case someone passes in an object that's not a plugin, like CustomEase
  instanceDefaults = {
    init: _emptyFunc,
    render: _renderPropTweens,
    add: _addPropTween,
    kill: _killPropTweensOf,
    modifier: _addPluginModifier,
    rawVars: 0
  },
      statics = {
    targetTest: 0,
    get: 0,
    getSetter: _getSetter,
    aliases: {},
    register: 0
  };

  _wake();

  if (config !== Plugin) {
    if (_plugins[name]) {
      return;
    }

    _setDefaults(Plugin, _setDefaults(_copyExcluding(config, instanceDefaults), statics)); //static methods


    _merge(Plugin.prototype, _merge(instanceDefaults, _copyExcluding(config, statics))); //instance methods


    _plugins[Plugin.prop = name] = Plugin;

    if (config.targetTest) {
      _harnessPlugins.push(Plugin);

      _reservedProps[name] = 1;
    }

    name = (name === "css" ? "CSS" : name.charAt(0).toUpperCase() + name.substr(1)) + "Plugin"; //for the global name. "motionPath" should become MotionPathPlugin
  }

  _addGlobal(name, Plugin);

  config.register && config.register(gsap, Plugin, PropTween);
},

/*
 * --------------------------------------------------------------------------------------
 * COLORS
 * --------------------------------------------------------------------------------------
 */
_255 = 255,
    _colorLookup = {
  aqua: [0, _255, _255],
  lime: [0, _255, 0],
  silver: [192, 192, 192],
  black: [0, 0, 0],
  maroon: [128, 0, 0],
  teal: [0, 128, 128],
  blue: [0, 0, _255],
  navy: [0, 0, 128],
  white: [_255, _255, _255],
  olive: [128, 128, 0],
  yellow: [_255, _255, 0],
  orange: [_255, 165, 0],
  gray: [128, 128, 128],
  purple: [128, 0, 128],
  green: [0, 128, 0],
  red: [_255, 0, 0],
  pink: [_255, 192, 203],
  cyan: [0, _255, _255],
  transparent: [_255, _255, _255, 0]
},
    _hue = function _hue(h, m1, m2) {
  h = h < 0 ? h + 1 : h > 1 ? h - 1 : h;
  return (h * 6 < 1 ? m1 + (m2 - m1) * h * 6 : h < .5 ? m2 : h * 3 < 2 ? m1 + (m2 - m1) * (2 / 3 - h) * 6 : m1) * _255 + .5 | 0;
},
    splitColor = function splitColor(v, toHSL, forceAlpha) {
  var a = !v ? _colorLookup.black : _isNumber(v) ? [v >> 16, v >> 8 & _255, v & _255] : 0,
      r,
      g,
      b,
      h,
      s,
      l,
      max,
      min,
      d,
      wasHSL;

  if (!a) {
    if (v.substr(-1) === ",") {
      //sometimes a trailing comma is included and we should chop it off (typically from a comma-delimited list of values like a textShadow:"2px 2px 2px blue, 5px 5px 5px rgb(255,0,0)" - in this example "blue," has a trailing comma. We could strip it out inside parseComplex() but we'd need to do it to the beginning and ending values plus it wouldn't provide protection from other potential scenarios like if the user passes in a similar value.
      v = v.substr(0, v.length - 1);
    }

    if (_colorLookup[v]) {
      a = _colorLookup[v];
    } else if (v.charAt(0) === "#") {
      if (v.length === 4) {
        //for shorthand like #9F0
        r = v.charAt(1);
        g = v.charAt(2);
        b = v.charAt(3);
        v = "#" + r + r + g + g + b + b;
      }

      v = parseInt(v.substr(1), 16);
      a = [v >> 16, v >> 8 & _255, v & _255];
    } else if (v.substr(0, 3) === "hsl") {
      a = wasHSL = v.match(_strictNumExp);

      if (!toHSL) {
        h = +a[0] % 360 / 360;
        s = +a[1] / 100;
        l = +a[2] / 100;
        g = l <= .5 ? l * (s + 1) : l + s - l * s;
        r = l * 2 - g;
        a.length > 3 && (a[3] *= 1); //cast as number

        a[0] = _hue(h + 1 / 3, r, g);
        a[1] = _hue(h, r, g);
        a[2] = _hue(h - 1 / 3, r, g);
      } else if (~v.indexOf("=")) {
        //if relative values are found, just return the raw strings with the relative prefixes in place.
        a = v.match(_numExp);
        forceAlpha && a.length < 4 && (a[3] = 1);
        return a;
      }
    } else {
      a = v.match(_strictNumExp) || _colorLookup.transparent;
    }

    a = a.map(Number);
  }

  if (toHSL && !wasHSL) {
    r = a[0] / _255;
    g = a[1] / _255;
    b = a[2] / _255;
    max = Math.max(r, g, b);
    min = Math.min(r, g, b);
    l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h *= 60;
    }

    a[0] = ~~(h + .5);
    a[1] = ~~(s * 100 + .5);
    a[2] = ~~(l * 100 + .5);
  }

  forceAlpha && a.length < 4 && (a[3] = 1);
  return a;
},
    _colorOrderData = function _colorOrderData(v) {
  // strips out the colors from the string, finds all the numeric slots (with units) and returns an array of those. The Array also has a "c" property which is an Array of the index values where the colors belong. This is to help work around issues where there's a mis-matched order of color/numeric data like drop-shadow(#f00 0px 1px 2px) and drop-shadow(0x 1px 2px #f00). This is basically a helper function used in _formatColors()
  var values = [],
      c = [],
      i = -1;
  v.split(_colorExp).forEach(function (v) {
    var a = v.match(_numWithUnitExp) || [];
    values.push.apply(values, a);
    c.push(i += a.length + 1);
  });
  values.c = c;
  return values;
},
    _formatColors = function _formatColors(s, toHSL, orderMatchData) {
  var result = "",
      colors = (s + result).match(_colorExp),
      type = toHSL ? "hsla(" : "rgba(",
      i = 0,
      c,
      shell,
      d,
      l;

  if (!colors) {
    return s;
  }

  colors = colors.map(function (color) {
    return (color = splitColor(color, toHSL, 1)) && type + (toHSL ? color[0] + "," + color[1] + "%," + color[2] + "%," + color[3] : color.join(",")) + ")";
  });

  if (orderMatchData) {
    d = _colorOrderData(s);
    c = orderMatchData.c;

    if (c.join(result) !== d.c.join(result)) {
      shell = s.replace(_colorExp, "1").split(_numWithUnitExp);
      l = shell.length - 1;

      for (; i < l; i++) {
        result += shell[i] + (~c.indexOf(i) ? colors.shift() || type + "0,0,0,0)" : (d.length ? d : colors.length ? colors : orderMatchData).shift());
      }
    }
  }

  if (!shell) {
    shell = s.split(_colorExp);
    l = shell.length - 1;

    for (; i < l; i++) {
      result += shell[i] + colors[i];
    }
  }

  return result + shell[l];
},
    _colorExp = function () {
  var s = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3}){1,2}\\b",
      //we'll dynamically build this Regular Expression to conserve file size. After building it, it will be able to find rgb(), rgba(), # (hexadecimal), and named color values like red, blue, purple, etc.,
  p;

  for (p in _colorLookup) {
    s += "|" + p + "\\b";
  }

  return new RegExp(s + ")", "gi");
}(),
    _hslExp = /hsl[a]?\(/,
    _colorStringFilter = function _colorStringFilter(a) {
  var combined = a.join(" "),
      toHSL;
  _colorExp.lastIndex = 0;

  if (_colorExp.test(combined)) {
    toHSL = _hslExp.test(combined);
    a[1] = _formatColors(a[1], toHSL);
    a[0] = _formatColors(a[0], toHSL, _colorOrderData(a[1])); // make sure the order of numbers/colors match with the END value.

    return true;
  }
},

/*
 * --------------------------------------------------------------------------------------
 * TICKER
 * --------------------------------------------------------------------------------------
 */
_tickerActive,
    _ticker = function () {
  var _getTime = Date.now,
      _lagThreshold = 500,
      _adjustedLag = 33,
      _startTime = _getTime(),
      _lastUpdate = _startTime,
      _gap = 1000 / 240,
      _nextTime = _gap,
      _listeners = [],
      _id,
      _req,
      _raf,
      _self,
      _delta,
      _i,
      _tick = function _tick(v) {
    var elapsed = _getTime() - _lastUpdate,
        manual = v === true,
        overlap,
        dispatch,
        time,
        frame;

    elapsed > _lagThreshold && (_startTime += elapsed - _adjustedLag);
    _lastUpdate += elapsed;
    time = _lastUpdate - _startTime;
    overlap = time - _nextTime;

    if (overlap > 0 || manual) {
      frame = ++_self.frame;
      _delta = time - _self.time * 1000;
      _self.time = time = time / 1000;
      _nextTime += overlap + (overlap >= _gap ? 4 : _gap - overlap);
      dispatch = 1;
    }

    manual || (_id = _req(_tick)); //make sure the request is made before we dispatch the "tick" event so that timing is maintained. Otherwise, if processing the "tick" requires a bunch of time (like 15ms) and we're using a setTimeout() that's based on 16.7ms, it'd technically take 31.7ms between frames otherwise.

    if (dispatch) {
      for (_i = 0; _i < _listeners.length; _i++) {
        // use _i and check _listeners.length instead of a variable because a listener could get removed during the loop, and if that happens to an element less than the current index, it'd throw things off in the loop.
        _listeners[_i](time, _delta, frame, v);
      }
    }
  };

  _self = {
    time: 0,
    frame: 0,
    tick: function tick() {
      _tick(true);
    },
    deltaRatio: function deltaRatio(fps) {
      return _delta / (1000 / (fps || 60));
    },
    wake: function wake() {
      if (_coreReady) {
        if (!_coreInitted && _windowExists()) {
          _win = _coreInitted = window;
          _doc = _win.document || {};
          _globals.gsap = gsap;
          (_win.gsapVersions || (_win.gsapVersions = [])).push(gsap.version);

          _install(_installScope || _win.GreenSockGlobals || !_win.gsap && _win || {});

          _raf = _win.requestAnimationFrame;
        }

        _id && _self.sleep();

        _req = _raf || function (f) {
          return setTimeout(f, _nextTime - _self.time * 1000 + 1 | 0);
        };

        _tickerActive = 1;

        _tick(2);
      }
    },
    sleep: function sleep() {
      (_raf ? _win.cancelAnimationFrame : clearTimeout)(_id);
      _tickerActive = 0;
      _req = _emptyFunc;
    },
    lagSmoothing: function lagSmoothing(threshold, adjustedLag) {
      _lagThreshold = threshold || 1 / _tinyNum; //zero should be interpreted as basically unlimited

      _adjustedLag = Math.min(adjustedLag, _lagThreshold, 0);
    },
    fps: function fps(_fps) {
      _gap = 1000 / (_fps || 240);
      _nextTime = _self.time * 1000 + _gap;
    },
    add: function add(callback) {
      _listeners.indexOf(callback) < 0 && _listeners.push(callback);

      _wake();
    },
    remove: function remove(callback) {
      var i;
      ~(i = _listeners.indexOf(callback)) && _listeners.splice(i, 1) && _i >= i && _i--;
    },
    _listeners: _listeners
  };
  return _self;
}(),
    _wake = function _wake() {
  return !_tickerActive && _ticker.wake();
},
    //also ensures the core classes are initialized.

/*
* -------------------------------------------------
* EASING
* -------------------------------------------------
*/
_easeMap = {},
    _customEaseExp = /^[\d.\-M][\d.\-,\s]/,
    _quotesExp = /["']/g,
    _parseObjectInString = function _parseObjectInString(value) {
  //takes a string like "{wiggles:10, type:anticipate})" and turns it into a real object. Notice it ends in ")" and includes the {} wrappers. This is because we only use this function for parsing ease configs and prioritized optimization rather than reusability.
  var obj = {},
      split = value.substr(1, value.length - 3).split(":"),
      key = split[0],
      i = 1,
      l = split.length,
      index,
      val,
      parsedVal;

  for (; i < l; i++) {
    val = split[i];
    index = i !== l - 1 ? val.lastIndexOf(",") : val.length;
    parsedVal = val.substr(0, index);
    obj[key] = isNaN(parsedVal) ? parsedVal.replace(_quotesExp, "").trim() : +parsedVal;
    key = val.substr(index + 1).trim();
  }

  return obj;
},
    _valueInParentheses = function _valueInParentheses(value) {
  var open = value.indexOf("(") + 1,
      close = value.indexOf(")"),
      nested = value.indexOf("(", open);
  return value.substring(open, ~nested && nested < close ? value.indexOf(")", close + 1) : close);
},
    _configEaseFromString = function _configEaseFromString(name) {
  //name can be a string like "elastic.out(1,0.5)", and pass in _easeMap as obj and it'll parse it out and call the actual function like _easeMap.Elastic.easeOut.config(1,0.5). It will also parse custom ease strings as long as CustomEase is loaded and registered (internally as _easeMap._CE).
  var split = (name + "").split("("),
      ease = _easeMap[split[0]];
  return ease && split.length > 1 && ease.config ? ease.config.apply(null, ~name.indexOf("{") ? [_parseObjectInString(split[1])] : _valueInParentheses(name).split(",").map(_numericIfPossible)) : _easeMap._CE && _customEaseExp.test(name) ? _easeMap._CE("", name) : ease;
},
    _invertEase = function _invertEase(ease) {
  return function (p) {
    return 1 - ease(1 - p);
  };
},
    // allow yoyoEase to be set in children and have those affected when the parent/ancestor timeline yoyos.
_propagateYoyoEase = function _propagateYoyoEase(timeline, isYoyo) {
  var child = timeline._first,
      ease;

  while (child) {
    if (child instanceof Timeline) {
      _propagateYoyoEase(child, isYoyo);
    } else if (child.vars.yoyoEase && (!child._yoyo || !child._repeat) && child._yoyo !== isYoyo) {
      if (child.timeline) {
        _propagateYoyoEase(child.timeline, isYoyo);
      } else {
        ease = child._ease;
        child._ease = child._yEase;
        child._yEase = ease;
        child._yoyo = isYoyo;
      }
    }

    child = child._next;
  }
},
    _parseEase = function _parseEase(ease, defaultEase) {
  return !ease ? defaultEase : (_isFunction(ease) ? ease : _easeMap[ease] || _configEaseFromString(ease)) || defaultEase;
},
    _insertEase = function _insertEase(names, easeIn, easeOut, easeInOut) {
  if (easeOut === void 0) {
    easeOut = function easeOut(p) {
      return 1 - easeIn(1 - p);
    };
  }

  if (easeInOut === void 0) {
    easeInOut = function easeInOut(p) {
      return p < .5 ? easeIn(p * 2) / 2 : 1 - easeIn((1 - p) * 2) / 2;
    };
  }

  var ease = {
    easeIn: easeIn,
    easeOut: easeOut,
    easeInOut: easeInOut
  },
      lowercaseName;

  _forEachName(names, function (name) {
    _easeMap[name] = _globals[name] = ease;
    _easeMap[lowercaseName = name.toLowerCase()] = easeOut;

    for (var p in ease) {
      _easeMap[lowercaseName + (p === "easeIn" ? ".in" : p === "easeOut" ? ".out" : ".inOut")] = _easeMap[name + "." + p] = ease[p];
    }
  });

  return ease;
},
    _easeInOutFromOut = function _easeInOutFromOut(easeOut) {
  return function (p) {
    return p < .5 ? (1 - easeOut(1 - p * 2)) / 2 : .5 + easeOut((p - .5) * 2) / 2;
  };
},
    _configElastic = function _configElastic(type, amplitude, period) {
  var p1 = amplitude >= 1 ? amplitude : 1,
      //note: if amplitude is < 1, we simply adjust the period for a more natural feel. Otherwise the math doesn't work right and the curve starts at 1.
  p2 = (period || (type ? .3 : .45)) / (amplitude < 1 ? amplitude : 1),
      p3 = p2 / _2PI * (Math.asin(1 / p1) || 0),
      easeOut = function easeOut(p) {
    return p === 1 ? 1 : p1 * Math.pow(2, -10 * p) * _sin((p - p3) * p2) + 1;
  },
      ease = type === "out" ? easeOut : type === "in" ? function (p) {
    return 1 - easeOut(1 - p);
  } : _easeInOutFromOut(easeOut);

  p2 = _2PI / p2; //precalculate to optimize

  ease.config = function (amplitude, period) {
    return _configElastic(type, amplitude, period);
  };

  return ease;
},
    _configBack = function _configBack(type, overshoot) {
  if (overshoot === void 0) {
    overshoot = 1.70158;
  }

  var easeOut = function easeOut(p) {
    return p ? --p * p * ((overshoot + 1) * p + overshoot) + 1 : 0;
  },
      ease = type === "out" ? easeOut : type === "in" ? function (p) {
    return 1 - easeOut(1 - p);
  } : _easeInOutFromOut(easeOut);

  ease.config = function (overshoot) {
    return _configBack(type, overshoot);
  };

  return ease;
}; // a cheaper (kb and cpu) but more mild way to get a parameterized weighted ease by feeding in a value between -1 (easeIn) and 1 (easeOut) where 0 is linear.
// _weightedEase = ratio => {
// 	let y = 0.5 + ratio / 2;
// 	return p => (2 * (1 - p) * p * y + p * p);
// },
// a stronger (but more expensive kb/cpu) parameterized weighted ease that lets you feed in a value between -1 (easeIn) and 1 (easeOut) where 0 is linear.
// _weightedEaseStrong = ratio => {
// 	ratio = .5 + ratio / 2;
// 	let o = 1 / 3 * (ratio < .5 ? ratio : 1 - ratio),
// 		b = ratio - o,
// 		c = ratio + o;
// 	return p => p === 1 ? p : 3 * b * (1 - p) * (1 - p) * p + 3 * c * (1 - p) * p * p + p * p * p;
// };


exports._ticker = _ticker;
exports._colorStringFilter = _colorStringFilter;
exports.splitColor = splitColor;
exports.interpolate = interpolate;
exports.mapRange = mapRange;
exports._replaceRandom = _replaceRandom;
exports.wrapYoyo = wrapYoyo;
exports.wrap = wrap;
exports.normalize = normalize;
exports.unitize = unitize;
exports.pipe = pipe;
exports.random = random;
exports.snap = snap;
exports._roundModifier = _roundModifier;
exports.distribute = distribute;
exports.shuffle = shuffle;
exports.toArray = toArray;
exports.clamp = clamp;
exports.getUnit = getUnit;
exports._removeLinkedListItem = _removeLinkedListItem;
exports._setDefaults = _setDefaults;
exports._round = _round;
exports._forEachName = _forEachName;
exports._getProperty = _getProperty;
exports._getCache = _getCache;
exports._plugins = _plugins;
exports._missingPlugin = _missingPlugin;
exports._relExp = _relExp;
exports._numWithUnitExp = _numWithUnitExp;
exports._numExp = _numExp;
exports._isUndefined = _isUndefined;
exports._isString = _isString;
exports._config = _config;

_forEachName("Linear,Quad,Cubic,Quart,Quint,Strong", function (name, i) {
  var power = i < 5 ? i + 1 : i;

  _insertEase(name + ",Power" + (power - 1), i ? function (p) {
    return Math.pow(p, power);
  } : function (p) {
    return p;
  }, function (p) {
    return 1 - Math.pow(1 - p, power);
  }, function (p) {
    return p < .5 ? Math.pow(p * 2, power) / 2 : 1 - Math.pow((1 - p) * 2, power) / 2;
  });
});

_easeMap.Linear.easeNone = _easeMap.none = _easeMap.Linear.easeIn;

_insertEase("Elastic", _configElastic("in"), _configElastic("out"), _configElastic());

(function (n, c) {
  var n1 = 1 / c,
      n2 = 2 * n1,
      n3 = 2.5 * n1,
      easeOut = function easeOut(p) {
    return p < n1 ? n * p * p : p < n2 ? n * Math.pow(p - 1.5 / c, 2) + .75 : p < n3 ? n * (p -= 2.25 / c) * p + .9375 : n * Math.pow(p - 2.625 / c, 2) + .984375;
  };

  _insertEase("Bounce", function (p) {
    return 1 - easeOut(1 - p);
  }, easeOut);
})(7.5625, 2.75);

_insertEase("Expo", function (p) {
  return p ? Math.pow(2, 10 * (p - 1)) : 0;
});

_insertEase("Circ", function (p) {
  return -(_sqrt(1 - p * p) - 1);
});

_insertEase("Sine", function (p) {
  return p === 1 ? 1 : -_cos(p * _HALF_PI) + 1;
});

_insertEase("Back", _configBack("in"), _configBack("out"), _configBack());

_easeMap.SteppedEase = _easeMap.steps = _globals.SteppedEase = {
  config: function config(steps, immediateStart) {
    if (steps === void 0) {
      steps = 1;
    }

    var p1 = 1 / steps,
        p2 = steps + (immediateStart ? 0 : 1),
        p3 = immediateStart ? 1 : 0,
        max = 1 - _tinyNum;
    return function (p) {
      return ((p2 * _clamp(0, max, p) | 0) + p3) * p1;
    };
  }
};
_defaults.ease = _easeMap["quad.out"];

_forEachName("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt", function (name) {
  return _callbackNames += name + "," + name + "Params,";
});
/*
 * --------------------------------------------------------------------------------------
 * CACHE
 * --------------------------------------------------------------------------------------
 */


var GSCache = function GSCache(target, harness) {
  this.id = _gsID++;
  target._gsap = this;
  this.target = target;
  this.harness = harness;
  this.get = harness ? harness.get : _getProperty;
  this.set = harness ? harness.getSetter : _getSetter;
};
/*
 * --------------------------------------------------------------------------------------
 * ANIMATION
 * --------------------------------------------------------------------------------------
 */


exports.GSCache = GSCache;

var Animation = /*#__PURE__*/function () {
  function Animation(vars, time) {
    var parent = vars.parent || _globalTimeline;
    this.vars = vars;
    this._delay = +vars.delay || 0;

    if (this._repeat = vars.repeat || 0) {
      this._rDelay = vars.repeatDelay || 0;
      this._yoyo = !!vars.yoyo || !!vars.yoyoEase;
    }

    this._ts = 1;

    _setDuration(this, +vars.duration, 1, 1);

    this.data = vars.data;
    _tickerActive || _ticker.wake();
    parent && _addToTimeline(parent, this, time || time === 0 ? time : parent._time, 1);
    vars.reversed && this.reverse();
    vars.paused && this.paused(true);
  }

  var _proto = Animation.prototype;

  _proto.delay = function delay(value) {
    if (value || value === 0) {
      this.parent && this.parent.smoothChildTiming && this.startTime(this._start + value - this._delay);
      this._delay = value;
      return this;
    }

    return this._delay;
  };

  _proto.duration = function duration(value) {
    return arguments.length ? this.totalDuration(this._repeat > 0 ? value + (value + this._rDelay) * this._repeat : value) : this.totalDuration() && this._dur;
  };

  _proto.totalDuration = function totalDuration(value) {
    if (!arguments.length) {
      return this._tDur;
    }

    this._dirty = 0;
    return _setDuration(this, this._repeat < 0 ? value : (value - this._repeat * this._rDelay) / (this._repeat + 1));
  };

  _proto.totalTime = function totalTime(_totalTime, suppressEvents) {
    _wake();

    if (!arguments.length) {
      return this._tTime;
    }

    var parent = this._dp;

    if (parent && parent.smoothChildTiming && this._ts) {
      _alignPlayhead(this, _totalTime); //in case any of the ancestor timelines had completed but should now be enabled, we should reset their totalTime() which will also ensure that they're lined up properly and enabled. Skip for animations that are on the root (wasteful). Example: a TimelineLite.exportRoot() is performed when there's a paused tween on the root, the export will not complete until that tween is unpaused, but imagine a child gets restarted later, after all [unpaused] tweens have completed. The start of that child would get pushed out, but one of the ancestors may have completed.


      while (parent.parent) {
        if (parent.parent._time !== parent._start + (parent._ts >= 0 ? parent._tTime / parent._ts : (parent.totalDuration() - parent._tTime) / -parent._ts)) {
          parent.totalTime(parent._tTime, true);
        }

        parent = parent.parent;
      }

      if (!this.parent && this._dp.autoRemoveChildren && (this._ts > 0 && _totalTime < this._tDur || this._ts < 0 && _totalTime > 0 || !this._tDur && !_totalTime)) {
        //if the animation doesn't have a parent, put it back into its last parent (recorded as _dp for exactly cases like this). Limit to parents with autoRemoveChildren (like globalTimeline) so that if the user manually removes an animation from a timeline and then alters its playhead, it doesn't get added back in.
        _addToTimeline(this._dp, this, this._start - this._delay);
      }
    }

    if (this._tTime !== _totalTime || !this._dur && !suppressEvents || this._initted && Math.abs(this._zTime) === _tinyNum || !_totalTime && !this._initted && (this.add || this._ptLookup)) {
      // check for _ptLookup on a Tween instance to ensure it has actually finished being instantiated, otherwise if this.reverse() gets called in the Animation constructor, it could trigger a render() here even though the _targets weren't populated, thus when _init() is called there won't be any PropTweens (it'll act like the tween is non-functional)
      this._ts || (this._pTime = _totalTime); // otherwise, if an animation is paused, then the playhead is moved back to zero, then resumed, it'd revert back to the original time at the pause

      _lazySafeRender(this, _totalTime, suppressEvents);
    }

    return this;
  };

  _proto.time = function time(value, suppressEvents) {
    return arguments.length ? this.totalTime(Math.min(this.totalDuration(), value + _elapsedCycleDuration(this)) % this._dur || (value ? this._dur : 0), suppressEvents) : this._time; // note: if the modulus results in 0, the playhead could be exactly at the end or the beginning, and we always defer to the END with a non-zero value, otherwise if you set the time() to the very end (duration()), it would render at the START!
  };

  _proto.totalProgress = function totalProgress(value, suppressEvents) {
    return arguments.length ? this.totalTime(this.totalDuration() * value, suppressEvents) : this.totalDuration() ? Math.min(1, this._tTime / this._tDur) : this.ratio;
  };

  _proto.progress = function progress(value, suppressEvents) {
    return arguments.length ? this.totalTime(this.duration() * (this._yoyo && !(this.iteration() & 1) ? 1 - value : value) + _elapsedCycleDuration(this), suppressEvents) : this.duration() ? Math.min(1, this._time / this._dur) : this.ratio;
  };

  _proto.iteration = function iteration(value, suppressEvents) {
    var cycleDuration = this.duration() + this._rDelay;

    return arguments.length ? this.totalTime(this._time + (value - 1) * cycleDuration, suppressEvents) : this._repeat ? _animationCycle(this._tTime, cycleDuration) + 1 : 1;
  } // potential future addition:
  // isPlayingBackwards() {
  // 	let animation = this,
  // 		orientation = 1; // 1 = forward, -1 = backward
  // 	while (animation) {
  // 		orientation *= animation.reversed() || (animation.repeat() && !(animation.iteration() & 1)) ? -1 : 1;
  // 		animation = animation.parent;
  // 	}
  // 	return orientation < 0;
  // }
  ;

  _proto.timeScale = function timeScale(value) {
    if (!arguments.length) {
      return this._rts === -_tinyNum ? 0 : this._rts; // recorded timeScale. Special case: if someone calls reverse() on an animation with timeScale of 0, we assign it -_tinyNum to remember it's reversed.
    }

    if (this._rts === value) {
      return this;
    }

    var tTime = this.parent && this._ts ? _parentToChildTotalTime(this.parent._time, this) : this._tTime; // make sure to do the parentToChildTotalTime() BEFORE setting the new _ts because the old one must be used in that calculation.
    // prioritize rendering where the parent's playhead lines up instead of this._tTime because there could be a tween that's animating another tween's timeScale in the same rendering loop (same parent), thus if the timeScale tween renders first, it would alter _start BEFORE _tTime was set on that tick (in the rendering loop), effectively freezing it until the timeScale tween finishes.

    this._rts = +value || 0;
    this._ts = this._ps || value === -_tinyNum ? 0 : this._rts; // _ts is the functional timeScale which would be 0 if the animation is paused.

    return _recacheAncestors(this.totalTime(_clamp(-this._delay, this._tDur, tTime), true));
  };

  _proto.paused = function paused(value) {
    if (!arguments.length) {
      return this._ps;
    }

    if (this._ps !== value) {
      this._ps = value;

      if (value) {
        this._pTime = this._tTime || Math.max(-this._delay, this.rawTime()); // if the pause occurs during the delay phase, make sure that's factored in when resuming.

        this._ts = this._act = 0; // _ts is the functional timeScale, so a paused tween would effectively have a timeScale of 0. We record the "real" timeScale as _rts (recorded time scale)
      } else {
        _wake();

        this._ts = this._rts; //only defer to _pTime (pauseTime) if tTime is zero. Remember, someone could pause() an animation, then scrub the playhead and resume(). If the parent doesn't have smoothChildTiming, we render at the rawTime() because the startTime won't get updated.

        this.totalTime(this.parent && !this.parent.smoothChildTiming ? this.rawTime() : this._tTime || this._pTime, this.progress() === 1 && (this._tTime -= _tinyNum) && Math.abs(this._zTime) !== _tinyNum); // edge case: animation.progress(1).pause().play() wouldn't render again because the playhead is already at the end, but the call to totalTime() below will add it back to its parent...and not remove it again (since removing only happens upon rendering at a new time). Offsetting the _tTime slightly is done simply to cause the final render in totalTime() that'll pop it off its timeline (if autoRemoveChildren is true, of course). Check to make sure _zTime isn't -_tinyNum to avoid an edge case where the playhead is pushed to the end but INSIDE a tween/callback, the timeline itself is paused thus halting rendering and leaving a few unrendered. When resuming, it wouldn't render those otherwise.
      }
    }

    return this;
  };

  _proto.startTime = function startTime(value) {
    if (arguments.length) {
      this._start = value;
      var parent = this.parent || this._dp;
      parent && (parent._sort || !this.parent) && _addToTimeline(parent, this, value - this._delay);
      return this;
    }

    return this._start;
  };

  _proto.endTime = function endTime(includeRepeats) {
    return this._start + (_isNotFalse(includeRepeats) ? this.totalDuration() : this.duration()) / Math.abs(this._ts);
  };

  _proto.rawTime = function rawTime(wrapRepeats) {
    var parent = this.parent || this._dp; // _dp = detatched parent

    return !parent ? this._tTime : wrapRepeats && (!this._ts || this._repeat && this._time && this.totalProgress() < 1) ? this._tTime % (this._dur + this._rDelay) : !this._ts ? this._tTime : _parentToChildTotalTime(parent.rawTime(wrapRepeats), this);
  };

  _proto.globalTime = function globalTime(rawTime) {
    var animation = this,
        time = arguments.length ? rawTime : animation.rawTime();

    while (animation) {
      time = animation._start + time / (animation._ts || 1);
      animation = animation._dp;
    }

    return time;
  };

  _proto.repeat = function repeat(value) {
    if (arguments.length) {
      this._repeat = value;
      return _onUpdateTotalDuration(this);
    }

    return this._repeat;
  };

  _proto.repeatDelay = function repeatDelay(value) {
    if (arguments.length) {
      this._rDelay = value;
      return _onUpdateTotalDuration(this);
    }

    return this._rDelay;
  };

  _proto.yoyo = function yoyo(value) {
    if (arguments.length) {
      this._yoyo = value;
      return this;
    }

    return this._yoyo;
  };

  _proto.seek = function seek(position, suppressEvents) {
    return this.totalTime(_parsePosition(this, position), _isNotFalse(suppressEvents));
  };

  _proto.restart = function restart(includeDelay, suppressEvents) {
    return this.play().totalTime(includeDelay ? -this._delay : 0, _isNotFalse(suppressEvents));
  };

  _proto.play = function play(from, suppressEvents) {
    from != null && this.seek(from, suppressEvents);
    return this.reversed(false).paused(false);
  };

  _proto.reverse = function reverse(from, suppressEvents) {
    from != null && this.seek(from || this.totalDuration(), suppressEvents);
    return this.reversed(true).paused(false);
  };

  _proto.pause = function pause(atTime, suppressEvents) {
    atTime != null && this.seek(atTime, suppressEvents);
    return this.paused(true);
  };

  _proto.resume = function resume() {
    return this.paused(false);
  };

  _proto.reversed = function reversed(value) {
    if (arguments.length) {
      !!value !== this.reversed() && this.timeScale(-this._rts || (value ? -_tinyNum : 0)); // in case timeScale is zero, reversing would have no effect so we use _tinyNum.

      return this;
    }

    return this._rts < 0;
  };

  _proto.invalidate = function invalidate() {
    this._initted = 0;
    this._zTime = -_tinyNum;
    return this;
  };

  _proto.isActive = function isActive() {
    var parent = this.parent || this._dp,
        start = this._start,
        rawTime;
    return !!(!parent || this._ts && this._initted && parent.isActive() && (rawTime = parent.rawTime(true)) >= start && rawTime < this.endTime(true) - _tinyNum);
  };

  _proto.eventCallback = function eventCallback(type, callback, params) {
    var vars = this.vars;

    if (arguments.length > 1) {
      if (!callback) {
        delete vars[type];
      } else {
        vars[type] = callback;
        params && (vars[type + "Params"] = params);
        type === "onUpdate" && (this._onUpdate = callback);
      }

      return this;
    }

    return vars[type];
  };

  _proto.then = function then(onFulfilled) {
    var self = this;
    return new Promise(function (resolve) {
      var f = _isFunction(onFulfilled) ? onFulfilled : _passThrough,
          _resolve = function _resolve() {
        var _then = self.then;
        self.then = null; // temporarily null the then() method to avoid an infinite loop (see https://github.com/greensock/GSAP/issues/322)

        _isFunction(f) && (f = f(self)) && (f.then || f === self) && (self.then = _then);
        resolve(f);
        self.then = _then;
      };

      if (self._initted && self.totalProgress() === 1 && self._ts >= 0 || !self._tTime && self._ts < 0) {
        _resolve();
      } else {
        self._prom = _resolve;
      }
    });
  };

  _proto.kill = function kill() {
    _interrupt(this);
  };

  return Animation;
}();

exports.Animation = Animation;

_setDefaults(Animation.prototype, {
  _time: 0,
  _start: 0,
  _end: 0,
  _tTime: 0,
  _tDur: 0,
  _dirty: 0,
  _repeat: 0,
  _yoyo: false,
  parent: null,
  _initted: false,
  _rDelay: 0,
  _ts: 1,
  _dp: 0,
  ratio: 0,
  _zTime: -_tinyNum,
  _prom: 0,
  _ps: false,
  _rts: 1
});
/*
 * -------------------------------------------------
 * TIMELINE
 * -------------------------------------------------
 */


var Timeline = /*#__PURE__*/function (_Animation) {
  _inheritsLoose(Timeline, _Animation);

  function Timeline(vars, time) {
    var _this;

    if (vars === void 0) {
      vars = {};
    }

    _this = _Animation.call(this, vars, time) || this;
    _this.labels = {};
    _this.smoothChildTiming = !!vars.smoothChildTiming;
    _this.autoRemoveChildren = !!vars.autoRemoveChildren;
    _this._sort = _isNotFalse(vars.sortChildren);
    _this.parent && _postAddChecks(_this.parent, _assertThisInitialized(_this));
    vars.scrollTrigger && _scrollTrigger(_assertThisInitialized(_this), vars.scrollTrigger);
    return _this;
  }

  var _proto2 = Timeline.prototype;

  _proto2.to = function to(targets, vars, position) {
    new Tween(targets, _parseVars(arguments, 0, this), _parsePosition(this, _isNumber(vars) ? arguments[3] : position));
    return this;
  };

  _proto2.from = function from(targets, vars, position) {
    new Tween(targets, _parseVars(arguments, 1, this), _parsePosition(this, _isNumber(vars) ? arguments[3] : position));
    return this;
  };

  _proto2.fromTo = function fromTo(targets, fromVars, toVars, position) {
    new Tween(targets, _parseVars(arguments, 2, this), _parsePosition(this, _isNumber(fromVars) ? arguments[4] : position));
    return this;
  };

  _proto2.set = function set(targets, vars, position) {
    vars.duration = 0;
    vars.parent = this;
    _inheritDefaults(vars).repeatDelay || (vars.repeat = 0);
    vars.immediateRender = !!vars.immediateRender;
    new Tween(targets, vars, _parsePosition(this, position), 1);
    return this;
  };

  _proto2.call = function call(callback, params, position) {
    return _addToTimeline(this, Tween.delayedCall(0, callback, params), _parsePosition(this, position));
  } //ONLY for backward compatibility! Maybe delete?
  ;

  _proto2.staggerTo = function staggerTo(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams) {
    vars.duration = duration;
    vars.stagger = vars.stagger || stagger;
    vars.onComplete = onCompleteAll;
    vars.onCompleteParams = onCompleteAllParams;
    vars.parent = this;
    new Tween(targets, vars, _parsePosition(this, position));
    return this;
  };

  _proto2.staggerFrom = function staggerFrom(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams) {
    vars.runBackwards = 1;
    _inheritDefaults(vars).immediateRender = _isNotFalse(vars.immediateRender);
    return this.staggerTo(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams);
  };

  _proto2.staggerFromTo = function staggerFromTo(targets, duration, fromVars, toVars, stagger, position, onCompleteAll, onCompleteAllParams) {
    toVars.startAt = fromVars;
    _inheritDefaults(toVars).immediateRender = _isNotFalse(toVars.immediateRender);
    return this.staggerTo(targets, duration, toVars, stagger, position, onCompleteAll, onCompleteAllParams);
  };

  _proto2.render = function render(totalTime, suppressEvents, force) {
    var prevTime = this._time,
        tDur = this._dirty ? this.totalDuration() : this._tDur,
        dur = this._dur,
        tTime = this !== _globalTimeline && totalTime > tDur - _tinyNum && totalTime >= 0 ? tDur : totalTime < _tinyNum ? 0 : totalTime,
        crossingStart = this._zTime < 0 !== totalTime < 0 && (this._initted || !dur),
        time,
        child,
        next,
        iteration,
        cycleDuration,
        prevPaused,
        pauseTween,
        timeScale,
        prevStart,
        prevIteration,
        yoyo,
        isYoyo;

    if (tTime !== this._tTime || force || crossingStart) {
      if (prevTime !== this._time && dur) {
        //if totalDuration() finds a child with a negative startTime and smoothChildTiming is true, things get shifted around internally so we need to adjust the time accordingly. For example, if a tween starts at -30 we must shift EVERYTHING forward 30 seconds and move this timeline's startTime backward by 30 seconds so that things align with the playhead (no jump).
        tTime += this._time - prevTime;
        totalTime += this._time - prevTime;
      }

      time = tTime;
      prevStart = this._start;
      timeScale = this._ts;
      prevPaused = !timeScale;

      if (crossingStart) {
        dur || (prevTime = this._zTime); //when the playhead arrives at EXACTLY time 0 (right on top) of a zero-duration timeline, we need to discern if events are suppressed so that when the playhead moves again (next time), it'll trigger the callback. If events are NOT suppressed, obviously the callback would be triggered in this render. Basically, the callback should fire either when the playhead ARRIVES or LEAVES this exact spot, not both. Imagine doing a timeline.seek(0) and there's a callback that sits at 0. Since events are suppressed on that seek() by default, nothing will fire, but when the playhead moves off of that position, the callback should fire. This behavior is what people intuitively expect.

        (totalTime || !suppressEvents) && (this._zTime = totalTime);
      }

      if (this._repeat) {
        //adjust the time for repeats and yoyos
        yoyo = this._yoyo;
        cycleDuration = dur + this._rDelay;
        time = _round(tTime % cycleDuration); //round to avoid floating point errors. (4 % 0.8 should be 0 but some browsers report it as 0.79999999!)

        if (tTime === tDur) {
          // the tDur === tTime is for edge cases where there's a lengthy decimal on the duration and it may reach the very end but the time is rendered as not-quite-there (remember, tDur is rounded to 4 decimals whereas dur isn't)
          iteration = this._repeat;
          time = dur;
        } else {
          iteration = ~~(tTime / cycleDuration);

          if (iteration && iteration === tTime / cycleDuration) {
            time = dur;
            iteration--;
          }

          time > dur && (time = dur);
        }

        prevIteration = _animationCycle(this._tTime, cycleDuration);
        !prevTime && this._tTime && prevIteration !== iteration && (prevIteration = iteration); // edge case - if someone does addPause() at the very beginning of a repeating timeline, that pause is technically at the same spot as the end which causes this._time to get set to 0 when the totalTime would normally place the playhead at the end. See https://greensock.com/forums/topic/23823-closing-nav-animation-not-working-on-ie-and-iphone-6-maybe-other-older-browser/?tab=comments#comment-113005

        if (yoyo && iteration & 1) {
          time = dur - time;
          isYoyo = 1;
        }
        /*
        make sure children at the end/beginning of the timeline are rendered properly. If, for example,
        a 3-second long timeline rendered at 2.9 seconds previously, and now renders at 3.2 seconds (which
        would get translated to 2.8 seconds if the timeline yoyos or 0.2 seconds if it just repeats), there
        could be a callback or a short tween that's at 2.95 or 3 seconds in which wouldn't render. So
        we need to push the timeline to the end (and/or beginning depending on its yoyo value). Also we must
        ensure that zero-duration tweens at the very beginning or end of the Timeline work.
        */


        if (iteration !== prevIteration && !this._lock) {
          var rewinding = yoyo && prevIteration & 1,
              doesWrap = rewinding === (yoyo && iteration & 1);
          iteration < prevIteration && (rewinding = !rewinding);
          prevTime = rewinding ? 0 : dur;
          this._lock = 1;
          this.render(prevTime || (isYoyo ? 0 : _round(iteration * cycleDuration)), suppressEvents, !dur)._lock = 0;
          !suppressEvents && this.parent && _callback(this, "onRepeat");
          this.vars.repeatRefresh && !isYoyo && (this.invalidate()._lock = 1);

          if (prevTime !== this._time || prevPaused !== !this._ts) {
            return this;
          }

          dur = this._dur; // in case the duration changed in the onRepeat

          tDur = this._tDur;

          if (doesWrap) {
            this._lock = 2;
            prevTime = rewinding ? dur : -0.0001;
            this.render(prevTime, true);
            this.vars.repeatRefresh && !isYoyo && this.invalidate();
          }

          this._lock = 0;

          if (!this._ts && !prevPaused) {
            return this;
          } //in order for yoyoEase to work properly when there's a stagger, we must swap out the ease in each sub-tween.


          _propagateYoyoEase(this, isYoyo);
        }
      }

      if (this._hasPause && !this._forcing && this._lock < 2) {
        pauseTween = _findNextPauseTween(this, _round(prevTime), _round(time));

        if (pauseTween) {
          tTime -= time - (time = pauseTween._start);
        }
      }

      this._tTime = tTime;
      this._time = time;
      this._act = !timeScale; //as long as it's not paused, force it to be active so that if the user renders independent of the parent timeline, it'll be forced to re-render on the next tick.

      if (!this._initted) {
        this._onUpdate = this.vars.onUpdate;
        this._initted = 1;
        this._zTime = totalTime;
      }

      !prevTime && time && !suppressEvents && _callback(this, "onStart");

      if (time >= prevTime && totalTime >= 0) {
        child = this._first;

        while (child) {
          next = child._next;

          if ((child._act || time >= child._start) && child._ts && pauseTween !== child) {
            if (child.parent !== this) {
              // an extreme edge case - the child's render could do something like kill() the "next" one in the linked list, or reparent it. In that case we must re-initiate the whole render to be safe.
              return this.render(totalTime, suppressEvents, force);
            }

            child.render(child._ts > 0 ? (time - child._start) * child._ts : (child._dirty ? child.totalDuration() : child._tDur) + (time - child._start) * child._ts, suppressEvents, force);

            if (time !== this._time || !this._ts && !prevPaused) {
              //in case a tween pauses or seeks the timeline when rendering, like inside of an onUpdate/onComplete
              pauseTween = 0;
              next && (tTime += this._zTime = -_tinyNum); // it didn't finish rendering, so flag zTime as negative so that so that the next time render() is called it'll be forced (to render any remaining children)

              break;
            }
          }

          child = next;
        }
      } else {
        child = this._last;
        var adjustedTime = totalTime < 0 ? totalTime : time; //when the playhead goes backward beyond the start of this timeline, we must pass that information down to the child animations so that zero-duration tweens know whether to render their starting or ending values.

        while (child) {
          next = child._prev;

          if ((child._act || adjustedTime <= child._end) && child._ts && pauseTween !== child) {
            if (child.parent !== this) {
              // an extreme edge case - the child's render could do something like kill() the "next" one in the linked list, or reparent it. In that case we must re-initiate the whole render to be safe.
              return this.render(totalTime, suppressEvents, force);
            }

            child.render(child._ts > 0 ? (adjustedTime - child._start) * child._ts : (child._dirty ? child.totalDuration() : child._tDur) + (adjustedTime - child._start) * child._ts, suppressEvents, force);

            if (time !== this._time || !this._ts && !prevPaused) {
              //in case a tween pauses or seeks the timeline when rendering, like inside of an onUpdate/onComplete
              pauseTween = 0;
              next && (tTime += this._zTime = adjustedTime ? -_tinyNum : _tinyNum); // it didn't finish rendering, so adjust zTime so that so that the next time render() is called it'll be forced (to render any remaining children)

              break;
            }
          }

          child = next;
        }
      }

      if (pauseTween && !suppressEvents) {
        this.pause();
        pauseTween.render(time >= prevTime ? 0 : -_tinyNum)._zTime = time >= prevTime ? 1 : -1;

        if (this._ts) {
          //the callback resumed playback! So since we may have held back the playhead due to where the pause is positioned, go ahead and jump to where it's SUPPOSED to be (if no pause happened).
          this._start = prevStart; //if the pause was at an earlier time and the user resumed in the callback, it could reposition the timeline (changing its startTime), throwing things off slightly, so we make sure the _start doesn't shift.

          _setEnd(this);

          return this.render(totalTime, suppressEvents, force);
        }
      }

      this._onUpdate && !suppressEvents && _callback(this, "onUpdate", true);
      if (tTime === tDur && tDur >= this.totalDuration() || !tTime && prevTime) if (prevStart === this._start || Math.abs(timeScale) !== Math.abs(this._ts)) if (!this._lock) {
        (totalTime || !dur) && (tTime === tDur && this._ts > 0 || !tTime && this._ts < 0) && _removeFromParent(this, 1); // don't remove if the timeline is reversed and the playhead isn't at 0, otherwise tl.progress(1).reverse() won't work. Only remove if the playhead is at the end and timeScale is positive, or if the playhead is at 0 and the timeScale is negative.

        if (!suppressEvents && !(totalTime < 0 && !prevTime) && (tTime || prevTime)) {
          _callback(this, tTime === tDur ? "onComplete" : "onReverseComplete", true);

          this._prom && !(tTime < tDur && this.timeScale() > 0) && this._prom();
        }
      }
    }

    return this;
  };

  _proto2.add = function add(child, position) {
    var _this2 = this;

    if (!_isNumber(position)) {
      position = _parsePosition(this, position);
    }

    if (!(child instanceof Animation)) {
      if (_isArray(child)) {
        child.forEach(function (obj) {
          return _this2.add(obj, position);
        });
        return this;
      }

      if (_isString(child)) {
        return this.addLabel(child, position);
      }

      if (_isFunction(child)) {
        child = Tween.delayedCall(0, child);
      } else {
        return this;
      }
    }

    return this !== child ? _addToTimeline(this, child, position) : this; //don't allow a timeline to be added to itself as a child!
  };

  _proto2.getChildren = function getChildren(nested, tweens, timelines, ignoreBeforeTime) {
    if (nested === void 0) {
      nested = true;
    }

    if (tweens === void 0) {
      tweens = true;
    }

    if (timelines === void 0) {
      timelines = true;
    }

    if (ignoreBeforeTime === void 0) {
      ignoreBeforeTime = -_bigNum;
    }

    var a = [],
        child = this._first;

    while (child) {
      if (child._start >= ignoreBeforeTime) {
        if (child instanceof Tween) {
          tweens && a.push(child);
        } else {
          timelines && a.push(child);
          nested && a.push.apply(a, child.getChildren(true, tweens, timelines));
        }
      }

      child = child._next;
    }

    return a;
  };

  _proto2.getById = function getById(id) {
    var animations = this.getChildren(1, 1, 1),
        i = animations.length;

    while (i--) {
      if (animations[i].vars.id === id) {
        return animations[i];
      }
    }
  };

  _proto2.remove = function remove(child) {
    if (_isString(child)) {
      return this.removeLabel(child);
    }

    if (_isFunction(child)) {
      return this.killTweensOf(child);
    }

    _removeLinkedListItem(this, child);

    if (child === this._recent) {
      this._recent = this._last;
    }

    return _uncache(this);
  };

  _proto2.totalTime = function totalTime(_totalTime2, suppressEvents) {
    if (!arguments.length) {
      return this._tTime;
    }

    this._forcing = 1;

    if (!this._dp && this._ts) {
      //special case for the global timeline (or any other that has no parent or detached parent).
      this._start = _round(_ticker.time - (this._ts > 0 ? _totalTime2 / this._ts : (this.totalDuration() - _totalTime2) / -this._ts));
    }

    _Animation.prototype.totalTime.call(this, _totalTime2, suppressEvents);

    this._forcing = 0;
    return this;
  };

  _proto2.addLabel = function addLabel(label, position) {
    this.labels[label] = _parsePosition(this, position);
    return this;
  };

  _proto2.removeLabel = function removeLabel(label) {
    delete this.labels[label];
    return this;
  };

  _proto2.addPause = function addPause(position, callback, params) {
    var t = Tween.delayedCall(0, callback || _emptyFunc, params);
    t.data = "isPause";
    this._hasPause = 1;
    return _addToTimeline(this, t, _parsePosition(this, position));
  };

  _proto2.removePause = function removePause(position) {
    var child = this._first;
    position = _parsePosition(this, position);

    while (child) {
      if (child._start === position && child.data === "isPause") {
        _removeFromParent(child);
      }

      child = child._next;
    }
  };

  _proto2.killTweensOf = function killTweensOf(targets, props, onlyActive) {
    var tweens = this.getTweensOf(targets, onlyActive),
        i = tweens.length;

    while (i--) {
      _overwritingTween !== tweens[i] && tweens[i].kill(targets, props);
    }

    return this;
  };

  _proto2.getTweensOf = function getTweensOf(targets, onlyActive) {
    var a = [],
        parsedTargets = toArray(targets),
        child = this._first,
        isGlobalTime = _isNumber(onlyActive),
        // a number is interpreted as a global time. If the animation spans
    children;

    while (child) {
      if (child instanceof Tween) {
        if (_arrayContainsAny(child._targets, parsedTargets) && (isGlobalTime ? (!_overwritingTween || child._initted && child._ts) && child.globalTime(0) <= onlyActive && child.globalTime(child.totalDuration()) > onlyActive : !onlyActive || child.isActive())) {
          // note: if this is for overwriting, it should only be for tweens that aren't paused and are initted.
          a.push(child);
        }
      } else if ((children = child.getTweensOf(parsedTargets, onlyActive)).length) {
        a.push.apply(a, children);
      }

      child = child._next;
    }

    return a;
  };

  _proto2.tweenTo = function tweenTo(position, vars) {
    vars = vars || {};

    var tl = this,
        endTime = _parsePosition(tl, position),
        _vars = vars,
        startAt = _vars.startAt,
        _onStart = _vars.onStart,
        onStartParams = _vars.onStartParams,
        tween = Tween.to(tl, _setDefaults(vars, {
      ease: "none",
      lazy: false,
      time: endTime,
      overwrite: "auto",
      duration: vars.duration || Math.abs((endTime - (startAt && "time" in startAt ? startAt.time : tl._time)) / tl.timeScale()) || _tinyNum,
      onStart: function onStart() {
        tl.pause();
        var duration = vars.duration || Math.abs((endTime - tl._time) / tl.timeScale());
        tween._dur !== duration && _setDuration(tween, duration, 0, 1).render(tween._time, true, true);
        _onStart && _onStart.apply(tween, onStartParams || []); //in case the user had an onStart in the vars - we don't want to overwrite it.
      }
    }));

    return tween;
  };

  _proto2.tweenFromTo = function tweenFromTo(fromPosition, toPosition, vars) {
    return this.tweenTo(toPosition, _setDefaults({
      startAt: {
        time: _parsePosition(this, fromPosition)
      }
    }, vars));
  };

  _proto2.recent = function recent() {
    return this._recent;
  };

  _proto2.nextLabel = function nextLabel(afterTime) {
    if (afterTime === void 0) {
      afterTime = this._time;
    }

    return _getLabelInDirection(this, _parsePosition(this, afterTime));
  };

  _proto2.previousLabel = function previousLabel(beforeTime) {
    if (beforeTime === void 0) {
      beforeTime = this._time;
    }

    return _getLabelInDirection(this, _parsePosition(this, beforeTime), 1);
  };

  _proto2.currentLabel = function currentLabel(value) {
    return arguments.length ? this.seek(value, true) : this.previousLabel(this._time + _tinyNum);
  };

  _proto2.shiftChildren = function shiftChildren(amount, adjustLabels, ignoreBeforeTime) {
    if (ignoreBeforeTime === void 0) {
      ignoreBeforeTime = 0;
    }

    var child = this._first,
        labels = this.labels,
        p;

    while (child) {
      if (child._start >= ignoreBeforeTime) {
        child._start += amount;
        child._end += amount;
      }

      child = child._next;
    }

    if (adjustLabels) {
      for (p in labels) {
        if (labels[p] >= ignoreBeforeTime) {
          labels[p] += amount;
        }
      }
    }

    return _uncache(this);
  };

  _proto2.invalidate = function invalidate() {
    var child = this._first;
    this._lock = 0;

    while (child) {
      child.invalidate();
      child = child._next;
    }

    return _Animation.prototype.invalidate.call(this);
  };

  _proto2.clear = function clear(includeLabels) {
    if (includeLabels === void 0) {
      includeLabels = true;
    }

    var child = this._first,
        next;

    while (child) {
      next = child._next;
      this.remove(child);
      child = next;
    }

    this._time = this._tTime = this._pTime = 0;
    includeLabels && (this.labels = {});
    return _uncache(this);
  };

  _proto2.totalDuration = function totalDuration(value) {
    var max = 0,
        self = this,
        child = self._last,
        prevStart = _bigNum,
        prev,
        start,
        parent;

    if (arguments.length) {
      return self.timeScale((self._repeat < 0 ? self.duration() : self.totalDuration()) / (self.reversed() ? -value : value));
    }

    if (self._dirty) {
      parent = self.parent;

      while (child) {
        prev = child._prev; //record it here in case the tween changes position in the sequence...

        child._dirty && child.totalDuration(); //could change the tween._startTime, so make sure the animation's cache is clean before analyzing it.

        start = child._start;

        if (start > prevStart && self._sort && child._ts && !self._lock) {
          //in case one of the tweens shifted out of order, it needs to be re-inserted into the correct position in the sequence
          self._lock = 1; //prevent endless recursive calls - there are methods that get triggered that check duration/totalDuration when we add().

          _addToTimeline(self, child, start - child._delay, 1)._lock = 0;
        } else {
          prevStart = start;
        }

        if (start < 0 && child._ts) {
          //children aren't allowed to have negative startTimes unless smoothChildTiming is true, so adjust here if one is found.
          max -= start;

          if (!parent && !self._dp || parent && parent.smoothChildTiming) {
            self._start += start / self._ts;
            self._time -= start;
            self._tTime -= start;
          }

          self.shiftChildren(-start, false, -1e999);
          prevStart = 0;
        }

        child._end > max && child._ts && (max = child._end);
        child = prev;
      }

      _setDuration(self, self === _globalTimeline && self._time > max ? self._time : max, 1, 1);

      self._dirty = 0;
    }

    return self._tDur;
  };

  Timeline.updateRoot = function updateRoot(time) {
    if (_globalTimeline._ts) {
      _lazySafeRender(_globalTimeline, _parentToChildTotalTime(time, _globalTimeline));

      _lastRenderedFrame = _ticker.frame;
    }

    if (_ticker.frame >= _nextGCFrame) {
      _nextGCFrame += _config.autoSleep || 120;
      var child = _globalTimeline._first;
      if (!child || !child._ts) if (_config.autoSleep && _ticker._listeners.length < 2) {
        while (child && !child._ts) {
          child = child._next;
        }

        child || _ticker.sleep();
      }
    }
  };

  return Timeline;
}(Animation);

exports.TimelineLite = exports.TimelineMax = exports.Timeline = Timeline;

_setDefaults(Timeline.prototype, {
  _lock: 0,
  _hasPause: 0,
  _forcing: 0
});

var _addComplexStringPropTween = function _addComplexStringPropTween(target, prop, start, end, setter, stringFilter, funcParam) {
  //note: we call _addComplexStringPropTween.call(tweenInstance...) to ensure that it's scoped properly. We may call it from within a plugin too, thus "this" would refer to the plugin.
  var pt = new PropTween(this._pt, target, prop, 0, 1, _renderComplexString, null, setter),
      index = 0,
      matchIndex = 0,
      result,
      startNums,
      color,
      endNum,
      chunk,
      startNum,
      hasRandom,
      a;
  pt.b = start;
  pt.e = end;
  start += ""; //ensure values are strings

  end += "";

  if (hasRandom = ~end.indexOf("random(")) {
    end = _replaceRandom(end);
  }

  if (stringFilter) {
    a = [start, end];
    stringFilter(a, target, prop); //pass an array with the starting and ending values and let the filter do whatever it needs to the values.

    start = a[0];
    end = a[1];
  }

  startNums = start.match(_complexStringNumExp) || [];

  while (result = _complexStringNumExp.exec(end)) {
    endNum = result[0];
    chunk = end.substring(index, result.index);

    if (color) {
      color = (color + 1) % 5;
    } else if (chunk.substr(-5) === "rgba(") {
      color = 1;
    }

    if (endNum !== startNums[matchIndex++]) {
      startNum = parseFloat(startNums[matchIndex - 1]) || 0; //these nested PropTweens are handled in a special way - we'll never actually call a render or setter method on them. We'll just loop through them in the parent complex string PropTween's render method.

      pt._pt = {
        _next: pt._pt,
        p: chunk || matchIndex === 1 ? chunk : ",",
        //note: SVG spec allows omission of comma/space when a negative sign is wedged between two numbers, like 2.5-5.3 instead of 2.5,-5.3 but when tweening, the negative value may switch to positive, so we insert the comma just in case.
        s: startNum,
        c: endNum.charAt(1) === "=" ? parseFloat(endNum.substr(2)) * (endNum.charAt(0) === "-" ? -1 : 1) : parseFloat(endNum) - startNum,
        m: color && color < 4 ? Math.round : 0
      };
      index = _complexStringNumExp.lastIndex;
    }
  }

  pt.c = index < end.length ? end.substring(index, end.length) : ""; //we use the "c" of the PropTween to store the final part of the string (after the last number)

  pt.fp = funcParam;

  if (_relExp.test(end) || hasRandom) {
    pt.e = 0; //if the end string contains relative values or dynamic random(...) values, delete the end it so that on the final render we don't actually set it to the string with += or -= characters (forces it to use the calculated value).
  }

  this._pt = pt; //start the linked list with this new PropTween. Remember, we call _addComplexStringPropTween.call(tweenInstance...) to ensure that it's scoped properly. We may call it from within a plugin too, thus "this" would refer to the plugin.

  return pt;
},
    _addPropTween = function _addPropTween(target, prop, start, end, index, targets, modifier, stringFilter, funcParam) {
  _isFunction(end) && (end = end(index || 0, target, targets));
  var currentValue = target[prop],
      parsedStart = start !== "get" ? start : !_isFunction(currentValue) ? currentValue : funcParam ? target[prop.indexOf("set") || !_isFunction(target["get" + prop.substr(3)]) ? prop : "get" + prop.substr(3)](funcParam) : target[prop](),
      setter = !_isFunction(currentValue) ? _setterPlain : funcParam ? _setterFuncWithParam : _setterFunc,
      pt;

  if (_isString(end)) {
    if (~end.indexOf("random(")) {
      end = _replaceRandom(end);
    }

    if (end.charAt(1) === "=") {
      end = parseFloat(parsedStart) + parseFloat(end.substr(2)) * (end.charAt(0) === "-" ? -1 : 1) + (getUnit(parsedStart) || 0);
    }
  }

  if (parsedStart !== end) {
    if (!isNaN(parsedStart * end)) {
      pt = new PropTween(this._pt, target, prop, +parsedStart || 0, end - (parsedStart || 0), typeof currentValue === "boolean" ? _renderBoolean : _renderPlain, 0, setter);
      funcParam && (pt.fp = funcParam);
      modifier && pt.modifier(modifier, this, target);
      return this._pt = pt;
    }

    !currentValue && !(prop in target) && _missingPlugin(prop, end);
    return _addComplexStringPropTween.call(this, target, prop, parsedStart, end, setter, stringFilter || _config.stringFilter, funcParam);
  }
},
    //creates a copy of the vars object and processes any function-based values (putting the resulting values directly into the copy) as well as strings with "random()" in them. It does NOT process relative values.
_processVars = function _processVars(vars, index, target, targets, tween) {
  _isFunction(vars) && (vars = _parseFuncOrString(vars, tween, index, target, targets));

  if (!_isObject(vars) || vars.style && vars.nodeType || _isArray(vars) || _isTypedArray(vars)) {
    return _isString(vars) ? _parseFuncOrString(vars, tween, index, target, targets) : vars;
  }

  var copy = {},
      p;

  for (p in vars) {
    copy[p] = _parseFuncOrString(vars[p], tween, index, target, targets);
  }

  return copy;
},
    _checkPlugin = function _checkPlugin(property, vars, tween, index, target, targets) {
  var plugin, pt, ptLookup, i;

  if (_plugins[property] && (plugin = new _plugins[property]()).init(target, plugin.rawVars ? vars[property] : _processVars(vars[property], index, target, targets, tween), tween, index, targets) !== false) {
    tween._pt = pt = new PropTween(tween._pt, target, property, 0, 1, plugin.render, plugin, 0, plugin.priority);

    if (tween !== _quickTween) {
      ptLookup = tween._ptLookup[tween._targets.indexOf(target)]; //note: we can't use tween._ptLookup[index] because for staggered tweens, the index from the fullTargets array won't match what it is in each individual tween that spawns from the stagger.

      i = plugin._props.length;

      while (i--) {
        ptLookup[plugin._props[i]] = pt;
      }
    }
  }

  return plugin;
},
    _overwritingTween,
    //store a reference temporarily so we can avoid overwriting itself.
_initTween = function _initTween(tween, time) {
  var vars = tween.vars,
      ease = vars.ease,
      startAt = vars.startAt,
      immediateRender = vars.immediateRender,
      lazy = vars.lazy,
      onUpdate = vars.onUpdate,
      onUpdateParams = vars.onUpdateParams,
      callbackScope = vars.callbackScope,
      runBackwards = vars.runBackwards,
      yoyoEase = vars.yoyoEase,
      keyframes = vars.keyframes,
      autoRevert = vars.autoRevert,
      dur = tween._dur,
      prevStartAt = tween._startAt,
      targets = tween._targets,
      parent = tween.parent,
      fullTargets = parent && parent.data === "nested" ? parent.parent._targets : targets,
      autoOverwrite = tween._overwrite === "auto",
      tl = tween.timeline,
      cleanVars,
      i,
      p,
      pt,
      target,
      hasPriority,
      gsData,
      harness,
      plugin,
      ptLookup,
      index,
      harnessVars,
      overwritten;
  tl && (!keyframes || !ease) && (ease = "none");
  tween._ease = _parseEase(ease, _defaults.ease);
  tween._yEase = yoyoEase ? _invertEase(_parseEase(yoyoEase === true ? ease : yoyoEase, _defaults.ease)) : 0;

  if (yoyoEase && tween._yoyo && !tween._repeat) {
    //there must have been a parent timeline with yoyo:true that is currently in its yoyo phase, so flip the eases.
    yoyoEase = tween._yEase;
    tween._yEase = tween._ease;
    tween._ease = yoyoEase;
  }

  if (!tl) {
    //if there's an internal timeline, skip all the parsing because we passed that task down the chain.
    harness = targets[0] ? _getCache(targets[0]).harness : 0;
    harnessVars = harness && vars[harness.prop]; //someone may need to specify CSS-specific values AND non-CSS values, like if the element has an "x" property plus it's a standard DOM element. We allow people to distinguish by wrapping plugin-specific stuff in a css:{} object for example.

    cleanVars = _copyExcluding(vars, _reservedProps);
    prevStartAt && prevStartAt.render(-1, true).kill();

    if (startAt) {
      _removeFromParent(tween._startAt = Tween.set(targets, _setDefaults({
        data: "isStart",
        overwrite: false,
        parent: parent,
        immediateRender: true,
        lazy: _isNotFalse(lazy),
        startAt: null,
        delay: 0,
        onUpdate: onUpdate,
        onUpdateParams: onUpdateParams,
        callbackScope: callbackScope,
        stagger: 0
      }, startAt))); //copy the properties/values into a new object to avoid collisions, like var to = {x:0}, from = {x:500}; timeline.fromTo(e, from, to).fromTo(e, to, from);


      if (immediateRender) {
        if (time > 0) {
          autoRevert || (tween._startAt = 0); //tweens that render immediately (like most from() and fromTo() tweens) shouldn't revert when their parent timeline's playhead goes backward past the startTime because the initial render could have happened anytime and it shouldn't be directly correlated to this tween's startTime. Imagine setting up a complex animation where the beginning states of various objects are rendered immediately but the tween doesn't happen for quite some time - if we revert to the starting values as soon as the playhead goes backward past the tween's startTime, it will throw things off visually. Reversion should only happen in Timeline instances where immediateRender was false or when autoRevert is explicitly set to true.
        } else if (dur && !(time < 0 && prevStartAt)) {
          time && (tween._zTime = time);
          return; //we skip initialization here so that overwriting doesn't occur until the tween actually begins. Otherwise, if you create several immediateRender:true tweens of the same target/properties to drop into a Timeline, the last one created would overwrite the first ones because they didn't get placed into the timeline yet before the first render occurs and kicks in overwriting.
        }
      }
    } else if (runBackwards && dur) {
      //from() tweens must be handled uniquely: their beginning values must be rendered but we don't want overwriting to occur yet (when time is still 0). Wait until the tween actually begins before doing all the routines like overwriting. At that time, we should render at the END of the tween to ensure that things initialize correctly (remember, from() tweens go backwards)
      if (prevStartAt) {
        !autoRevert && (tween._startAt = 0);
      } else {
        time && (immediateRender = false); //in rare cases (like if a from() tween runs and then is invalidate()-ed), immediateRender could be true but the initial forced-render gets skipped, so there's no need to force the render in this context when the _time is greater than 0

        p = _setDefaults({
          overwrite: false,
          data: "isFromStart",
          //we tag the tween with as "isFromStart" so that if [inside a plugin] we need to only do something at the very END of a tween, we have a way of identifying this tween as merely the one that's setting the beginning values for a "from()" tween. For example, clearProps in CSSPlugin should only get applied at the very END of a tween and without this tag, from(...{height:100, clearProps:"height", delay:1}) would wipe the height at the beginning of the tween and after 1 second, it'd kick back in.
          lazy: immediateRender && _isNotFalse(lazy),
          immediateRender: immediateRender,
          //zero-duration tweens render immediately by default, but if we're not specifically instructed to render this tween immediately, we should skip this and merely _init() to record the starting values (rendering them immediately would push them to completion which is wasteful in that case - we'd have to render(-1) immediately after)
          stagger: 0,
          parent: parent //ensures that nested tweens that had a stagger are handled properly, like gsap.from(".class", {y:gsap.utils.wrap([-100,100])})

        }, cleanVars);
        harnessVars && (p[harness.prop] = harnessVars); // in case someone does something like .from(..., {css:{}})

        _removeFromParent(tween._startAt = Tween.set(targets, p));

        if (!immediateRender) {
          _initTween(tween._startAt, _tinyNum); //ensures that the initial values are recorded

        } else if (!time) {
          return;
        }
      }
    }

    tween._pt = 0;
    lazy = dur && _isNotFalse(lazy) || lazy && !dur;

    for (i = 0; i < targets.length; i++) {
      target = targets[i];
      gsData = target._gsap || _harness(targets)[i]._gsap;
      tween._ptLookup[i] = ptLookup = {};
      _lazyLookup[gsData.id] && _lazyTweens.length && _lazyRender(); //if other tweens of the same target have recently initted but haven't rendered yet, we've got to force the render so that the starting values are correct (imagine populating a timeline with a bunch of sequential tweens and then jumping to the end)

      index = fullTargets === targets ? i : fullTargets.indexOf(target);

      if (harness && (plugin = new harness()).init(target, harnessVars || cleanVars, tween, index, fullTargets) !== false) {
        tween._pt = pt = new PropTween(tween._pt, target, plugin.name, 0, 1, plugin.render, plugin, 0, plugin.priority);

        plugin._props.forEach(function (name) {
          ptLookup[name] = pt;
        });

        plugin.priority && (hasPriority = 1);
      }

      if (!harness || harnessVars) {
        for (p in cleanVars) {
          if (_plugins[p] && (plugin = _checkPlugin(p, cleanVars, tween, index, target, fullTargets))) {
            plugin.priority && (hasPriority = 1);
          } else {
            ptLookup[p] = pt = _addPropTween.call(tween, target, p, "get", cleanVars[p], index, fullTargets, 0, vars.stringFilter);
          }
        }
      }

      tween._op && tween._op[i] && tween.kill(target, tween._op[i]);

      if (autoOverwrite && tween._pt) {
        _overwritingTween = tween;

        _globalTimeline.killTweensOf(target, ptLookup, tween.globalTime(0)); //Also make sure the overwriting doesn't overwrite THIS tween!!!


        overwritten = !tween.parent;
        _overwritingTween = 0;
      }

      tween._pt && lazy && (_lazyLookup[gsData.id] = 1);
    }

    hasPriority && _sortPropTweensByPriority(tween);
    tween._onInit && tween._onInit(tween); //plugins like RoundProps must wait until ALL of the PropTweens are instantiated. In the plugin's init() function, it sets the _onInit on the tween instance. May not be pretty/intuitive, but it's fast and keeps file size down.
  }

  tween._from = !tl && !!vars.runBackwards; //nested timelines should never run backwards - the backwards-ness is in the child tweens.

  tween._onUpdate = onUpdate;
  tween._initted = (!tween._op || tween._pt) && !overwritten; // if overwrittenProps resulted in the entire tween being killed, do NOT flag it as initted or else it may render for one tick.
},
    _addAliasesToVars = function _addAliasesToVars(targets, vars) {
  var harness = targets[0] ? _getCache(targets[0]).harness : 0,
      propertyAliases = harness && harness.aliases,
      copy,
      p,
      i,
      aliases;

  if (!propertyAliases) {
    return vars;
  }

  copy = _merge({}, vars);

  for (p in propertyAliases) {
    if (p in copy) {
      aliases = propertyAliases[p].split(",");
      i = aliases.length;

      while (i--) {
        copy[aliases[i]] = copy[p];
      }
    }
  }

  return copy;
},
    _parseFuncOrString = function _parseFuncOrString(value, tween, i, target, targets) {
  return _isFunction(value) ? value.call(tween, i, target, targets) : _isString(value) && ~value.indexOf("random(") ? _replaceRandom(value) : value;
},
    _staggerTweenProps = _callbackNames + "repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase",
    _staggerPropsToSkip = (_staggerTweenProps + ",id,stagger,delay,duration,paused,scrollTrigger").split(",");
/*
 * --------------------------------------------------------------------------------------
 * TWEEN
 * --------------------------------------------------------------------------------------
 */


exports._checkPlugin = _checkPlugin;

var Tween = /*#__PURE__*/function (_Animation2) {
  _inheritsLoose(Tween, _Animation2);

  function Tween(targets, vars, time, skipInherit) {
    var _this3;

    if (typeof vars === "number") {
      time.duration = vars;
      vars = time;
      time = null;
    }

    _this3 = _Animation2.call(this, skipInherit ? vars : _inheritDefaults(vars), time) || this;
    var _this3$vars = _this3.vars,
        duration = _this3$vars.duration,
        delay = _this3$vars.delay,
        immediateRender = _this3$vars.immediateRender,
        stagger = _this3$vars.stagger,
        overwrite = _this3$vars.overwrite,
        keyframes = _this3$vars.keyframes,
        defaults = _this3$vars.defaults,
        scrollTrigger = _this3$vars.scrollTrigger,
        yoyoEase = _this3$vars.yoyoEase,
        parent = _this3.parent,
        parsedTargets = (_isArray(targets) || _isTypedArray(targets) ? _isNumber(targets[0]) : "length" in vars) ? [targets] : toArray(targets),
        tl,
        i,
        copy,
        l,
        p,
        curTarget,
        staggerFunc,
        staggerVarsToMerge;
    _this3._targets = parsedTargets.length ? _harness(parsedTargets) : _warn("GSAP target " + targets + " not found. https://greensock.com", !_config.nullTargetWarn) || [];
    _this3._ptLookup = []; //PropTween lookup. An array containing an object for each target, having keys for each tweening property

    _this3._overwrite = overwrite;

    if (keyframes || stagger || _isFuncOrString(duration) || _isFuncOrString(delay)) {
      vars = _this3.vars;
      tl = _this3.timeline = new Timeline({
        data: "nested",
        defaults: defaults || {}
      });
      tl.kill();
      tl.parent = _assertThisInitialized(_this3);

      if (keyframes) {
        _setDefaults(tl.vars.defaults, {
          ease: "none"
        });

        keyframes.forEach(function (frame) {
          return tl.to(parsedTargets, frame, ">");
        });
      } else {
        l = parsedTargets.length;
        staggerFunc = stagger ? distribute(stagger) : _emptyFunc;

        if (_isObject(stagger)) {
          //users can pass in callbacks like onStart/onComplete in the stagger object. These should fire with each individual tween.
          for (p in stagger) {
            if (~_staggerTweenProps.indexOf(p)) {
              staggerVarsToMerge || (staggerVarsToMerge = {});
              staggerVarsToMerge[p] = stagger[p];
            }
          }
        }

        for (i = 0; i < l; i++) {
          copy = {};

          for (p in vars) {
            if (_staggerPropsToSkip.indexOf(p) < 0) {
              copy[p] = vars[p];
            }
          }

          copy.stagger = 0;
          yoyoEase && (copy.yoyoEase = yoyoEase);
          staggerVarsToMerge && _merge(copy, staggerVarsToMerge);
          curTarget = parsedTargets[i]; //don't just copy duration or delay because if they're a string or function, we'd end up in an infinite loop because _isFuncOrString() would evaluate as true in the child tweens, entering this loop, etc. So we parse the value straight from vars and default to 0.

          copy.duration = +_parseFuncOrString(duration, _assertThisInitialized(_this3), i, curTarget, parsedTargets);
          copy.delay = (+_parseFuncOrString(delay, _assertThisInitialized(_this3), i, curTarget, parsedTargets) || 0) - _this3._delay;

          if (!stagger && l === 1 && copy.delay) {
            // if someone does delay:"random(1, 5)", repeat:-1, for example, the delay shouldn't be inside the repeat.
            _this3._delay = delay = copy.delay;
            _this3._start += delay;
            copy.delay = 0;
          }

          tl.to(curTarget, copy, staggerFunc(i, curTarget, parsedTargets));
        }

        tl.duration() ? duration = delay = 0 : _this3.timeline = 0; // if the timeline's duration is 0, we don't need a timeline internally!
      }

      duration || _this3.duration(duration = tl.duration());
    } else {
      _this3.timeline = 0; //speed optimization, faster lookups (no going up the prototype chain)
    }

    if (overwrite === true) {
      _overwritingTween = _assertThisInitialized(_this3);

      _globalTimeline.killTweensOf(parsedTargets);

      _overwritingTween = 0;
    }

    parent && _postAddChecks(parent, _assertThisInitialized(_this3));

    if (immediateRender || !duration && !keyframes && _this3._start === _round(parent._time) && _isNotFalse(immediateRender) && _hasNoPausedAncestors(_assertThisInitialized(_this3)) && parent.data !== "nested") {
      _this3._tTime = -_tinyNum; //forces a render without having to set the render() "force" parameter to true because we want to allow lazying by default (using the "force" parameter always forces an immediate full render)

      _this3.render(Math.max(0, -delay)); //in case delay is negative

    }

    scrollTrigger && _scrollTrigger(_assertThisInitialized(_this3), scrollTrigger);
    return _this3;
  }

  var _proto3 = Tween.prototype;

  _proto3.render = function render(totalTime, suppressEvents, force) {
    var prevTime = this._time,
        tDur = this._tDur,
        dur = this._dur,
        tTime = totalTime > tDur - _tinyNum && totalTime >= 0 ? tDur : totalTime < _tinyNum ? 0 : totalTime,
        time,
        pt,
        iteration,
        cycleDuration,
        prevIteration,
        isYoyo,
        ratio,
        timeline,
        yoyoEase;

    if (!dur) {
      _renderZeroDurationTween(this, totalTime, suppressEvents, force);
    } else if (tTime !== this._tTime || !totalTime || force || this._startAt && this._zTime < 0 !== totalTime < 0) {
      //this senses if we're crossing over the start time, in which case we must record _zTime and force the render, but we do it in this lengthy conditional way for performance reasons (usually we can skip the calculations): this._initted && (this._zTime < 0) !== (totalTime < 0)
      time = tTime;
      timeline = this.timeline;

      if (this._repeat) {
        //adjust the time for repeats and yoyos
        cycleDuration = dur + this._rDelay;
        time = _round(tTime % cycleDuration); //round to avoid floating point errors. (4 % 0.8 should be 0 but some browsers report it as 0.79999999!)

        if (tTime === tDur) {
          // the tDur === tTime is for edge cases where there's a lengthy decimal on the duration and it may reach the very end but the time is rendered as not-quite-there (remember, tDur is rounded to 4 decimals whereas dur isn't)
          iteration = this._repeat;
          time = dur;
        } else {
          iteration = ~~(tTime / cycleDuration);

          if (iteration && iteration === tTime / cycleDuration) {
            time = dur;
            iteration--;
          }

          time > dur && (time = dur);
        }

        isYoyo = this._yoyo && iteration & 1;

        if (isYoyo) {
          yoyoEase = this._yEase;
          time = dur - time;
        }

        prevIteration = _animationCycle(this._tTime, cycleDuration);

        if (time === prevTime && !force && this._initted) {
          //could be during the repeatDelay part. No need to render and fire callbacks.
          return this;
        }

        if (iteration !== prevIteration) {
          timeline && this._yEase && _propagateYoyoEase(timeline, isYoyo); //repeatRefresh functionality

          if (this.vars.repeatRefresh && !isYoyo && !this._lock) {
            this._lock = force = 1; //force, otherwise if lazy is true, the _attemptInitTween() will return and we'll jump out and get caught bouncing on each tick.

            this.render(_round(cycleDuration * iteration), true).invalidate()._lock = 0;
          }
        }
      }

      if (!this._initted) {
        if (_attemptInitTween(this, totalTime < 0 ? totalTime : time, force, suppressEvents)) {
          this._tTime = 0; // in constructor if immediateRender is true, we set _tTime to -_tinyNum to have the playhead cross the starting point but we can't leave _tTime as a negative number.

          return this;
        }

        if (dur !== this._dur) {
          // while initting, a plugin like InertiaPlugin might alter the duration, so rerun from the start to ensure everything renders as it should.
          return this.render(totalTime, suppressEvents, force);
        }
      }

      this._tTime = tTime;
      this._time = time;

      if (!this._act && this._ts) {
        this._act = 1; //as long as it's not paused, force it to be active so that if the user renders independent of the parent timeline, it'll be forced to re-render on the next tick.

        this._lazy = 0;
      }

      this.ratio = ratio = (yoyoEase || this._ease)(time / dur);

      if (this._from) {
        this.ratio = ratio = 1 - ratio;
      }

      time && !prevTime && !suppressEvents && _callback(this, "onStart");
      pt = this._pt;

      while (pt) {
        pt.r(ratio, pt.d);
        pt = pt._next;
      }

      timeline && timeline.render(totalTime < 0 ? totalTime : !time && isYoyo ? -_tinyNum : timeline._dur * ratio, suppressEvents, force) || this._startAt && (this._zTime = totalTime);

      if (this._onUpdate && !suppressEvents) {
        totalTime < 0 && this._startAt && this._startAt.render(totalTime, true, force); //note: for performance reasons, we tuck this conditional logic inside less traveled areas (most tweens don't have an onUpdate). We'd just have it at the end before the onComplete, but the values should be updated before any onUpdate is called, so we ALSO put it here and then if it's not called, we do so later near the onComplete.

        _callback(this, "onUpdate");
      }

      this._repeat && iteration !== prevIteration && this.vars.onRepeat && !suppressEvents && this.parent && _callback(this, "onRepeat");

      if ((tTime === this._tDur || !tTime) && this._tTime === tTime) {
        totalTime < 0 && this._startAt && !this._onUpdate && this._startAt.render(totalTime, true, true);
        (totalTime || !dur) && (tTime === this._tDur && this._ts > 0 || !tTime && this._ts < 0) && _removeFromParent(this, 1); // don't remove if we're rendering at exactly a time of 0, as there could be autoRevert values that should get set on the next tick (if the playhead goes backward beyond the startTime, negative totalTime). Don't remove if the timeline is reversed and the playhead isn't at 0, otherwise tl.progress(1).reverse() won't work. Only remove if the playhead is at the end and timeScale is positive, or if the playhead is at 0 and the timeScale is negative.

        if (!suppressEvents && !(totalTime < 0 && !prevTime) && (tTime || prevTime)) {
          // if prevTime and tTime are zero, we shouldn't fire the onReverseComplete. This could happen if you gsap.to(... {paused:true}).play();
          _callback(this, tTime === tDur ? "onComplete" : "onReverseComplete", true);

          this._prom && !(tTime < tDur && this.timeScale() > 0) && this._prom();
        }
      }
    }

    return this;
  };

  _proto3.targets = function targets() {
    return this._targets;
  };

  _proto3.invalidate = function invalidate() {
    this._pt = this._op = this._startAt = this._onUpdate = this._act = this._lazy = 0;
    this._ptLookup = [];
    this.timeline && this.timeline.invalidate();
    return _Animation2.prototype.invalidate.call(this);
  };

  _proto3.kill = function kill(targets, vars) {
    if (vars === void 0) {
      vars = "all";
    }

    if (!targets && (!vars || vars === "all")) {
      this._lazy = 0;

      if (this.parent) {
        return _interrupt(this);
      }
    }

    if (this.timeline) {
      var tDur = this.timeline.totalDuration();
      this.timeline.killTweensOf(targets, vars, _overwritingTween && _overwritingTween.vars.overwrite !== true)._first || _interrupt(this); // if nothing is left tweenng, interrupt.

      this.parent && tDur !== this.timeline.totalDuration() && _setDuration(this, this._dur * this.timeline._tDur / tDur, 0, 1); // if a nested tween is killed that changes the duration, it should affect this tween's duration. We must use the ratio, though, because sometimes the internal timeline is stretched like for keyframes where they don't all add up to whatever the parent tween's duration was set to.

      return this;
    }

    var parsedTargets = this._targets,
        killingTargets = targets ? toArray(targets) : parsedTargets,
        propTweenLookup = this._ptLookup,
        firstPT = this._pt,
        overwrittenProps,
        curLookup,
        curOverwriteProps,
        props,
        p,
        pt,
        i;

    if ((!vars || vars === "all") && _arraysMatch(parsedTargets, killingTargets)) {
      vars === "all" && (this._pt = 0);
      return _interrupt(this);
    }

    overwrittenProps = this._op = this._op || [];

    if (vars !== "all") {
      //so people can pass in a comma-delimited list of property names
      if (_isString(vars)) {
        p = {};

        _forEachName(vars, function (name) {
          return p[name] = 1;
        });

        vars = p;
      }

      vars = _addAliasesToVars(parsedTargets, vars);
    }

    i = parsedTargets.length;

    while (i--) {
      if (~killingTargets.indexOf(parsedTargets[i])) {
        curLookup = propTweenLookup[i];

        if (vars === "all") {
          overwrittenProps[i] = vars;
          props = curLookup;
          curOverwriteProps = {};
        } else {
          curOverwriteProps = overwrittenProps[i] = overwrittenProps[i] || {};
          props = vars;
        }

        for (p in props) {
          pt = curLookup && curLookup[p];

          if (pt) {
            if (!("kill" in pt.d) || pt.d.kill(p) === true) {
              _removeLinkedListItem(this, pt, "_pt");
            }

            delete curLookup[p];
          }

          if (curOverwriteProps !== "all") {
            curOverwriteProps[p] = 1;
          }
        }
      }
    }

    this._initted && !this._pt && firstPT && _interrupt(this); //if all tweening properties are killed, kill the tween. Without this line, if there's a tween with multiple targets and then you killTweensOf() each target individually, the tween would technically still remain active and fire its onComplete even though there aren't any more properties tweening.

    return this;
  };

  Tween.to = function to(targets, vars) {
    return new Tween(targets, vars, arguments[2]);
  };

  Tween.from = function from(targets, vars) {
    return new Tween(targets, _parseVars(arguments, 1));
  };

  Tween.delayedCall = function delayedCall(delay, callback, params, scope) {
    return new Tween(callback, 0, {
      immediateRender: false,
      lazy: false,
      overwrite: false,
      delay: delay,
      onComplete: callback,
      onReverseComplete: callback,
      onCompleteParams: params,
      onReverseCompleteParams: params,
      callbackScope: scope
    });
  };

  Tween.fromTo = function fromTo(targets, fromVars, toVars) {
    return new Tween(targets, _parseVars(arguments, 2));
  };

  Tween.set = function set(targets, vars) {
    vars.duration = 0;
    vars.repeatDelay || (vars.repeat = 0);
    return new Tween(targets, vars);
  };

  Tween.killTweensOf = function killTweensOf(targets, props, onlyActive) {
    return _globalTimeline.killTweensOf(targets, props, onlyActive);
  };

  return Tween;
}(Animation);

exports.TweenLite = exports.TweenMax = exports.Tween = Tween;

_setDefaults(Tween.prototype, {
  _targets: [],
  _lazy: 0,
  _startAt: 0,
  _op: 0,
  _onInit: 0
}); //add the pertinent timeline methods to Tween instances so that users can chain conveniently and create a timeline automatically. (removed due to concerns that it'd ultimately add to more confusion especially for beginners)
// _forEachName("to,from,fromTo,set,call,add,addLabel,addPause", name => {
// 	Tween.prototype[name] = function() {
// 		let tl = new Timeline();
// 		return _addToTimeline(tl, this)[name].apply(tl, toArray(arguments));
// 	}
// });
//for backward compatibility. Leverage the timeline calls.


_forEachName("staggerTo,staggerFrom,staggerFromTo", function (name) {
  Tween[name] = function () {
    var tl = new Timeline(),
        params = _slice.call(arguments, 0);

    params.splice(name === "staggerFromTo" ? 5 : 4, 0, 0);
    return tl[name].apply(tl, params);
  };
});
/*
 * --------------------------------------------------------------------------------------
 * PROPTWEEN
 * --------------------------------------------------------------------------------------
 */


var _setterPlain = function _setterPlain(target, property, value) {
  return target[property] = value;
},
    _setterFunc = function _setterFunc(target, property, value) {
  return target[property](value);
},
    _setterFuncWithParam = function _setterFuncWithParam(target, property, value, data) {
  return target[property](data.fp, value);
},
    _setterAttribute = function _setterAttribute(target, property, value) {
  return target.setAttribute(property, value);
},
    _getSetter = function _getSetter(target, property) {
  return _isFunction(target[property]) ? _setterFunc : _isUndefined(target[property]) && target.setAttribute ? _setterAttribute : _setterPlain;
},
    _renderPlain = function _renderPlain(ratio, data) {
  return data.set(data.t, data.p, Math.round((data.s + data.c * ratio) * 10000) / 10000, data);
},
    _renderBoolean = function _renderBoolean(ratio, data) {
  return data.set(data.t, data.p, !!(data.s + data.c * ratio), data);
},
    _renderComplexString = function _renderComplexString(ratio, data) {
  var pt = data._pt,
      s = "";

  if (!ratio && data.b) {
    //b = beginning string
    s = data.b;
  } else if (ratio === 1 && data.e) {
    //e = ending string
    s = data.e;
  } else {
    while (pt) {
      s = pt.p + (pt.m ? pt.m(pt.s + pt.c * ratio) : Math.round((pt.s + pt.c * ratio) * 10000) / 10000) + s; //we use the "p" property for the text inbetween (like a suffix). And in the context of a complex string, the modifier (m) is typically just Math.round(), like for RGB colors.

      pt = pt._next;
    }

    s += data.c; //we use the "c" of the PropTween to store the final chunk of non-numeric text.
  }

  data.set(data.t, data.p, s, data);
},
    _renderPropTweens = function _renderPropTweens(ratio, data) {
  var pt = data._pt;

  while (pt) {
    pt.r(ratio, pt.d);
    pt = pt._next;
  }
},
    _addPluginModifier = function _addPluginModifier(modifier, tween, target, property) {
  var pt = this._pt,
      next;

  while (pt) {
    next = pt._next;
    pt.p === property && pt.modifier(modifier, tween, target);
    pt = next;
  }
},
    _killPropTweensOf = function _killPropTweensOf(property) {
  var pt = this._pt,
      hasNonDependentRemaining,
      next;

  while (pt) {
    next = pt._next;

    if (pt.p === property && !pt.op || pt.op === property) {
      _removeLinkedListItem(this, pt, "_pt");
    } else if (!pt.dep) {
      hasNonDependentRemaining = 1;
    }

    pt = next;
  }

  return !hasNonDependentRemaining;
},
    _setterWithModifier = function _setterWithModifier(target, property, value, data) {
  data.mSet(target, property, data.m.call(data.tween, value, data.mt), data);
},
    _sortPropTweensByPriority = function _sortPropTweensByPriority(parent) {
  var pt = parent._pt,
      next,
      pt2,
      first,
      last; //sorts the PropTween linked list in order of priority because some plugins need to do their work after ALL of the PropTweens were created (like RoundPropsPlugin and ModifiersPlugin)

  while (pt) {
    next = pt._next;
    pt2 = first;

    while (pt2 && pt2.pr > pt.pr) {
      pt2 = pt2._next;
    }

    if (pt._prev = pt2 ? pt2._prev : last) {
      pt._prev._next = pt;
    } else {
      first = pt;
    }

    if (pt._next = pt2) {
      pt2._prev = pt;
    } else {
      last = pt;
    }

    pt = next;
  }

  parent._pt = first;
}; //PropTween key: t = target, p = prop, r = renderer, d = data, s = start, c = change, op = overwriteProperty (ONLY populated when it's different than p), pr = priority, _next/_prev for the linked list siblings, set = setter, m = modifier, mSet = modifierSetter (the original setter, before a modifier was added)


exports._sortPropTweensByPriority = _sortPropTweensByPriority;
exports._renderComplexString = _renderComplexString;
exports._getSetter = _getSetter;

var PropTween = /*#__PURE__*/function () {
  function PropTween(next, target, prop, start, change, renderer, data, setter, priority) {
    this.t = target;
    this.s = start;
    this.c = change;
    this.p = prop;
    this.r = renderer || _renderPlain;
    this.d = data || this;
    this.set = setter || _setterPlain;
    this.pr = priority || 0;
    this._next = next;

    if (next) {
      next._prev = this;
    }
  }

  var _proto4 = PropTween.prototype;

  _proto4.modifier = function modifier(func, tween, target) {
    this.mSet = this.mSet || this.set; //in case it was already set (a PropTween can only have one modifier)

    this.set = _setterWithModifier;
    this.m = func;
    this.mt = target; //modifier target

    this.tween = tween;
  };

  return PropTween;
}(); //Initialization tasks


exports.PropTween = PropTween;

_forEachName(_callbackNames + "parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger", function (name) {
  return _reservedProps[name] = 1;
});

_globals.TweenMax = _globals.TweenLite = Tween;
_globals.TimelineLite = _globals.TimelineMax = Timeline;
_globalTimeline = new Timeline({
  sortChildren: false,
  defaults: _defaults,
  autoRemoveChildren: true,
  id: "root",
  smoothChildTiming: true
});
_config.stringFilter = _colorStringFilter;
/*
 * --------------------------------------------------------------------------------------
 * GSAP
 * --------------------------------------------------------------------------------------
 */

var _gsap = {
  registerPlugin: function registerPlugin() {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    args.forEach(function (config) {
      return _createPlugin(config);
    });
  },
  timeline: function timeline(vars) {
    return new Timeline(vars);
  },
  getTweensOf: function getTweensOf(targets, onlyActive) {
    return _globalTimeline.getTweensOf(targets, onlyActive);
  },
  getProperty: function getProperty(target, property, unit, uncache) {
    _isString(target) && (target = toArray(target)[0]); //in case selector text or an array is passed in

    var getter = _getCache(target || {}).get,
        format = unit ? _passThrough : _numericIfPossible;

    unit === "native" && (unit = "");
    return !target ? target : !property ? function (property, unit, uncache) {
      return format((_plugins[property] && _plugins[property].get || getter)(target, property, unit, uncache));
    } : format((_plugins[property] && _plugins[property].get || getter)(target, property, unit, uncache));
  },
  quickSetter: function quickSetter(target, property, unit) {
    target = toArray(target);

    if (target.length > 1) {
      var setters = target.map(function (t) {
        return gsap.quickSetter(t, property, unit);
      }),
          l = setters.length;
      return function (value) {
        var i = l;

        while (i--) {
          setters[i](value);
        }
      };
    }

    target = target[0] || {};

    var Plugin = _plugins[property],
        cache = _getCache(target),
        p = cache.harness && (cache.harness.aliases || {})[property] || property,
        // in case it's an alias, like "rotate" for "rotation".
    setter = Plugin ? function (value) {
      var p = new Plugin();
      _quickTween._pt = 0;
      p.init(target, unit ? value + unit : value, _quickTween, 0, [target]);
      p.render(1, p);
      _quickTween._pt && _renderPropTweens(1, _quickTween);
    } : cache.set(target, p);

    return Plugin ? setter : function (value) {
      return setter(target, p, unit ? value + unit : value, cache, 1);
    };
  },
  isTweening: function isTweening(targets) {
    return _globalTimeline.getTweensOf(targets, true).length > 0;
  },
  defaults: function defaults(value) {
    value && value.ease && (value.ease = _parseEase(value.ease, _defaults.ease));
    return _mergeDeep(_defaults, value || {});
  },
  config: function config(value) {
    return _mergeDeep(_config, value || {});
  },
  registerEffect: function registerEffect(_ref) {
    var name = _ref.name,
        effect = _ref.effect,
        plugins = _ref.plugins,
        defaults = _ref.defaults,
        extendTimeline = _ref.extendTimeline;
    (plugins || "").split(",").forEach(function (pluginName) {
      return pluginName && !_plugins[pluginName] && !_globals[pluginName] && _warn(name + " effect requires " + pluginName + " plugin.");
    });

    _effects[name] = function (targets, vars, tl) {
      return effect(toArray(targets), _setDefaults(vars || {}, defaults), tl);
    };

    if (extendTimeline) {
      Timeline.prototype[name] = function (targets, vars, position) {
        return this.add(_effects[name](targets, _isObject(vars) ? vars : (position = vars) && {}, this), position);
      };
    }
  },
  registerEase: function registerEase(name, ease) {
    _easeMap[name] = _parseEase(ease);
  },
  parseEase: function parseEase(ease, defaultEase) {
    return arguments.length ? _parseEase(ease, defaultEase) : _easeMap;
  },
  getById: function getById(id) {
    return _globalTimeline.getById(id);
  },
  exportRoot: function exportRoot(vars, includeDelayedCalls) {
    if (vars === void 0) {
      vars = {};
    }

    var tl = new Timeline(vars),
        child,
        next;
    tl.smoothChildTiming = _isNotFalse(vars.smoothChildTiming);

    _globalTimeline.remove(tl);

    tl._dp = 0; //otherwise it'll get re-activated when adding children and be re-introduced into _globalTimeline's linked list (then added to itself).

    tl._time = tl._tTime = _globalTimeline._time;
    child = _globalTimeline._first;

    while (child) {
      next = child._next;

      if (includeDelayedCalls || !(!child._dur && child instanceof Tween && child.vars.onComplete === child._targets[0])) {
        _addToTimeline(tl, child, child._start - child._delay);
      }

      child = next;
    }

    _addToTimeline(_globalTimeline, tl, 0);

    return tl;
  },
  utils: {
    wrap: wrap,
    wrapYoyo: wrapYoyo,
    distribute: distribute,
    random: random,
    snap: snap,
    normalize: normalize,
    getUnit: getUnit,
    clamp: clamp,
    splitColor: splitColor,
    toArray: toArray,
    mapRange: mapRange,
    pipe: pipe,
    unitize: unitize,
    interpolate: interpolate,
    shuffle: shuffle
  },
  install: _install,
  effects: _effects,
  ticker: _ticker,
  updateRoot: Timeline.updateRoot,
  plugins: _plugins,
  globalTimeline: _globalTimeline,
  core: {
    PropTween: PropTween,
    globals: _addGlobal,
    Tween: Tween,
    Timeline: Timeline,
    Animation: Animation,
    getCache: _getCache,
    _removeLinkedListItem: _removeLinkedListItem
  }
};

_forEachName("to,from,fromTo,delayedCall,set,killTweensOf", function (name) {
  return _gsap[name] = Tween[name];
});

_ticker.add(Timeline.updateRoot);

_quickTween = _gsap.to({}, {
  duration: 0
}); // ---- EXTRA PLUGINS --------------------------------------------------------

var _getPluginPropTween = function _getPluginPropTween(plugin, prop) {
  var pt = plugin._pt;

  while (pt && pt.p !== prop && pt.op !== prop && pt.fp !== prop) {
    pt = pt._next;
  }

  return pt;
},
    _addModifiers = function _addModifiers(tween, modifiers) {
  var targets = tween._targets,
      p,
      i,
      pt;

  for (p in modifiers) {
    i = targets.length;

    while (i--) {
      pt = tween._ptLookup[i][p];

      if (pt && (pt = pt.d)) {
        if (pt._pt) {
          // is a plugin
          pt = _getPluginPropTween(pt, p);
        }

        pt && pt.modifier && pt.modifier(modifiers[p], tween, targets[i], p);
      }
    }
  }
},
    _buildModifierPlugin = function _buildModifierPlugin(name, modifier) {
  return {
    name: name,
    rawVars: 1,
    //don't pre-process function-based values or "random()" strings.
    init: function init(target, vars, tween) {
      tween._onInit = function (tween) {
        var temp, p;

        if (_isString(vars)) {
          temp = {};

          _forEachName(vars, function (name) {
            return temp[name] = 1;
          }); //if the user passes in a comma-delimited list of property names to roundProps, like "x,y", we round to whole numbers.


          vars = temp;
        }

        if (modifier) {
          temp = {};

          for (p in vars) {
            temp[p] = modifier(vars[p]);
          }

          vars = temp;
        }

        _addModifiers(tween, vars);
      };
    }
  };
}; //register core plugins


var gsap = _gsap.registerPlugin({
  name: "attr",
  init: function init(target, vars, tween, index, targets) {
    var p, pt;

    for (p in vars) {
      pt = this.add(target, "setAttribute", (target.getAttribute(p) || 0) + "", vars[p], index, targets, 0, 0, p);
      pt && (pt.op = p);

      this._props.push(p);
    }
  }
}, {
  name: "endArray",
  init: function init(target, value) {
    var i = value.length;

    while (i--) {
      this.add(target, i, target[i] || 0, value[i]);
    }
  }
}, _buildModifierPlugin("roundProps", _roundModifier), _buildModifierPlugin("modifiers"), _buildModifierPlugin("snap", snap)) || _gsap; //to prevent the core plugins from being dropped via aggressive tree shaking, we must include them in the variable declaration in this way.


exports.default = exports.gsap = gsap;
Tween.version = Timeline.version = gsap.version = "3.5.1";
_coreReady = 1;

if (_windowExists()) {
  _wake();
}

var Power0 = _easeMap.Power0,
    Power1 = _easeMap.Power1,
    Power2 = _easeMap.Power2,
    Power3 = _easeMap.Power3,
    Power4 = _easeMap.Power4,
    Linear = _easeMap.Linear,
    Quad = _easeMap.Quad,
    Cubic = _easeMap.Cubic,
    Quart = _easeMap.Quart,
    Quint = _easeMap.Quint,
    Strong = _easeMap.Strong,
    Elastic = _easeMap.Elastic,
    Back = _easeMap.Back,
    SteppedEase = _easeMap.SteppedEase,
    Bounce = _easeMap.Bounce,
    Sine = _easeMap.Sine,
    Expo = _easeMap.Expo,
    Circ = _easeMap.Circ;
exports.Circ = Circ;
exports.Expo = Expo;
exports.Sine = Sine;
exports.Bounce = Bounce;
exports.SteppedEase = SteppedEase;
exports.Back = Back;
exports.Elastic = Elastic;
exports.Strong = Strong;
exports.Quint = Quint;
exports.Quart = Quart;
exports.Cubic = Cubic;
exports.Quad = Quad;
exports.Linear = Linear;
exports.Power4 = Power4;
exports.Power3 = Power3;
exports.Power2 = Power2;
exports.Power1 = Power1;
exports.Power0 = Power0;
},{}],"KE4Q":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkPrefix = exports._createElement = exports._getBBox = exports.default = exports.CSSPlugin = void 0;

var _gsapCore = require("./gsap-core.js");

/*!
 * CSSPlugin 3.5.1
 * https://greensock.com
 *
 * Copyright 2008-2020, GreenSock. All rights reserved.
 * Subject to the terms at https://greensock.com/standard-license or for
 * Club GreenSock members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
*/

/* eslint-disable */
var _win,
    _doc,
    _docElement,
    _pluginInitted,
    _tempDiv,
    _tempDivStyler,
    _recentSetterPlugin,
    _windowExists = function _windowExists() {
  return typeof window !== "undefined";
},
    _transformProps = {},
    _RAD2DEG = 180 / Math.PI,
    _DEG2RAD = Math.PI / 180,
    _atan2 = Math.atan2,
    _bigNum = 1e8,
    _capsExp = /([A-Z])/g,
    _horizontalExp = /(?:left|right|width|margin|padding|x)/i,
    _complexExp = /[\s,\(]\S/,
    _propertyAliases = {
  autoAlpha: "opacity,visibility",
  scale: "scaleX,scaleY",
  alpha: "opacity"
},
    _renderCSSProp = function _renderCSSProp(ratio, data) {
  return data.set(data.t, data.p, Math.round((data.s + data.c * ratio) * 10000) / 10000 + data.u, data);
},
    _renderPropWithEnd = function _renderPropWithEnd(ratio, data) {
  return data.set(data.t, data.p, ratio === 1 ? data.e : Math.round((data.s + data.c * ratio) * 10000) / 10000 + data.u, data);
},
    _renderCSSPropWithBeginning = function _renderCSSPropWithBeginning(ratio, data) {
  return data.set(data.t, data.p, ratio ? Math.round((data.s + data.c * ratio) * 10000) / 10000 + data.u : data.b, data);
},
    //if units change, we need a way to render the original unit/value when the tween goes all the way back to the beginning (ratio:0)
_renderRoundedCSSProp = function _renderRoundedCSSProp(ratio, data) {
  var value = data.s + data.c * ratio;
  data.set(data.t, data.p, ~~(value + (value < 0 ? -.5 : .5)) + data.u, data);
},
    _renderNonTweeningValue = function _renderNonTweeningValue(ratio, data) {
  return data.set(data.t, data.p, ratio ? data.e : data.b, data);
},
    _renderNonTweeningValueOnlyAtEnd = function _renderNonTweeningValueOnlyAtEnd(ratio, data) {
  return data.set(data.t, data.p, ratio !== 1 ? data.b : data.e, data);
},
    _setterCSSStyle = function _setterCSSStyle(target, property, value) {
  return target.style[property] = value;
},
    _setterCSSProp = function _setterCSSProp(target, property, value) {
  return target.style.setProperty(property, value);
},
    _setterTransform = function _setterTransform(target, property, value) {
  return target._gsap[property] = value;
},
    _setterScale = function _setterScale(target, property, value) {
  return target._gsap.scaleX = target._gsap.scaleY = value;
},
    _setterScaleWithRender = function _setterScaleWithRender(target, property, value, data, ratio) {
  var cache = target._gsap;
  cache.scaleX = cache.scaleY = value;
  cache.renderTransform(ratio, cache);
},
    _setterTransformWithRender = function _setterTransformWithRender(target, property, value, data, ratio) {
  var cache = target._gsap;
  cache[property] = value;
  cache.renderTransform(ratio, cache);
},
    _transformProp = "transform",
    _transformOriginProp = _transformProp + "Origin",
    _supports3D,
    _createElement = function _createElement(type, ns) {
  var e = _doc.createElementNS ? _doc.createElementNS((ns || "http://www.w3.org/1999/xhtml").replace(/^https/, "http"), type) : _doc.createElement(type); //some servers swap in https for http in the namespace which can break things, making "style" inaccessible.

  return e.style ? e : _doc.createElement(type); //some environments won't allow access to the element's style when created with a namespace in which case we default to the standard createElement() to work around the issue. Also note that when GSAP is embedded directly inside an SVG file, createElement() won't allow access to the style object in Firefox (see https://greensock.com/forums/topic/20215-problem-using-tweenmax-in-standalone-self-containing-svg-file-err-cannot-set-property-csstext-of-undefined/).
},
    _getComputedProperty = function _getComputedProperty(target, property, skipPrefixFallback) {
  var cs = getComputedStyle(target);
  return cs[property] || cs.getPropertyValue(property.replace(_capsExp, "-$1").toLowerCase()) || cs.getPropertyValue(property) || !skipPrefixFallback && _getComputedProperty(target, _checkPropPrefix(property) || property, 1) || ""; //css variables may not need caps swapped out for dashes and lowercase.
},
    _prefixes = "O,Moz,ms,Ms,Webkit".split(","),
    _checkPropPrefix = function _checkPropPrefix(property, element, preferPrefix) {
  var e = element || _tempDiv,
      s = e.style,
      i = 5;

  if (property in s && !preferPrefix) {
    return property;
  }

  property = property.charAt(0).toUpperCase() + property.substr(1);

  while (i-- && !(_prefixes[i] + property in s)) {}

  return i < 0 ? null : (i === 3 ? "ms" : i >= 0 ? _prefixes[i] : "") + property;
},
    _initCore = function _initCore() {
  if (_windowExists() && window.document) {
    _win = window;
    _doc = _win.document;
    _docElement = _doc.documentElement;
    _tempDiv = _createElement("div") || {
      style: {}
    };
    _tempDivStyler = _createElement("div");
    _transformProp = _checkPropPrefix(_transformProp);
    _transformOriginProp = _transformProp + "Origin";
    _tempDiv.style.cssText = "border-width:0;line-height:0;position:absolute;padding:0"; //make sure to override certain properties that may contaminate measurements, in case the user has overreaching style sheets.

    _supports3D = !!_checkPropPrefix("perspective");
    _pluginInitted = 1;
  }
},
    _getBBoxHack = function _getBBoxHack(swapIfPossible) {
  //works around issues in some browsers (like Firefox) that don't correctly report getBBox() on SVG elements inside a <defs> element and/or <mask>. We try creating an SVG, adding it to the documentElement and toss the element in there so that it's definitely part of the rendering tree, then grab the bbox and if it works, we actually swap out the original getBBox() method for our own that does these extra steps whenever getBBox is needed. This helps ensure that performance is optimal (only do all these extra steps when absolutely necessary...most elements don't need it).
  var svg = _createElement("svg", this.ownerSVGElement && this.ownerSVGElement.getAttribute("xmlns") || "http://www.w3.org/2000/svg"),
      oldParent = this.parentNode,
      oldSibling = this.nextSibling,
      oldCSS = this.style.cssText,
      bbox;

  _docElement.appendChild(svg);

  svg.appendChild(this);
  this.style.display = "block";

  if (swapIfPossible) {
    try {
      bbox = this.getBBox();
      this._gsapBBox = this.getBBox; //store the original

      this.getBBox = _getBBoxHack;
    } catch (e) {}
  } else if (this._gsapBBox) {
    bbox = this._gsapBBox();
  }

  if (oldParent) {
    if (oldSibling) {
      oldParent.insertBefore(this, oldSibling);
    } else {
      oldParent.appendChild(this);
    }
  }

  _docElement.removeChild(svg);

  this.style.cssText = oldCSS;
  return bbox;
},
    _getAttributeFallbacks = function _getAttributeFallbacks(target, attributesArray) {
  var i = attributesArray.length;

  while (i--) {
    if (target.hasAttribute(attributesArray[i])) {
      return target.getAttribute(attributesArray[i]);
    }
  }
},
    _getBBox = function _getBBox(target) {
  var bounds;

  try {
    bounds = target.getBBox(); //Firefox throws errors if you try calling getBBox() on an SVG element that's not rendered (like in a <symbol> or <defs>). https://bugzilla.mozilla.org/show_bug.cgi?id=612118
  } catch (error) {
    bounds = _getBBoxHack.call(target, true);
  }

  bounds && (bounds.width || bounds.height) || target.getBBox === _getBBoxHack || (bounds = _getBBoxHack.call(target, true)); //some browsers (like Firefox) misreport the bounds if the element has zero width and height (it just assumes it's at x:0, y:0), thus we need to manually grab the position in that case.

  return bounds && !bounds.width && !bounds.x && !bounds.y ? {
    x: +_getAttributeFallbacks(target, ["x", "cx", "x1"]) || 0,
    y: +_getAttributeFallbacks(target, ["y", "cy", "y1"]) || 0,
    width: 0,
    height: 0
  } : bounds;
},
    _isSVG = function _isSVG(e) {
  return !!(e.getCTM && (!e.parentNode || e.ownerSVGElement) && _getBBox(e));
},
    //reports if the element is an SVG on which getBBox() actually works
_removeProperty = function _removeProperty(target, property) {
  if (property) {
    var style = target.style;

    if (property in _transformProps && property !== _transformOriginProp) {
      property = _transformProp;
    }

    if (style.removeProperty) {
      if (property.substr(0, 2) === "ms" || property.substr(0, 6) === "webkit") {
        //Microsoft and some Webkit browsers don't conform to the standard of capitalizing the first prefix character, so we adjust so that when we prefix the caps with a dash, it's correct (otherwise it'd be "ms-transform" instead of "-ms-transform" for IE9, for example)
        property = "-" + property;
      }

      style.removeProperty(property.replace(_capsExp, "-$1").toLowerCase());
    } else {
      //note: old versions of IE use "removeAttribute()" instead of "removeProperty()"
      style.removeAttribute(property);
    }
  }
},
    _addNonTweeningPT = function _addNonTweeningPT(plugin, target, property, beginning, end, onlySetAtEnd) {
  var pt = new _gsapCore.PropTween(plugin._pt, target, property, 0, 1, onlySetAtEnd ? _renderNonTweeningValueOnlyAtEnd : _renderNonTweeningValue);
  plugin._pt = pt;
  pt.b = beginning;
  pt.e = end;

  plugin._props.push(property);

  return pt;
},
    _nonConvertibleUnits = {
  deg: 1,
  rad: 1,
  turn: 1
},
    //takes a single value like 20px and converts it to the unit specified, like "%", returning only the numeric amount.
_convertToUnit = function _convertToUnit(target, property, value, unit) {
  var curValue = parseFloat(value) || 0,
      curUnit = (value + "").trim().substr((curValue + "").length) || "px",
      // some browsers leave extra whitespace at the beginning of CSS variables, hence the need to trim()
  style = _tempDiv.style,
      horizontal = _horizontalExp.test(property),
      isRootSVG = target.tagName.toLowerCase() === "svg",
      measureProperty = (isRootSVG ? "client" : "offset") + (horizontal ? "Width" : "Height"),
      amount = 100,
      toPixels = unit === "px",
      toPercent = unit === "%",
      px,
      parent,
      cache,
      isSVG;

  if (unit === curUnit || !curValue || _nonConvertibleUnits[unit] || _nonConvertibleUnits[curUnit]) {
    return curValue;
  }

  curUnit !== "px" && !toPixels && (curValue = _convertToUnit(target, property, value, "px"));
  isSVG = target.getCTM && _isSVG(target);

  if (toPercent && (_transformProps[property] || ~property.indexOf("adius"))) {
    //transforms and borderRadius are relative to the size of the element itself!
    return (0, _gsapCore._round)(curValue / (isSVG ? target.getBBox()[horizontal ? "width" : "height"] : target[measureProperty]) * amount);
  }

  style[horizontal ? "width" : "height"] = amount + (toPixels ? curUnit : unit);
  parent = ~property.indexOf("adius") || unit === "em" && target.appendChild && !isRootSVG ? target : target.parentNode;

  if (isSVG) {
    parent = (target.ownerSVGElement || {}).parentNode;
  }

  if (!parent || parent === _doc || !parent.appendChild) {
    parent = _doc.body;
  }

  cache = parent._gsap;

  if (cache && toPercent && cache.width && horizontal && cache.time === _gsapCore._ticker.time) {
    return (0, _gsapCore._round)(curValue / cache.width * amount);
  } else {
    (toPercent || curUnit === "%") && (style.position = _getComputedProperty(target, "position"));
    parent === target && (style.position = "static"); // like for borderRadius, if it's a % we must have it relative to the target itself but that may not have position: relative or position: absolute in which case it'd go up the chain until it finds its offsetParent (bad). position: static protects against that.

    parent.appendChild(_tempDiv);
    px = _tempDiv[measureProperty];
    parent.removeChild(_tempDiv);
    style.position = "absolute";

    if (horizontal && toPercent) {
      cache = (0, _gsapCore._getCache)(parent);
      cache.time = _gsapCore._ticker.time;
      cache.width = parent[measureProperty];
    }
  }

  return (0, _gsapCore._round)(toPixels ? px * curValue / amount : px && curValue ? amount / px * curValue : 0);
},
    _get = function _get(target, property, unit, uncache) {
  var value;
  _pluginInitted || _initCore();

  if (property in _propertyAliases && property !== "transform") {
    property = _propertyAliases[property];

    if (~property.indexOf(",")) {
      property = property.split(",")[0];
    }
  }

  if (_transformProps[property] && property !== "transform") {
    value = _parseTransform(target, uncache);
    value = property !== "transformOrigin" ? value[property] : _firstTwoOnly(_getComputedProperty(target, _transformOriginProp)) + " " + value.zOrigin + "px";
  } else {
    value = target.style[property];

    if (!value || value === "auto" || uncache || ~(value + "").indexOf("calc(")) {
      value = _specialProps[property] && _specialProps[property](target, property, unit) || _getComputedProperty(target, property) || (0, _gsapCore._getProperty)(target, property) || (property === "opacity" ? 1 : 0); // note: some browsers, like Firefox, don't report borderRadius correctly! Instead, it only reports every corner like  borderTopLeftRadius
    }
  }

  return unit && !~(value + "").indexOf(" ") ? _convertToUnit(target, property, value, unit) + unit : value;
},
    _tweenComplexCSSString = function _tweenComplexCSSString(target, prop, start, end) {
  //note: we call _tweenComplexCSSString.call(pluginInstance...) to ensure that it's scoped properly. We may call it from within a plugin too, thus "this" would refer to the plugin.
  if (!start || start === "none") {
    // some browsers like Safari actually PREFER the prefixed property and mis-report the unprefixed value like clipPath (BUG). In other words, even though clipPath exists in the style ("clipPath" in target.style) and it's set in the CSS properly (along with -webkit-clip-path), Safari reports clipPath as "none" whereas WebkitClipPath reports accurately like "ellipse(100% 0% at 50% 0%)", so in this case we must SWITCH to using the prefixed property instead. See https://greensock.com/forums/topic/18310-clippath-doesnt-work-on-ios/
    var p = _checkPropPrefix(prop, target, 1),
        s = p && _getComputedProperty(target, p, 1);

    if (s && s !== start) {
      prop = p;
      start = s;
    } else if (prop === "borderColor") {
      start = _getComputedProperty(target, "borderTopColor"); // Firefox bug: always reports "borderColor" as "", so we must fall back to borderTopColor. See https://greensock.com/forums/topic/24583-how-to-return-colors-that-i-had-after-reverse/
    }
  }

  var pt = new _gsapCore.PropTween(this._pt, target.style, prop, 0, 1, _gsapCore._renderComplexString),
      index = 0,
      matchIndex = 0,
      a,
      result,
      startValues,
      startNum,
      color,
      startValue,
      endValue,
      endNum,
      chunk,
      endUnit,
      startUnit,
      relative,
      endValues;
  pt.b = start;
  pt.e = end;
  start += ""; //ensure values are strings

  end += "";

  if (end === "auto") {
    target.style[prop] = end;
    end = _getComputedProperty(target, prop) || end;
    target.style[prop] = start;
  }

  a = [start, end];
  (0, _gsapCore._colorStringFilter)(a); //pass an array with the starting and ending values and let the filter do whatever it needs to the values. If colors are found, it returns true and then we must match where the color shows up order-wise because for things like boxShadow, sometimes the browser provides the computed values with the color FIRST, but the user provides it with the color LAST, so flip them if necessary. Same for drop-shadow().

  start = a[0];
  end = a[1];
  startValues = start.match(_gsapCore._numWithUnitExp) || [];
  endValues = end.match(_gsapCore._numWithUnitExp) || [];

  if (endValues.length) {
    while (result = _gsapCore._numWithUnitExp.exec(end)) {
      endValue = result[0];
      chunk = end.substring(index, result.index);

      if (color) {
        color = (color + 1) % 5;
      } else if (chunk.substr(-5) === "rgba(" || chunk.substr(-5) === "hsla(") {
        color = 1;
      }

      if (endValue !== (startValue = startValues[matchIndex++] || "")) {
        startNum = parseFloat(startValue) || 0;
        startUnit = startValue.substr((startNum + "").length);
        relative = endValue.charAt(1) === "=" ? +(endValue.charAt(0) + "1") : 0;

        if (relative) {
          endValue = endValue.substr(2);
        }

        endNum = parseFloat(endValue);
        endUnit = endValue.substr((endNum + "").length);
        index = _gsapCore._numWithUnitExp.lastIndex - endUnit.length;

        if (!endUnit) {
          //if something like "perspective:300" is passed in and we must add a unit to the end
          endUnit = endUnit || _gsapCore._config.units[prop] || startUnit;

          if (index === end.length) {
            end += endUnit;
            pt.e += endUnit;
          }
        }

        if (startUnit !== endUnit) {
          startNum = _convertToUnit(target, prop, startValue, endUnit) || 0;
        } //these nested PropTweens are handled in a special way - we'll never actually call a render or setter method on them. We'll just loop through them in the parent complex string PropTween's render method.


        pt._pt = {
          _next: pt._pt,
          p: chunk || matchIndex === 1 ? chunk : ",",
          //note: SVG spec allows omission of comma/space when a negative sign is wedged between two numbers, like 2.5-5.3 instead of 2.5,-5.3 but when tweening, the negative value may switch to positive, so we insert the comma just in case.
          s: startNum,
          c: relative ? relative * endNum : endNum - startNum,
          m: color && color < 4 ? Math.round : 0
        };
      }
    }

    pt.c = index < end.length ? end.substring(index, end.length) : ""; //we use the "c" of the PropTween to store the final part of the string (after the last number)
  } else {
    pt.r = prop === "display" && end === "none" ? _renderNonTweeningValueOnlyAtEnd : _renderNonTweeningValue;
  }

  if (_gsapCore._relExp.test(end)) {
    pt.e = 0; //if the end string contains relative values or dynamic random(...) values, delete the end it so that on the final render we don't actually set it to the string with += or -= characters (forces it to use the calculated value).
  }

  this._pt = pt; //start the linked list with this new PropTween. Remember, we call _tweenComplexCSSString.call(pluginInstance...) to ensure that it's scoped properly. We may call it from within another plugin too, thus "this" would refer to the plugin.

  return pt;
},
    _keywordToPercent = {
  top: "0%",
  bottom: "100%",
  left: "0%",
  right: "100%",
  center: "50%"
},
    _convertKeywordsToPercentages = function _convertKeywordsToPercentages(value) {
  var split = value.split(" "),
      x = split[0],
      y = split[1] || "50%";

  if (x === "top" || x === "bottom" || y === "left" || y === "right") {
    //the user provided them in the wrong order, so flip them
    value = x;
    x = y;
    y = value;
  }

  split[0] = _keywordToPercent[x] || x;
  split[1] = _keywordToPercent[y] || y;
  return split.join(" ");
},
    _renderClearProps = function _renderClearProps(ratio, data) {
  if (data.tween && data.tween._time === data.tween._dur) {
    var target = data.t,
        style = target.style,
        props = data.u,
        cache = target._gsap,
        prop,
        clearTransforms,
        i;

    if (props === "all" || props === true) {
      style.cssText = "";
      clearTransforms = 1;
    } else {
      props = props.split(",");
      i = props.length;

      while (--i > -1) {
        prop = props[i];

        if (_transformProps[prop]) {
          clearTransforms = 1;
          prop = prop === "transformOrigin" ? _transformOriginProp : _transformProp;
        }

        _removeProperty(target, prop);
      }
    }

    if (clearTransforms) {
      _removeProperty(target, _transformProp);

      if (cache) {
        cache.svg && target.removeAttribute("transform");

        _parseTransform(target, 1); // force all the cached values back to "normal"/identity, otherwise if there's another tween that's already set to render transforms on this element, it could display the wrong values.


        cache.uncache = 1;
      }
    }
  }
},
    // note: specialProps should return 1 if (and only if) they have a non-zero priority. It indicates we need to sort the linked list.
_specialProps = {
  clearProps: function clearProps(plugin, target, property, endValue, tween) {
    if (tween.data !== "isFromStart") {
      var pt = plugin._pt = new _gsapCore.PropTween(plugin._pt, target, property, 0, 0, _renderClearProps);
      pt.u = endValue;
      pt.pr = -10;
      pt.tween = tween;

      plugin._props.push(property);

      return 1;
    }
  }
  /* className feature (about 0.4kb gzipped).
  , className(plugin, target, property, endValue, tween) {
  	let _renderClassName = (ratio, data) => {
  			data.css.render(ratio, data.css);
  			if (!ratio || ratio === 1) {
  				let inline = data.rmv,
  					target = data.t,
  					p;
  				target.setAttribute("class", ratio ? data.e : data.b);
  				for (p in inline) {
  					_removeProperty(target, p);
  				}
  			}
  		},
  		_getAllStyles = (target) => {
  			let styles = {},
  				computed = getComputedStyle(target),
  				p;
  			for (p in computed) {
  				if (isNaN(p) && p !== "cssText" && p !== "length") {
  					styles[p] = computed[p];
  				}
  			}
  			_setDefaults(styles, _parseTransform(target, 1));
  			return styles;
  		},
  		startClassList = target.getAttribute("class"),
  		style = target.style,
  		cssText = style.cssText,
  		cache = target._gsap,
  		classPT = cache.classPT,
  		inlineToRemoveAtEnd = {},
  		data = {t:target, plugin:plugin, rmv:inlineToRemoveAtEnd, b:startClassList, e:(endValue.charAt(1) !== "=") ? endValue : startClassList.replace(new RegExp("(?:\\s|^)" + endValue.substr(2) + "(?![\\w-])"), "") + ((endValue.charAt(0) === "+") ? " " + endValue.substr(2) : "")},
  		changingVars = {},
  		startVars = _getAllStyles(target),
  		transformRelated = /(transform|perspective)/i,
  		endVars, p;
  	if (classPT) {
  		classPT.r(1, classPT.d);
  		_removeLinkedListItem(classPT.d.plugin, classPT, "_pt");
  	}
  	target.setAttribute("class", data.e);
  	endVars = _getAllStyles(target, true);
  	target.setAttribute("class", startClassList);
  	for (p in endVars) {
  		if (endVars[p] !== startVars[p] && !transformRelated.test(p)) {
  			changingVars[p] = endVars[p];
  			if (!style[p] && style[p] !== "0") {
  				inlineToRemoveAtEnd[p] = 1;
  			}
  		}
  	}
  	cache.classPT = plugin._pt = new PropTween(plugin._pt, target, "className", 0, 0, _renderClassName, data, 0, -11);
  	if (style.cssText !== cssText) { //only apply if things change. Otherwise, in cases like a background-image that's pulled dynamically, it could cause a refresh. See https://greensock.com/forums/topic/20368-possible-gsap-bug-switching-classnames-in-chrome/.
  		style.cssText = cssText; //we recorded cssText before we swapped classes and ran _getAllStyles() because in cases when a className tween is overwritten, we remove all the related tweening properties from that class change (otherwise class-specific stuff can't override properties we've directly set on the target's style object due to specificity).
  	}
  	_parseTransform(target, true); //to clear the caching of transforms
  	data.css = new gsap.plugins.css();
  	data.css.init(target, changingVars, tween);
  	plugin._props.push(...data.css._props);
  	return 1;
  }
  */

},

/*
 * --------------------------------------------------------------------------------------
 * TRANSFORMS
 * --------------------------------------------------------------------------------------
 */
_identity2DMatrix = [1, 0, 0, 1, 0, 0],
    _rotationalProperties = {},
    _isNullTransform = function _isNullTransform(value) {
  return value === "matrix(1, 0, 0, 1, 0, 0)" || value === "none" || !value;
},
    _getComputedTransformMatrixAsArray = function _getComputedTransformMatrixAsArray(target) {
  var matrixString = _getComputedProperty(target, _transformProp);

  return _isNullTransform(matrixString) ? _identity2DMatrix : matrixString.substr(7).match(_gsapCore._numExp).map(_gsapCore._round);
},
    _getMatrix = function _getMatrix(target, force2D) {
  var cache = target._gsap || (0, _gsapCore._getCache)(target),
      style = target.style,
      matrix = _getComputedTransformMatrixAsArray(target),
      parent,
      nextSibling,
      temp,
      addedToDOM;

  if (cache.svg && target.getAttribute("transform")) {
    temp = target.transform.baseVal.consolidate().matrix; //ensures that even complex values like "translate(50,60) rotate(135,0,0)" are parsed because it mashes it into a matrix.

    matrix = [temp.a, temp.b, temp.c, temp.d, temp.e, temp.f];
    return matrix.join(",") === "1,0,0,1,0,0" ? _identity2DMatrix : matrix;
  } else if (matrix === _identity2DMatrix && !target.offsetParent && target !== _docElement && !cache.svg) {
    //note: if offsetParent is null, that means the element isn't in the normal document flow, like if it has display:none or one of its ancestors has display:none). Firefox returns null for getComputedStyle() if the element is in an iframe that has display:none. https://bugzilla.mozilla.org/show_bug.cgi?id=548397
    //browsers don't report transforms accurately unless the element is in the DOM and has a display value that's not "none". Firefox and Microsoft browsers have a partial bug where they'll report transforms even if display:none BUT not any percentage-based values like translate(-50%, 8px) will be reported as if it's translate(0, 8px).
    temp = style.display;
    style.display = "block";
    parent = target.parentNode;

    if (!parent || !target.offsetParent) {
      // note: in 3.3.0 we switched target.offsetParent to _doc.body.contains(target) to avoid [sometimes unnecessary] MutationObserver calls but that wasn't adequate because there are edge cases where nested position: fixed elements need to get reparented to accurately sense transforms. See https://github.com/greensock/GSAP/issues/388 and https://github.com/greensock/GSAP/issues/375
      addedToDOM = 1; //flag

      nextSibling = target.nextSibling;

      _docElement.appendChild(target); //we must add it to the DOM in order to get values properly

    }

    matrix = _getComputedTransformMatrixAsArray(target);
    temp ? style.display = temp : _removeProperty(target, "display");

    if (addedToDOM) {
      nextSibling ? parent.insertBefore(target, nextSibling) : parent ? parent.appendChild(target) : _docElement.removeChild(target);
    }
  }

  return force2D && matrix.length > 6 ? [matrix[0], matrix[1], matrix[4], matrix[5], matrix[12], matrix[13]] : matrix;
},
    _applySVGOrigin = function _applySVGOrigin(target, origin, originIsAbsolute, smooth, matrixArray, pluginToAddPropTweensTo) {
  var cache = target._gsap,
      matrix = matrixArray || _getMatrix(target, true),
      xOriginOld = cache.xOrigin || 0,
      yOriginOld = cache.yOrigin || 0,
      xOffsetOld = cache.xOffset || 0,
      yOffsetOld = cache.yOffset || 0,
      a = matrix[0],
      b = matrix[1],
      c = matrix[2],
      d = matrix[3],
      tx = matrix[4],
      ty = matrix[5],
      originSplit = origin.split(" "),
      xOrigin = parseFloat(originSplit[0]) || 0,
      yOrigin = parseFloat(originSplit[1]) || 0,
      bounds,
      determinant,
      x,
      y;

  if (!originIsAbsolute) {
    bounds = _getBBox(target);
    xOrigin = bounds.x + (~originSplit[0].indexOf("%") ? xOrigin / 100 * bounds.width : xOrigin);
    yOrigin = bounds.y + (~(originSplit[1] || originSplit[0]).indexOf("%") ? yOrigin / 100 * bounds.height : yOrigin);
  } else if (matrix !== _identity2DMatrix && (determinant = a * d - b * c)) {
    //if it's zero (like if scaleX and scaleY are zero), skip it to avoid errors with dividing by zero.
    x = xOrigin * (d / determinant) + yOrigin * (-c / determinant) + (c * ty - d * tx) / determinant;
    y = xOrigin * (-b / determinant) + yOrigin * (a / determinant) - (a * ty - b * tx) / determinant;
    xOrigin = x;
    yOrigin = y;
  }

  if (smooth || smooth !== false && cache.smooth) {
    tx = xOrigin - xOriginOld;
    ty = yOrigin - yOriginOld;
    cache.xOffset = xOffsetOld + (tx * a + ty * c) - tx;
    cache.yOffset = yOffsetOld + (tx * b + ty * d) - ty;
  } else {
    cache.xOffset = cache.yOffset = 0;
  }

  cache.xOrigin = xOrigin;
  cache.yOrigin = yOrigin;
  cache.smooth = !!smooth;
  cache.origin = origin;
  cache.originIsAbsolute = !!originIsAbsolute;
  target.style[_transformOriginProp] = "0px 0px"; //otherwise, if someone sets  an origin via CSS, it will likely interfere with the SVG transform attribute ones (because remember, we're baking the origin into the matrix() value).

  if (pluginToAddPropTweensTo) {
    _addNonTweeningPT(pluginToAddPropTweensTo, cache, "xOrigin", xOriginOld, xOrigin);

    _addNonTweeningPT(pluginToAddPropTweensTo, cache, "yOrigin", yOriginOld, yOrigin);

    _addNonTweeningPT(pluginToAddPropTweensTo, cache, "xOffset", xOffsetOld, cache.xOffset);

    _addNonTweeningPT(pluginToAddPropTweensTo, cache, "yOffset", yOffsetOld, cache.yOffset);
  }

  target.setAttribute("data-svg-origin", xOrigin + " " + yOrigin);
},
    _parseTransform = function _parseTransform(target, uncache) {
  var cache = target._gsap || new _gsapCore.GSCache(target);

  if ("x" in cache && !uncache && !cache.uncache) {
    return cache;
  }

  var style = target.style,
      invertedScaleX = cache.scaleX < 0,
      px = "px",
      deg = "deg",
      origin = _getComputedProperty(target, _transformOriginProp) || "0",
      x,
      y,
      z,
      scaleX,
      scaleY,
      rotation,
      rotationX,
      rotationY,
      skewX,
      skewY,
      perspective,
      xOrigin,
      yOrigin,
      matrix,
      angle,
      cos,
      sin,
      a,
      b,
      c,
      d,
      a12,
      a22,
      t1,
      t2,
      t3,
      a13,
      a23,
      a33,
      a42,
      a43,
      a32;
  x = y = z = rotation = rotationX = rotationY = skewX = skewY = perspective = 0;
  scaleX = scaleY = 1;
  cache.svg = !!(target.getCTM && _isSVG(target));
  matrix = _getMatrix(target, cache.svg);

  if (cache.svg) {
    t1 = !cache.uncache && target.getAttribute("data-svg-origin");

    _applySVGOrigin(target, t1 || origin, !!t1 || cache.originIsAbsolute, cache.smooth !== false, matrix);
  }

  xOrigin = cache.xOrigin || 0;
  yOrigin = cache.yOrigin || 0;

  if (matrix !== _identity2DMatrix) {
    a = matrix[0]; //a11

    b = matrix[1]; //a21

    c = matrix[2]; //a31

    d = matrix[3]; //a41

    x = a12 = matrix[4];
    y = a22 = matrix[5]; //2D matrix

    if (matrix.length === 6) {
      scaleX = Math.sqrt(a * a + b * b);
      scaleY = Math.sqrt(d * d + c * c);
      rotation = a || b ? _atan2(b, a) * _RAD2DEG : 0; //note: if scaleX is 0, we cannot accurately measure rotation. Same for skewX with a scaleY of 0. Therefore, we default to the previously recorded value (or zero if that doesn't exist).

      skewX = c || d ? _atan2(c, d) * _RAD2DEG + rotation : 0;
      skewX && (scaleY *= Math.cos(skewX * _DEG2RAD));

      if (cache.svg) {
        x -= xOrigin - (xOrigin * a + yOrigin * c);
        y -= yOrigin - (xOrigin * b + yOrigin * d);
      } //3D matrix

    } else {
      a32 = matrix[6];
      a42 = matrix[7];
      a13 = matrix[8];
      a23 = matrix[9];
      a33 = matrix[10];
      a43 = matrix[11];
      x = matrix[12];
      y = matrix[13];
      z = matrix[14];
      angle = _atan2(a32, a33);
      rotationX = angle * _RAD2DEG; //rotationX

      if (angle) {
        cos = Math.cos(-angle);
        sin = Math.sin(-angle);
        t1 = a12 * cos + a13 * sin;
        t2 = a22 * cos + a23 * sin;
        t3 = a32 * cos + a33 * sin;
        a13 = a12 * -sin + a13 * cos;
        a23 = a22 * -sin + a23 * cos;
        a33 = a32 * -sin + a33 * cos;
        a43 = a42 * -sin + a43 * cos;
        a12 = t1;
        a22 = t2;
        a32 = t3;
      } //rotationY


      angle = _atan2(-c, a33);
      rotationY = angle * _RAD2DEG;

      if (angle) {
        cos = Math.cos(-angle);
        sin = Math.sin(-angle);
        t1 = a * cos - a13 * sin;
        t2 = b * cos - a23 * sin;
        t3 = c * cos - a33 * sin;
        a43 = d * sin + a43 * cos;
        a = t1;
        b = t2;
        c = t3;
      } //rotationZ


      angle = _atan2(b, a);
      rotation = angle * _RAD2DEG;

      if (angle) {
        cos = Math.cos(angle);
        sin = Math.sin(angle);
        t1 = a * cos + b * sin;
        t2 = a12 * cos + a22 * sin;
        b = b * cos - a * sin;
        a22 = a22 * cos - a12 * sin;
        a = t1;
        a12 = t2;
      }

      if (rotationX && Math.abs(rotationX) + Math.abs(rotation) > 359.9) {
        //when rotationY is set, it will often be parsed as 180 degrees different than it should be, and rotationX and rotation both being 180 (it looks the same), so we adjust for that here.
        rotationX = rotation = 0;
        rotationY = 180 - rotationY;
      }

      scaleX = (0, _gsapCore._round)(Math.sqrt(a * a + b * b + c * c));
      scaleY = (0, _gsapCore._round)(Math.sqrt(a22 * a22 + a32 * a32));
      angle = _atan2(a12, a22);
      skewX = Math.abs(angle) > 0.0002 ? angle * _RAD2DEG : 0;
      perspective = a43 ? 1 / (a43 < 0 ? -a43 : a43) : 0;
    }

    if (cache.svg) {
      //sense if there are CSS transforms applied on an SVG element in which case we must overwrite them when rendering. The transform attribute is more reliable cross-browser, but we can't just remove the CSS ones because they may be applied in a CSS rule somewhere (not just inline).
      t1 = target.getAttribute("transform");
      cache.forceCSS = target.setAttribute("transform", "") || !_isNullTransform(_getComputedProperty(target, _transformProp));
      t1 && target.setAttribute("transform", t1);
    }
  }

  if (Math.abs(skewX) > 90 && Math.abs(skewX) < 270) {
    if (invertedScaleX) {
      scaleX *= -1;
      skewX += rotation <= 0 ? 180 : -180;
      rotation += rotation <= 0 ? 180 : -180;
    } else {
      scaleY *= -1;
      skewX += skewX <= 0 ? 180 : -180;
    }
  }

  cache.x = ((cache.xPercent = x && Math.round(target.offsetWidth / 2) === Math.round(-x) ? -50 : 0) ? 0 : x) + px;
  cache.y = ((cache.yPercent = y && Math.round(target.offsetHeight / 2) === Math.round(-y) ? -50 : 0) ? 0 : y) + px;
  cache.z = z + px;
  cache.scaleX = (0, _gsapCore._round)(scaleX);
  cache.scaleY = (0, _gsapCore._round)(scaleY);
  cache.rotation = (0, _gsapCore._round)(rotation) + deg;
  cache.rotationX = (0, _gsapCore._round)(rotationX) + deg;
  cache.rotationY = (0, _gsapCore._round)(rotationY) + deg;
  cache.skewX = skewX + deg;
  cache.skewY = skewY + deg;
  cache.transformPerspective = perspective + px;

  if (cache.zOrigin = parseFloat(origin.split(" ")[2]) || 0) {
    style[_transformOriginProp] = _firstTwoOnly(origin);
  }

  cache.xOffset = cache.yOffset = 0;
  cache.force3D = _gsapCore._config.force3D;
  cache.renderTransform = cache.svg ? _renderSVGTransforms : _supports3D ? _renderCSSTransforms : _renderNon3DTransforms;
  cache.uncache = 0;
  return cache;
},
    _firstTwoOnly = function _firstTwoOnly(value) {
  return (value = value.split(" "))[0] + " " + value[1];
},
    //for handling transformOrigin values, stripping out the 3rd dimension
_addPxTranslate = function _addPxTranslate(target, start, value) {
  var unit = (0, _gsapCore.getUnit)(start);
  return (0, _gsapCore._round)(parseFloat(start) + parseFloat(_convertToUnit(target, "x", value + "px", unit))) + unit;
},
    _renderNon3DTransforms = function _renderNon3DTransforms(ratio, cache) {
  cache.z = "0px";
  cache.rotationY = cache.rotationX = "0deg";
  cache.force3D = 0;

  _renderCSSTransforms(ratio, cache);
},
    _zeroDeg = "0deg",
    _zeroPx = "0px",
    _endParenthesis = ") ",
    _renderCSSTransforms = function _renderCSSTransforms(ratio, cache) {
  var _ref = cache || this,
      xPercent = _ref.xPercent,
      yPercent = _ref.yPercent,
      x = _ref.x,
      y = _ref.y,
      z = _ref.z,
      rotation = _ref.rotation,
      rotationY = _ref.rotationY,
      rotationX = _ref.rotationX,
      skewX = _ref.skewX,
      skewY = _ref.skewY,
      scaleX = _ref.scaleX,
      scaleY = _ref.scaleY,
      transformPerspective = _ref.transformPerspective,
      force3D = _ref.force3D,
      target = _ref.target,
      zOrigin = _ref.zOrigin,
      transforms = "",
      use3D = force3D === "auto" && ratio && ratio !== 1 || force3D === true; // Safari has a bug that causes it not to render 3D transform-origin values properly, so we force the z origin to 0, record it in the cache, and then do the math here to offset the translate values accordingly (basically do the 3D transform-origin part manually)


  if (zOrigin && (rotationX !== _zeroDeg || rotationY !== _zeroDeg)) {
    var angle = parseFloat(rotationY) * _DEG2RAD,
        a13 = Math.sin(angle),
        a33 = Math.cos(angle),
        cos;

    angle = parseFloat(rotationX) * _DEG2RAD;
    cos = Math.cos(angle);
    x = _addPxTranslate(target, x, a13 * cos * -zOrigin);
    y = _addPxTranslate(target, y, -Math.sin(angle) * -zOrigin);
    z = _addPxTranslate(target, z, a33 * cos * -zOrigin + zOrigin);
  }

  if (transformPerspective !== _zeroPx) {
    transforms += "perspective(" + transformPerspective + _endParenthesis;
  }

  if (xPercent || yPercent) {
    transforms += "translate(" + xPercent + "%, " + yPercent + "%) ";
  }

  if (use3D || x !== _zeroPx || y !== _zeroPx || z !== _zeroPx) {
    transforms += z !== _zeroPx || use3D ? "translate3d(" + x + ", " + y + ", " + z + ") " : "translate(" + x + ", " + y + _endParenthesis;
  }

  if (rotation !== _zeroDeg) {
    transforms += "rotate(" + rotation + _endParenthesis;
  }

  if (rotationY !== _zeroDeg) {
    transforms += "rotateY(" + rotationY + _endParenthesis;
  }

  if (rotationX !== _zeroDeg) {
    transforms += "rotateX(" + rotationX + _endParenthesis;
  }

  if (skewX !== _zeroDeg || skewY !== _zeroDeg) {
    transforms += "skew(" + skewX + ", " + skewY + _endParenthesis;
  }

  if (scaleX !== 1 || scaleY !== 1) {
    transforms += "scale(" + scaleX + ", " + scaleY + _endParenthesis;
  }

  target.style[_transformProp] = transforms || "translate(0, 0)";
},
    _renderSVGTransforms = function _renderSVGTransforms(ratio, cache) {
  var _ref2 = cache || this,
      xPercent = _ref2.xPercent,
      yPercent = _ref2.yPercent,
      x = _ref2.x,
      y = _ref2.y,
      rotation = _ref2.rotation,
      skewX = _ref2.skewX,
      skewY = _ref2.skewY,
      scaleX = _ref2.scaleX,
      scaleY = _ref2.scaleY,
      target = _ref2.target,
      xOrigin = _ref2.xOrigin,
      yOrigin = _ref2.yOrigin,
      xOffset = _ref2.xOffset,
      yOffset = _ref2.yOffset,
      forceCSS = _ref2.forceCSS,
      tx = parseFloat(x),
      ty = parseFloat(y),
      a11,
      a21,
      a12,
      a22,
      temp;

  rotation = parseFloat(rotation);
  skewX = parseFloat(skewX);
  skewY = parseFloat(skewY);

  if (skewY) {
    //for performance reasons, we combine all skewing into the skewX and rotation values. Remember, a skewY of 10 degrees looks the same as a rotation of 10 degrees plus a skewX of 10 degrees.
    skewY = parseFloat(skewY);
    skewX += skewY;
    rotation += skewY;
  }

  if (rotation || skewX) {
    rotation *= _DEG2RAD;
    skewX *= _DEG2RAD;
    a11 = Math.cos(rotation) * scaleX;
    a21 = Math.sin(rotation) * scaleX;
    a12 = Math.sin(rotation - skewX) * -scaleY;
    a22 = Math.cos(rotation - skewX) * scaleY;

    if (skewX) {
      skewY *= _DEG2RAD;
      temp = Math.tan(skewX - skewY);
      temp = Math.sqrt(1 + temp * temp);
      a12 *= temp;
      a22 *= temp;

      if (skewY) {
        temp = Math.tan(skewY);
        temp = Math.sqrt(1 + temp * temp);
        a11 *= temp;
        a21 *= temp;
      }
    }

    a11 = (0, _gsapCore._round)(a11);
    a21 = (0, _gsapCore._round)(a21);
    a12 = (0, _gsapCore._round)(a12);
    a22 = (0, _gsapCore._round)(a22);
  } else {
    a11 = scaleX;
    a22 = scaleY;
    a21 = a12 = 0;
  }

  if (tx && !~(x + "").indexOf("px") || ty && !~(y + "").indexOf("px")) {
    tx = _convertToUnit(target, "x", x, "px");
    ty = _convertToUnit(target, "y", y, "px");
  }

  if (xOrigin || yOrigin || xOffset || yOffset) {
    tx = (0, _gsapCore._round)(tx + xOrigin - (xOrigin * a11 + yOrigin * a12) + xOffset);
    ty = (0, _gsapCore._round)(ty + yOrigin - (xOrigin * a21 + yOrigin * a22) + yOffset);
  }

  if (xPercent || yPercent) {
    //The SVG spec doesn't support percentage-based translation in the "transform" attribute, so we merge it into the translation to simulate it.
    temp = target.getBBox();
    tx = (0, _gsapCore._round)(tx + xPercent / 100 * temp.width);
    ty = (0, _gsapCore._round)(ty + yPercent / 100 * temp.height);
  }

  temp = "matrix(" + a11 + "," + a21 + "," + a12 + "," + a22 + "," + tx + "," + ty + ")";
  target.setAttribute("transform", temp);

  if (forceCSS) {
    //some browsers prioritize CSS transforms over the transform attribute. When we sense that the user has CSS transforms applied, we must overwrite them this way (otherwise some browser simply won't render the  transform attribute changes!)
    target.style[_transformProp] = temp;
  }
},
    _addRotationalPropTween = function _addRotationalPropTween(plugin, target, property, startNum, endValue, relative) {
  var cap = 360,
      isString = (0, _gsapCore._isString)(endValue),
      endNum = parseFloat(endValue) * (isString && ~endValue.indexOf("rad") ? _RAD2DEG : 1),
      change = relative ? endNum * relative : endNum - startNum,
      finalValue = startNum + change + "deg",
      direction,
      pt;

  if (isString) {
    direction = endValue.split("_")[1];

    if (direction === "short") {
      change %= cap;

      if (change !== change % (cap / 2)) {
        change += change < 0 ? cap : -cap;
      }
    }

    if (direction === "cw" && change < 0) {
      change = (change + cap * _bigNum) % cap - ~~(change / cap) * cap;
    } else if (direction === "ccw" && change > 0) {
      change = (change - cap * _bigNum) % cap - ~~(change / cap) * cap;
    }
  }

  plugin._pt = pt = new _gsapCore.PropTween(plugin._pt, target, property, startNum, change, _renderPropWithEnd);
  pt.e = finalValue;
  pt.u = "deg";

  plugin._props.push(property);

  return pt;
},
    _addRawTransformPTs = function _addRawTransformPTs(plugin, transforms, target) {
  //for handling cases where someone passes in a whole transform string, like transform: "scale(2, 3) rotate(20deg) translateY(30em)"
  var style = _tempDivStyler.style,
      startCache = target._gsap,
      exclude = "perspective,force3D,transformOrigin,svgOrigin",
      endCache,
      p,
      startValue,
      endValue,
      startNum,
      endNum,
      startUnit,
      endUnit;
  style.cssText = getComputedStyle(target).cssText + ";position:absolute;display:block;"; //%-based translations will fail unless we set the width/height to match the original target (and padding/borders can affect it)

  style[_transformProp] = transforms;

  _doc.body.appendChild(_tempDivStyler);

  endCache = _parseTransform(_tempDivStyler, 1);

  for (p in _transformProps) {
    startValue = startCache[p];
    endValue = endCache[p];

    if (startValue !== endValue && exclude.indexOf(p) < 0) {
      //tweening to no perspective gives very unintuitive results - just keep the same perspective in that case.
      startUnit = (0, _gsapCore.getUnit)(startValue);
      endUnit = (0, _gsapCore.getUnit)(endValue);
      startNum = startUnit !== endUnit ? _convertToUnit(target, p, startValue, endUnit) : parseFloat(startValue);
      endNum = parseFloat(endValue);
      plugin._pt = new _gsapCore.PropTween(plugin._pt, startCache, p, startNum, endNum - startNum, _renderCSSProp);
      plugin._pt.u = endUnit || 0;

      plugin._props.push(p);
    }
  }

  _doc.body.removeChild(_tempDivStyler);
}; // handle splitting apart padding, margin, borderWidth, and borderRadius into their 4 components. Firefox, for example, won't report borderRadius correctly - it will only do borderTopLeftRadius and the other corners. We also want to handle paddingTop, marginLeft, borderRightWidth, etc.


exports._getBBox = _getBBox;
exports.checkPrefix = _checkPropPrefix;
exports._createElement = _createElement;
(0, _gsapCore._forEachName)("padding,margin,Width,Radius", function (name, index) {
  var t = "Top",
      r = "Right",
      b = "Bottom",
      l = "Left",
      props = (index < 3 ? [t, r, b, l] : [t + l, t + r, b + r, b + l]).map(function (side) {
    return index < 2 ? name + side : "border" + side + name;
  });

  _specialProps[index > 1 ? "border" + name : name] = function (plugin, target, property, endValue, tween) {
    var a, vars;

    if (arguments.length < 4) {
      // getter, passed target, property, and unit (from _get())
      a = props.map(function (prop) {
        return _get(plugin, prop, property);
      });
      vars = a.join(" ");
      return vars.split(a[0]).length === 5 ? a[0] : vars;
    }

    a = (endValue + "").split(" ");
    vars = {};
    props.forEach(function (prop, i) {
      return vars[prop] = a[i] = a[i] || a[(i - 1) / 2 | 0];
    });
    plugin.init(target, vars, tween);
  };
});
var CSSPlugin = {
  name: "css",
  register: _initCore,
  targetTest: function targetTest(target) {
    return target.style && target.nodeType;
  },
  init: function init(target, vars, tween, index, targets) {
    var props = this._props,
        style = target.style,
        startValue,
        endValue,
        endNum,
        startNum,
        type,
        specialProp,
        p,
        startUnit,
        endUnit,
        relative,
        isTransformRelated,
        transformPropTween,
        cache,
        smooth,
        hasPriority;
    _pluginInitted || _initCore();

    for (p in vars) {
      if (p === "autoRound") {
        continue;
      }

      endValue = vars[p];

      if (_gsapCore._plugins[p] && (0, _gsapCore._checkPlugin)(p, vars, tween, index, target, targets)) {
        //plugins
        continue;
      }

      type = typeof endValue;
      specialProp = _specialProps[p];

      if (type === "function") {
        endValue = endValue.call(tween, index, target, targets);
        type = typeof endValue;
      }

      if (type === "string" && ~endValue.indexOf("random(")) {
        endValue = (0, _gsapCore._replaceRandom)(endValue);
      }

      if (specialProp) {
        if (specialProp(this, target, p, endValue, tween)) {
          hasPriority = 1;
        }
      } else if (p.substr(0, 2) === "--") {
        //CSS variable
        this.add(style, "setProperty", getComputedStyle(target).getPropertyValue(p) + "", endValue + "", index, targets, 0, 0, p);
      } else if (type !== "undefined") {
        startValue = _get(target, p);
        startNum = parseFloat(startValue);
        relative = type === "string" && endValue.charAt(1) === "=" ? +(endValue.charAt(0) + "1") : 0;

        if (relative) {
          endValue = endValue.substr(2);
        }

        endNum = parseFloat(endValue);

        if (p in _propertyAliases) {
          if (p === "autoAlpha") {
            //special case where we control the visibility along with opacity. We still allow the opacity value to pass through and get tweened.
            if (startNum === 1 && _get(target, "visibility") === "hidden" && endNum) {
              //if visibility is initially set to "hidden", we should interpret that as intent to make opacity 0 (a convenience)
              startNum = 0;
            }

            _addNonTweeningPT(this, style, "visibility", startNum ? "inherit" : "hidden", endNum ? "inherit" : "hidden", !endNum);
          }

          if (p !== "scale" && p !== "transform") {
            p = _propertyAliases[p];
            ~p.indexOf(",") && (p = p.split(",")[0]);
          }
        }

        isTransformRelated = p in _transformProps; //--- TRANSFORM-RELATED ---

        if (isTransformRelated) {
          if (!transformPropTween) {
            cache = target._gsap;
            cache.renderTransform || _parseTransform(target); // if, for example, gsap.set(... {transform:"translateX(50vw)"}), the _get() call doesn't parse the transform, thus cache.renderTransform won't be set yet so force the parsing of the transform here.

            smooth = vars.smoothOrigin !== false && cache.smooth;
            transformPropTween = this._pt = new _gsapCore.PropTween(this._pt, style, _transformProp, 0, 1, cache.renderTransform, cache, 0, -1); //the first time through, create the rendering PropTween so that it runs LAST (in the linked list, we keep adding to the beginning)

            transformPropTween.dep = 1; //flag it as dependent so that if things get killed/overwritten and this is the only PropTween left, we can safely kill the whole tween.
          }

          if (p === "scale") {
            this._pt = new _gsapCore.PropTween(this._pt, cache, "scaleY", cache.scaleY, relative ? relative * endNum : endNum - cache.scaleY);
            props.push("scaleY", p);
            p += "X";
          } else if (p === "transformOrigin") {
            endValue = _convertKeywordsToPercentages(endValue); //in case something like "left top" or "bottom right" is passed in. Convert to percentages.

            if (cache.svg) {
              _applySVGOrigin(target, endValue, 0, smooth, 0, this);
            } else {
              endUnit = parseFloat(endValue.split(" ")[2]) || 0; //handle the zOrigin separately!

              endUnit !== cache.zOrigin && _addNonTweeningPT(this, cache, "zOrigin", cache.zOrigin, endUnit);

              _addNonTweeningPT(this, style, p, _firstTwoOnly(startValue), _firstTwoOnly(endValue));
            }

            continue;
          } else if (p === "svgOrigin") {
            _applySVGOrigin(target, endValue, 1, smooth, 0, this);

            continue;
          } else if (p in _rotationalProperties) {
            _addRotationalPropTween(this, cache, p, startNum, endValue, relative);

            continue;
          } else if (p === "smoothOrigin") {
            _addNonTweeningPT(this, cache, "smooth", cache.smooth, endValue);

            continue;
          } else if (p === "force3D") {
            cache[p] = endValue;
            continue;
          } else if (p === "transform") {
            _addRawTransformPTs(this, endValue, target);

            continue;
          }
        } else if (!(p in style)) {
          p = _checkPropPrefix(p) || p;
        }

        if (isTransformRelated || (endNum || endNum === 0) && (startNum || startNum === 0) && !_complexExp.test(endValue) && p in style) {
          startUnit = (startValue + "").substr((startNum + "").length);
          endNum || (endNum = 0); // protect against NaN

          endUnit = (0, _gsapCore.getUnit)(endValue) || (p in _gsapCore._config.units ? _gsapCore._config.units[p] : startUnit);
          startUnit !== endUnit && (startNum = _convertToUnit(target, p, startValue, endUnit));
          this._pt = new _gsapCore.PropTween(this._pt, isTransformRelated ? cache : style, p, startNum, relative ? relative * endNum : endNum - startNum, endUnit === "px" && vars.autoRound !== false && !isTransformRelated ? _renderRoundedCSSProp : _renderCSSProp);
          this._pt.u = endUnit || 0;

          if (startUnit !== endUnit) {
            //when the tween goes all the way back to the beginning, we need to revert it to the OLD/ORIGINAL value (with those units). We record that as a "b" (beginning) property and point to a render method that handles that. (performance optimization)
            this._pt.b = startValue;
            this._pt.r = _renderCSSPropWithBeginning;
          }
        } else if (!(p in style)) {
          if (p in target) {
            //maybe it's not a style - it could be a property added directly to an element in which case we'll try to animate that.
            this.add(target, p, target[p], endValue, index, targets);
          } else {
            (0, _gsapCore._missingPlugin)(p, endValue);
            continue;
          }
        } else {
          _tweenComplexCSSString.call(this, target, p, startValue, endValue);
        }

        props.push(p);
      }
    }

    hasPriority && (0, _gsapCore._sortPropTweensByPriority)(this);
  },
  get: _get,
  aliases: _propertyAliases,
  getSetter: function getSetter(target, property, plugin) {
    //returns a setter function that accepts target, property, value and applies it accordingly. Remember, properties like "x" aren't as simple as target.style.property = value because they've got to be applied to a proxy object and then merged into a transform string in a renderer.
    var p = _propertyAliases[property];
    p && p.indexOf(",") < 0 && (property = p);
    return property in _transformProps && property !== _transformOriginProp && (target._gsap.x || _get(target, "x")) ? plugin && _recentSetterPlugin === plugin ? property === "scale" ? _setterScale : _setterTransform : (_recentSetterPlugin = plugin || {}) && (property === "scale" ? _setterScaleWithRender : _setterTransformWithRender) : target.style && !(0, _gsapCore._isUndefined)(target.style[property]) ? _setterCSSStyle : ~property.indexOf("-") ? _setterCSSProp : (0, _gsapCore._getSetter)(target, property);
  },
  core: {
    _removeProperty: _removeProperty,
    _getMatrix: _getMatrix
  }
};
exports.default = exports.CSSPlugin = CSSPlugin;
_gsapCore.gsap.utils.checkPrefix = _checkPropPrefix;

(function (positionAndScale, rotation, others, aliases) {
  var all = (0, _gsapCore._forEachName)(positionAndScale + "," + rotation + "," + others, function (name) {
    _transformProps[name] = 1;
  });
  (0, _gsapCore._forEachName)(rotation, function (name) {
    _gsapCore._config.units[name] = "deg";
    _rotationalProperties[name] = 1;
  });
  _propertyAliases[all[13]] = positionAndScale + "," + rotation;
  (0, _gsapCore._forEachName)(aliases, function (name) {
    var split = name.split(":");
    _propertyAliases[split[1]] = all[split[0]];
  });
})("x,y,z,scale,scaleX,scaleY,xPercent,yPercent", "rotation,rotationX,rotationY,skewX,skewY", "transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective", "0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY");

(0, _gsapCore._forEachName)("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective", function (name) {
  _gsapCore._config.units[name] = "px";
});

_gsapCore.gsap.registerPlugin(CSSPlugin);
},{"./gsap-core.js":"P74P"}],"f8Z0":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Power0", {
  enumerable: true,
  get: function () {
    return _gsapCore.Power0;
  }
});
Object.defineProperty(exports, "Power1", {
  enumerable: true,
  get: function () {
    return _gsapCore.Power1;
  }
});
Object.defineProperty(exports, "Power2", {
  enumerable: true,
  get: function () {
    return _gsapCore.Power2;
  }
});
Object.defineProperty(exports, "Power3", {
  enumerable: true,
  get: function () {
    return _gsapCore.Power3;
  }
});
Object.defineProperty(exports, "Power4", {
  enumerable: true,
  get: function () {
    return _gsapCore.Power4;
  }
});
Object.defineProperty(exports, "Linear", {
  enumerable: true,
  get: function () {
    return _gsapCore.Linear;
  }
});
Object.defineProperty(exports, "Quad", {
  enumerable: true,
  get: function () {
    return _gsapCore.Quad;
  }
});
Object.defineProperty(exports, "Cubic", {
  enumerable: true,
  get: function () {
    return _gsapCore.Cubic;
  }
});
Object.defineProperty(exports, "Quart", {
  enumerable: true,
  get: function () {
    return _gsapCore.Quart;
  }
});
Object.defineProperty(exports, "Quint", {
  enumerable: true,
  get: function () {
    return _gsapCore.Quint;
  }
});
Object.defineProperty(exports, "Strong", {
  enumerable: true,
  get: function () {
    return _gsapCore.Strong;
  }
});
Object.defineProperty(exports, "Elastic", {
  enumerable: true,
  get: function () {
    return _gsapCore.Elastic;
  }
});
Object.defineProperty(exports, "Back", {
  enumerable: true,
  get: function () {
    return _gsapCore.Back;
  }
});
Object.defineProperty(exports, "SteppedEase", {
  enumerable: true,
  get: function () {
    return _gsapCore.SteppedEase;
  }
});
Object.defineProperty(exports, "Bounce", {
  enumerable: true,
  get: function () {
    return _gsapCore.Bounce;
  }
});
Object.defineProperty(exports, "Sine", {
  enumerable: true,
  get: function () {
    return _gsapCore.Sine;
  }
});
Object.defineProperty(exports, "Expo", {
  enumerable: true,
  get: function () {
    return _gsapCore.Expo;
  }
});
Object.defineProperty(exports, "Circ", {
  enumerable: true,
  get: function () {
    return _gsapCore.Circ;
  }
});
Object.defineProperty(exports, "TweenLite", {
  enumerable: true,
  get: function () {
    return _gsapCore.TweenLite;
  }
});
Object.defineProperty(exports, "TimelineLite", {
  enumerable: true,
  get: function () {
    return _gsapCore.TimelineLite;
  }
});
Object.defineProperty(exports, "TimelineMax", {
  enumerable: true,
  get: function () {
    return _gsapCore.TimelineMax;
  }
});
Object.defineProperty(exports, "CSSPlugin", {
  enumerable: true,
  get: function () {
    return _CSSPlugin.CSSPlugin;
  }
});
exports.TweenMax = exports.default = exports.gsap = void 0;

var _gsapCore = require("./gsap-core.js");

var _CSSPlugin = require("./CSSPlugin.js");

var gsapWithCSS = _gsapCore.gsap.registerPlugin(_CSSPlugin.CSSPlugin) || _gsapCore.gsap,
    // to protect from tree shaking
TweenMaxWithCSS = gsapWithCSS.core.Tween;

exports.TweenMax = TweenMaxWithCSS;
exports.default = exports.gsap = gsapWithCSS;
},{"./gsap-core.js":"P74P","./CSSPlugin.js":"KE4Q"}],"QdeU":[function(require,module,exports) {
"use strict";

var _curtainsjs = require("curtainsjs");

var _fragment = _interopRequireDefault(require("../shaders_circle/fragment.glsl"));

var _vertex = _interopRequireDefault(require("../shaders_circle/vertex.glsl"));

var _gsap = _interopRequireDefault(require("gsap"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var activeTexture = 0;
var currentTexture = 0;
var transitionTimer = 0;
var timer = 0;
var isRunning = 0;
window.addEventListener("load", function () {
  // set up our WebGL context and append the canvas to our wrapper
  var curtains = new _curtainsjs.Curtains({
    container: "canvas",
    alpha: true,
    pixelRatio: Math.min(1.5, window.devicePixelRatio) // limit pixel ratio for performance

  }); // get our plane element

  var planeElements = _toConsumableArray(document.getElementsByClassName("plane"));

  var navElements = _toConsumableArray(document.getElementsByClassName("js-nav"));

  var duration = planeElements[0].getAttribute("data-duration") || 2; // set our initial parameters (basic uniforms)

  var params = {
    vertexShaderID: "vert",
    fragmentShaderID: "frag",
    uniforms: {
      transitionTimer: {
        name: "uTransitionTimer",
        type: "1f",
        value: 0
      },
      fadeIn: {
        name: "uFadeIn",
        type: "1f",
        value: 0
      },
      timer: {
        name: "uTimer",
        type: "1f",
        value: 0
      },
      to: {
        name: "uTo",
        type: "1f",
        value: 0
      },
      from: {
        name: "uFrom",
        type: "1f",
        value: 0
      }
    }
  };
  var multiTexturesPlane = new _curtainsjs.Plane(curtains, planeElements[0], params); // set up our basic methods

  multiTexturesPlane.onReady(function () {
    // display the button
    document.body.classList.add("curtains-ready");
    var length = multiTexturesPlane.videos.length; // planeElements[0].addEventListener("click", () => {
    //   gsap.to(multiTexturesPlane.uniforms.transitionTimer, {
    //     duration: duration,
    //     value: currentTexture + 1,
    //     easing: 'power2.in',
    //     onStart: () => {
    //       multiTexturesPlane.videos[(currentTexture + 1) % length].play();
    //       currentTexture = currentTexture + 1;
    //     },
    //     onComplete: () => {
    //       multiTexturesPlane.videos[
    //         (currentTexture + length - 1) % length
    //       ].pause();
    //       multiTexturesPlane.videos[
    //         (currentTexture + length + 1) % length
    //       ].pause();
    //     },
    //   });
    // });

    navElements.forEach(function (nav) {
      nav.addEventListener('click', function (event) {
        var to = event.target.getAttribute('data-nav');
        if (isRunning || to == currentTexture) return;
        var elems = document.querySelectorAll(".frame__switch-item");
        [].forEach.call(elems, function (el) {
          el.classList.remove("frame__switch-item--current");
        });
        event.target.classList.add('frame__switch-item--current');
        isRunning = true;
        multiTexturesPlane.uniforms.to.value = to;
        var fake = {
          progress: 0
        };

        _gsap.default.to(fake, {
          duration: duration,
          progress: 1,
          easing: 'power2.in',
          onStart: function onStart() {
            multiTexturesPlane.videos[to].play();
            currentTexture = to;
          },
          onUpdate: function onUpdate() {
            if (fake.progress === 1) {
              multiTexturesPlane.uniforms.from.value = to;
            }

            multiTexturesPlane.uniforms.transitionTimer.value = fake.progress;
          },
          onComplete: function onComplete() {
            multiTexturesPlane.uniforms.from.value = to;
            multiTexturesPlane.videos[(currentTexture + length - 1) % length].pause();
            multiTexturesPlane.videos[(currentTexture + length + 1) % length].pause();
            isRunning = false;
          }
        });
      });
    }); // click to play the videos

    document.getElementById("intro").addEventListener("click", function () {
      // fade out animation
      _gsap.default.to('#intro', {
        duration: 0.1,
        autoAlpha: 0.
      });

      document.body.classList.add("video-started");

      _gsap.default.to(multiTexturesPlane.uniforms.fadeIn, {
        duration: 1,
        value: 1
      }); // play all videos to force uploading the first frame of each texture


      multiTexturesPlane.playVideos(); // wait a tick and pause the rest of videos (the ones that are hidden)

      curtains.nextRender(function () {
        multiTexturesPlane.videos[1].pause();
        multiTexturesPlane.videos[2].pause();
      });
    }, false);
  }).onRender(function () {
    timer += 0.001;
    multiTexturesPlane.uniforms.timer.value = timer;
  });
});
},{"curtainsjs":"McdC","../shaders_circle/fragment.glsl":"yNZb","../shaders_circle/vertex.glsl":"e9km","gsap":"f8Z0"}]},{},["QdeU"], null)
//# sourceMappingURL=app.be8f17b5.js.map