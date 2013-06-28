(function () {
    var Ext = window.Ext4 || window.Ext;
    Ext.Ajax.withCredentials = true;

    Ext.define('Rally.apps.roadmapplanningboard.RoadmapPlanningBoardApp', {
        extend: 'Rally.app.App',
        requires: [
            'Rally.apps.roadmapplanningboard.PlanningGridBoard',
            'Rally.apps.roadmapplanningboard.AppModelFactory',
            'Rally.apps.roadmapplanningboard.FeatureStore',
            'Rally.apps.roadmapplanningboard.TimeframeStore',
            'Rally.apps.roadmapplanningboard.PlanningStore',
            'Rally.apps.roadmapplanningboard.RoadmapStore'
        ],
        cls: 'planning-board roadmapPlanningBoardApp',
        componentCls: 'app',

        constructor: function(config) {
            Deft.Injector.configure({
                appModelFactory: {
                    className: 'Rally.apps.roadmapplanningboard.AppModelFactory'
                },
                featureStore: {
                    className: 'Rally.apps.roadmapplanningboard.FeatureStore'
                },
                timeframeStore: {
                    className: 'Rally.apps.roadmapplanningboard.TimeframeStore'
                },
                planningStore: {
                    className: 'Rally.apps.roadmapplanningboard.PlanningStore'
                },
                roadmapStore: {
                    className: 'Rally.apps.roadmapplanningboard.RoadmapStore'
                }
            });
            this.mergeConfig(config);
            this.callParent([this.config]);
        },

        launch: function () {
            var _this = this;

            roadmapStore = Deft.Injector.resolve('roadmapStore');
            timeframeStore = Deft.Injector.resolve('timeframeStore');

            roadmapStore.load(function () {
                timeframeStore.load(function () {
                    _this.add(Ext.create('Rally.apps.roadmapplanningboard.PlanningGridBoard', {
                        roadmapId: roadmapStore.first() ? roadmapStore.first().get('id') : undefined
                    }));

                });
            });
        }
    });

}).call(this);
