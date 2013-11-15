(function() {

    var Ext = window.Ext4 || window.Ext;

    /**
     * @private
     * Proxy to talk to Rally REST JSON API services
     */
    Ext.define('Rally.apps.roadmapplanningboard.Proxy', {
        extend: 'Ext.data.proxy.Rest',
        requires: [
            'Rally.apps.roadmapplanningboard.Writer'
        ],
        alias: 'proxy.roadmap',

        inject: 'uuidMapper',

        reader: {
            type: 'json',
            root: 'data.results'
        },

        writer: {
            type: 'roadmap',
            writeAllFields: false
        },

        /**
         * Attach a workspace uuid to the request. This would naturally go into the buildRequest
         * method, but that is a sync call. We need to delay the actual request until we have
         * a uuid. Note this will be deprecated when v3.0 rolls out.
         */
        doRequest: function (operation, callback, scope) {

            if (operation.params && operation.params.workspace !== undefined) {
                return this.callParent(arguments);
            }

            var me = this;
            var context = operation.context || Rally.environment.getContext();

            this.uuidMapper.getUuid(context.getWorkspace()).then(function (uuid) {
                operation.params = operation.params || {};
                operation.params.workspace = uuid || '';

                return me.doRequest(operation, callback, scope);
            });
        },

        buildRequest: function(operation) {
            var request = this.callParent(arguments);
            request.withCredentials = true;
            return request;
        }
    });

})();
