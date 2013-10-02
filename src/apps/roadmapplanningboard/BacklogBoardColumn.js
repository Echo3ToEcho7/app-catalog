(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.roadmapplanningboard.BacklogBoardColumn', {
        extend: 'Rally.apps.roadmapplanningboard.PlanningBoardColumn',
        alias: 'widget.backlogplanningcolumn',
        inject: ['planStore'],
        config: {
            roadmap: null,
            columnHeaderConfig: {
                headerTpl: 'Backlog'
            }
        },

        getStoreFilter: function (model) {
            return [];
        },

        isMatchingRecord: function (featureRecord) {
            var _this = this;

            return !this.roadmap || (this.planStore.findBy(function (planRecord) {
                return _this.roadmap.plans().getById(planRecord.getId()) &&
                    (_.find(planRecord.get('features'), function (planFeatureRecord) {
                        return featureRecord.getId() === parseInt(planFeatureRecord.id, 10);
                    }));
            }, this)) === -1;
        }
    });

})();
