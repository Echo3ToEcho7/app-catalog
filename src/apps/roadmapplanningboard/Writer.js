(function() {
    var Ext = window.Ext4 || window.Ext;

    /**
     * @private
     * A {@link Ext.data.writer.Json} subclass that talks to a Rally REST JSON API service
     */
    Ext.define('Rally.apps.roadmapplanningboard.Writer', {
        extend: 'Ext.data.writer.Json',
        alias: 'writer.roadmap',

        root: '',

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
            request.url += '/' + fieldName;

            var oldValue = record.modified[fieldName];
            var newValue = record.get(fieldName);

            if (newValue.length > oldValue.length) {
                // make sure we're only adding 1 relationship
                if (newValue.length - oldValue.length > 1) {
                    Ext.Error.raise('Cannot add more than one relationship at a time');
                }
                request.action = 'create';

                var id = _.difference(_.pluck(newValue, record.idProperty), _.pluck(oldValue, record.idProperty))[0];
                request.jsonData = _.find(newValue, function (value) {
                    return id === value.id;
                });
            } else {
                // make sure we're only removing 1 relationship
                if (oldValue.length - newValue.length > 1) {
                    Ext.Error.raise('Cannot delete more than one relationship at a time');
                }

                var deletedRelationships = _.difference(_.pluck(oldValue, record.idProperty), _.pluck(newValue, record.idProperty));

                request.action = 'destroy';
                request.url += '/' + deletedRelationships[0];
                delete request.jsonData;
            }

            return request;
        },

        /**
         * Return only changes without the id
         * @param {Rally.data.Model} record The record to save
         * @returns {Object} what to save
         */
        getRecordData: function (record) {
            return record.getChanges();
        }
    });
})();
