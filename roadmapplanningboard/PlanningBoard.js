(function () {
    var Ext = window.Ext4 || window.Ext;
    Ext.define('Rally.apps.roadmapplanningboard.PlanningBoard', {
        extend: 'Rally.ui.cardboard.CardBoard',
        plugins: [
            {
                ptype: 'rallyfixedheadercardboard'
            }
        ],
        alias: 'widget.roadmapplanningboard',
        inject: ['timeframeStore', 'planningStore', 'roadmapStore', 'appModelFactory'],
        requires: ['Rally.data.util.PortfolioItemHelper', 'Rally.ui.cardboard.plugin.FixedHeader', 'Rally.apps.roadmapplanningboard.PlanningBoardColumn', 'Rally.apps.roadmapplanningboard.TimeframePlanningColumn', 'Rally.apps.roadmapplanningboard.BacklogBoardColumn'],
        config: {
            roadmapId: null,
            cardConfig: {
                fields: ['FormattedID', 'Owner','Name', 'PreliminaryEstimate'],
                skipDefaultFields: true
            },
            ddGroup: 'planningBoard',
            dropAllowed: "planningBoard",
            dropNotAllowed: "planningBoard"
        },
        _roadmap: null,

        _retrieveModels: function () {
            var _this = this;
            this._roadmap = this.roadmapStore.getById(this.roadmapId);

            this._retrieveLowestLevelPI(function(record) {
                _this.lowestPIType = record.get('TypePath');
                _this.planningStore.load(function() {
                    _this.timeframeStore.load(function() {
                        _this._buildColumnsFromStore();
                    });
                });
            });
        },

        _retrieveLowestLevelPI: function(callback) {
            Rally.data.util.PortfolioItemHelper.loadTypeOrDefault({
                defaultToLowest: true,
                success: callback,
                scope: this
            });
        },

        _buildColumnsFromStore: function () {
            var _ref,
                _this = this;

            this.columnDefinitions = [];
            this.addColumn(this._getBacklogColumnConfig());
            if (this._roadmap) {
                this.timeframeStore.each(function (timeframe) {
                    return _this._addColumnFromTimeframe(timeframe, _this._roadmap.plans());
                });
            }

            var _column = this.columnDefinitions[this.columnDefinitions.length - 1];
            if ( _column !== null) {
                _column.isRightmostColumn = true;
            }
            return this._renderColumns();
        },

        _getBacklogColumnConfig: function () {
            return {
                xtype: 'backlogplanningcolumn',
                lowestPIType: this.lowestPIType,
                cls: 'column backlog',
                roadmap: this._roadmap
            };
        },

        _addColumnFromTimeframe: function (timeframe, roadmapResultPlans) {
            var planForTimeframe;

            planForTimeframe = this.planningStore.getAt(this.planningStore.findBy(function (record) {
                return record.get('timeframe').id === timeframe.getId();
            }));
            if (!planForTimeframe || (roadmapResultPlans.findBy(function (record) {
                return record.data.id === planForTimeframe.data.id;
            })) === -1) {
                return null;
            }
            return this._addColumnFromTimeframeAndPlan(timeframe, planForTimeframe);
        },

        _addColumnFromTimeframeAndPlan: function (timeframe, plan) {
            var _this = this;

            return this.addColumn({
                xtype: 'timeframeplanningcolumn',
                lowestPIType: this.lowestPIType,
                timeboxRecord: timeframe,
                planRecord: plan,
                columnHeaderConfig: {
                    record: timeframe,
                    fieldToDisplay: 'name',
                    editable: true
                },
                isMatchingRecord: function (featureRecord) {
                    return plan && plan.features().findExact('id', '' + featureRecord.get('ObjectID')) >= 0;
                }
            });
        }
    });

}).call(this);
