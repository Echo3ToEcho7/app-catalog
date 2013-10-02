(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.charts.burndown.BurnDownApp', {
        extend: 'Rally.app.TimeboxScopedApp',

        settingsScope: 'workspace',

        requires: [
            'Rally.apps.charts.burndown.BurnDownSettings',
            'Rally.data.WsapiDataStore',
            'Rally.ui.combobox.IterationComboBox',
            'Rally.ui.combobox.ReleaseComboBox'
        ],

        mixins: [
            'Rally.apps.charts.DateMixin',
            'Rally.apps.charts.burndown.BurnDownChart'
        ],

        cls: 'burndown-app',

        items: [
            {
                xtype: 'container',
                itemId: 'header',
                cls: 'header'
            }
        ],

        help: {
            id: 278
        },

        scopeObject: undefined,
        
        customScheduleStates: ['Accepted'],	// a reasonable default

        getSettingsFields: function () {
            this.chartSettings = this.chartSettings || Ext.create('Rally.apps.charts.burndown.BurnDownSettings', {
                app: this
            });

            return this.chartSettings.getFields();
        },

        onScopeChange: function (scope) {
            if (!this.ignoreOnScopeChange) {
                this._rebuildChartForScope(scope.getRecord().get('_ref'));
            }
        },

        launch: function () {
            if (this._settingsInvalid()) {
                if (this.owner) {
                    this.owner.showSettings();
                    return;
                }
            }

            this._addHelpComponent();
            this._loadUserStoryModel();
            this._saveScopeType();
            this.callParent(arguments);

            if (!this.isOnScopedDashboard()) {
                this.ignoreOnScopeChange = true;
                this._getScopePicker().on('ready', this._loadScopePreference, this, {single: true});
            }
        },

        _addHelpComponent: function () {
            this.down('#header').add(this._buildHelpComponent());
        },

        _buildHelpComponent: function () {
            return Ext.create('Ext.Component', {
                renderTpl: Rally.util.Help.getIcon({
                    cls: Rally.util.Test.toBrowserTestCssClass(this.help.cls),
                    id: this.help.id
                })
            });
        },

        _rebuildChartForScope: function(scopeRef) {
            this._destroyChart();

            this._saveScopePreference(scopeRef);
            this._loadScopeObject(scopeRef);
        },

        _destroyChart: function () {
            this.remove('burndownchart');
        },

        _saveScopePreference: function (scopeRef) {
            if (!this.isOnScopedDashboard()) {
                var settings = {};
                settings[this._getScopeType()] = scopeRef;

                Rally.data.PreferenceManager.update({
                    appID: this.getContext().get('appID'),
                    settings: settings,
                    scope: this
                });
            }
        },

        _loadScopePreference: function (picker) {
            Rally.data.PreferenceManager.load({
                appID: this.getContext().get('appID'),
                success: function (preferences) {
                    var scopeRef = preferences[this._getScopeType()];
                    if (!scopeRef || scopeRef === 'undefined') {
                        var pickerRecord = picker.getRecord();
                        if (pickerRecord) {
                            scopeRef = pickerRecord.get('_ref');
                            this._saveScopePreference(scopeRef);
                        }
                    }
                    this.ignoreOnScopeChange = false;

                    if (scopeRef && scopeRef !== 'undefined') {
                        this._setScopeValue(scopeRef);
                        scopeRef = this._getScopePicker().getValue();
                        if (scopeRef) {
                            this._rebuildChartForScope(scopeRef);
                        }
                    }
                },
                scope: this
            });
        },

        _setScopeValue: function (scopeRef) {
            this._getScopePicker().setValue(scopeRef);
        },

        _loadTimeboxes: function() {
            var timeboxStore = Ext.create('Rally.data.WsapiDataStore', {
                model: this.scopeObject._type,
                filters: [
                    {
                        property: 'Name',
                        operator: '=',
                        value: this.scopeObject.Name
                    },
                    {
                        property: this._getScopeObjectStartDateName(),
                        operator: '=',
                        value: Rally.util.DateTime.toIsoString(this._getScopeObjectStartDate(), true)
                    },
                    {
                        property: this._getScopeObjectEndDateName(),
                        operator: '=',
                        value: Rally.util.DateTime.toIsoString(this._getScopeObjectEndDate(), true)
                    }
                ],
                context: {
                    workspace: this.getContext().getWorkspaceRef(),
                    project: this.getContext().getProjectRef()
                },
                fetch: ['ObjectID'],
                limit: Infinity
            });

            timeboxStore.on('load', this._getTimeboxesInScope, this);
            timeboxStore.load();
        },

        _onScopeObjectLoaded: function (record) {
            this._setScopeFromData(record);

            this._updateChartTitle();
            this._updateYAxis();

            this._addDateBounds();
            this._addAggregationTypeToCalculator();
            this._updateCompletedScheduleStates();
            this._loadTimeboxes();
        },

        _renderChartBasedOnType: function () {
            if (this._getScopeType() === 'release') {
                this._fetchIterations();
            } else {
                this._addChart();
            }
        },

        _setScopeFromData: function (record) {
            this.scopeObject = record.data;
        },

        _getTimeboxesInScope: function (store) {
            var storeConfig = this.chartComponentConfig.storeConfig;
            var type = Ext.String.capitalize(this._getScopeType());
            var oids = [];
            var i;

            this.timeboxes = store.getItems();
            this._clearStoreConfig(storeConfig);

            for (i = 0; i < this.timeboxes.length; i++) {
                oids.push(this.timeboxes[i].ObjectID);
            }
            storeConfig.find[type] = { '$in' : oids };

            this._renderChartBasedOnType();

        },

        _onIterationsLoaded: function (store) {
            this.iterations = store.getItems();

            this._addChart();
            this.down('rallychart').on('snapshotsAggregated', this._addIterationLines, this);
        },

        _addDateBounds: function () {
            this._addDateBoundsToQuery();
            this._addDateBoundsToCalculator();
        },

        _addDateBoundsToQuery: function () {

        },

        _addDateBoundsToCalculator: function () {
            var calcConfig = this.chartComponentConfig.calculatorConfig;
            var endDate = this._getScopeObjectEndDate();
            var now = new Date();
            calcConfig.startDate = Rally.util.DateTime.toIsoString(this._getScopeObjectStartDate(), true);
            if(now > this._getScopeObjectStartDate() && now < this._getScopeObjectEndDate()) {
                endDate = now;
            }
            calcConfig.endDate = Rally.util.DateTime.toIsoString(endDate, true);
            // S53625: If the time-box has ended, disable the projection line
            if (now > this._getScopeObjectEndDate()) {
                calcConfig.enableProjections = false;
            } else {
                calcConfig.enableProjections = true;
            }
            // add scopeEndDate, which may or may not be the same as endDate
            calcConfig.scopeEndDate = this._getScopeObjectEndDate();
        },

        _addAggregationTypeToCalculator: function () {
            var calcConfig = this.chartComponentConfig.calculatorConfig;
            calcConfig.chartAggregationType = this.getSetting('chartAggregationType');
        },

        _updateCompletedScheduleStates: function () {
            var calcConfig = this.chartComponentConfig.calculatorConfig;
            calcConfig.completedScheduleStateNames = this.customScheduleStates;
        },

        _loadScopeObject: function (scopeRef) {
            Rally.data.ModelFactory.getModel({
                type: this._getScopeType(),

                context: {
                    workspace: this.getContext().getWorkspaceRef(),
                    project: null
                },
                success: function(model) {
                    model.load(Rally.util.Ref.getOidFromRef(scopeRef), {
                        success: function(record) {
                            this._onScopeObjectLoaded(record);
                        },
                        scope: this
                    });
                },
                scope: this
            });
        },

        _fetchIterations: function () {
            var store = Ext.create('Rally.data.WsapiDataStore', {
                model: 'Iteration',
                filters: [
                    {
                        property: 'StartDate',
                        operator: '>=',
                        value: Rally.util.DateTime.toIsoString(this._getScopeObjectStartDate(), true)
                    },
                    {
                        property: 'EndDate',
                        operator: '<=',
                        value: Rally.util.DateTime.toIsoString(this._getScopeObjectEndDate(), true)
                    }
                ],
                context: {
                    workspace: this.getContext().getWorkspaceRef(),
                    project: this.getContext().getProjectRef()
                },
                fetch: ['Name','StartDate','EndDate'],
                limit: Infinity
            });

            store.on('load', this._onIterationsLoaded, this);
            store.load();
        },

        _areIterationsEqual: function (iteration1, iteration2) {
            return iteration1.Name === iteration2.Name &&
                   iteration1.StartDate === iteration2.StartDate &&
                   iteration1.EndDate === iteration2.EndDate;
        },

        _addIterationLines: function (chart) {
            var axis = chart.chartConfig.xAxis;
            var categories = chart.chartData.categories;
            var i, j;
            var uniqueIterations = [];
            var unique;

            axis.plotLines = [];
            axis.plotBands = [];

            for (i = 0; i < this.iterations.length; i++) {
                unique = true;
                for (j = 0; j < uniqueIterations.length; j++) {
                    if(this._areIterationsEqual(uniqueIterations[j], this.iterations[i])) {
                        unique = false;
                        break;
                    }
                }
                if(unique === true) {
                    uniqueIterations.push(this.iterations[i]);
                }
            }

            for (i = 0; i < uniqueIterations.length; i++) {
                axis.plotLines.push(this._getPlotLine(categories, uniqueIterations[i], false));
                axis.plotBands.push(this._getPlotBand(categories, uniqueIterations[i], i % 2 !== 0));
            }

            if (uniqueIterations.length > 0) {
                axis.plotLines.push(this._getPlotLine(categories, uniqueIterations[uniqueIterations.length - 1], true));
            }
        },

        _getPlotBand: function (categories, iteration, shouldColorize) {
            var startDate = this.dateStringToObject(iteration.StartDate);
            var endDate = this.dateStringToObject(iteration.EndDate);

            return {
                color: shouldColorize ? '#F2FAFF' : '#FFFFFF',
                from: this._getNearestWorkday(categories, startDate),
                to: this._getNearestWorkday(categories, endDate),
                label: {
                    text: iteration.Name,
                    align: 'center',
                    rotation: 0,
                    y: -7
                }
            };
        },

        _getNearestWorkday: function(categories, date) {
            var dateStr = Ext.Date.format(date, 'Y-m-d');
            var index = categories.indexOf(dateStr);
            if(index === -1) {
                var workdays = this._getWorkspaceConfiguredWorkdays();
                if(workdays.length < 1) {
                    return -1;
                }
                // date not in categories (probably) means it falls on a non-workday...back up to the next previous workday
                while (workdays.indexOf(Ext.Date.format(date, 'l')) === -1 && date > this._getScopeObjectStartDate()) {
                    date = Ext.Date.add(date, Ext.Date.DAY, -1);
                    dateStr = Ext.Date.format(date, 'Y-m-d');
                    index = categories.indexOf(dateStr);
                }
            }
            return index;
        },

        _getPlotLine: function (categories, iteration, lastLine) {
            var dateObj;
            var dateIndex;

            if (lastLine) {
                dateObj = this.dateStringToObject(iteration.EndDate);
            } else {
                dateObj = this.dateStringToObject(iteration.StartDate);
            }

            dateIndex = this._getNearestWorkday(categories, dateObj);

            return {
                color: '#BBBBBB',
                dashStyle: 'ShortDash',
                width: 2,
                zIndex: 3,
                value: dateIndex
            };
        },

        _addChart: function () {
            this._updateChartConfigDateFormat();
            this._updateChartConfigWorkdays();
            var chartComponentConfig = Ext.Object.merge({}, this.chartComponentConfig);


            this.add(chartComponentConfig);
            this.down('rallychart').on('snapshotsAggregated', this._onSnapshotDataReady, this);
        },

        _onSnapshotDataReady: function (chart) {
            this._updateDisplayType(chart);
            this._updateXAxis(chart);
        },

        _updateDisplayType: function (chart) {
            var series = chart.chartData.series;
            var displayType = this.getSetting('chartDisplayType');
            var i;

            for (i = 0; i < series.length; i++) {
                if (this._seriesFollowsDisplayType(series[i])) {
                    series[i].type = displayType;
                }
            }
        },

        _seriesFollowsDisplayType: function (series) {
            return series.name.indexOf('Ideal') === -1 && series.name.indexOf('Prediction') === -1;
        },

        _updateYAxis: function () {
            this._updateYAxisTitle();
            this._updateYAxisConfig();
        },

        _updateYAxisTitle: function () {
            var chartConfig = this.chartComponentConfig.chartConfig;
            chartConfig.yAxis = [
                {}
            ];
            chartConfig.yAxis[0].title = {
                text: this._getAxisTitleBasedOnAggregationType()
            };
        },

        _updateYAxisConfig: function () {
            var axis = this.chartComponentConfig.chartConfig.yAxis[0];
            axis.min = 0;
            axis.labels = {
                x: -5,
                y: 4
            };
        },

        _updateXAxis: function (chart) {
            if(this.container.dom.offsetWidth < 1000) {
                chart.chartConfig.xAxis.labels.staggerLines = 2;
            }
            chart.chartConfig.xAxis.labels.step = Math.round( chart.chartData.categories.length / 100 );
            chart.chartConfig.xAxis.tickInterval = this._configureChartTicks(chart.chartData.categories.length);
        },

        _configureChartTicks: function (days) {
            var pixelTickWidth = 125,
                appWidth = this.getWidth(),
                ticks = Math.floor(appWidth / pixelTickWidth);

            return Math.ceil(days / ticks);
        },

        _getAxisTitleBasedOnAggregationType: function () {
            var aggregationType = this.getSetting('chartAggregationType');
            if (aggregationType === 'storycount') {
                return 'Count';
            } else {
                return 'Points';
            }
        },

        _updateChartConfigDateFormat: function () {
            var self = this;

            this.chartComponentConfig.chartConfig.xAxis.labels.formatter = function () {
                return self._formatDate(self.dateStringToObject(this.value));
            };
        },

        _updateChartConfigWorkdays: function () {
            this.chartComponentConfig.calculatorConfig.workDays = this._getWorkspaceConfiguredWorkdays().split(',');
        },

        _parseRallyDateFormatToHighchartsDateFormat: function () {
            var dateFormat = this._getUserConfiguredDateFormat() || this._getWorkspaceConfiguredDateFormat();

            for (var i = 0; i < this.dateFormatters.length; i++) {
                dateFormat = dateFormat.replace(this.dateFormatters[i].key, this.dateFormatters[i].value);
            }

            return dateFormat;
        },

        _formatDate: function (date) {
            if (!this.dateFormat) {
                this.dateFormat = this._parseRallyDateFormatToHighchartsDateFormat();
            }

            return Highcharts.dateFormat(this.dateFormat, date.getTime());
        },

        _getUserConfiguredDateFormat: function () {
            return this.getContext().getUser().UserProfile.DateFormat;
        },

        _getWorkspaceConfiguredDateFormat: function () {
            return this.getContext().getWorkspace().WorkspaceConfiguration.DateFormat;
        },

        _getWorkspaceConfiguredWorkdays: function () {
            return this.getContext().getWorkspace().WorkspaceConfiguration.WorkDays;
        },

        _updateChartTitle: function () {
            var chartConfig = this.chartComponentConfig.chartConfig;
            chartConfig.title = this._buildChartTitle();
        },

        _buildChartTitle: function () {
            var widthPerCharacter = 10;
            var totalCharacters = Math.floor(this.getWidth() / widthPerCharacter);
            var title = this._getDefaultTitle();
            var align = 'center';

            if (this.scopeObject) {
                title = this.scopeObject.Name;
            }

            if (totalCharacters < title.length) {
                title = title.substring(0, totalCharacters) + '...';
                align = 'left';
            }

            return {
                text: title,
                align: align,
                margin: 30
            };
        },

        _getDefaultTitle: function () {
            return Ext.String.capitalize(this._getScopeType());
        },

        _settingsInvalid: function () {
            var chartAggregationType = this.getSetting('chartAggregationType'),
                chartDisplayType = this.getSetting('chartDisplayType'),
                chartTimebox = this.getSetting('chartTimebox');

            var invalid = function (value) {
                return !value || value === 'undefined';
            };

            return invalid(chartAggregationType) || invalid(chartDisplayType) ||
                this._chartTimeboxInvalid(chartTimebox);
        },

        _chartTimeboxInvalid: function (chartTimebox) {
            if (this.context.getTimeboxScope()) {
                return false;
            }

            return !chartTimebox || chartTimebox === 'undefined';
        },

        _saveScopeType: function () {
            this.scopeType = this._getScopeType();
        },

        _getScopeType: function () {
            if (this.isOnScopedDashboard()) {
                return this._getDashboardScopeType();
            } else {
                return this._getSavedScopeType();
            }
        },

        _getDashboardScopeType: function () {
            return this.getContext().getTimeboxScope().getType();
        },

        _getSavedScopeType: function () {
            return this.getSetting('chartTimebox');
        },

        _getScopePicker: function () {
            if (this.isOnScopedDashboard()) {
                return this.getContext().getTimeboxScope();
            } else {
                return this.down('rally' + this._getScopeType() + 'combobox');
            }
        },

        _getScopeObjectStartDateName: function () {
            if (!this.scopeObject) {
                return '';
            } else if (this.scopeObject._type === 'release') {
                return 'ReleaseStartDate';
            } else {
                return 'StartDate';
            }
        },

        _getScopeObjectEndDateName: function () {
            if (!this.scopeObject) {
                return '';
            } else if (this.scopeObject._type === 'release') {
                return 'ReleaseDate';
            } else {
                return 'EndDate';
            }
        },

        _getScopeObjectStartDate: function () {
            if (!this.scopeObject) {
                return new Date();
            } else if (this.scopeObject._type === 'release') {
                return this.scopeObject.ReleaseStartDate;
            } else {
                return this.scopeObject.StartDate;
            }
        },

        _getScopeObjectEndDate: function () {
            if (!this.scopeObject) {
                return new Date();
            } else if (this.scopeObject._type === 'release') {
                return this.scopeObject.ReleaseDate;
            } else {
                return this.scopeObject.EndDate;
            }
        },

        _clearStoreConfig: function (storeConfig) {
            if (storeConfig.find.hasOwnProperty('Release')) {
                delete storeConfig.find.Release;
            }

            if (storeConfig.find.hasOwnProperty('Iteration')) {
                delete storeConfig.find.Iteration;
            }
        },

        _loadUserStoryModel: function() {
            Rally.data.ModelFactory.getModel({
                type: "UserStory",
                context: this._getContext(),
                success: function(model) {
                    this._getScheduleStateValues(model);
                },
                scope: this
            });
        },

        _getContext: function() {
            return {
                workspace: this.context.getWorkspaceRef(),
                project: null
            };
        },

        _getScheduleStateValues: function (model) {
            if(model) {
                model.getField("ScheduleState").getAllowedValueStore().load({
                    callback: function(records, operation, success) {
                        var scheduleStates = _.collect(records, function(obj) {
                            return obj.raw;
                        });

                        var store = this._wrapRecords(scheduleStates);
                        var	values = [];
                        var acceptedSeen = false;
                        for(var i = 0; i < store.data.items.length; i++) {
                            if(store.data.items[i].data.StringValue === 'Accepted') {
                                acceptedSeen = true;
                            }
                            if(acceptedSeen) {
                                values.push(store.data.items[i].data.StringValue);
                            }
                        }

                        if(values.length > 0) {
                            this.customScheduleStates = values;
                        }
                    },
                    scope: this
                });
            }
        },
        
        _wrapRecords: function(records) {
            return Ext.create("Ext.data.JsonStore", {
                fields: ["_ref", "StringValue"],
                data: records
            });
        }


    });
}());
