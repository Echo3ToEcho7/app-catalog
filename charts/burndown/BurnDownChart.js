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
                },
                fetch: ["ScheduleState", "PlanEstimate", "TaskEstimateTotal"],
                hydrate: ["ScheduleState"],
                sort: {
                    "_ValidFrom": 1
                }
            },

            calculatorType: "Rally.apps.charts.burndown.BurnDownCalculator",
            calculatorConfig: {
                workDays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                timeZone: "GMT",
                completedScheduleStateNames: ["Accepted"]
            },

            chartColors: ["#3399ff", "#66cc33", "#000000"],

            chartConfig: {
                chart: {
                    zoomType: "xy"
                },
                xAxis: {
                    categories: [],
                    tickmarkPlacement: "on",
                    tickInterval: 7,
                    title: {
                        text: "Days",
                        margin: 12
                    },
                    maxPadding: 0.25,
                    labels: {
                        x: 0,
                        y: 20,
                        overflow: "justify"
                    }
                },
                yAxis: [],
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
