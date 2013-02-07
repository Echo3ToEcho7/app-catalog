(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define("Rally.apps.charts.cfd.Calculator", {
        extend: "Rally.apps.charts.TimeSeriesCalculator",

        getDerivedFieldsOnInput: function () {
            var self = this,
                derivedFields = [],
                scheduleStates = this.config.scheduleStates;

            for (var i = 0, length = scheduleStates.length; i < length; i += 1) {
                (function (state) {
                    derivedFields.push({
                        "as": state,
                        "f": function (snapshot) {
                            if (self.config.chartAggregationType === 'storycount') {
                                return snapshot.ScheduleState === state ? 1 : 0;
                            } else {
                                return snapshot.ScheduleState === state ? snapshot.PlanEstimate : 0;
                            }

                        }
                    });
                }(scheduleStates[i]));
            }

            return derivedFields;
        },

        getMetrics: function () {
            var metrics = [],
                scheduleStates = this.config.scheduleStates;

            for (var i = 0, length = scheduleStates.length; i < length; i += 1) {
                var state = scheduleStates[i];
                metrics.push({
                    "field": state,
                    "as": state,
                    "f": "sum"
                });
            }

            return metrics;
        }
    });
}());
