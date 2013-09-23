(function() {
    var Ext = window.Ext4 || window.Ext;

    var TIME_PERIOD_IN_MILLIS = 7776000000; // 3 months in milliseconds
    //var TIME_PERIOD_IN_MILLIS = 5184000000; // 2 months in milliseconds
    //var TIME_PERIOD_IN_MILLIS = 2592000000; // 1 month in milliseconds

    Ext.define("ProjectCFDCalculator", {
        extend: "Rally.data.lookback.calculator.TimeSeriesCalculator",

        getMetrics: function() {
            var stateFieldName = this.stateFieldName;
            var stateFieldValues = this.stateFieldValues.split(',');

            var metrics = [
                {f: 'groupByCount', groupByField: stateFieldName, allowedValues: stateFieldValues}
            ];

            for (var i = 0; i < stateFieldValues.length; ++i) {
                metrics.push(
                    {as: stateFieldValues[i], field: stateFieldValues[i], f: 'sum', display: 'area'}
                );
            }
            return metrics;
        }
    });

    Ext.define("Rally.apps.charts.magic.cfd.CumulativeFlowChartApp", {
        name: 'chartapp',
        alias: 'widget.charts_magic_cfd_cumulativeflowchartapp',
        extend: "Rally.app.App",
        settingsScope: "workspace",
        componentCls: 'app',

        requires: [
            'Rally.ui.chart.Chart',
            'Rally.apps.charts.magic.ChartSettings'
        ],

        config: {
            defaultSettings: {
                stateFieldName: 'ScheduleState',
                stateFieldValues: 'Idea,Defined,In-Progress,Completed,Accepted,Released'
            }
        },

        chartSettings: undefined, // ChartSettings object

        items: [
            {
                xtype: 'container',
                itemId: 'header',
                cls: 'header'
            }
        ],

        getSettingsFields: function () {
            if (!this.chartSettings) {
                this.chartSettings = Ext.create('Rally.apps.charts.magic.ChartSettings', {
                    app: this
                });
            }
            return this.chartSettings.getFields();
        },

        launch: function() {
            this.add(this._getChartAppConfig());
            this._publishComponentReady();
        },

        _getChartAppConfig: function() {
            return {
                xtype: 'rallychart',

                storeConfig: this._getChartStoreConfig(),
                calculatorType: 'ProjectCFDCalculator',
                calculatorConfig: this._getChartCalculatorConfig(),

                chartColors: [  // RGB values obtained from here: http://ux-blog.rallydev.com/?cat=23
                    "#C0C0C0",  // $grey4
                    "#FF8200",  // $orange
                    "#F6A900",  // $gold
                    "#FAD200",  // $yellow
                    "#8DC63F",  // $lime
                    "#1E7C00",  // $green_dk
                    "#337EC6",  // $blue_link
                    "#005EB8",  // $blue
                    "#7832A5",  // $purple
                    "#DA1884"   // $pink
                ],

                listeners: {
                    chartRendered: this._publishComponentReady,
                    scope: this
                },

                chartConfig: {
                    chart: {
                        zoomType: 'xy'
                    },
                    title: {
                        text: this.getContext().getProject().Name + ' Cumulative Flow Diagram'
                    },
                    xAxis: {
                        tickmarkPlacement: 'on',
                        tickInterval: 20,
                        title: {
                            text: 'Days'
                        }
                    },
                    yAxis: [
                        {
                            title: {
                                text: 'Count'
                            }
                        }
                    ],
                    plotOptions: {
                        series: {
                            marker: {
                                enabled: false
                            }
                        },
                        area: {
                            stacking: 'normal'
                        }
                    }
                }
            };
        },

        _getChartStoreConfig: function() {
            return {
                find: {
                    'Project': this.getContext().getProject().ObjectID,
                    '_TypeHierarchy': 'HierarchicalRequirement',
                    'Children': null,
                    '_ValidFrom': {
                        "$gt": this._getChartStoreConfigValidFrom()
                    }
                },
                fetch: this._getChartStoreConfigFetch(),
                hydrate: this._getChartStoreConfigHydrate()
            };
        },

        _getChartStoreConfigValidFrom: function() {
            var today = new Date();
            var timePeriod = new Date(today - TIME_PERIOD_IN_MILLIS);
            return timePeriod.toISOString();
        },

        _getChartStoreConfigFetch: function() {
            var stateFieldName = this.getSetting('stateFieldName');
            return [stateFieldName, 'PlanEstimate'];
        },

        _getChartStoreConfigHydrate: function() {
            var stateFieldName = this.getSetting('stateFieldName');
            return [stateFieldName];
        },

        _getChartCalculatorConfig: function() {
            var stateFieldName = this.getSetting('stateFieldName');
            var stateFieldValues = this.getSetting('stateFieldValues');

            return {
                stateFieldName: stateFieldName,
                stateFieldValues: stateFieldValues
            };
        },

        _publishComponentReady: function() {
            if (Rally.BrowserTest) {
                Rally.BrowserTest.publishComponentReady(this);
            }
        }

    });

}());
