(function() {
    var Ext = window.Ext4 || window.Ext;

    /**
     * Extra data types for Rally REST JSON API
     * @private
     */
    Ext.define('Rally.apps.roadmapplanningboard.DataTypes', {}, function () {
        Ext.apply(Ext.data.Types, {
            /**
             * @property {Object} COLLECTION
             */
            COLLECTION: {
                type: 'collection',
                sortType: Ext.data.SortTypes.none
            }
        });
    });
})();
