/**
 * Created by aghassaei on 6/12/15.
 */


define(['underscore', 'three', 'threeModel', 'lattice', 'appState', 'superCell', "cubeCell", 'globals', 'materials'],
    function(_, THREE, three, lattice, appState, DMASuperCell, CubeCell, globals, materials){

    function CompositeCell(json, superCell){
        DMASuperCell.call(this, json, superCell);
    }
    CompositeCell.prototype = Object.create(DMASuperCell.prototype);

    CompositeCell.prototype._getGeometry = function(){
        var dimensions = this.material.dimensions;
        var geo = new THREE.BoxGeometry(dimensions.x*lattice.xScale(), dimensions.y*lattice.yScale(), dimensions.z*lattice.zScale());
        geo.applyMatrix(new THREE.Matrix4().makeTranslation((dimensions.x/2-0.5)*lattice.xScale(), (dimensions.y/2-0.5)*lattice.yScale(), (dimensions.z/2-0.5)*lattice.zScale()));
        return geo;
    };

    CompositeCell.prototype._buildWireframe = function(mesh){
        var wireframe = new THREE.BoxHelper(mesh);
        wireframe.material.color.set(0x000000);
        wireframe.matrixWorld = mesh.matrixWorld;
        wireframe.matrixAutoUpdate = true;
        return wireframe;
    };

    CompositeCell.prototype._makeCellForJSON = function(json){
        if (materials.getMaterialForId(json.materialID).isComposite()) return new CompositeCell(json, this);
        return new CubeCell(json, this);
    };

    CompositeCell.prototype.getDimensions = function(){
        return this.getMaterial().getDimensions();
    };

    return CompositeCell;
});