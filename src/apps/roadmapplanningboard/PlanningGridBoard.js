(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.roadmapplanningboard.PlanningGridBoard', {
        extend: 'Rally.ui.gridboard.GridBoard',
        requires: [
            'Rally.apps.roadmapplanningboard.plugin.RoadmapScrollable',
            'Rally.apps.roadmapplanningboard.PlanningBoard'
        ],
        config: {
            roadmapId: null
        },

        _getBoardConfig: function () {
            return {
                itemId: 'gridOrBoard',
                xtype: 'roadmapplanningboard',
                context: this.context,
                roadmapId: this.roadmapId,
                plugins: [
                    {
                        ptype: 'rallytimeframescrollablecardboard'
                    }
                ]
            };
        }
    });

})();
