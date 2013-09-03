(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.roadmapplanningboard.RoadmapPlanningBoardApp', {
        extend: 'Rally.app.App',
        requires: [
            'Rally.apps.roadmapplanningboard.PlanningGridBoard',
            'Rally.apps.roadmapplanningboard.AppModelFactory'
        ],
        cls: 'roadmapPlanningBoardApp planning-board',
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
            timeframeStore = Deft.Injector.resolve('timeframeStore');

            roadmapStore.load(function() {
                timeframeStore.load(function() {
                    _this.add(Ext.create('Rally.apps.roadmapplanningboard.PlanningGridBoard', {
                        roadmapId: roadmapStore.first() ? roadmapStore.first().getId() : undefined
                    }));
                });
            });
        }
    });

}).call(this);
