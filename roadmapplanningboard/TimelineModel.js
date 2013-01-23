(function() {
    var Ext = window.Ext4 || window.Ext;

    /**
     * Timeline Model
     */
    Ext.define('Orca.timeline.data.model.Timeline', {
        extend: 'Ext.data.Model',
        fields: [
            { name: 'id', type: 'string' },
            { name: 'name', type: 'string' }
        ],

        hasMany: { model: 'Orca.timeline.data.store.Timeframe', name: 'timeframes' },

        proxy: {
            type: 'memory',
            reader: {
                type: 'json'
            }
        }
    });
})();