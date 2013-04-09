(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define("Rally.apps.charts.rpm.PortfolioChartAppBase", {
        extend: "Rally.app.App",
        settingsScope: "workspace",
        
        requires: [
            'Rally.ui.combobox.ComboBox',
            'Rally.util.Test',
            'Deft.Deferred'
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
                        cls: "pichooser",
                        context: this.getContext()
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
                            {name: "Story Count", value: "storycount"},
                            {name: "Story Plan Estimate", value: "storypoints"}
                        ]
                    },
                    displayField: "name",
                    valueField: "value",
                    listeners: {
                        load: function() {
                            this.setValue(self.getSetting("chartAggregationType") || "storycount");
                        },
                        select: function() {
                            this.setValue(this.value);
                        }
                    }
                },
                {
                    xtype: "rallydatefield",
                    fieldLabel: "Start Date (optional)",
                    name: "startDate"
                },
                {
                    xtype: "rallydatefield",
                    fieldLabel: "End Date (optional)",
                    name: "endDate"
                }
            ];
        },

        clientMetrics: {
            beginEvent: 'updateBeforeRender',
            endEvent: 'updateAfterRender',
            defaultUserAction: 'pichartapp - elapsed chart load'
        },

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
                    this._onModelRetrieved(model, savedPortfolioItem);
                },
                scope: this
            });
        },

        _onModelRetrieved: function (model, savedPortfolioItem) {
            if (model) {
                model.find({
                    filters: {
                        property: "ObjectID",
                        value: savedPortfolioItem.artifact.ObjectID
                    },
                    context: {
                        workspace: this.getContext().getWorkspace()._ref,
                        project: null
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
            this._updateChartComponentConfig(model, portfolioItemRecord.data).then({
                success: function(chartComponentConfig) {
                    this.add(chartComponentConfig);
                    Rally.environment.getMessageBus().publish(Rally.Message.piChartAppReady);
                },
                scope: this
            });
        },

        _updateChartComponentConfig: function (model, portfolioItem) {
            var deferred = Ext.create('Deft.Deferred');

            this._getScheduleStateValues(model).then({
                success: function(scheduleStateValues) {
                    this.chartComponentConfig.calculatorConfig.scheduleStates = scheduleStateValues;

                    this._setDynamicConfigValues(portfolioItem);
                    this._calculateDateRange(portfolioItem);
                    this._updateQueryConfig(portfolioItem);

                    deferred.resolve(this.chartComponentConfig);
                },
                scope: this
            });

            return deferred.promise;
        },

        _getScheduleStateValues: function (model) {
            var deferred = Ext.create('Deft.Deferred');

            if (model) {
                model.getField('ScheduleState').getAllowedValueStore().load({
                    callback: function(records, operation, success) {
                        var scheduleStateValues = Ext.Array.map(records, function(record) {
                            return record.get('StringValue');
                        });
                        deferred.resolve(scheduleStateValues);
                    },
                    scope: this
                });
            } else {
                deferred.resolve(this.scheduleStates);
            }

            return deferred.promise;
        },

        _setDynamicConfigValues: function (portfolioItem) {
            this._updateChartConfigDateFormat();
            this.chartComponentConfig.chartConfig.title = this._buildChartTitle(portfolioItem);
            this.chartComponentConfig.chartConfig.subtitle = this._buildChartSubtitle(portfolioItem);

            this.chartComponentConfig.calculatorConfig.chartAggregationType = this._getAggregationType();
            this.chartComponentConfig.chartConfig.yAxis[0].title.text = this._getYAxisTitle();

            this.chartComponentConfig.chartConfig.yAxis[0].labels = {
                x: -5,
                y: 4
            };
        },

        _updateChartConfigDateFormat: function () {
            var self = this;

            this.chartComponentConfig.chartConfig.xAxis.labels = {
                x: 0,
                y: 20,
                formatter: function () {
                    return self._formatDate(new Date(this.value));
                }
            };
        },

        _parseRallyDateFormatToHighchartsDateFormat: function () {
            var dateFormat = this._getUserConfiguredDateFormat() || this._getWorkspaceConfiguredDateFormat();

            for (var i = 0; i < this.dateFormatters.length; i++) {
                dateFormat = dateFormat.replace(this.dateFormatters[i].key, this.dateFormatters[i].value);
            }
            
            return dateFormat;
        },

        _formatDate: function(date) {
            if (!this.dateFormat) {
                this.dateFormat = this._parseRallyDateFormatToHighchartsDateFormat();
            }

            return Highcharts.dateFormat(this.dateFormat, date.getTime());
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

        _getUserConfiguredDateFormat: function() {
            return this.getContext().getUser().UserProfile.DateFormat;
        },

        _getWorkspaceConfiguredDateFormat: function () {
            return this.getContext().getWorkspace().WorkspaceConfiguration.DateFormat;
        },

        _buildChartTitle: function (portfolioItem) {
            var widthPerCharacter = 10,
                totalCharacters = Math.floor(this.getWidth() / widthPerCharacter),
                title = "Portfolio Item Chart",
                align = "center";

            if (portfolioItem) {
                title = portfolioItem.FormattedID + ": " + portfolioItem.Name;
            }

            if (totalCharacters < title.length) {
                title = title.substring(0, totalCharacters) + "...";
                align = "left";
            }

            return {
                text: title,
                align: align,
                margin: 30
            };
        },

        _buildChartSubtitle: function (portfolioItem) {
            var widthPerCharacter = 6,
                totalCharacters = Math.floor(this.getWidth() / widthPerCharacter),
                plannedStartDate = "",
                plannedEndDate = "";

            var template = Ext.create("Ext.XTemplate",
                '<tpl if="plannedStartDate">' +
                    '<span>Planned Start Date: {plannedStartDate}</span>' +
                    '<tpl if="plannedEndDate">' +
                        '<tpl if="tooBig">' +
                            '<br />' +
                        '<tpl else>' +
                            '&nbsp;&nbsp;&nbsp;' +
                        '</tpl>' +
                    '</tpl>' +
                '</tpl>' +
                '<tpl if="plannedEndDate">' +
                    '<span>Planned End Date: {plannedEndDate}</span>' +
                '</tpl>'
            );

            if(portfolioItem && portfolioItem.PlannedStartDate) {
                plannedStartDate = this._formatDate(portfolioItem.PlannedStartDate);
            }

            if(portfolioItem && portfolioItem.PlannedEndDate) {
                plannedEndDate = this._formatDate(portfolioItem.PlannedEndDate);
            }

            var formattedTitle = template.apply({
                plannedStartDate: plannedStartDate,
                plannedEndDate: plannedEndDate,
                tooBig: totalCharacters < plannedStartDate.length + plannedEndDate.length + 60
            });

            return {
                text: formattedTitle,
                useHTML: true,
                align: "center"
            };
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
            var startDateSetting = this.getSetting('startDate');
            var startDate = startDateSetting ? new Date(startDateSetting) : undefined;

            var date = startDate || portfolioItem.ActualStartDate || portfolioItem.ActualEndDate || new Date();
            return Ext.Date.format(date, 'Y-m-d\\TH:i:s.u\\Z');
        },

        _getChartEndDate: function (portfolioItem) {
            var endDateSetting = this.getSetting('endDate');
            var endDate = endDateSetting ? new Date(endDateSetting) : undefined;

            var date = endDate || portfolioItem.ActualEndDate || new Date();
            return Ext.Date.format(date, 'Y-m-d\\TH:i:s.u\\Z');
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
