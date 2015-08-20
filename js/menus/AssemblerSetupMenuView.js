/**
 * Created by aghassaei on 8/11/15.
 */


define(['jquery', 'underscore', 'menuParent', 'camPlist', 'cam', 'text!assemblerSetupMenuTemplate'],
    function($, _, MenuParentView, camPlist, cam, template){

    return MenuParentView.extend({

        events: {
            "click .editMachineComponent":                          "_editMachineComponent",
            "click .editMachineCode":                               "_editMachineCode",
            "click #newMachineComponent":                           "_newComponent"
        },

        _initialize: function(){

        },

        getPropertyOwner: function($target){
            if ($target.hasClass("assembler")) return cam.get("assembler");
            return null;
        },

        _editMachineComponent: function(e){
            e.preventDefault();
            cam.set("editingComponent", $(e.target).data("id"));
            this.model.set("currentNav", "navMachineComponent");
        },

        _editMachineCode: function(e){
            e.preventDefault();
            var codeType = $(e.target).data("name");
            if (!codeType) return;
            var js = cam.get("assembler")[codeType];
            if (js){
                if (codeType == "customFunctionsContext") js = JSON.stringify(js, null, "\t");
                require(['globals'], function(globals){
                    globals.scriptView.showWithJS(js, codeType, function(js){
                        console.log("saved");
                        cam.get("assembler")[codeType] = js;
                    });
                });
            }
        },

        _newComponent: function(e){
            e.preventDefault();
            var id = cam.get("assembler").newComponent();
            cam.set("editingComponent", id);
            this.model.set("currentNav", "navMachineComponent");
        },

        _makeTemplateJSON: function(){
            return _.extend(this.model.toJSON(), cam.toJSON(), cam.get("assembler").toJSON());
        },

        template: _.template(template)
    });
});
