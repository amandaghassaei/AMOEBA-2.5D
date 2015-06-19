/**
 * Created by aghassaei on 6/12/15.
 */


define(['underscore', 'three', 'threeModel', 'lattice', 'appState', 'superCell', 'globals', 'materials'],
    function(_, THREE, three, lattice, appState, DMASuperCell, globals, materials){

    CompositeCell = function(json, superCell){
        DMASuperCell.call(this, json, superCell);
    };
    CompositeCell.prototype = Object.create(DMASuperCell.prototype);

    CompositeCell.prototype._getGeometry = function(){
        var dimensions = materials[this.materialName].dimensions;
        var geo = new THREE.BoxGeometry(dimensions.x*lattice.xScale(), dimensions.y*lattice.yScale(), dimensions.z*lattice.zScale());
        geo.applyMatrix(new THREE.Matrix4().makeTranslation(dimensions.x/2-0.5, dimensions.y/2-0.5, dimensions.z/2-0.5));
        return geo;
    };

    CompositeCell.prototype._buildWireframe = function(mesh){
        var wireframe = new THREE.BoxHelper(mesh);
        wireframe.material.color.set(0x000000);
        wireframe.matrixWorld = mesh.matrixWorld;
        wireframe.matrixAutoUpdate = true;
        return wireframe;
    };

    return CompositeCell;
});