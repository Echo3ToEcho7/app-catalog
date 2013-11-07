(function() {
    var Ext = window.Ext4 || window.Ext;

    /**
     * @private
     * A {@link Ext.data.writer.Json} subclass that talks to a Rally REST JSON API service
     */
    Ext.define('Rally.apps.roadmapplanningboard.Writer', {
        extend: 'Ext.data.writer.Json',
        alias: 'writer.roadmap',

        root: 'data',

        write: function (request) {
            this.callParent(arguments);

            _.map(request.records, function (record) {
                var fields = record.getDirtyCollectionFields();
                if (fields.length) {
                    request = this.processCollectionField(fields, record, request);
                }
            }, this);

            return request;
        },

        /**
         *
         * @param {Rally.data.Field[]} fields The dirty collections fields to process
         * @param {Rally.data.Model} record The record we are processing
         * @param {} request
         * @returns {*}
         */
        processCollectionField: function (fields, record, request) {
            // make sure this is the only change
            if (record.getDirtyFields().length > 1) {
                Ext.Error.raise('Cannot update other fields on a record if a collection has changed');
            }

            var fieldName = fields[0].name;
            request.url = record.getUri() + '/' + fieldName;

            var oldValue = record.modified[fieldName];
            var newValue = record.get(fieldName);

            if (newValue.length > oldValue.length) {
                request.action = 'create';
                request.jsonData = {
                    data: {}
                };
                ids = _.difference(_.pluck(newValue, record.idProperty), _.pluck(oldValue, record.idProperty));
                request.jsonData.data[fieldName] = _.filter(newValue, function (value) {
                    return _.contains(ids, value.id);
                });
            } else {
                var deletedRelationships = _.difference(_.pluck(oldValue, record.idProperty), _.pluck(newValue, record.idProperty));

                // make sure we're only removing 1 relationship
                if (deletedRelationships.length > 1) {
                    Ext.Error.raise('Cannot delete more than one relationship at a time');
                }
                request.action = 'destroy';
                request.url += '/' + deletedRelationships[0];
            }

            return request;
        }
    });
})();
