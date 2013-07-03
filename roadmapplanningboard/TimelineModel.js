(function() {
    var Ext = window.Ext4 || window.Ext;

    /**
     * Timeline Model
     */
    Ext.define('Rally.apps.roadmapplanningboard.TimelineModel', {
        extend: 'Ext.data.Model',
        fields: [
            { name: 'id', type: 'string' },
            { name: 'name', type: 'string' }
        ],

        hasMany: { model: 'Rally.apps.roadmapplanningboard.TimeframeModel', name: 'timeframes' },

        proxy: {
            type: 'memory',
            reader: {
                type: 'json'
            }
        }
    });
})();