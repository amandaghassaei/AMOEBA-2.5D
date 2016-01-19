/**
 * Created by aghassaei on 1/11/16.
 */


define(["cell"], function(DMACell){


    function EMSimCell(cell){

        this.position = cell.getAbsolutePosition();
        this.rotation = cell.getAbsoluteOrientation();

        this.cell = cell;

        this._reset();

        this.float();

    }

    EMSimCell.prototype.changePosition = function(delta){
        this.deltaPosition.add(delta);
    };

    EMSimCell.prototype.setDeltaPosition = function(delta){
        this.deltaPosition = delta;
    };

    EMSimCell.prototype.setDeltaRotation = function(delta){
        this.deltaRotation = delta;
    };

    EMSimCell.prototype._setPosition = function(position){
        this.cell.object3D.position.set(position.x, position.y, position.z);
    };

    EMSimCell.prototype.show = function(){
        this.cell.show();
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

    EMSimCell.prototype.update = function(){
        if (this._isFixed) return;
        this._setPosition(this.position.clone().add(this.deltaPosition));
    };

    EMSimCell.prototype.reset = function(){
        this._reset();
        this._setPosition(this.position.clone());
    };

    EMSimCell.prototype._reset = function(){
        this.setDeltaPosition(new THREE.Vector3(0,0,0));
        this.setDeltaRotation(new THREE.Quaternion(0,0,0,1));
    };

    EMSimCell.prototype.destroy = function(){
        this.cell = null;
        this.position = null;
        this.rotation = null;
        this.deltaPosition = null;
        this.deltaRotation = null;
    };

    return EMSimCell;

});