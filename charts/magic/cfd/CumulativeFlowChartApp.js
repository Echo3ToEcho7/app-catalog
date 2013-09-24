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
        componentCls: 'cfd-app',

        requires: [
            "Rally.apps.charts.magic.ChartSettings",
            "Rally.ui.chart.Chart",
            "Rally.util.DateTime"
        ],

        items: [
            {
                xtype: 'container',
                itemId: 'header',
                cls: 'header'
            }
        ],

        config: {
            defaultSettings: {
                timeFrameQuantity: 90,
                timeFrameUnit: 'day'
            }
        },

        getSettingsFields: function () {
            return Rally.apps.charts.magic.ChartSettings.getFields();
        },

        launch: function() {
            this.callParent(arguments);
            var project = this.getContext().getProject();
            var today = new Date();
            var timeFrame = this.getSetting("timeFrame");
            if( ! timeFrame ) {
                timeFrame = this.config.defaultSettings;
            }
            var validFromDate = Rally.util.DateTime.add( today, timeFrame.timeFrameUnit, - timeFrame.timeFrameQuantity );
            var validFromStr = validFromDate.toISOString();

            this.chartConfig.storeConfig.find.Project = project.ObjectID;
            this.chartConfig.storeConfig.find._ValidFrom = { "$gt": validFromStr };
            this.chartConfig.chartConfig.title = { text: project.Name + " Cumulative Flow Diagram" };

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
