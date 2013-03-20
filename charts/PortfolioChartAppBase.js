(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define("Rally.apps.charts.PortfolioChartAppBase", {
        extend: "Rally.app.App",
        settingsScope: "workspace",
        
        requires: [
            'Rally.ui.combobox.ComboBox'
        ],

        scheduleStates: ["Defined", "In-Progress", "Completed", "Accepted"],

        PI_SETTING: "buttonchooser",

        items: [
            {
                xtype: 'container',
                itemId: 'header',
                cls: 'header'
            }
        ],

        dateFormatters: [
            {key: "MMM", value: "%b"},
            {key: "MM", value: "%m"},
            {key: "dd", value: "%d"},
            {key: "yyyy", value: "%Y"}
        ],

        getSettingsFields: function () {
            var self = this;
            return [
                {
                    type: "buttonchooser",
                    label: "Portfolio Item",
                    config: {
                        type: "portfolioitem",
                        cls: "pichooser"
                    }
                },
                {
                    xtype: "rallycombobox",
                    name: "chartAggregationType",
                    fieldLabel: "Data Type",
                    queryMode: "local",
                    editable: false,
                    store: {
                        xtype: "store",
                        fields: ["name", "value"],
                        data: [
                            {name: "Story Plan Estimate", value: "storypoints"},
                            {name: "Story Count", value: "storycount"}
                        ]
                    },
                    displayField: "name",
                    valueField: "value",
                    onLoad: function () {
                        this.setValue(self.getSetting("chartAggregationType") || "storycount");
                    }
                }
            ];
        },

        clientMetrics: [
            {
                method: 'launch',
                defaultUserAction: 'pichartapp - user loading chart'
            },
            {
                beginEvent: 'updateBeforeRender',
                endEvent: 'updateAfterRender',
                defaultUserAction: 'pichartapp - elapsed chart load'
            }
        ],

        launch: function () {
            this._setupEvents();

            this._addHelpComponent();
            this._setDefaultConfigValues();
            this._setupUpdateBeforeRender();

            var savedPortfolioItem = this._loadSavedPortfolioItem();
            if (savedPortfolioItem) {
                this._loadPortfolioItem(savedPortfolioItem);
            }
            else {
                // this.owner is the panel this app belongs to
                this.owner.showSettings();
            }
        },

        _setupUpdateBeforeRender: function() {
            this.chartComponentConfig.updateBeforeRender = this._setupDynamicHooksWithEvents(
                this.chartComponentConfig.updateBeforeRender,
                'updateBeforeRender'
            );

            this.chartComponentConfig.updateAfterRender = this._setupDynamicHooksWithEvents(
                this.chartComponentConfig.updateAfterRender,
                'updateAfterRender'
            );

//            var self = this;
//            var updateBeforeRender = this.chartComponentConfig.updateBeforeRender;
//
//            this.chartComponentConfig.updateBeforeRender = function() {
//                self.fireEvent('updateBeforeRender');
//                updateBeforeRender.apply(this);
//            }
        },

        _setupDynamicHooksWithEvents: function(func, event) {
            var self = this;

            return function() {
                self.fireEvent(event);
                if ('function' === typeof func) {
                    func.apply(this);
                }
            };
        },

        _setupEvents: function () {
            this.addEvents(
                'updateBeforeRender',
                'updateAfterRender'
            );
        },

        _addHelpComponent: function () {
            this.down('#header').add(this._buildHelpComponent());
        },

        _setDefaultConfigValues: function () {
            var config = Ext.clone(this.chartComponentConfig);

            config.storeConfig.find = config.storeConfig.find || {};

            config.calculatorConfig = config.calculatorConfig || {};

            config.chartConfig = config.chartConfig || {};
            config.chartConfig.title = config.chartConfig.title || {};
            config.chartConfig.xAxis = config.chartConfig.xAxis || {};
            config.chartConfig.xAxis.type = config.chartConfig.xAxis.type || "datetime";
            config.chartConfig.yAxis = config.chartConfig.yAxis || [
                {
                    title: {}
                }
            ];

            this.chartComponentConfig = config;
        },

        _buildHelpComponent: function () {
            return Ext.create('Ext.Component', {
                renderTpl: Rally.util.Help.getIcon({
                    cls: Rally.util.Test.toBrowserTestCssClass(this.help.cls),
                    id: this.help.id
                })
            });
        },

        _loadSavedPortfolioItem: function () {
            var piJson = this.getSetting(this.PI_SETTING);
            if (!piJson) {
                return false;
            }

            var savedPi = Ext.JSON.decode(piJson);
            if (!this._savedPortfolioItemValid(savedPi)) {
                return false;
            }

            return savedPi;
        },

        _savedPortfolioItemValid: function (savedPi) {
            return savedPi &&
                savedPi.context &&
                savedPi.context.workspace &&
                savedPi.context.project &&
                savedPi.artifact &&
                savedPi.artifact._type &&
                savedPi.artifact.ObjectID;
        },

        _loadPortfolioItem: function (savedPortfolioItem) {
            var context = savedPortfolioItem.context;
            var portfolioItem = savedPortfolioItem.artifact;

            Rally.data.ModelFactory.getModel({
                context: context,
                type: portfolioItem._type,
                success: function (model) {
                    this._onModelRetrieved(model, portfolioItem.ObjectID);
                },
                scope: this
            });
        },

        _onModelRetrieved: function (model, portfolioItemOid) {
            if (model) {
                model.find({
                    filters: {
                        property: "ObjectID",
                        value: portfolioItemOid
                    },
                    scope: this,
                    callback: this._onPortfolioItemRetrieved
                });
            } else {
                this._portfolioItemNotValid();
            }
        },

        _onPortfolioItemRetrieved: function (portfolioItemRecord) {
            if (portfolioItemRecord) {
                Rally.data.ModelFactory.getModel({
                    type: 'UserStory',
                    success: function (model) {
                        this._onUserStoryModelRetrieved(model, portfolioItemRecord);
                    },
                    scope: this
                });
            } else {
                this._setErrorTextMessage("A server error occurred, please refresh the page.");
            }
        },

        _onUserStoryModelRetrieved: function (model, portfolioItemRecord) {
            this._updateChartComponentConfig(model, portfolioItemRecord.data);
            this.add(this.chartComponentConfig);

            Rally.environment.getMessageBus().publish(Rally.Message.piChartAppReady);
        },

        _updateChartComponentConfig: function (model, portfolioItem) {
            this._setScheduleStateFieldValues(model);
            this._setDynamicConfigValues(portfolioItem);
            this._calculateDateRange(portfolioItem);
            this._updateQueryConfig(portfolioItem);
        },

        _setScheduleStateFieldValues: function (model) {
            if (model) {
                var allowedScheduleStates = model.getField('ScheduleState').allowedValues;
                var i, length, scheduleStateValues = [];

                for (i = 0, length = allowedScheduleStates.length; i < length; i++) {
                    scheduleStateValues.push(allowedScheduleStates[i].StringValue);
                }

                this.chartComponentConfig.calculatorConfig.scheduleStates = scheduleStateValues;
            } else {
                this.chartComponentConfig.calculatorConfig.scheduleStates = this.scheduleStates;
            }
        },

        _setDynamicConfigValues: function (portfolioItem) {
            this._updateChartConfigDateFormat();
            this.chartComponentConfig.chartConfig.title.text = this._buildChartTitle(portfolioItem);

            this.chartComponentConfig.calculatorConfig.chartAggregationType = this._getAggregationType();
            this.chartComponentConfig.chartConfig.yAxis[0].title.text = this._getYAxisTitle();
        },

        _updateChartConfigDateFormat: function () {
            var rallyDateFormat = this._parseRallyDateFormatToHighchartsDateFormat();

            this.chartComponentConfig.chartConfig.xAxis.labels = {
                formatter: function () {
                    return Highcharts.dateFormat(rallyDateFormat, new Date(this.value).getTime());
                }
            };
        },

        _parseRallyDateFormatToHighchartsDateFormat: function () {
            var rallyDateFormat = this._getWorkspaceConfiguredDateFormat(),
                i, length;

            for (i = 0, length = this.dateFormatters.length; i < length; i++) {
                rallyDateFormat = rallyDateFormat.replace(this.dateFormatters[i].key, this.dateFormatters[i].value);
            }
            return rallyDateFormat;
        },

        _calculateDateRange: function (portfolioItem) {
            var calcConfig = this.chartComponentConfig.calculatorConfig;
            calcConfig.startDate = calcConfig.startDate || this._getChartStartDate(portfolioItem);
            calcConfig.endDate = calcConfig.endDate || this._getChartEndDate(portfolioItem);
            calcConfig.timeZone = calcConfig.timeZone || this._getTimeZone();

            this.chartComponentConfig.chartConfig.xAxis.tickInterval = this._configureChartTicks(calcConfig.startDate, calcConfig.endDate);
        },

        _updateQueryConfig: function (portfolioItem) {
            this.chartComponentConfig.storeConfig.find._ItemHierarchy = portfolioItem.ObjectID;
        },

        _configureChartTicks: function (startDate, endDate) {
            var tickWidth = 125, // in pixels
                width = this.getWidth(), // app width
                ticks = Math.floor(width / tickWidth);

            var startDateObj = new Date(startDate),
                endDateObj = new Date(endDate);

            var days = Math.floor((endDateObj - startDateObj) / 86400000); // Converting ms to days

            return Math.floor(days / ticks); // number of dates that will fit on the xAxis
        },

        _getWorkspaceConfiguredDateFormat: function () {
            return this.getContext().getWorkspace().WorkspaceConfiguration.DateFormat;
        },

        _buildChartTitle: function (portfolioItem) {
            if (portfolioItem) {
                return portfolioItem.FormattedID + ": " + portfolioItem.Name;
            } else {
                return "Portfolio Item Chart";
            }
        },

        _getAggregationType: function () {
            return this.getSetting("chartAggregationType") || "storycount";
        },

        _getYAxisTitle: function () {
            return this._getAggregationType() === "storypoints" ?
                "Points" :
                "Count";
        },

        _getChartStartDate: function (portfolioItem) {
            var date = portfolioItem.ActualStartDate || portfolioItem.ActualEndDate || new Date();
            return date.toISOString();
        },

        _getChartEndDate: function (portfolioItem) {
            var date = portfolioItem.ActualEndDate || new Date();
            return date.toISOString();
        },

        _getTimeZone: function () {
            return this.getContext().getUser().UserProfile.TimeZone || this.getContext().getWorkspace().WorkspaceConfiguration.TimeZone;
        },

        _portfolioItemNotValid: function () {
            this._setErrorTextMessage('Cannot find the chosen portfolio item.  Please click the gear and "Edit Settings" to choose another.');
        },

        _setErrorTextMessage: function (message) {
            this.down('#header').add({
                xtype: 'displayfield',
                value: message
            });
        }
    });
}());
