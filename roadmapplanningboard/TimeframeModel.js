(function() {
    var Ext = window.Ext4 || window.Ext;

    /**
     * Timeframe Model
     */
    Ext.define('Rally.apps.roadmapplanningboard.TimeframeModel', {
        extend: 'Ext.data.Model',
        fields: [
            { name: 'id', type: 'string' },
            { name: 'name', type: 'string' },
            { name: 'start', type: 'date', dateFormat: 'c' },
            { name: 'end', type: 'date', dateFormat: 'c' }
        ],

        belongsTo: {
            model: 'Rally.apps.roadmapplanningboard.TimelineModel',
            foreignKey: 'timelineId'
        },
        
        proxy: {
            type: 'memory',
            reader: {
                type: 'json'
            }
        }
    });

})();