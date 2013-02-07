(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.charts.TimeSeriesCalculator', {
        config: {
            workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            holidays: [],
            startDate: new Date(),
            endDate: new Date(),
            timeZone: "GMT",
            chartAggregationType: undefined,
            scheduleStates: ["Defined", "In-Progress", "Completed", "Accepted"]
        },

        getDerivedFieldsOnInput: function () {
            return [];
        },

        getMetrics: function () {
            return [];
        },

        getSummaryMetricsConfig: function () {
            return [];
        },

        getDerivedFieldsAfterSummary: function () {
            return [];
        },

        constructor: function (config) {
            Ext.apply(this.config, config);

            this.lumenize = Rally.data.lookback.Lumenize;
        },

        prepareChartData: function (store) {
            var snapshots = [];
            store.each(function (record) {
                snapshots.push(record.raw);
            });

            return this.runCalculation(snapshots);
        },

        prepareCalculator: function (chartMetrics, timeZone) {
            var TimeSeriesCalculator = this.lumenize.TimeSeriesCalculator;

            var burnConfig = {
                deriveFieldsOnInput: this.getDerivedFieldsOnInput(),
                metrics: chartMetrics,
                summaryMetricsConfig: this.getSummaryMetricsConfig(),
                deriveFieldsAfterSummary: this.getDerivedFieldsAfterSummary(),
                granularity: this.lumenize.Time.DAY,
                tz: timeZone,
                holidays: this.config.holidays,
                workDays: this.config.workDays.join(',')
            };

            return new TimeSeriesCalculator(burnConfig);
        },

        runCalculation: function (snapshots) {
            var timeZone = this.config.timeZone,
                chartMetrics = this.getMetrics();

            var highchartsSeriesConfig = this._buildHighchartsSeriesConfig(chartMetrics);

            var calculator = this.prepareCalculator(chartMetrics, timeZone);
            calculator.addSnapshots(snapshots, this.config.startDate, this.config.endDate);

            return this._transformLumenizeDataToHighchartsSeries(calculator.getResults().seriesData, highchartsSeriesConfig);
        },

        _buildHighchartsSeriesConfig: function (chartMetrics) {
            var aggregationConfig = [];

            for (var i = 0, ilength = chartMetrics.length; i < ilength; i += 1) {
                var metric = chartMetrics[i];
                aggregationConfig.push({
                    name: metric.as,
                    type: metric.display
                });
            }

            var derivedFieldsAfterSummary = this.getDerivedFieldsAfterSummary();
            for (var j = 0, jlength = derivedFieldsAfterSummary.length; j < jlength; j += 1) {
                aggregationConfig.push(derivedFieldsAfterSummary[j]);
            }

            return aggregationConfig;
        },

        _transformLumenizeDataToHighchartsSeries: function (seriesData, highchartsSeriesConfig) {
            var categories = [];

            for (var i = 0, length = seriesData.length; i < length; i++) {
                categories.push(seriesData[i].label);
            }

            var series = this.lumenize.arrayOfMaps_To_HighChartsSeries(seriesData, highchartsSeriesConfig);

            return {
                series: series,
                categories: categories
            };
        }
    });
}());
