/**
 * Created by aghassaei on 1/14/15.
 */


//a Cell, a unit piece of the lattice

(function () {

    var unitOctHeight = 2/Math.sqrt(6);

    var unitCellGeo1 = new THREE.OctahedronGeometry(1/Math.sqrt(2));
    unitCellGeo1.applyMatrix(new THREE.Matrix4().makeRotationZ(-3*Math.PI/12));
    unitCellGeo1.applyMatrix(new THREE.Matrix4().makeRotationX(Math.asin(2/Math.sqrt(2)/Math.sqrt(3))));

    var unitCellGeo2 = unitCellGeo1.clone();

    unitCellGeo1.applyMatrix(new THREE.Matrix4().makeTranslation(0,-1/Math.sqrt(3),unitOctHeight/2));
    unitCellGeo2.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI));
    unitCellGeo2.applyMatrix(new THREE.Matrix4().makeTranslation(0,1/Math.sqrt(3),unitOctHeight/2));

    var cellMaterials = [new THREE.MeshNormalMaterial(),
        new THREE.MeshBasicMaterial({color:0x000000, wireframe:true})];

    var cellGeometry1;
    var cellGeometry2;

    setScale(30);

    function setScale(scale){
        cellGeometry1 = unitCellGeo1.clone();
        cellGeometry1.applyMatrix(new THREE.Matrix4().makeScale(scale, scale, scale));
        cellGeometry2 = unitCellGeo2.clone();
        cellGeometry2.applyMatrix(new THREE.Matrix4().makeScale(scale, scale, scale));
    }

    function DMACell(mode, indices, scale) {

        this.indices = indices;
        this.position = this._calcPositionForScale(scale);

        this.parts = this._initParts(this.position);
        this.drawForMode(mode);
    }

    DMACell.prototype._calcPositionForScale = function(scale){
        var position = {};
        var indices = this.indices;
        var octHeight = 2*scale/Math.sqrt(6);
        var triHeight = scale/2*Math.sqrt(3);
        position.x = indices.x*scale;
        position.y = indices.y*triHeight;
        position.z = indices.z*octHeight;
        if (Math.abs(indices.y%2) == 1) position.x -= scale/2;
        if (Math.abs(indices.z%2) == 1) position.y -= triHeight*4/3;
        return position;
    };

    DMACell.prototype._initParts = function(position){
        var parts  = [];
        for (var i=0;i<3;i++){
            parts.push(new DMAPart(i, position));
        }
        return parts;
    };

    DMACell.prototype._buildCellMesh = function(position){//abstract mesh representation of cell

        var mesh;

        if (this.indices.z%2==0){
            mesh = THREE.SceneUtils.createMultiMaterialObject(cellGeometry1, cellMaterials);
        } else {
            mesh = THREE.SceneUtils.createMultiMaterialObject(cellGeometry2, cellMaterials);
        }
        mesh.position.x = position.x;
        mesh.position.y = position.y;
        mesh.position.z = position.z;

        mesh.myCell = this;//we need a reference to this instance from the mesh for intersection selection stuff
        return mesh;
    };

    DMACell.prototype.drawForMode = function(mode){
        console.log(mode);
        if (mode == "cell"){
            if (this.cellMesh) this._setCellMeshVisibility(true);
            else {
                this.cellMesh = this._buildCellMesh(this.position);
                window.three.sceneAdd(this.cellMesh);
            }
            _.each(this.parts, function(part){
                part.hide();
            });
        } else if (mode == "parts"){
            this._setCellMeshVisibility(false);
            _.each(this.parts, function(part){
                part.show();
            });
        } else {
            console.warn("unrecognized draw mode for cell");
        }
    };

    DMACell.prototype._setCellMeshVisibility = function(visibility){
        if (!this.cellMesh) return;
        this.cellMesh.visible = visibility;
    };

    DMACell.prototype.remove = function(){
        if (this.cellMesh) window.three.sceneRemove(this.cellMesh);
    };

    DMACell.prototype._destroy = function(){
        if (this.cellMesh) this.cellMesh.myCell = null;
    };

    self.DMACell =  DMACell;

})();
