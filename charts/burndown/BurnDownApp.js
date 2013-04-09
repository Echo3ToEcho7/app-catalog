(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define("Rally.apps.charts.burndown.BurnDownApp", {
        extend: "Rally.app.App",
        settingsScope: "workspace",

        requires: [
            "Rally.apps.charts.burndown.Settings",
            "Rally.ui.chart.Chart",
            "Rally.ui.combobox.IterationComboBox",
            "Rally.ui.combobox.ReleaseComboBox"
        ],

        cls: "burndown-app",

        help: {
            cls: "burndown-help-container",
            id: 0
        },

        launch: function() {
            this.callParent(arguments);

            var context = this.getContext();
            if(context && context.getTimeboxScope()) {
                var dashboard_type = context.getTimeboxScope().getType();

                if(dashboard_type === 'release') {

                } else if(dashboard_type === 'iteration') {

                } else {
                    // not sure how this would ever get run...
                }
            } else {
                this._addTimeRangePicker();
            }
        },

        getSettingsFields: function() {
            var context = this.getContext();
            return Rally.apps.charts.burndown.Settings.getFields(this, context);
        },

        onTimeboxScopeChange: function(scope) {
            console.log('scope changed');
            this.callParent(arguments);
        },

        _addIterationPicker: function() {
            this.down('#chartControls').add([
                {
                    xtype: 'label',
                    text: 'Iteration: '
                },
                {
                    xtype: 'rallyiterationcombobox',
                    listeners: {
                        change: this.onTimeboxScopeChange,
                        scope: this
                    }
                }
            ]);
        },

        _addReleasePicker: function() {
            this.down('#chartControls').add([
                {
                    xtype: 'label',
                    text: 'Release: '
                },
                {
                    xtype: 'rallyreleasecombobox',
                    listeners: {
                        change: this.onTimeboxScopeChange,
                        scope: this
                    }
                }
            ]);
        },

        _addTimeRangePicker: function() {
            var chartLevel = this.getSetting('chartLevel');

            if(chartLevel === 'iteration') {
                this._addIterationPicker();
            } else if(chartLevel === 'release') {
                this._addReleasePicker();
            } else {}
        },

        items: [
            {
                xtype: "container",
                itemId: "chartControls",
                cls: "chartControls"
            },
            {
                xtype: "rallychart",

                noDataMessage: "There could be no stories available or started for this portfolio item, missing plan estimate values, or work on this portfolio item has not yet been started.",

                storeType: "Rally.data.lookback.SnapshotStore",
                storeConfig: {
                    find: {
                        "_TypeHierarchy": -51038,
                        "Children": null,
                        "Iteration": 9693020302
                    },
                    fetch: ["ScheduleState", "PlanEstimate", "TaskEstimateTotal"],
                    hydrate: ["ScheduleState"],
                    sort: {
                        "_ValidFrom": 1
                    }
                },

                calculatorType: "Rally.apps.charts.burndown.BurnDownCalculator",
                calculatorConfig: {
                    workDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                    timeZone: "GMT",
                    completedScheduleStateNames: ["Accepted", "Released"]
                },

                chartColors: ['#3399ff', '#66cc33'],

                chartConfig: {
                    chart: {
                        zoomType: "xy"
                    },
                    xAxis: {
                        categories: [],
                        tickmarkPlacement: "on",
                        tickInterval: 5,
                        title: {
                            text: "Days"
                        }
                    },
                    yAxis: [
                        {
                            title: {
                                text: "Count"
                            }
                        }
                    ],
                    tooltip: {
                        formatter: function () {
                            return "" + this.x + "<br />" + this.series.name + ": " + this.y;
                        }
                    },
                    plotOptions: {
                        series: {
                            marker: {
                                enabled: false,
                                states: {
                                    hover: {
                                        enabled: true
                                    }
                                }
                            }
                        },
                        column: {
                            pointPadding: 0,
                            borderWidth: 0,
                            stacking: null,
                            shadow: false
                        }
                    }
                }
            }
        ]
    });
}());
