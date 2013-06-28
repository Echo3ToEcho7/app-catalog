(function () {
    var Ext;

    Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.roadmapplanningboard.BacklogBoardColumn', {
        extend: 'Rally.apps.roadmapplanningboard.PlanningBoardColumn',
        alias: 'widget.backlogplanningcolumn',
        inject: ['featureStore', 'planningStore'],
        config: {
            roadmap: null,
            columnHeaderConfig: {
                headerTpl: 'Backlog'
            }
        },
        onAfterRender: function () {
        },
        getStores: function () {
            return [this.featureStore];
        },
        isMatchingRecord: function (featureRecord) {
            var _this = this;

            return !this.roadmap || (this.planningStore.findBy(function (planningRecord) {
                return _this.roadmap.plans().getById(planningRecord.get('id')) && (planningRecord.features().findBy(function (planFeatureRecord) {
                    return featureRecord.id === planFeatureRecord.id;
                }, _this)) >= 0;
            }, this)) === -1;
        }
    });

}).call(this);
