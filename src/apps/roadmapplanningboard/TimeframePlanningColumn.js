(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.roadmapplanningboard.TimeframePlanningColumn', {
        extend: 'Rally.apps.roadmapplanningboard.PlanningBoardColumn',
        alias: 'widget.timeframeplanningcolumn',
        
        requires: [
            'Rally.data.QueryFilter',
            'Rally.apps.roadmapplanningboard.ThemeHeader',
            'Rally.apps.roadmapplanningboard.PlanCapacityProgressBar',
            'Rally.apps.roadmapplanningboard.util.Fraction',
            'Rally.apps.roadmapplanningboard.PlanningCapacityPopoverView'
        ],
        
        config: {
            startDateField: 'start',
            endDateField: 'end',
            timeframeRecord: undefined,
            planRecord: undefined,
            dateFormat: 'M j',
            headerTemplate: undefined,
            pointField: 'PreliminaryEstimate',
            progressBarTitle: 'Edit Planned Capacity Range'
        },
        
        initComponent: function () {

            this.callParent(arguments);

            this.on('ready', this.drawHeader, this);
            this.on('addcard', this.drawHeader, this);
            this.on('cardupdated', this.drawHeader, this);
            this.on('removecard', this.drawHeader, this);

            this.on('afterrender', this.onAfterRender, this);
            if (this.planRecord && this.planRecord.store) {
                this.planRecord.store.on('update', function () {
                    return this.drawHeader();
                }, this);
            }
        },

        onAfterRender: function (event) {
            this.columnHeader.getEl().on('click', this.onProgressBarClick, this, {
                delegate: '.progress-bar-container'
            });
            return this.columnHeader.getEl().on('click', this.onTimeframeDatesClick, this, {
                delegate: '.timeframeDates'
            });
        },

        getStoreFilter: function (model) {
            var result = _.reduce(this.planRecord.data.features, function(result, feature) {
                var filter = Ext.create('Rally.data.QueryFilter', {
                    property: 'ObjectID',
                    operator: '=',
                    value: feature.id
                });
                if (!result) {
                    return filter;
                } else {
                    return result.or(filter);
                }
            }, null);
            return result || [];
        },

        onProgressBarClick: function (event) {
            var _this = this;

            if (this.popover) {
                return;
            }
            this.popover = Ext.create('Rally.apps.roadmapplanningboard.PlanningCapacityPopoverView', {
                target: Ext.get(event.target),
                owner: this,
                offsetFromTarget: [
                    {
                        x: 0,
                        y: 0
                    },
                    {
                        x: 0,
                        y: 0
                    },
                    {
                        x: 0,
                        y: 16
                    },
                    {
                        x: 0,
                        y: 0
                    }
                ],
                controllerConfig: {
                    model: this.planRecord
                },
                listeners: {
                    beforedestroy: function () {
                        _this.popover = null;
                    }
                }
            });
            return this.popover;
        },

        onTimeframeDatesClick: function (event) {
            var _this = this;

            return Ext.create('Rally.apps.roadmapplanningboard.TimeframeDatesPopoverView', {
                target: Ext.get(event.target),
                offsetFromTarget: [
                    {
                        x: 0,
                        y: 0
                    },
                    {
                        x: 0,
                        y: 0
                    },
                    {
                        x: 0,
                        y: 5
                    },
                    {
                        x: 0,
                        y: 0
                    }
                ],
                controllerConfig: {
                    model: this.timeframeRecord
                },
                listeners: {
                    destroy: function () {
                        return _this._drawDateRange();
                    }
                }
            });
        },

        _drawDateRange: function () {
            if (this.dateRange) {
                return this.dateRange.update(this.getDateHeaderTplData());
            } else {
                this.dateRange = this.getHeaderTitle().add({
                    xtype: 'component',
                    tpl: "<div class='timeframeDates'>{formattedDate}</div>",
                    data: this.getDateHeaderTplData()
                });
            }
        },

        _drawProgressBar: function () {
            if (this.progressBar) {
                return this.progressBar.update(this.getHeaderTplData());
            } else {
                this.progressBar = this.getColumnHeader().add({
                    xtype: 'container',
                    tpl: "<div class='progress-bar-background'>\n    <div title='{progressBarTitle}'>{progressBarHtml}</div>\n    <div class='progress-bar-percent-done'>{formattedPercent}</div>\n</div>",
                    data: this.getHeaderTplData()
                });
            }
        },

        _drawTheme: function () {
            if (!this.theme && this.planRecord) {
                this.theme = this.getColumnHeader().add({
                    xtype: 'roadmapthemeheader',
                    record: this.planRecord,
                    style: {
                        display: this.ownerCardboard.showTheme ? '': 'none' // DE18305 - using style.display instead of hidden because Ext won't render children that are hidden
                    }
                });
            }
        },

        getHeaderTplData: function () {
            var fraction, _ref,
                _this = this;

            fraction = Ext.create('Rally.apps.roadmapplanningboard.util.Fraction', {
                denominator: ((_ref = this.planRecord) !== null ? _ref.get('highCapacity') : undefined) || 0,
                numeratorItems: this.getCards(true),
                numeratorItemValueFunction: function (card) {
                    if (card.getRecord().get(_this.pointField)) {
                        return card.getRecord().get(_this.pointField).Value || 0;
                    }
                    return 0;
                }
            });
            return {
                progressBarHtml: this._getProgressBarHtml(fraction),
                formattedPercent: fraction.getFormattedPercent(),
                progressBarTitle: this.progressBarTitle
            };
        },

        getDateHeaderTplData: function () {
            return {
                formattedDate: this._getDateRange()
            };
        },

        drawHeader: function () {
            this.callParent(arguments);
            this._drawDateRange();
            this._drawProgressBar();
            return this._drawTheme();
        },

        _getDateRange: function () {
            var formattedEndDate, formattedStartDate;

            formattedStartDate = this._getFormattedDate(this.startDateField);
            formattedEndDate = this._getFormattedDate(this.endDateField);
            if (!formattedStartDate && !formattedEndDate) {
                return "&nbsp;";
            }
            return "" + formattedStartDate + " - " + formattedEndDate;
        },

        _getFormattedDate: function (dateField) {
            var date;

            date = this.timeframeRecord.get(dateField);
            if (date) {
                return Ext.Date.format(date, this.dateFormat);
            }
        },

        _getProgressBarHtml: function (fraction) {
            var _ref, _ref1;

            return Ext.create('Rally.apps.roadmapplanningboard.PlanCapacityProgressBar').apply({
                low: ((_ref = this.planRecord) !== null ? _ref.get('lowCapacity') : undefined) || 0,
                high: ((_ref1 = this.planRecord) !== null ? _ref1.get('highCapacity') : undefined) || 0,
                total: fraction.getNumerator(),
                percentDone: fraction.getPercent()
            });
        }
    });

})();
