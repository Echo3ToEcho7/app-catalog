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

        reader: {
            type: 'json',
            root: 'results'
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
            var uuidMapper = Deft.Injector.resolve('uuidMapper');

            if (operation.params && operation.params.workspace !== undefined) {
                return this.callParent(arguments);
            }

            var me = this;
            var context = operation.context || Rally.environment.getContext();

            uuidMapper.getUuid(context.getWorkspace()).then(function (uuid) {
                operation.params = operation.params || {};
                operation.params.workspace = uuid || '';

                return me.doRequest(operation, callback, scope);
            });
        },

        /**
         * This method will build the url running it through an {Ext.XTemplate} with the operation params
         * @param {Object} request
         * @returns {String} url
         */
        buildUrl: function (request) {
            var recordData = request.records && request.records[0].data || {}
            var data = _.merge({}, request.operation.params, recordData);
            return new Ext.XTemplate(this.getUrl(request)).apply(data);
        },

        buildRequest: function(operation) {
            var request = this.callParent(arguments);
            request.withCredentials = true;
            return request;
        }
    });

})();
