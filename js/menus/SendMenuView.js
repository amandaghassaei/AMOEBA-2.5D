/**
 * Created by aghassaei on 3/11/15.
 */

SendMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
        "click #saveSendMenu":                                       "_save",
        "click #overrideEdits":                                      "_postProcess"
    },

    initialize: function(){

        //bind events
        this.listenTo(dmaGlobals.assembler, "change", this.render);
        $(document).bind('keyup', {state:false}, this._codeEdit);

        _.bindAll(this, "render");
    },

    _save: function(e){
        e.preventDefault();
        dmaGlobals.assembler.save();
    },

    _postProcess: function(e){
        e.preventDefault();
        dmaGlobals.assembler.postProcess();
    },

    _codeEdit: function(e){
        var textarea = $("#gcodeEditor");
        if (!textarea.is(":focus")) return;
        e.preventDefault();
        dmaGlobals.assembler.makeProgramEdits(textarea.val());
    },

    render: function(){
        if (this.model.get("currentTab") != "send") return;
        if (dmaGlobals.assembler.get("needsPostProcessing")) dmaGlobals.assembler.postProcess();
        this.$el.html(this.template(dmaGlobals.assembler.toJSON()));
    },

    template: _.template('\
        <a href="#" id="saveSendMenu" class=" btn btn-block btn-lg btn-default">Save</a><br/>\
        <textarea id="gcodeEditor"><%= dataOut %></textarea><br/><br/>\
        <a href="#" id="overrideEdits" class=" btn btn-block btn-lg btn-default">Undo Changes</a><br/>\
        ')

});