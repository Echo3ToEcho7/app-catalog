(function() {
    var Ext = window.Ext4 || window.Ext;

    Ext.define("Rally.apps.charts.burndown.BurnDownChart", {
        requires: [
            "Rally.ui.chart.Chart"
        ],

        chartComponentConfig: {
            xtype: "rallychart",

            noDataMessage: "There could be no stories available or started for this portfolio item, missing plan estimate values, or work on this portfolio item has not yet been started.",

            storeType: "Rally.data.lookback.SnapshotStore",
            storeConfig: {
                find: {
                    "_TypeHierarchy": -51038,
                    "Children": null
//                    "Iteration": 9693020302
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
    });
}());
