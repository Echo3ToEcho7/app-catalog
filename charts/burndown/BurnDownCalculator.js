(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define("Rally.apps.charts.burndown.BurnDownCalculator", {
        extend: "Rally.data.lookback.calculator.TimeSeriesCalculator",

        getDerivedFieldsOnInput: function () {
            var inProgressStates = ["Idea", "Defined", "In-Progress", "Completed"];
            var completedStates = ["Accepted", "Released"];

            return [
                {
                    "as": "RemainingPoints",
                    "f": function(snapshot) {
                        var ss = snapshot.ScheduleState;
                        if(inProgressStates.indexOf(ss) > -1 && snapshot.PlanEstimate) {
                            return snapshot.PlanEstimate;
                        }

                        return 0;
                    }
                },
                {
                    "as": "AcceptedPoints",
                    "f": function(snapshot) {
                        var ss = snapshot.ScheduleState;
                        if (completedStates.indexOf(ss) > -1 && snapshot.PlanEstimate) {
                            return snapshot.PlanEstimate;
                        }

                        return 0;
                    }
                }
            ];
        },

        getMetrics: function() {
            return [
                {
                    "field": "RemainingPoints",
                    "as": "TASK TO DO",
                    "f": "sum",
                    "display": "line"
                },
                {
                    "field": "AcceptedPoints",
                    "as": "ACCEPTED (POINTS)",
                    "f": "sum",
                    "display": "line"
                }
            ];
        }
    });
}());
