/**
 * Created by aghassaei on 5/28/15.
 */


define(['underscore', 'assembler', 'stlLoader', 'gikSuperCell'], function(_, Assembler, THREE, StockClass){

    function StaplerAssembler(){
        this.stockAttachedToEndEffector = true;//no need for "stock position"
        Assembler.call(this);
    }
    StaplerAssembler.prototype = Object.create(Assembler.prototype);

    StaplerAssembler.prototype._buildStock = function(){
        return new StockClass({});
    };

    StaplerAssembler.prototype._positionStockRelativeToEndEffector = function(stock){
        var object3D = stock.getObject3D();
        object3D.position.set((2.4803+0.2)*20, (-1.9471+0.36)*20, 1.7*20);
    };

    StaplerAssembler.prototype._configureAssemblerMovementDependencies = function(){
        this.zAxis.addChild(this.stock);
        this.xAxis.addChild(this.zAxis);
        this.frame.addChild(this.xAxis);
        this.frame.addChild(this.yAxis);
        this.object3D.add(this.frame.getObject3D());
        this.object3D.add(this.substrate.getObject3D());
    };

    StaplerAssembler.prototype._getTotalNumMeshes = function(){
        return 5;
    };

    StaplerAssembler.prototype._loadSTls = function(doAdd){

        function geometryScale(geometry){
            geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-4.0757, -4.3432, -6.2154));
            geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI/2));

            var unitScale = 20;
            geometry.applyMatrix(new THREE.Matrix4().makeScale(unitScale, unitScale, unitScale));
            geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-21, -0.63, 0));
            return geometry;
        }

        var loader = new THREE.STLLoader();
        loader.load("assets/stls/stapler/frame.stl", function(geometry){
            doAdd(geometryScale(geometry), "frame");
        });
        loader.load(this._headSTLFile(), function(geometry){
            doAdd(geometryScale(geometry), "zAxis");
        });
        loader.load("assets/stls/stapler/yAxis.stl", function(geometry){
            doAdd(geometryScale(geometry), "yAxis");
        });
        loader.load("assets/stls/stapler/xAxis.stl", function(geometry){
            doAdd(geometryScale(geometry), "xAxis");
        });
        loader.load("assets/stls/stapler/substrate.stl", function(geometry){
    //        geometry.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI/2));
    //        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 1.8545, -1.2598));
            doAdd(geometryScale(geometry), "substrate");
        });
    };

    StaplerAssembler.prototype._headSTLFile = function(){
        return "assets/stls/stapler/zAxis.stl";
    };

    StaplerAssembler.prototype._moveXAxis = function(startingPos, target, axis, speed, callback){
        if (target == null || target === undefined) {
            callback();
            return;
        }
        this._animateObjects([this.xAxis], axis, speed, startingPos, target, callback);
    };
    StaplerAssembler.prototype._moveYAxis = function(startingPos, target, axis, speed, callback){
        if (target == null || target === undefined) {
            callback();
            return;
        }
        this._animateObjects([this.yAxis], axis, speed, startingPos, target, callback);
    };
    StaplerAssembler.prototype._moveZAxis = function(startingPos, target, axis, speed, callback){
        if (target == null || target === undefined) {
            callback();
            return;
        }
        this._animateObjects([this.zAxis], axis, speed, startingPos, target, callback);
    };


    return StaplerAssembler;
});