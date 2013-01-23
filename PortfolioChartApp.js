(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.PortfolioChartApp', {
        extend:'Rally.app.App',

        items:[
            {
                xtype:'container',
                itemId:'header',
                cls:'header'
            },
            {
                xtype:'container',
                itemId:'chart',
                cls:'chart'
            }
        ],

        launch:function () {
            this._addHelpComponent();
            this._setupChart();
        },

        _addHelpComponent:function () {
            if (Rally.alm) {
                this.down('#header').add(this._buildHelpComponent());
            }
        },

        _buildHelpComponent:function () {
            return Ext.create('Ext.Component', {
                cls:Rally.util.Test.toBrowserTestCssClass(this.help.cls),
                renderTpl:Rally.util.Help.getIcon({
                    id:this.help.id
                })
            });
        },

        _setupChart:function () {
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

            this._loadPortfolioItem(artifactWithContext);
        },

        _setErrorTextMessage:function (message) {
            this.down('#header').add({
                xtype:'displayfield',
                value:message
            });
        },

        _savedPortfolioItemValid:function (savedPortfolioItemSetting) {
            return savedPortfolioItemSetting &&
                savedPortfolioItemSetting.context &&
                savedPortfolioItemSetting.context.workspace &&
                savedPortfolioItemSetting.context.project &&
                savedPortfolioItemSetting.artifact &&
                savedPortfolioItemSetting.artifact.ObjectID;
        },

        _portfolioItemNotValid:function () {
            this._destroyChart();
            this._setErrorTextMessage('Cannot find the chosen portfolio item.  Please click the gear and "Edit Settings" to choose another.');
        },

        _loadPortfolioItem:function (artifactWithContext) {
            var context = artifactWithContext.context;
            var portfolioItem = artifactWithContext.artifact;

            Rally.data.ModelFactory.getModel({
                context:context,
                type:portfolioItem._type,
                success:function (model) {
                    this._onModelRetrieved(model, portfolioItem.ObjectID);
                },
                scope:this
            });
        },

        _onModelRetrieved:function (model, portfolioItemOid) {
            if (!model) {
                this._portfolioItemNotValid();
                return;
            }

            model.find({
                filters:{
                    property:"ObjectID",
                    value:portfolioItemOid
                },
                scope:this,
                callback:this._onPortfolioItemRetrieved
            });
        },

        _onPortfolioItemRetrieved:function (record) {
            if (!record) {
                this._portfolioItemNotValid();
                return;
            }
            this._buildChart(record.getData());
        },

        _buildChart:function (portfolioItem) {
            var chartConfig = this._buildChartConfig(portfolioItem);

            this._destroyChart();
            this.chartEl = Ext.widget(this.chart.xtype, chartConfig);
            this.down('#chart').add(this.chartEl);

            Rally.environment.getMessageBus().publish(Rally.Message.piChartAppReady);
        },

        _buildChartConfig:function (portfolioItem) {
            var typeConfigNameMap = {
                rallyburnchart:'burnConfig',
                rallycumulativeflowchart:'cumulativeFlowConfig'
            };

            var chartConfig = {
                storeConfig:this._buildStoreConfig(portfolioItem),
                chartConfig:{
                    title:{
                        text:this._buildChartTitle(portfolioItem)
                    }
                },
                dateTimeFormat:this.getContext().getWorkspace().WorkspaceConfiguration.DateFormat
            };

            var typeOptions = {
                startDate: this._getChartStartDate(portfolioItem),
                endDate:   this._getChartEndDate(portfolioItem),
                timeZone:  this._getTimeZone()
            };
            Ext.apply(typeOptions, this.chart.typeOptions);

            var typeConfigName = this.chart.typeConfigName || typeConfigNameMap[this.chart.xtype];
            chartConfig[typeConfigName] = typeOptions;

            return chartConfig;
        },

        _buildStoreConfig:function (portfolioItem) {
            return {
                context:{
                    workspace:this.getContext().getDataContext().workspace
                },
                filters:[
                    {
                        property:'_TypeHierarchy',
                        value:-51038
                    },
                    {
                        property:'_ItemHierarchy',
                        value:portfolioItem.ObjectID
                    },
                    {
                        property:'Children',
                        value:null
                    }
                ]
            };
        },

        _getTimeZone:function () {
            return this.getContext().getUser().UserProfile.TimeZone || this.getContext().getWorkspace().WorkspaceConfiguration.TimeZone;
        },

        _getChartStartDate:function (portfolioItem) {
            return portfolioItem.ActualStartDate || portfolioItem.ActualEndDate || new Date();
        },

        _getChartEndDate:function (portfolioItem) {
            return portfolioItem.ActualEndDate || new Date();
        },

        _buildChartTitle:function (portfolioItem) {
            return portfolioItem.PortfolioItemType._refObjectName + ' ' + portfolioItem.FormattedID + ': ' + portfolioItem.Name;
        },

        _destroyChart:function () {
            if (this.chartEl) {
                this.chartEl.destroy();
            }
        }
    });
})();
