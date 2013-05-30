(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define("Rally.apps.charts.burndown.BurnDownCalculator", {
        extend: "Rally.data.lookback.calculator.TimeSeriesCalculator",

//        prepareChartData: function () {
//            var fields = ["ObjectID", "_ValidFrom", "_ValidTo", "ScheduleState", "PlanEstimate", "TaskRemainingTotal", "TaskEstimateTotal"];
//            var final_snapshots = [];
//            var snapshots = [
//                [1, "2013-03-01T15:00:00.000Z", "2013-03-02T13:00:00.000Z", "Idea",          5             , 15                  , 15],
//                [1, "2013-03-02T13:00:00.000Z", "2013-03-02T15:10:00.000Z", "Idea",          5             , 15                  , 15],
//                [1, "2013-03-02T15:10:00.000Z", "2013-03-03T15:00:00.000Z", "In-Progress"  , 5             , 20                  , 15],
//                [2, "2013-03-02T15:00:00.000Z", "2013-03-03T15:00:00.000Z", "Idea",          3             , 5                   , 5],
//                [3, "2013-03-02T15:00:00.000Z", "2013-03-03T15:00:00.000Z", "Idea",          5             , 12                  , 12],
//                [2, "2013-03-03T15:00:00.000Z", "2013-03-04T15:00:00.000Z", "In-Progress"  , 3             , 5                   , 5],
//                [3, "2013-03-03T15:00:00.000Z", "2013-03-04T15:00:00.000Z", "Idea",          5             , 12                  , 12],
//                [4, "2013-03-03T15:00:00.000Z", "2013-03-04T15:00:00.000Z", "Idea",          5             , 15                  , 15],
//                [1, "2013-03-03T15:10:00.000Z", "2013-03-04T15:00:00.000Z", "In-Progress"  , 5             , 12                  , 15],
//                [1, "2013-03-04T15:00:00.000Z", "2013-03-06T15:00:00.000Z", "Accepted"     , 5             , 0                   , 15],
//                [2, "2013-03-04T15:00:00.000Z", "2013-03-06T15:00:00.000Z", "Completed"    , 3             , 1                   , 5],
//                [3, "2013-03-04T15:00:00.000Z", "2013-03-05T15:00:00.000Z", "In-Progress"  , 5             , 10                  , 12],
//                [4, "2013-03-04T15:00:00.000Z", "2013-03-06T15:00:00.000Z", "Idea",          5             , 15                  , 15],
//                [5, "2013-03-04T15:00:00.000Z", "2013-03-06T15:00:00.000Z", "Idea",          2             , 4                   , 4],
//                [3, "2013-03-05T15:00:00.000Z", "2013-03-07T15:00:00.000Z", "Completed"    , 5             , 5                   , 12],
//                [1, "2013-03-06T15:00:00.000Z", "2013-03-07T15:00:00.000Z", "Released"     , 5             , 0                   , 15],
//                [2, "2013-03-06T15:00:00.000Z", "2013-03-07T15:00:00.000Z", "Accepted"     , 3             , 0                   , 5],
//                [4, "2013-03-06T15:00:00.000Z", "2013-03-07T15:00:00.000Z", "In-Progress"  , 5             , 7                   , 15],
//                [5, "2013-03-06T15:00:00.000Z", "2013-03-07T15:00:00.000Z", "Idea",          2             , 4                   , 4],
//                [1, "2013-03-07T15:00:00.000Z", "9999-01-01T00:00:00.000Z", "Released"     , 5            , 0                    , 15],
//                [2, "2013-03-07T15:00:00.000Z", "9999-01-01T00:00:00.000Z", "Released"     , 3            , 0                    , 5],
//                [3, "2013-03-07T15:00:00.000Z", "9999-01-01T00:00:00.000Z", "Accepted"     , 5            , 0                    , 12],
//                [4, "2013-03-07T15:00:00.000Z", "9999-01-01T00:00:00.000Z", "Completed"    , 5            , 3                    , 15]
//            ];
//
//            for (var i = 0; i < snapshots.length; i++) {
//                var snapshot = {};
//                for (var j = 0; j < fields.length; j++) {
//                    snapshot[fields[j]] = snapshots[i][j];
//                }
//
//                final_snapshots.push(snapshot);
//            }
//
//            return this.runCalculation(final_snapshots);
//        },

        getDerivedFieldsOnInput: function () {
            var inProgressStates = ["Idea", "Defined", "In-Progress"],
                completedStates = ["Completed", "Accepted", "Released"],
                aggregationType = this.config.chartAggregationType;

            return [
                {
                    "as": "RemainingPoints",
                    "f": function(snapshot) {
                        var ss = snapshot.ScheduleState;
                        if(inProgressStates.indexOf(ss) > -1 && snapshot.PlanEstimate) {
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
