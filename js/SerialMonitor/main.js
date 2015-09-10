/**
 * Created by aghassaei on 9/9/15.
 */


require.config({

    paths: {
        jquery: '../../dependencies/jquery-2.1.3',
        underscore: '../../dependencies/underscore',
        backbone: '../../dependencies/backbone',
        text: '../../dependencies/require/text',
        three: '../../dependencies/three',
        socketio: '../../dependencies/socket.io-1.3.5',

        serialMonitor: 'SerialMonitor',
        serialMonitorView: 'SerialMonitorView',

        menuParent: '../menus/MenuParentView',
        commParentMenu: '../menus/CommParentMenu',
        plist: '../plists/PList',
        commPlist: '../plists/commPlist',
        serialComm: '../models/SerialComm'

    },

    shim: {
        three: {
            exports: 'THREE'
        },
        'socketio': {
            exports: 'io'
        }
    }

});

require(['serialMonitorView', 'serialMonitor'], function(SerialMonitorView, SerialMonitor){
    new SerialMonitorView({model: new SerialMonitor()});
});