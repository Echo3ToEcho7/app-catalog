(function() {
    var Ext = window.Ext4 || window.Ext;

    var TIME_PERIOD_IN_MONTHS = 2;
    var TIME_PERIOD_IN_MILLIS = 1000 * 60 * 60 * 24 * 30 * TIME_PERIOD_IN_MONTHS;

    Ext.define("ProjectCFDCalculator", {
        extend: "Rally.data.lookback.calculator.TimeSeriesCalculator",

        getDerivedFieldsOnInput: function () {
            return [
                {
                    as: "Idea",
                    f: function (snapshot) {
                        return snapshot.ScheduleState === "Idea" ? 1 : 0;
                    }
                },
                {
                    as: "Defined",
                    f: function (snapshot) {
                        return snapshot.ScheduleState === "Defined" ? 1 : 0;
                    }
                },
                {
                    as: "In-Progress",
                    f: function (snapshot) {
                        return snapshot.ScheduleState === "In-Progress" ? 1 : 0;
                    }
                },
                {
                    as: "Completed",
                    f: function (snapshot) {
                        return snapshot.ScheduleState === "Completed" ? 1 : 0;
                    }
                },
                {
                    as: "Accepted",
                    f: function (snapshot) {
                        return snapshot.ScheduleState === "Accepted" ? 1 : 0;
                    }
                },
                {
                    as: "Released",
                    f: function (snapshot) {
                        return snapshot.ScheduleState === "Released" ? 1 : 0;
                    }
                }
            ];
        },

        getMetrics: function () {
            return [
                {
                    field: "Idea",
                    as: "Idea",
                    f: "sum",
                    display: "area"
                },
                {
                    field: "Defined",
                    as: "Defined",
                    f: "sum",
                    display: "area"
                },
                {
                    field: "In-Progress",
                    as: "In-Progress",
                    f: "sum",
                    display: "area"
                },
                {
                    field: "Completed",
                    as: "Completed",
                    f: "sum",
                    display: "area"
                },
                {
                    field: "Accepted",
                    as: "Accepted",
                    f: "sum",
                    display: "area"
                },
                {
                    field: "Released",
                    as: "Released",
                    f: "sum",
                    display: "area"
                }
            ];
        }
    });

    Ext.define("Rally.apps.charts.magic.cfd.CumulativeFlowChartApp", {
        extend: "Rally.app.App",
        settingsScope: "workspace",
        componentCls: 'app',

        requires: [
            "Rally.apps.charts.magic.ChartSettings"
        ],

        items: [
            {
                xtype: 'container',
                itemId: 'header',
                cls: 'header'
            }
        ],

        getSettingsFields: function () {
            return Rally.apps.charts.magic.ChartSettings.getFields();
        },

        launch: function() {
            this.callParent(arguments);
            var today = new Date();
            var timePeriod = new Date(today - TIME_PERIOD_IN_MILLIS);

            this.chartConfig.storeConfig.find['Project'] = this.getContext().getProject().ObjectID;
            this.chartConfig.storeConfig.find['_ValidFrom'] = {
                "$gt": timePeriod.toISOString()
            };
            this.chartConfig.chartConfig.title = {
                text: this.getContext().getProject().Name + " Cumulative Flow Diagram"
            };

            this.add(this.chartConfig);
        },

        chartConfig: {
            xtype: 'rallychart',

            storeConfig: {
                find: {
                    '_TypeHierarchy': 'HierarchicalRequirement',
                    'Children': null
                },
                fetch: ['ScheduleState', 'PlanEstimate'],
                hydrate: ['ScheduleState']
            },

            calculatorType: 'ProjectCFDCalculator',
            calculatorConfig: {
            },

            chartConfig: {
                chart: {
                    zoomType: 'xy'
                },
                title: {
                    text: 'Cumulative Flow Diagram'
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
        }

    });

}());
