(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define("Rally.apps.charts.cfd.CumulativeFlowChartApp", {
        extend: "Rally.apps.charts.PortfolioChartAppBase",
        cls: "portfolio-cfd-app",
        
        requires: [
            'Rally.ui.chart.Chart'
        ],

        help: {
            cls: 'portfolio-cfd-help-container',
            id: 274
        },

        chartComponentConfig: {
            xtype: "rallychart",

            updateBeforeRender: function () {
                var calcConfig = this.calculatorConfig,
                    chartColors = this.chartColors;

                var scheduleStatesLength = calcConfig.scheduleStates.length,
                    firstScheduleState = calcConfig.scheduleStates[0],
                    lastScheduleState = calcConfig.scheduleStates[scheduleStatesLength - 1];

                var firstColor = chartColors[0],
                    lastColor = chartColors[chartColors.length - 1],
                    firstCustomColor = '#B3B79A',
                    secondCustomColor = '#5C9ACB';

                if (firstScheduleState !== "Defined" && firstColor !== firstCustomColor) {
                    chartColors.unshift(firstCustomColor);
                }
                if (lastScheduleState !== "Accepted" && lastColor !== secondCustomColor) {
                    chartColors.push(secondCustomColor);
                }
            },

            noDataMessage: "There could be no stories available or started for this portfolio item, missing plan estimate values, or work on this portfolio item has not yet been started.",

            storeType: 'Rally.data.lookback.SnapshotStore',
            storeConfig: {
                find: {
                    "_TypeHierarchy": -51038,
                    "Children": null
                },
                fetch: ["ScheduleState", "PlanEstimate"],
                hydrate: ["ScheduleState"],
                sort: {
                    "_ValidFrom": 1
                }
            },

            calculatorType: "Rally.apps.charts.cfd.CumulativeFlowCalculator",

            chartConfig: {
                chart: {
                    defaultSeriesType: "area",
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
                        },
                        groupPadding: 0.01
                    },
                    area: {
                        stacking: 'normal',
                        lineColor: '#666666',
                        lineWidth: 2,
                        marker: {
                            enabled: false
                        }
                    }
                }
            }
        }
    });
}());
