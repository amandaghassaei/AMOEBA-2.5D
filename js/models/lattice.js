/**
 * Created by aghassaei on 1/16/15.
 */


Lattice = Backbone.Model.extend({

    defaults: {
        scale: 30.0,
        cellType: "octa",
        connectionType: "face",
        nodes: [],
        cells: [],
        numCells: 0,
        partType: "triangle",
        cellMode: "cell"
    },

    //pass in fillGeometry

    initialize: function(){

        //bind events
        this.listenTo(this, "change:cellMode", this._cellModeDidChange);
    },

    addCell: function(position){
        var cells = this.get("cells");
        if (this.get("cellMode")=="parts") return;//remove this eventually
        cells.push(new Cell(this.get("cellMode"), position));
        this.set("numCells", cells.length);
        window.three.render();
    },

    removeCell: function(object){
        var cells = this.get("cells");
        var cell = object.parent.myCell;
        var index = cells.indexOf(cell);
        if (index == -1) {//I think this is happening when two intersection/remove calls are done on the same cell before the next render loop finished
            console.warn("problem locating cell in cell array");
            return;
        }
        cells.splice(index, 1);
        cell.remove();
        this.set("numCells", cells.length);
        window.three.render();
    },

    clearCells: function(){
        _.each(this.get("cells"), function(cell){
            cell.remove();
        });
        this.set("cells", []);
        this.set("numCells", 0);
        window.three.render();
    },

    _cellModeDidChange: function(){
        var mode = this.get("cellMode");
        _.each(this.get("cells"), function(cell){
            cell.drawForMode(mode);
        });
        window.three.render();
    }

});