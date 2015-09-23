/**
 * Created by aghassaei on 6/24/15.
 */


define(['jquery', 'underscore', 'menuParent', 'plist', 'materials', 'text!materialEditorMenuTemplate', 'fileSaver'],
    function($, _, MenuParentView, plist, materials, template, fileSaver){

    return MenuParentView.extend({

        events: {
            "click #saveToFile":                                 "_saveMaterialToFile",
            "click #newRandomColor":                             "_changeRandomColor"
        },

        _initialize: function(options){

            var id = options.myObject;
            if (!options.myObject) {
                console.warn("no editing material id passed in");
                this.model.set("currentNav", plist.allMenus.navMaterial.parent);
            }
            if (id == "new") id = materials.getNextMaterialID();
            this.materialID = id;

            this.material = materials.getMaterialCopy(id);
        },

        getPropertyOwner: function($target){
            if ($target.hasClass("materialEditor")) return this.material;
            else if ($target.hasClass("materialProperties")) return this.material.properties;
            return null;
        },

        updateHex: function(hex, $target){
            //update hex without rendering
            $target.css("border-color", hex);
        },

        _changeRandomColor: function(e){
            e.preventDefault();
            var color = '#' + Math.floor(Math.random()*16777215).toString(16);
            this.material.altColor = color;
            this.render();
        },

        _saveMaterialToFile: function(e){
            e.preventDefault();
            fileSaver.saveMaterial(this.materialID, this.material);
        },

        saveExitMenu: function(){
            if (this.material.name == "") this.material.name = "Material " + materials.getNextMaterialID();
            materials.setMaterial(this.materialID, _.clone(this.material));
            return true;
        },

        deleteExitMenu: function(){
            var deleted = materials.deleteMaterial(this.materialID);
            return deleted;
        },

        _makeTemplateJSON: function(){
            return _.extend(this.material);
        },

        _destroy: function(){
            var self = this;
            _.each(_.keys(this.material), function(key){
                delete self.material[key];
            });
            this.material = null;
            this.materialID = null;
        },

        template: _.template(template)
    });
});