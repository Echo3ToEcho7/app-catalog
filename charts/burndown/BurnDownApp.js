(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define("Rally.apps.charts.burndown.BurnDownApp", {
        extend: "Rally.app.App",
        settingsScope: "workspace",

        requires: [
            "Rally.apps.charts.burndown.BurnDownSettings",
            "Rally.data.WsapiDataStore",
            "Rally.ui.combobox.IterationComboBox",
            "Rally.ui.combobox.ReleaseComboBox"
        ],

        mixins: [
            "Rally.apps.charts.DateMixin",
            "Rally.apps.charts.burndown.BurnDownChart"
        ],

        cls: "burndown-app",

        help: {
            cls: "burndown-help-container",
            id: 0
        },

        launch: function () {
            this.callParent(arguments);

            this._setupChartSettings();

            var context = this.getContext();
            if (context && context.getTimeboxScope()) {
                var dashboard_type = context.getTimeboxScope().getType();

                if (dashboard_type === 'release') {

                } else if (dashboard_type === 'iteration') {

                } else {
                    // not sure how this would ever get run...
                }
            } else {
                this._loadSavedObject();
            }
        },

        _loadSavedObject: function () {
            var model = this.getSetting("chartTimebox"),
                ref = "";

            if (model === "iteration") {
                ref = this.getSetting("Iteration");
            } else if (model === "release") {
                ref = this.getSetting("Release");
            } else { }

            var store = Ext.create("Rally.data.WsapiDataStore", {
                model: model,
                filters: [
                    {
                        property: "ObjectID",
                        operator: "=",
                        value: Rally.util.Ref.getOidFromRef(ref)
                    }
                ],
                context: {
                    workspace: this.getContext().getWorkspaceRef(),
                    project: null
                },
                scope: this
            });

            store.on("load", this._onObjectLoaded, this);
            store.load();
        },

        _onObjectLoaded: function (store) {
            if (store.count() !== 1) {
                // Should only have a single record, display error if more
                return;
            }

            this.domainObject = store.getAt(0).data;

            this._addDateBoundsToConfig();

            if(this.domainObject._type === "release") {
//                this._addObjectIdToStoreConfig("Release");
                this._fetchIterations();
            } else {
                this._addObjectIdToStoreConfig("Iteration");
                this._addChart();
            }
        },

        _getDomainObjectStartDate: function() {
            var date;

            if(this.domainObject._type === "release") {
                date = this.domainObject.ReleaseStartDate;
            } else {
                date = this.domainObject.StartDate;
            }

            return this.dateToString(date);
        },

        _getDomainObjectEndDate: function() {
            var date;

            if(this.domainObject._type === "release") {
                date = this.domainObject.ReleaseDate;
            } else {
                date = this.domainObject.EndDate;
            }

            return this.dateToString(date);
        },

        _fetchIterations: function() {
            var store = Ext.create("Rally.data.WsapiDataStore", {
                model: "Iteration",
                filters: [
                    {
                        property: "StartDate",
                        operator: ">=",
                        value: this._getDomainObjectStartDate()
                    },
                    {
                        property: "EndDate",
                        operator: "<=",
                        value: this._getDomainObjectEndDate()
                    }
                ],
                context: {
                    workspace: this.getContext().getWorkspaceRef(),
                    project: this.getContext().getProjectRef()
                },
                scope: this
            });

            store.on("load", this._onIterationsLoaded, this);
            store.load();
        },

        _onIterationsLoaded: function(store) {
            this.iterations = store.getItems();

            this._addChart();
            this.down("rallychart").on("snapshotsAggregated", this._addIterationLines, this);
        },

        _addIterationLines: function(chart) {
            var axis = chart.chartConfig.xAxis,
                categories = chart.chartData.categories,
                iteration = 0;

            axis.plotLines = [];
            axis.plotBands = [];

            while (iteration < this.iterations.length) {
                axis.plotLines.push(this._getPlotLine(categories, this.iterations[iteration], false));
                axis.plotBands.push(this._getPlotBand(categories, this.iterations[iteration], iteration % 2 !== 0));

                iteration += 1;
            }

            if (iteration) {
                axis.plotLines.push(this._getPlotLine(categories, this.iterations[iteration - 1], true));
            }
        },

        _getPlotBand: function(categories, iteration, shouldColorize) {
            var startDate = this.dateStringToObject(iteration.StartDate),
                endDate = this.dateStringToObject(iteration.EndDate);

            var startDateStr = Ext.Date.format(startDate, "Y-m-d"),
                endDateStr = Ext.Date.format(endDate, "Y-m-d");

            return {
                color: shouldColorize ? "#F2FAFF" : "#FFFFFF",
                from: categories.indexOf(startDateStr),
                to: categories.indexOf(endDateStr),
                label: {
                    text: iteration.Name,
                    align: "center",
                    rotation: 0,
                    y: -7
                }
            }
        },

        _getPlotLine: function(categories, iteration, lastLine) {
            var dateObj;

            if(lastLine) {
                dateObj = this.dateStringToObject(iteration.EndDate);
            } else {
                dateObj = this.dateStringToObject(iteration.StartDate);
            }

            var dateStr = Ext.Date.format(dateObj, "Y-m-d");
            var dateIndex = categories.indexOf(dateStr);

            return {
                color: "#BBBBBB",
                dashStyle: "ShortDash",
                width: 2,
                zIndex: 3,
                value: dateIndex
            };
        },

        _addObjectIdToStoreConfig: function(type) {
            var storeConfig = this.chartComponentConfig.storeConfig;
            storeConfig.find[type] = this.domainObject.ObjectID;
        },

        _addDateBoundsToConfig: function() {
//            this._addDateBoundsToQuery();
            this._addDateBoundsToCalculator();
        },

        _addDateBoundsToQuery: function() {
            var findQuery = this.chartComponentConfig.storeConfig.find;

            findQuery._ValidFrom = {
                "$gte": this._getDomainObjectStartDate(),
                "$lte": this._getDomainObjectEndDate()
            };
        },

        _addDateBoundsToCalculator: function() {
            var calcConfig = this.chartComponentConfig.calculatorConfig;

            calcConfig.startDate = this._getDomainObjectStartDate();
            calcConfig.endDate = this._getDomainObjectEndDate();
        },

        _addChart: function() {
            this.add(this.chartComponentConfig);
            this.down("rallychart").on("snapshotsAggregated", this._onSnapshotDataReady, this);
        },

        _onSnapshotDataReady: function (chart) {
            this._updateDisplayType(chart);
        },

        _updateDisplayType: function(chart) {
            var series = chart.chartData.series,
                displayType = this.getSetting("chartDisplayType");

            for(var i = 0; i < series.length; i++) {
                series[i].type = displayType;
            }
        },

        _setupChartSettings: function () {
            this.chartSettings = Ext.create("Rally.apps.charts.burndown.BurnDownSettings", {
                app: this
            });
        },

        getSettingsFields: function () {
            return this.chartSettings.getFields();
        },

        onTimeboxScopeChange: function (scope) {
            console.log('scope changed');
            this.callParent(arguments);
        }
    });
}());
