/**
 * Created by aghassaei on 1/26/15.
 */

define(['jquery', 'underscore', 'menuParent', 'plist', 'text!menus/templates/SelectMenuView.html', 'globals'],
    function($, _, MenuParentView, plist, template, globals){

    return MenuParentView.extend({

        events: {
            "click .fillCutSelection":                        "_finishSelection",
            "click #exitSelection":                           "_exitSelection",
            "click #selectRegion":                            "_selectRegion",
            "click #undoSelectRegion":                        "_undoSelection"
        },

        _initialize: function(){
            this.listenTo(globals, "change:selection3D", this._selection3DChanged);
            if (globals.get("selection3D")) this.listenTo(globals.get("selection3D"), "change", this.render);
        },

        getPropertyOwner: function($target){
            if ($target.hasClass('selection3D')) return globals.get("selection3D");
            return null;
        },

        _makeTemplateJSON: function(){
            var json = {selection3D:null, selectedRegion: null};
            if (globals.get("selection3D")) _.extend(json, {selection3D: globals.get("selection3D").toJSON()});
            if (globals.get("selectedRegion")) _.extend(json, {selectedRegion: globals.get("selectedRegion").toJSON()});
            return json;
        },

        _selection3DChanged: function(){
            if (globals.get("selection3D")) this.listenTo(globals.get("selection3D"), "change", this.render);
            this.render();
        },

        _finishSelection: function(e){
            e.preventDefault();
            var params = {mirrorX:$("#mirrorX").is(':checked'), mirrorY:$("#mirrorY").is(':checked'), mirrorZ:$("#mirrorZ").is(':checked')};
            globals.get("selection3D").finish(params);
        },

        _exitSelection: function(e){
            e.preventDefault();
            var selection3D = globals.get("selection3D");
            globals.destroySelection3D();
        },

        _selectRegion: function(e){
            e.preventDefault();
            globals.get("selection3D").selectRegion();
        },

        _undoSelection: function(e){
            e.preventDefault();
            globals.destroySelectedRegion();
            globals.destroySelection3D();
            this.render();
        },

        _render: function(){
        },

        template: _.template(template)
    });
});