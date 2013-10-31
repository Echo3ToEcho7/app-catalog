(function() {
    var Ext = window.Ext4 || window.Ext;

    /**
     * @private
     * The base class for all models interacting with the Rally REST JSON API. This class will not generally be used directly.
     * Use Rally.data.ModelFactory#getModel and Rally.data.ModelFactory#getModels to obtain model instances for specific object types.
     *
     * See [Data Models](#!/guide/data_models) for more information on models.
     */
    Ext.define('Rally.apps.roadmapplanningboard.Model', {
        extend: 'Rally.data.Model',

        requires: [
            'Rally.apps.roadmapplanningboard.DataTypes'
        ],

        uriKey: 'ref',

        /**
         * Return all fields that are of the collection type
         * @returns {Rally.data.Field[]} all fields that are collections
         */
        getCollectionFields: function () {
            return _.filter(this.getFields(), function (field) {
                return field.type === Ext.data.Types.COLLECTION;
            });
        },

        /**
         *
         * @returns {Rally.data.Field[]} all fields that are collection fields and are dirty
         */
        getDirtyCollectionFields: function () {
            return _.intersection(this.getCollectionFields(), this.getDirtyFields());
        }
    });
})();
