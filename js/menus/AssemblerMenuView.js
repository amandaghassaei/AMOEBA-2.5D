/**
 * Created by aghassaei on 2/25/15.
 */


AssemblerMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
    },

    initialize: function(options){

        this.assembler = options.assembler;

        _.bindAll(this, "render", "_onKeyup");
        this.listenTo(this.assembler, "change", this.render);
        $(document).bind('keyup', {}, this._onKeyup);
    },

    _onKeyup: function(e){
        if (this.model.get("currentTab") != "assembler") return;
        if ($(".placementOrder").is(":focus")) this._updatePlacementOrder(e);
    },

    _updatePlacementOrder: function(e){
        e.preventDefault();
        var newVal = $(e.target).val();
        if (newVal.length<3) return;//todo this isn't quite right
        this.assembler.set("placementOrder", newVal);
//        this.assembler.trigger("change:placementOrder");
    },

    render: function(){
        if (this.model.changedAttributes()["currentNav"]) return;
        if (this.model.get("currentTab") != "assembler") return;
        if ($("input").is(":focus")) return;
        this.$el.html(this.template(_.extend(this.model.toJSON(), this.assembler.toJSON(), globals.lattice.toJSON(), globals.plist)));
    },

    template: _.template('\
        Machine: &nbsp;&nbsp;\
            <div class="btn-group">\
                <button data-toggle="dropdown" class="btn dropdown-toggle" type="button"><%= allMachineTypes[cellType][connectionType][machineName] %><span class="caret"></span></button>\
                <ul role="menu" class="dropdown-menu">\
                    <% _.each(_.keys(allMachineTypes[cellType][connectionType]), function(key){ %>\
                        <li><a class="assembler dropdownSelector" data-property="machineName" data-value="<%= key %>" href="#"><%= allMachineTypes[cellType][connectionType][key] %></a></li>\
                    <% }); %>\
                </ul>\
            </div><br/><br/>\
        Strategy: &nbsp;&nbsp;\
            <div class="btn-group">\
                <button data-toggle="dropdown" class="btn dropdown-toggle" type="button"><%= allAssemblyStrategies[camStrategy] %><span class="caret"></span></button>\
                <ul role="menu" class="dropdown-menu">\
                    <% _.each(_.keys(allAssemblyStrategies), function(key){ %>\
                        <li><a class="assembler dropdownSelector" data-property="camStrategy" data-value="<%= key %>" href="#"><%= allAssemblyStrategies[key] %></a></li>\
                    <% }); %>\
                </ul>\
            </div><br/><br/>\
            <% if (camStrategy == "raster"){ %>\
        Raster Order: &nbsp;&nbsp;<input value="<%= placementOrder %>" placeholder="Placement Order" class="form-control placementOrder" type="text"><br/><br/>\
        <% } %>\
        ')
});