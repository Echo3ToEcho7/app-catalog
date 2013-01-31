(function() {
    var Ext = window.Ext4 || window.Ext;

    /**
     * Planning model
     */
    Ext.define('Rally.apps.roadmapplanningboard.PlanningModel', {
        extend: 'Ext.data.Model',
        fields: [
            { name: 'id', type: 'string' },
            { name: 'name', type: 'string' },
            { name: 'capacity', type: 'int' },
            { name: 'timeframe' }
        ],
        
        hasOne: {
            associationKey: 'timeframe',
            model: 'Rally.apps.roadmapplanningboard.TimelineModel',
            foreignKey: 'timeframe'
        },
         
        proxy: {
            type: 'memory',
            reader: {
                 type: 'json'
            }
        }
    });
})();