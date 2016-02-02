/**
 * Created by aghassaei on 1/11/16.
 */


define(['underscore', 'backbone', 'emSimCell', 'threeModel', 'lattice'],
    function(_, Backbone, EMSimCell, three, lattice){


    var EMSimLattice = Backbone.Model.extend({

        defaults: {

        },

        initialize: function(){

        },

        setCells: function(cells){
            this.destroyCells();
            this.cells = this._initEmptyArray(cells);
            this._loopCells(cells, function(cell, x, y, z, self){
                self.cells[x][y][z] = new EMSimCell(cell);
            });
        },

        _initEmptyArray: function(cells){
            var array3D = [];
            for (var x=0;x<cells.length;x++){
                var array2D = [];
                for (var y=0;y<cells[0].length;y++){
                    var array1D = [];
                    for (var z=0;z<cells[0][0].length;z++){
                        array1D.push(null);
                    }
                    array2D.push(array1D);
                }
                array3D.push(array2D);
            }
            return array3D;
        },

        destroyCells: function(){
            if (this.cells){
                this.loopCells(function(cell){
                    cell.destroy();
                });
            }
        },

        loopCells: function(callback){
            this._loopCells(this.cells, callback);
        },

        _loopCells: function(cells, callback){
            for (var x=0;x<cells.length;x++){
                for (var y=0;y<cells[0].length;y++){
                    for (var z=0;z<cells[0][0].length;z++){
                        if (cells[x][y][z]) callback(cells[x][y][z], x, y, z, this);
                    }
                }
            }
        },

        _loopCellsWithNeighbors: function(callback){
            var cells = this.cells;
            if (!cells) {
                console.warn('no cells array');
                return;
            }
            var sizeX = cells.length;
            var sizeY = cells[0].length;
            var sizeZ = cells[0][0].length;
            this.loopCells(function(cell, x, y, z, self){

                var neighbors = [];
                if (x == 0) neighbors.push(null);
                else neighbors.push(cells[x-1][y][z]);
                if (x == sizeX-1) neighbors.push(null);
                else neighbors.push(cells[x+1][y][z]);

                if (y == 0) neighbors.push(null);
                else neighbors.push(cells[x][y-1][z]);
                if (y == sizeY-1) neighbors.push(null);
                else neighbors.push(cells[x][y+1][z]);

                if (z == 0) neighbors.push(null);
                else neighbors.push(cells[x][y][z-1]);
                if (z == sizeZ-1) neighbors.push(null);
                else neighbors.push(cells[x][y][z+1]);

                callback(cell, neighbors, x, y, z, self);
            });
        },

        _neighborLookup: function(index){
            switch (index){
                case 0:
                    return 'x-';
                case 1:
                    return 'x+';
                case 2:
                    return 'y-';
                case 3:
                    return 'y+';
                case 4:
                    return 'z-';
                case 5:
                    return 'z+';
            }
        },

        _neighborSign: function(index){
            if (index%2 == 0) return -1;
            return 1;
        },

        _neighborAxis: function(index){
            if (index > 3) return 'z';
            if (index > 1) return 'y';
            return 'x';
        },

        _neighborOffset: function(index, latticePitch){
            var offset = new THREE.Vector3(0,0,0);
            var axisName = this._neighborAxis(index);
            offset[axisName] = this._neighborSign(index) * latticePitch[axisName];
            return offset;
        },

        _torqueAxis: function(neighbAxis, axis){
            if ('x' != neighbAxis && 'x' != axis) return 'x';
            if ('y' != neighbAxis && 'y' != axis) return 'y';
            return 'z';
        },

        _sign: function(val){
            if (val>0) return 1;
            return -1;
        },


        iter: function(dt, gravity, shouldRender){
            var self = this;
            var latticePitch = lattice.getPitch();
            this._loopCellsWithNeighbors(function(cell, neighbors){
                if (cell.isFixed()) return;
                var mass = cell.getMass();
                var material = cell.getMaterial();

                var cellVelocity = cell.getVelocity();
                var cellDelta = cell.getTranslation();

                var Ftotal = gravity.clone().multiplyScalar(mass);
                var Rtotal = new THREE.Vector3(0,0,0);//rotational forces
                var Rcontributions = new THREE.Vector3(0,0,0);

                _.each(neighbors, function(neighbor, index){
                    if (neighbor === null) return;

                    var nominalD = self._neighborOffset(index, latticePitch);
//                    var rotatedNominalD = cell.applyRotation(nominalD.clone());


                    var neighborTranslation = neighbor.getTranslation();
                    var neighborVelocity = neighbor.getVelocity();

                    var D = neighborTranslation.sub(cellDelta).add(nominalD);//offset between neighbors (with nominal component)
                    var relativeVelocity = cellVelocity.clone().sub(neighborVelocity);

                    var k = neighbor.makeCompositeParam(neighbor.getMaterial().getK(), material.getK());
                    var damping = 1/100;//this is arbitrary for now

                    var force = D.clone().sub(nominalD).clone().multiplyScalar(k).sub(relativeVelocity.multiplyScalar(damping));//kD-dv

                    Ftotal.add(force);

                    var neighborAxis = self._neighborAxis(index);
                    var rotation = new THREE.Vector3(0,0,0);

                    _.each(D, function(offset, axis){
                        if (axis == neighborAxis) return;
                        var torqueAxis = self._torqueAxis(neighborAxis, axis);
                        var Dproject = D.clone();
                        Dproject[torqueAxis] = 0;
                        var cross = nominalD.clone().cross(Dproject);
                        rotation[torqueAxis] = k*self._sign(cross[torqueAxis])*Math.asin(cross.length()/nominalD.length()/Dproject.length());
                        Rcontributions[torqueAxis] += k;
                    });
                    rotation[neighborAxis] = k*neighbor.getRotation();
                    Rcontributions[neighborAxis] += k;
                    Rtotal.add(rotation);

                });

                _.each(Rcontributions, function(num, key){
                    Rtotal[key]/=num;
                });


                cell.applyForce(Ftotal, dt);
                cell.setRotation(Rtotal, dt);
            });
            this.loopCells(function(cell){
                cell.update(shouldRender);
            });
        },

        _vectorAbs: function(vector){//take abs of vector components
            _.each(vector, function(val, key){
                vector[key] = Math.abs(val);
            });
            return vector;
        },

        reset: function(){
            this.loopCells(function(cell){
                cell.reset();
            });
        },

        getCellAtIndex: function(index){
            return this.cells[index.x][index.y][index.z];
        }


    });


    return new EMSimLattice();

});