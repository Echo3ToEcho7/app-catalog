(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define("Rally.apps.charts.PortfolioChartAppBase", {
        extend: "Rally.app.App",
        settingsScope: "project",

        scheduleStates: ["Defined", "In-Progress", "Completed", "Accepted"],

        items: [
            {
                xtype: 'container',
                itemId: 'header',
                cls: 'header'
            }
        ],

        dateFormatters: [
            {
                key: "MMM",
                value: "%b"
            },
            {
                key: "MM",
                value: "%m"
            },
            {
                key: "dd",
                value: "%d"
            },
            {
                key: "yyyy",
                value: "%Y"
            }
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
                    onLoad: function() {
                        this.setValue(self.getSetting("chartAggregationType") || "storypoints");
                    }
                }
            ];
        },

        launch: function () {
            this._addHelpComponent();

            var savedPortfolioItem = this._validatePortfolioItem();
            if (savedPortfolioItem) {
                this._loadPortfolioItem(savedPortfolioItem);
            }
        },

        setDynamicConfigValues: function (chartComponentConfig, portfolioItem) {
            var dateFormat = this.getContext().getWorkspace().WorkspaceConfiguration.DateFormat,
                chartConfig = chartComponentConfig.chartConfig;
            this._parseRallyDateFormat(dateFormat, chartConfig);

            if (portfolioItem) {
                if (!chartComponentConfig.chartConfig.hasOwnProperty('title')) {
                    chartComponentConfig.chartConfig.title = {};
                }
                chartComponentConfig.chartConfig.title.text = portfolioItem.FormattedID + ": " + portfolioItem.Name;
            }

            var aggregationType = this.getSetting("chartAggregationType") || "storypoints";
            chartComponentConfig.calculatorConfig.chartAggregationType = aggregationType;

            var yaxis = chartComponentConfig.chartConfig.yAxis[0];
            if(aggregationType === "storypoints") {
                yaxis.title.text = "Points";
            } else {
                yaxis.title.text = "Count";
            }
        },

        _validatePortfolioItem: function () {
            var settingsJson = this.getSetting('buttonchooser');
            if (!settingsJson) {
                this._setErrorTextMessage('Please click the gear and "Edit Settings" to choose a portfolio item.');
                return;
            }

            var artifactWithContext = Ext.JSON.decode(settingsJson);
            if (!this._savedPortfolioItemValid(artifactWithContext)) {
                this._portfolioItemNotValid();
                return;
            }

            return artifactWithContext;
        },

        _loadPortfolioItem: function (artifactWithContext) {
            var context = artifactWithContext.context;
            var portfolioItem = artifactWithContext.artifact;

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
            if (!model) {
                this._portfolioItemNotValid();
                return;
            }

            model.find({
                filters: {
                    property: "ObjectID",
                    value: portfolioItemOid
                },
                scope: this,
                callback: this._onPortfolioItemRetrieved
            });
        },

        _onPortfolioItemRetrieved: function (portfolioItemRecord) {
            if (!portfolioItemRecord) {
                this._portfolioItemNotValid();
                return;
            }

            Rally.data.ModelFactory.getModel({
                type: 'UserStory',
                success: function (model) {
                    this._onUserStoryModelRetrieved(model, portfolioItemRecord);
                },
                scope: this
            });
        },

        _onUserStoryModelRetrieved: function (model, portfolioItemRecord) {
            this._setScheduleStateFieldValues(model);

            var chartConfig = this._setupChartComponent(portfolioItemRecord.data);
            this.add(chartConfig);

            Rally.environment.getMessageBus().publish(Rally.Message.piChartAppReady);
        },

        _setScheduleStateFieldValues: function (model) {
            if (!model) {
                this.chartComponentConfig.calculatorConfig.scheduleStates = this.scheduleStates;
                return;
            }

            var allowedScheduleStates = model.getField('ScheduleState').allowedValues;
            var i, length, scheduleStateValues = [];

            for (i = 0, length = allowedScheduleStates.length; i < length; i++) {
                scheduleStateValues.push(allowedScheduleStates[i].StringValue);
            }

            this.chartComponentConfig.calculatorConfig.scheduleStates = scheduleStateValues;
        },

        _setupChartComponent: function (portfolioItem) {
            var chartComponentConfig = Ext.clone(this.chartComponentConfig);

            this.setDynamicConfigValues(chartComponentConfig, portfolioItem);
            this._calculateDateRange(chartComponentConfig, portfolioItem);
            this._updateQueryConfig(chartComponentConfig, portfolioItem);

            return chartComponentConfig;
        },

        _calculateDateRange: function (chartComponentConfig, portfolioItem) {
            var startDate = chartComponentConfig.calculatorConfig.startDate || this._getChartStartDate(portfolioItem),
                endDate = chartComponentConfig.calculatorConfig.endDate || this._getChartEndDate(portfolioItem),
                timeZone = chartComponentConfig.calculatorConfig.timeZone || this._getTimeZone();

            chartComponentConfig.calculatorConfig.startDate = startDate;
            chartComponentConfig.calculatorConfig.endDate = endDate;
            chartComponentConfig.calculatorConfig.timeZone = timeZone;

            chartComponentConfig.chartConfig.xAxis.tickInterval = this._configureChartTicks(startDate, endDate);
        },

        _configureChartTicks: function (startDate, endDate) {
            var tickWidth = 125,
                width = this.getWidth(),
                ticks = Math.floor(width / tickWidth);

            var startDateObj = new Date(startDate),
                endDateObj = new Date(endDate);

            var days = Math.floor((endDateObj - startDateObj) / 86400000); // Converting ms to days

            return Math.floor(days / ticks);
        },

        _updateQueryConfig: function (chartComponentConfig, portfolioItem) {
            chartComponentConfig.storeConfig.rawFind._ItemHierarchy = portfolioItem.ObjectID;
        },

        _setErrorTextMessage: function (message) {
            this.down('#header').add({
                xtype: 'displayfield',
                value: message
            });
        },

        _savedPortfolioItemValid: function (savedPortfolioItemSetting) {
            return savedPortfolioItemSetting &&
                savedPortfolioItemSetting.context &&
                savedPortfolioItemSetting.context.workspace &&
                savedPortfolioItemSetting.context.project &&
                savedPortfolioItemSetting.artifact &&
                savedPortfolioItemSetting.artifact.ObjectID;
        },

        _portfolioItemNotValid: function () {
            this._setErrorTextMessage('Cannot find the chosen portfolio item.  Please click the gear and "Edit Settings" to choose another.');
        },

        _getTimeZone: function () {
            return this.getContext().getUser().UserProfile.TimeZone || this.getContext().getWorkspace().WorkspaceConfiguration.TimeZone;
        },

        _getChartStartDate: function (portfolioItem) {
            var date = portfolioItem.ActualStartDate || portfolioItem.ActualEndDate || new Date();
            return date.toISOString();
        },

        _getChartEndDate: function (portfolioItem) {
            var date = portfolioItem.ActualEndDate || new Date();
            return date.toISOString();
        },

        _parseRallyDateFormat: function (rallyDateFormat, chartConfig) {
            rallyDateFormat = this._parseRallyDateFormatToHighchartsDateFormat(rallyDateFormat);

            chartConfig.xAxis = chartConfig.xAxis || {};
            chartConfig.xAxis.type = chartConfig.xAxis.type || "datetime";
            chartConfig.xAxis.labels = {
                formatter: function () {
                    return Highcharts.dateFormat(rallyDateFormat, new Date(this.value).getTime());
                }
            };
        },

        _parseRallyDateFormatToHighchartsDateFormat: function (rallyDateFormat) {
            var i, length;
            for (i = 0, length = this.dateFormatters.length; i < length; i++) {
                rallyDateFormat = rallyDateFormat.replace(this.dateFormatters[i].key, this.dateFormatters[i].value);
            }
            return rallyDateFormat;
        },

        _addHelpComponent: function () {
            this.down('#header').add(this._buildHelpComponent());
        },

        _buildHelpComponent: function () {
            return Ext.create('Ext.Component', {
                renderTpl: Rally.util.Help.getIcon({
                    cls:Rally.util.Test.toBrowserTestCssClass(this.help.cls),
                    id: this.help.id
                })
            });
        }
    });
}());
