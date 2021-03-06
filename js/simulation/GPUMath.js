/**
 * Created by ghassaei on 2/24/16.
 */


define(['glBoilerplate'], function(glBoilerplate){

    var canvas = document.getElementById("gpuMathCanvas");
    var gl = canvas.getContext("webgl", {antialias:false}) || canvas.getContext("experimental-webgl", {antialias:false});
    gl.getExtension('OES_texture_float');
    gl.disable(gl.DEPTH_TEST);

    var maxTexturesInFragmentShader = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    console.log(maxTexturesInFragmentShader + " textures max");


    function GPUMath(){
        this.reset();
    }

    GPUMath.prototype.createProgram = function(programName, vertexShader, fragmentShader){
        var programs = this.programs;
        var program = programs[name];
        if (program) {
            console.warn("already a program with the name " + programName);
            return;
        }
        program = glBoilerplate.createProgramFromSource(gl, vertexShader, fragmentShader);
        gl.useProgram(program);
        glBoilerplate.loadVertexData(gl, program);
        programs[programName] = {
            program: program,
            uniforms: {}
        };
    };

    GPUMath.prototype.initTextureFromData = function(name, width, height, typeName, data, shouldReplace){
        var texture = this.textures[name];
        if (!shouldReplace && texture) {
            console.warn("already a texture with the name " + name);
            return;
        }
        texture = glBoilerplate.makeTexture(gl, width, height, gl[typeName], data);
        this.textures[name] = texture;
    };



    GPUMath.prototype.initFrameBufferForTexture = function(textureName){
        var framebuffer = this.frameBuffers[textureName];
        if (framebuffer) {
            console.warn("framebuffer already exists for texture " + textureName);
            return;
        }
        var texture = this.textures[textureName];
        if (!texture){
            console.warn("texture " + textureName + " does not exist");
            return;
        }

        framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        this.frameBuffers[textureName] = framebuffer;
    };


    GPUMath.prototype.setUniformForProgram = function(programName, name, val, type){
        if (!this.programs[programName]){
            console.warn("no program with name " + programName);
            return;
        }
        var uniforms = this.programs[programName].uniforms;
        var location = uniforms[name];
        if (!location) {
            location = gl.getUniformLocation(this.programs[programName].program, name);
            uniforms[name] = location;
        }
        if (type == "1f") gl.uniform1f(location, val);
        else if (type == "2f") gl.uniform2f(location, val[0], val[1]);
        else if (type == "3f") gl.uniform3f(location, val[0], val[1], val[2]);
        else if (type == "1i") gl.uniform1i(location, val);
        else {
            console.warn("no uniform for type " + type);
        }
    };

    GPUMath.prototype.setSize = function(width, height){
        gl.viewport(0, 0, width, height);
        canvas.clientWidth = width;
        canvas.clientHeight = height;
    };

    GPUMath.prototype.setProgram = function(programName){
        gl.useProgram(this.programs[programName].program);
    };

    GPUMath.prototype.step = function(programName, inputTextures, outputTexture, time){

        gl.useProgram(this.programs[programName].program);
        if (time) this.setUniformForProgram(programName, "u_time", time, "1f");
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffers[outputTexture]);
        for (var i=0;i<inputTextures.length;i++){
            gl.activeTexture(gl.TEXTURE0 + i);
            gl.bindTexture(gl.TEXTURE_2D, this.textures[inputTextures[i]]);
        }
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);//draw to framebuffer
    };

    GPUMath.prototype.swapTextures = function(texture1Name, texture2Name){
        var temp = this.textures[texture1Name];
        this.textures[texture1Name] = this.textures[texture2Name];
        this.textures[texture2Name] = temp;
        temp = this.frameBuffers[texture1Name];
        this.frameBuffers[texture1Name] = this.frameBuffers[texture2Name];
        this.frameBuffers[texture2Name] = temp;
    };

    GPUMath.prototype.swap3Textures = function(texture1Name, texture2Name, texture3Name){
        var temp = this.textures[texture3Name];
        this.textures[texture3Name] = this.textures[texture2Name];
        this.textures[texture2Name] = this.textures[texture1Name];
        this.textures[texture1Name] = temp;
        temp = this.frameBuffers[texture3Name];
        this.frameBuffers[texture3Name] = this.frameBuffers[texture2Name];
        this.frameBuffers[texture2Name] = this.frameBuffers[texture1Name];
        this.frameBuffers[texture1Name] = temp;
    };

    GPUMath.prototype.readyToRead = function(){
        return gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE;
    };

    GPUMath.prototype.readPixels = function(xMin, yMin, width, height, array){
        gl.readPixels(xMin, yMin, width, height, gl.RGBA, gl.UNSIGNED_BYTE, array);
    };

    GPUMath.prototype.reset = function(){
        this.programs = {};
        this.frameBuffers = {};
        this.textures = {};
        this.index = 0;
    };

    return new GPUMath;

});