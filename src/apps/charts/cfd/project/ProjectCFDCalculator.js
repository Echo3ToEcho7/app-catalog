(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define("Rally.apps.charts.cfd.project.ProjectCFDCalculator", {
        extend: "Rally.data.lookback.calculator.TimeSeriesCalculator",

        getMetrics: function() {
            var stateFieldName = this.stateFieldName;
            var stateFieldValues = this.stateFieldValues.split(',');

            var metrics = [
            ];

            for (var i = 0; i < stateFieldValues.length; ++i) {
                metrics.push(
                    {as: stateFieldValues[i], groupByField: stateFieldName, allowedValues: [stateFieldValues[i]], f: 'groupByCount', display: 'area'}
                );
            }
            return metrics;
        }

    });
})();