(function () {
    var Ext = window.Ext4 || window.Ext;
    Ext.Ajax.withCredentials = true;

    Ext.define('Rally.apps.roadmapplanningboard.RoadmapPlanningBoardApp', {
        extend: 'Rally.app.App',
        inject: ['timeframeStore', 'roadmapStore'],
        requires: ['Rally.apps.roadmapplanningboard.PlanningGridBoard'],
        cls: 'planning-board roadmapPlanningBoardApp',
        componentCls: 'app',
        launch: function () {
            var _this = this;

            this.roadmapStore.load(function () {
                _this.timeframeStore.load(function () {
                    _this.add(Ext.create('Rally.apps.roadmapplanningboard.PlanningGridBoard', {
                        roadmapId: _this.roadmapStore.first() ? _this.roadmapStore.first().get('id') : undefined
                    }));

                });
            });
        }
    });

}).call(this);
