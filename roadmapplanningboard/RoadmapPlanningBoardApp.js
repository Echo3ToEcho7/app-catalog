(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.roadmapplanningboard.RoadmapPlanningBoardApp', {
        extend: 'Rally.app.App',
        requires: [
            'Rally.apps.roadmapplanningboard.PlanningGridBoard',
            'Rally.apps.roadmapplanningboard.plugin.RoadmapScrollable',
            'Rally.apps.roadmapplanningboard.AppModelFactory'
        ],
        cls: 'roadmapPlanningBoardApp',
        componentCls: 'app',

        constructor: function(config) {
            Deft.Injector.configure({
                timeframeStore: {
                    className: 'Ext.data.Store',
                    parameters: [{
                        model: Rally.apps.roadmapplanningboard.AppModelFactory.getTimeframeModel()
                    }]
                },
                planStore: {
                    className: 'Ext.data.Store',
                    parameters: [{
                        model: Rally.apps.roadmapplanningboard.AppModelFactory.getPlanModel()
                    }]
                },
                roadmapStore: {
                    className: 'Ext.data.Store',
                    parameters: [{
                        model: Rally.apps.roadmapplanningboard.AppModelFactory.getRoadmapModel()
                    }]
                }
            });
            this.mergeConfig(config);
            this.callParent([this.config]);
        },

        launch: function () {
            var _this = this;

            roadmapStore = Deft.Injector.resolve('roadmapStore');

            roadmapStore.load(function() {
                _this.add(Ext.create('Rally.apps.roadmapplanningboard.PlanningBoard', {
                    roadmapId: roadmapStore.first() ? roadmapStore.first().getId() : undefined,
                    plugins: [
                        {
                            ptype: 'rallytimeframescrollablecardboard', timeframeColumnCount: 4
                        },
                        {
                            ptype: 'rallyfixedheadercardboard'
                        }
                    ]
                }));
            });
        }
    });

}).call(this);
