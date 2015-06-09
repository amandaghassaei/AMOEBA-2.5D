/**
 * Created by aghassaei on 5/26/15.
 */


define(['underscore', 'three', 'part', 'bin!gikPartSTL', 'bin!gikEndPartSTL', 'stlLoader'], function(_, THREE, DMAPart, gikPart, gikEndPart){

    var loader = new THREE.STLLoader();
    var unitGeo = preProcessGeo(loader.parse(gikPart));
    var unitGeoEnd = preProcessGeo(loader.parse(gikEndPart));

    function preProcessGeo(geo){
        geo.computeBoundingBox();
        geo.applyMatrix(new THREE.Matrix4().makeTranslation(-(geo.boundingBox.min.x+0.5),
            -(geo.boundingBox.min.y+geo.boundingBox.max.y)/2, -(geo.boundingBox.min.z+geo.boundingBox.max.z)/2));
        var unitScale = 1/(1.2699999809265137);
        geo.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI/2));
        geo.applyMatrix(new THREE.Matrix4().makeScale(unitScale, unitScale, unitScale));
        return geo;
    }

    function GIKPart(index, parent){
        DMAPart.call(this, index, parent);
    }
    GIKPart.prototype = Object.create(DMAPart.prototype);

    GIKPart.prototype._getGeometry = function(){
        if (this._isEnd()) return unitGeoEnd;
        return unitGeo;
    };

    GIKPart.prototype._rotatePart = function(mesh){
        if (this._getGIKLength() == this.index) mesh.rotateZ(Math.PI);
        return mesh;
    };

    GIKPart.prototype._isEnd = function(){
        return this.index == 0 || this.index == this._getGIKLength();
    };

    GIKPart.prototype._getGIKLength = function(){
        return this.parentCell.superCell.getLength();
    };

    return GIKPart;

});