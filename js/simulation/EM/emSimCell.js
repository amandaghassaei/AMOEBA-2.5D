/**
 * Created by aghassaei on 1/11/16.
 */


define(["cell", "lattice", "plist"], function(DMACell, lattice, plist){


    function EMSimCell(cell){

        this.origPosition = cell.getAbsolutePosition();
//        this.rotation = cell.getAbsoluteOrientation();

        this.cell = cell;

        var material = cell.getMaterial();
        var cellSize = lattice.getPitch();
        var cellVolume = cellSize.x * cellSize.y * cellSize.z;
        this.mass = material.getDensity()*cellVolume;//kg
        this.I = 2/5*this.mass*Math.pow(cellSize.x/2, 2);

        this.velocity = null;
        this.nextVelocity = null;
        this.translation = null;
        this.nextTranslation = null;
        this.quaternion = null;
        this.rotation = null;
        this.nextRotation = null;
        this.w = null;
        this.nextW = null;

        this._reset();

        this.float();

    }

    EMSimCell.prototype.getMomentOfInertia = function(){
        return this.I;
    };

    EMSimCell.prototype.getMass = function(){
        return this.mass;//kg
    };

    EMSimCell.prototype.applyForce = function(force, dt){
        if (this._isFixed) return;
        var accel = force.multiplyScalar(1/this.mass);
        this.nextVelocity = this.getVelocity().add(accel.multiplyScalar(dt));
        this.nextTranslation = this.getTranslation().add(this.nextVelocity.clone().multiplyScalar(dt));
    };

    EMSimCell.prototype.setRotation = function(rotation, dt){
        if (this._isFixed) return;
        this.nextW = this.getRotation().sub(rotation).multiplyScalar(1/dt);
        this.nextRotation = rotation;
    };



    
    EMSimCell.prototype.getAbsoluteVelocity = function(){
        return this.applyRotation(this.getVelocity());
    };

    EMSimCell.prototype.getVelocity = function(){
        return this.velocity.clone();
    };

    EMSimCell.prototype.getAngularVelocity = function(){
        return this.w.clone();
    };

    EMSimCell.prototype.getTranslation = function(){
        return this.translation.clone();
    };

    EMSimCell.prototype.getAbsoluteTranslation = function(){
        return this.applyRotation(this.getTranslation());
    };

    EMSimCell.prototype.getRotation = function(){
        return this.rotation.clone();
    };

    EMSimCell.prototype._setPosition = function(position){
        this.cell.object3D.position.set(position.x, position.y, position.z);
    };

    EMSimCell.prototype._setRotation = function(rotation){
//        this.cell.object3D.rotation.set(rotation.x, 0,0);
        this.cell.object3D.rotation.set(rotation.x, rotation.y, rotation.z);
        this.quaternion.setFromEuler(this.cell.object3D.rotation);
    };

    EMSimCell.prototype.getQuaternion = function(){
        return this.quaternion.clone();
    };

    EMSimCell.prototype.applyRotation = function(vector){
        vector.applyQuaternion(this.getQuaternion());
        return vector;
    };
    
    
    

    EMSimCell.prototype.show = function(){
        this.cell.show();
    };

    EMSimCell.prototype.showDefaultColor = function(){
        this.cell.setMaterial(this.getMaterial(true));
    };

    EMSimCell.prototype.showTranslation = function(material){
        this.cell._setTHREEMaterial(material);
    };



    EMSimCell.prototype.hide = function(){
        this.cell.hide();
    };

    EMSimCell.prototype.fix = function(){
        this._isFixed = true;
    };

    EMSimCell.prototype.float = function(){
        this._isFixed = false;
    };

    EMSimCell.prototype.isFixed = function(){
        return this._isFixed;
    };

    EMSimCell.prototype.getMaterial = function(){
        return this.cell.getMaterial();
    };

    EMSimCell.prototype.makeCompositeParam = function(param, paramNeighbor){
        if (param == paramNeighbor) return param;
        if (paramNeighbor === Infinity) return param*2;
        return 2*param*paramNeighbor/(param+paramNeighbor);
    };

    EMSimCell.prototype.update = function(shouldRender){
        if (this._isFixed) return;
        var multiplier = 1/(plist.allUnitTypes[lattice.getUnits()].multiplier);
        this.translation = this.nextTranslation;
        this.velocity = this.nextVelocity;
        this.rotation = this.nextRotation;
        this.w = this.nextW;
        if (shouldRender) {
            this._setPosition(this.origPosition.clone().add(this.translation.clone().multiplyScalar(multiplier)));
            this._setRotation(this.rotation.clone());
        }
    };

    EMSimCell.prototype.numNeighbors = function(neighbors){
        var num = 0;
        _.each(neighbors, function(neighbor){
            if (neighbor) num++;
        });
        return num;
    };

    EMSimCell.prototype.reset = function(){
        this._reset();
        this._setPosition(this.origPosition.clone());
        this._setRotation(this.rotation.clone());
    };

    EMSimCell.prototype._reset = function(){
        this.velocity = new THREE.Vector3(0,0,0);
        this.translation = new THREE.Vector3(0,0,0);
        this.quaternion = new THREE.Quaternion(0,0,0,1);
        this.w = new THREE.Vector3(0,0,0);
        this.rotation = new THREE.Vector3(0,0,0);
    };

    EMSimCell.prototype.destroy = function(){
        this.cell = null;
        this.origPosition = null;
        this.rotation = null;
        this.translation = null;
        this.quaternion = null;
    };

    return EMSimCell;

});