(function() {

    var Ext = window.Ext4 || window.Ext;

    /**
     * @private
     * Proxy to talk to Rally REST JSON API services
     */
    Ext.define('Rally.apps.roadmapplanningboard.Proxy', {
        extend: 'Ext.data.proxy.Rest',
        requires: [
            'Rally.data.Proxy',
            'Rally.apps.roadmapplanningboard.Writer'
        ],
        alias: 'proxy.roadmap',

        reader: {
            type: 'json',
            root: 'data.results'
        },

        writer: {
            type: 'roadmap',
            writeAllFields: false
        },

        buildRequest: function(operation) {
            var request = this.callParent(arguments);
            request.withCredentials = true;
            return request;
        }
    });

})();
