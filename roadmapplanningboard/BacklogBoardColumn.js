(function () {
    var Ext;

    Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.roadmapplanningboard.BacklogBoardColumn', {
        extend: 'Rally.apps.roadmapplanningboard.PlanningBoardColumn',
        alias: 'widget.backlogplanningcolumn',
        inject: ['planStore'],
        config: {
            roadmap: null,
            lowestPIType: undefined,
            columnHeaderConfig: {
                headerTpl: 'Backlog'
            }
        },

        getStores: function (models) {
            return [
                Ext.create('Rally.data.WsapiDataStore', {
                    model: this.lowestPIType,
                    autoLoad: true,
                    fetch: ['Value','FormattedID', 'Owner','Name', 'PreliminaryEstimate', 'DisplayColor']
                })
            ];
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

}).call(this);
