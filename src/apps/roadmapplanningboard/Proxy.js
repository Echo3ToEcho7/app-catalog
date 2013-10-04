(function() {

    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.roadmapplanningboard.Proxy', {
        extend: 'Ext.data.proxy.Rest',
        requires: ['Rally.data.Proxy'],
        alias: 'proxy.roadmap',

        reader: {
            type: 'json',
            root: 'data.results'
        },

        writer: {
            type: 'json',
            root: 'data',
            writeAllFields: false
        },

        buildRequest: function(operation) {
            var request = this.callParent(arguments);
            request.withCredentials = true;
            return request;
        }
    });

})();
