/**
 * Created by aghassaei on 1/26/15.
 */


MenuWrapper = Backbone.View.extend({

    el: "#menuWrapper",

    events: {
        "click .menuWrapperTab>a":                     "_tabWasSelected",
        "click .dropdownSelector":                     "_makeDropdownSelection",
        "click .clearCells":                           "_clearCells"
    },

    initialize: function(){

        _.bindAll(this, "render", "_updateCurrentTab", "_setVisibility", "_hide", "_show", "_onKeyUp");
        $(document).bind('keyup', {}, this._onKeyUp);

        var lattice = globals.lattice;

        //init all tab view controllers

        this.physicsMenu = new PhysicsMenuView({model:this.model});
        this.materialMenu = new MaterialMenuView({model:this.model});
        this.optimizeMenu = new OptimizationMenuView({model:this.model});
        this.assemblerMenu = new AssemblerMenuView({model:this.model, assembler: globals.assembler});
        this.animationMenu = new AnimationMenuView({model:this.model});
        this.camMenu = new CamMenuView({model:this.model, lattice:lattice, assembler:globals.assembler});
        this.sendMenu = new SendMenuView({model:this.model});

        //bind events
        this.listenTo(this.model, "change:currentNav", this.render);
        this.listenTo(lattice, "change:cellType change:connectionType", this._populateAndShow);
        this.listenTo(this.model, "change:currentTab", this._updateCurrentTab);
        this.listenTo(this.model, "change:menuIsVisible", this._setVisibility);

        if (this.model.get("menuIsVisible")) this._populateAndShow();
    },


    _onKeyUp: function(e){
        if ($("input").is(":focus") && e.keyCode == 13) {//enter key
            $(e.target).blur();
            this._renderTab();
            return;
        }
        if ($(".floatInput").is(":focus")) this._updateFloat(e);
        if ($(".intInput").is(":focus")) this._updateInt(e);
    },

    _updateFloat: function(e){
        e.preventDefault();
        var $target = $(e.target);
        var newVal = parseFloat($target.val());
        if (isNaN(newVal)) {
            console.warn("value is not float");
            return;
        }
        this._setNumber($target, newVal);
    },

    _updateInt: function(e){
        e.preventDefault();
        var $target = $(e.target);
        var newVal = parseInt($target.val());
        if (isNaN(newVal)) {
            console.warn("value is NaN");
            return;
        }
        this._setNumber($target, newVal);
    },

    _setNumber: function($target, newVal){
        var property = $target.data("property");
        if (!property) {
            console.warn("no property associated with number input");
            return;
        }
        var key = $target.data("key");
        if (key){
            if ($target.hasClass("lattice")) {
                globals.lattice.get(property)[key] = newVal;
                globals.lattice.trigger("change:"+property);
            } else if ($target.hasClass("assembler")) {
                globals.assembler.get(property)[key] = newVal;
                globals.assembler.trigger("change:"+property);
            }

            return;
        }
        if ($target.hasClass("lattice")) globals.lattice.set(property, newVal);
        else if ($target.hasClass("assembler")) globals.assembler.set(property, newVal);
    },

    _makeDropdownSelection: function(e){
        var $target = $(e.target);
        var property = $target.data("property");
        var value = $target.data("value");
        if (!property || !value) return;
        if ($target.hasClass("lattice")) globals.lattice.set(property, value);
        else if ($target.hasClass("assembler")) globals.assembler.set(property, value);
    },

    _clearCells: function(e){
        e.preventDefault();
        globals.lattice.clearCells();
    },




    _tabWasSelected: function(e){
        e.preventDefault();
        var tabName = $(e.target).parent().data('name');
        this.model.set("currentTab", tabName);
    },

    _updateCurrentTab: function(){
        var tabName = this.model.get("currentTab");
        _.each($(".menuWrapperTab"), function(tab){
            var $tab = $(tab);
            if ($tab.data('name') == tabName){
                $tab.addClass("active");
            } else {
                $tab.removeClass("active");
            }
        });

        this._renderTab(tabName);
    },

    _renderTab: function(tabName){
        if (!tabName) tabName = this.model.get("currentTab");

        if (tabName == "lattice"){
            if (!this.latticeMenu) this.latticeMenu = new LatticeMenuView({model:this.model});
            this.latticeMenu.render();
        } else if (tabName == "import"){
            if (!this.importMenu) this.importMenu = new ImportMenuView({model:this.model});
            this.importMenu.render();
        } else if (tabName == "sketch"){
            if (!this.sketchMenu) this.sketchMenu = new SketchMenuView({model:this.model});
            this.sketchMenu.render();
        } else if (tabName == "part"){
            if (!this.partMenu) this.partMenu = new PartMenuView({model:this.model});
            this.partMenu.render();
        } else if (tabName == "script"){
            if (!this.scriptMenu) this.scriptMenu = new ScriptMenuView({model:this.model});
            this.scriptMenu.render();
        } else if (tabName == "physics"){
            this.physicsMenu.render();
        } else if (tabName == "material"){
            this.materialMenu.render();
        } else if (tabName == "optimize"){
            this.optimizeMenu.render();
        } else if (tabName == "assembler"){
            this.assemblerMenu.render();
        } else if (tabName == "animate"){
            this.animationMenu.render();
        } else if (tabName == "cam"){
            this.camMenu.render();
        } else if (tabName == "send"){
            this.sendMenu.render();
        } else {
            console.warn("no tab initialized!");
            $("#menuContent").html('Coming Soon.');//clear out content from menu
        }
    },

    render: function(){
        var self = this;
        this._hide(function(){
            self._populateAndShow();
            self.model.trigger("change:currentTab");//this was updated silently before
        }, true);
    },

    _populateAndShow: function(){
        $("#menuHeader").html(this.template(_.extend(this.model.toJSON(), globals.lattice.toJSON(), globals.plist)));
        this._updateCurrentTab();
        this._show();
    },

    _setVisibility: function(){
        if(this.model.get("menuIsVisible")){
            this._populateAndShow();
        } else {
            this._hide();
        }
    },

    _hide: function(callback, suppressModelUpdate){
        this.$el.animate({right: "-430"}, {done: callback});
        if (!suppressModelUpdate) this.model.set("menuIsVisible", false);
    },

    _show: function(){
        this.$el.animate({right: "0"});
        this.model.set("menuIsVisible", true);
    },

    template: _.template('\
        <ul class="nav nav-tabs nav-justified">\
        <% _.each(_.keys(allMenuTabs[currentNav]), function(key){\
            if (key == "part" && !(allPartTypes[cellType][connectionType])) return;  %>\
          <li role="presentation" class="menuWrapperTab" data-name="<%= key %>"><a href="#"><%= allMenuTabs[currentNav][key] %></a></li>\
        <% }); %>\
        </ul>\
        ')
});