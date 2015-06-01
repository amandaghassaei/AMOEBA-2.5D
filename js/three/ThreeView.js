/**
 * Created by aghassaei on 1/16/15.
 */

ThreeView = Backbone.View.extend({

    events: {
        "mousemove":                            "_mouseMoved",
        "mouseup":                              "_mouseUp",
        "mousedown":                            "_mouseDown",
        "mouseout":                             "_mouseOut"
    },

    mouseIsDown: false,//store state of mouse click inside this el

    //intersections/object highlighting
    mouseProjection: new THREE.Raycaster(),
    currentIntersectedPart: null,

    el: "#threeContainer",

    controls: null,

    initialize: function(){

        _.bindAll(this, "_mouseMoved", "_animate");

        //bind events
        this.listenTo(globals.appState, "change:deleteMode change:extrudeMode change:shift", this._setControlsEnabled);

        this.controls = new THREE.OrbitControls(this.model.camera, this.$el.get(0));
        this.controls.addEventListener('change', this.model.render);

        this.$el.append(this.model.domElement);//render only once

        this.model.render();
//        this._animate();
    },

    ////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////CONTROLS/////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    _animate: function(){
//        requestAnimationFrame(this._animate);
//        this.controls.update();
    },

    _setControlsEnabled: function(){
        var state = globals.appState.get("deleteMode") || globals.appState.get("shift") || globals.appState.get("extrudeMode");
        this.controls.noRotate = state;
    },

    ////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////MOUSE EVENTS/////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    _mouseOut: function(){
        globals.highlighter.setNothingHighlighted();
        this._setNoPartIntersections();
    },

    _mouseUp: function(){
        this.mouseIsDown = false;
        if (globals.appState.get("currentTab") == "cam" && globals.appState.get("manualSelectOrigin")){
            var position = globals.highlighter.getHighlightedObjectPosition();
            if (position){
                globals.cam.set("originPosition", position);
                globals.appState.set("manualSelectOrigin", false);
                return;
            }
        }
        if (this.currentIntersectedPart) this.currentIntersectedPart.removeFromCell();
        else globals.highlighter.addRemoveVoxel(!globals.appState.get("deleteMode"));
    },

    _mouseDown: function(){
        this.mouseIsDown = true;
    },

    _mouseMoved: function(e){

        if (!globals.appState.get("highlightMode") && !(globals.appState.get("manualSelectOrigin"))) return;

        if (this.mouseIsDown && !this.controls.noRotate) {//in the middle of a camera move
            globals.highlighter.setNothingHighlighted();
            this._setNoPartIntersections();
            return;
        }

        //make projection vector
        var vector = new THREE.Vector2(2*(e.pageX-this.$el.offset().left)/this.$el.width()-1, 1-2*(e.pageY-this.$el.offset().top)/this.$el.height());
        this.mouseProjection.setFromCamera(vector, this.model.camera);

        var objsToIntersect = this.model.cells.concat(this.model.basePlane);
//        if (globals.highlighter.isVisible()) objsToIntersect = objsToIntersect.concat(globals.highlighter.mesh);
        var intersections = this.mouseProjection.intersectObjects(objsToIntersect, false);
        if (intersections.length == 0) {//no intersections
            globals.highlighter.setNothingHighlighted();
            this._setNoPartIntersections();
            return;
        }

        if(intersections[0].object == globals.highlighter.mesh) return;

        globals.highlighter.highlight(intersections[0]);

        if (this.mouseIsDown) {
            if (globals.appState.get("deleteMode")){
                globals.highlighter.addRemoveVoxel(false);
            } else if (globals.appState.get("shift")){
                globals.highlighter.addRemoveVoxel(true);
            }
        }

//        if (globals.appState.get("cellMode") == "part"){//additionally check for part intersections in part mode
//            var partIntersections = this.mouseProjection.intersectObjects(this.model.parts, false);
//            if (partIntersections.length == 0) {
//                this._setNoPartIntersections();
//                return;
//            }
//            this._handlePartIntersections(partIntersections, intersections[0].distance);
//        }
    },

    ////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////INTERSECTIONS////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    _setNoPartIntersections: function(){
        if (this.currentIntersectedPart){
            this.currentIntersectedPart.unhighlight();
            this.currentIntersectedPart = null;
            globals.three.render();
        }
    },

    _handlePartIntersections: function(intersections, distanceToNearestCell){
        var part = intersections[0].object.myPart;
        if (globals.highlighter.isVisible() && intersections[0].distance > distanceToNearestCell){
            this._setNoPartIntersections();
            return;
        }
        globals.highlighter.hide();
        if (part!= this.currentIntersectedPart){
            if (this.currentIntersectedPart) this.currentIntersectedPart.unhighlight();
            part.highlight();
            this.currentIntersectedPart = part;
            globals.three.render();
        }
    }

});