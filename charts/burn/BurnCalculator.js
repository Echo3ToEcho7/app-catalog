(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define("Rally.apps.charts.burn.Calculator", {
        extend: "Rally.data.lookback.calculator.TimeSeriesCalculator",

        getDerivedFieldsOnInput: function () {
            var completedStateNames = this.config.completedScheduleStateNames;

            if (this.config.chartAggregationType === 'storycount') {
                return [
                    {
                        "as": "StoryCount",
                        "f": function(snapshot) {
                            return 1;
                        }
                    },
                    {
                        "as": "CompletedStoryCount",
                        "f": function(snapshot) {
                            var ss = snapshot.ScheduleState;
                            if (completedStateNames.indexOf(ss) > -1) {
                                return 1;
                            }
                            else {
                                return 0;
                            }
                        }
                    }
                ];
            }
            else {
                return [];
            }
        },

        getMetrics: function() {
            if(this.config.chartAggregationType === 'storycount') {
                return [
                    {
                        "field": "StoryCount",
                        "as": "Planned",
                        "f": "sum",
                        "display": "line"
                    },
                    {
                        "field": "CompletedStoryCount",
                        "as": "Completed",
                        "f": "sum",
                        "display": "column"
                    }
                ];
            }
            else {
                return [
                    {
                        "field": "PlanEstimate",
                        "as": "Planned",
                        "display": "line",
                        "f": "sum"
                    },
                    {
                        "field": "PlanEstimate",
                        "as": "Completed",
                        "f": "filteredSum",
                        "filterField": "ScheduleState",
                        "filterValues": ["Accepted", "Released"],
                        "display": "column"
                    }
                ];
            }
        }
    });
}());
