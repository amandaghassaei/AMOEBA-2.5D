/**
 * Created by aghassaei on 1/29/15.
 */

//a class to store global app state, model for navbar and menu wrapper
//never deallocated

AppState = Backbone.Model.extend({

    defaults: {
        currentNav:"navDesign",// design, sim, assemble
        currentTab:"lattice",

        //last tab that one open in each of the main menus
        lastDesignTab: "lattice",
        lastSimulationTab: "physics",
        lastAssembleTab: "assembler",

        menuWrapper: null,

        allCellTypes: {octa:"Octahedron", cube:"Cube"},
        allConnectionTypes: {
            octa: {face:"Face", freeformFace:"Freeform Face", edge:"Edge", edgeRot:"Rotated Edge", vertex:"Vertex"},
            cube: {face:"Face"}
        },
        allPartTypes:{
            octa:{
                face: {triangle:"Triangle", beam:"Beam"},
                freeformFace: {triangle:"Triangle", beam:"Beam"},
                edge: {beam:"Beam", triangle:"Triangle"},
                edgeRot: {beam:"Beam"},
                vertex: {beam:"Beam", square:"Square", xShape:"X"}
            },
            cube:{
                face: {beam:"Beam"}
            }
        },

        menuIsVisible: true,

        //key bindings
        shift: false,
        deleteMode: false,
        extrudeMode: false
    },

    initialize: function(options){

        _.bindAll(this, "_handleKeyStroke");

        //bind events
        $(document).bind('keydown', {state:true}, this._handleKeyStroke);
        $(document).bind('keyup', {state:false}, this._handleKeyStroke);

        this.listenTo(this, "change:currentTab", this._storeTab);
        this.listenTo(this, "change:currentNav", this._updateCurrentTabForNav);
        this.listenTo(this, "change:currentTab", this._updateCellMode);

        this.lattice = options.lattice;//this doesn't need to be tracked for changes
        this.downKeys = {};//track keypresses to prevent repeat keystrokeson hold

        if (this.isMobile()) this.set("menuIsVisible", false);

        this.set("menuWrapper", new MenuWrapper({model: this}));
    },

    isMobile: function() {
//        var check = false;
//        (function(a,b){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
//        return check;
        return (window.innerWidth <= 700);
    },


    ///////////////////////////////////////////////////////////////////////////////
    /////////////////////EVENTS////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////


    _storeTab: function(){
        var currentNav = this.get("currentNav");
        var currentTab = this.get("currentTab");
        if (currentNav == "navDesign") this.set("lastDesignTab", currentTab);
        else if (currentNav == "navSim") this.set("lastSimulationTab", currentTab);
        else if (currentNav == "navAssemble") this.set("lastAssembleTab", currentTab);
    },

    _updateCellMode: function(){
        var currentTab = this.get("currentTab");
        if (currentTab == "lattice") this.lattice.set("cellMode", "cell");
        else if (currentTab == "import") this.lattice.set("cellMode", "cell");
        else if (currentTab == "sketch") this.lattice.set("cellMode", "cell");
        else if (currentTab == "part") this.lattice.set("cellMode", "part");
    },

    //update to last tab open in that section
    _updateCurrentTabForNav: function(){
        var navSelection = this.get("currentNav");
        if (navSelection == "navDesign") this.set("currentTab",
            this.get("lastDesignTab"), {silent:true});
        else if (navSelection == "navSim") this.set("currentTab",
            this.get("lastSimulationTab"), {silent:true});
        else if (navSelection == "navAssemble") this.set("currentTab",
            this.get("lastAssembleTab"), {silent:true});
        this._updateCellMode();//a little bit hacky, this updates the cell mode, but holds off on updating the menus til the animation has happened
    },

    ///////////////////////////////////////////////////////////////////////////////
    /////////////////////KEY BINDINGS//////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////

    _handleKeyStroke: function(e){//receives keyup and keydown

        if ($("input").is(':focus')) return;//we are typing in an input

        var state = e.data.state;
        var currentTab = this.get("currentTab");

        if (e.ctrlKey || e.metaKey){
        }else if (state) {
            if (this.downKeys[e.keyCode]) return;
            this.downKeys[e.keyCode] = true;
        } else this.downKeys[e.keyCode] = false;

//        console.log(e);
//        console.log(e.keyCode);
        switch(e.keyCode){
            case 16://shift
                this.set("shift", state);
                break;
            case 68://d delete mode
                if (this.get("cellMode") == "cell") this.set("deleteMode", state);//only for cell mode
                else this.set("deleteMode", false);
                break;
            case 69://e
//                if (currentTab != "sketch") return;
                this.set("extrudeMode", state);
                break;
            case 80://p part mode
                var cellMode = this.lattice.get("cellMode");
                if (cellMode == "part") this.lattice.set("cellMode", "cell");
                else if (cellMode == "cell") this.lattice.set("cellMode", "part");
                break;
            case 73://i inverse mode
                this.lattice.set("inverseMode", !this.lattice.get("inverseMode"));
                break;
            case 83://s save
                if (e.ctrlKey || e.metaKey){//command
                    e.preventDefault();
                    if (e.shiftKey){
                        $("#saveAsModel").modal("show");
                    } else {
                        dmaGlobals.lattice.saveJSON();
                    }
                }
                break;
            case 79://o open
                if (e.ctrlKey || e.metaKey){//command
                    e.preventDefault();
                    $("#jsonInput").click();
                }
                break;
            default:
                break;
        }
    }

});