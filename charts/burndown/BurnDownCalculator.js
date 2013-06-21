(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define("Rally.apps.charts.burndown.BurnDownCalculator", {
        extend: "Rally.data.lookback.calculator.TimeSeriesCalculator",

        getDerivedFieldsOnInput: function () {
            var completedStates = this.config.completedScheduleStateNames,
                aggregationType = this.config.chartAggregationType;

            return [
                {
                    "as": "RemainingPoints",
                    "f": function(snapshot) {
                        var ss = snapshot.ScheduleState;
                        if(completedStates.indexOf(ss) < 0 && snapshot.PlanEstimate) {
                            if(aggregationType === "storycount") {
                                return 1;
                            } else {
                                return snapshot.PlanEstimate;
                            }
                        }

                        return 0;
                    }
                },
                {
                    "as": "AcceptedPoints",
                    "f": function(snapshot) {
                        var ss = snapshot.ScheduleState;
                        if(completedStates.indexOf(ss) > -1 && snapshot.PlanEstimate) {
                            if(aggregationType === "storycount") {
                                return 1;
                            } else {
                                return snapshot.PlanEstimate;
                            }
                        }

                        return 0;
                    }
                }
            ];
        },

        getMetrics: function () {
            return [
                {
                    "field": "RemainingPoints",
                    "as": "Task To Do",
                    "f": "sum"
                },
                {
                    "field": "AcceptedPoints",
                    "as": "Accepted",
                    "f": "sum"
                }
            ];
        },

        getSummaryMetricsConfig: function () {
            return [
                {
                    "field": "Task To Do",
                    "f": "max"
                }
            ];
        },

        getDerivedFieldsAfterSummary: function () {
            return  [
                {
                    "as": "Ideal",
                    "f": function(row, index, summaryMetrics, seriesData) {
                        var max = summaryMetrics["Task To Do_max"],
                            increments = seriesData.length - 1,
                            incrementAmount = max / increments;
                        return Math.floor(100 * (max - index * incrementAmount)) / 100;
                    },
                    "display": "line"
                }
            ];
        }
    });
}());
