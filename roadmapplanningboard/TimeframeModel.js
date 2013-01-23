(function() {
    var Ext = window.Ext4 || window.Ext;

    /**
     * Timeframe Model
     */
    Ext.define('Orca.timeline.data.model.Timeframe', {
        extend: 'Ext.data.Model',
        fields: [
            { name: 'id', type: 'string' },
            { name: 'name', type: 'string' },
            { name: 'start', type: 'date', dateFormat: 'c' },
            { name: 'end', type: 'date', dateFormat: 'c' }
        ],

        belongsTo: {
            model: 'Orca.timeline.data.store.Timeline',
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