(function() {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.kanban.App', {
        extend: 'Rally.app.App',
        requires: [
            'Rally.apps.kanban.Settings',
            'Rally.apps.kanban.Card'
        ],
        cls: 'kanban',
        alias: 'widget.kanbanapp',
        appName: 'Kanban',

        settingsScope: 'project',

        items: [
            {
                xtype: 'container',
                itemId: 'bodyContainer'
            }
        ],

        config: {
            defaultSettings: {
                groupByField: 'ScheduleState',
                columns: Ext.JSON.encode({
                    Defined: {wip: ''},
                    'In-Progress': {wip: ''},
                    Completed: {wip: ''},
                    Accepted: {wip: ''}
                }),
                cardFields: 'Name,Discussion,Tasks,Defects',
                hideReleasedCards: false,
                showCardAge: true,
                cardAgeThreshold: 3
            }
        },

        launch: function() {
            this.setLoading();

            Rally.data.ModelFactory.getModel({
                type: 'UserStory',
                success: this._onStoryModelRetrieved,
                scope: this
            });
        },

        getOptions: function() {
            return [
                {
                    text: 'Show Cycle Time Report',
                    handler: this._showCycleTimeReport,
                    scope: this
                },
                {
                    text: 'Show Throughput Report',
                    handler: this._showThroughputReport,
                    scope: this
                },
                {
                    text: 'Print',
                    handler: this._print,
                    scope: this
                }
            ];
        },

        getSettingsFields: function() {
            return Rally.apps.kanban.Settings.getFields();
        },

        _onStoryModelRetrieved: function(model) {
            this.groupByField = model.getField(this.getSetting('groupByField'));
            this._addCardboardContent();
        },

        _addCardboardContent: function() {
            var cardboardConfig = this._getCardboardConfig();

            var columnSetting = this._getColumnSetting();
            if (columnSetting) {
                cardboardConfig.columns = this._getColumnConfig(columnSetting);
            }

            this.gridboard = this.down('#bodyContainer').add(this._getGridboardConfig(cardboardConfig));

            this.cardboard = this.gridboard.getGridOrBoard();
        },

        _getGridboardConfig: function(cardboardConfig) {
            return {
                xtype: 'rallygridboard',
                cardBoardConfig: cardboardConfig,
                plugins: [
                    'rallygridboardaddnew',
                    {
                        ptype: 'rallygridboardartifacttypechooser',
                        artifactTypePreferenceKey: 'kanbanapp.rallygridboardartifacttypechooser',
                        additionalTypesConfig: [this._getAgreementsTypeConfig()]
                    }
                ],
                context: this.getContext(),
                modelNames: this._getDefaultTypes(),
                addNewPluginConfig: {
                    listeners: {
                        beforecreate: this._onBeforeCreate,
                        beforeeditorshow: this._onBeforeEditorShow,
                        create: this._onCreate,
                        scope: this
                    }
                }
            };
        },

        _getColumnConfig: function(columnSetting) {
            var columns = [];
            Ext.Object.each(columnSetting, function(column, values) {
                var columnName = column || 'None';
                var columnConfig = {
                    wipLimit: values.wip,
                    value: column,
                    displayValue: columnName,
                    policyCmpConfig: {
                        xtype: 'rallykanbanpolicy',
                        policies: this.getSetting(columnName + 'Policy'),
                        prefConfig: {
                            appID: this.getAppId(),
                            project: this.getContext().getProject()
                        },
                        title: 'Exit Agreement'
                    }
                };
                columns.push(columnConfig);
            }, this);

            columns[columns.length - 1].storeConfig = {
                filters: this._getLastColumnFilter()
            };

            return columns;
        },

        _getCardboardConfig: function() {
            var additionalFetchFields = [];
            if (this.getSetting('showCardAge')) {
                Ext.Array.push(additionalFetchFields, ['LastUpdateDate']);
            }

            return {
                xtype: 'rallycardboard',
                types: this._getDefaultTypes(),
                attribute: this.getSetting('groupByField'),
                margin: '10px',
                context: this.getContext(),
                listeners: {
                    beforecarddroppedsave: this._onBeforeCardSaved,
                    load: this._onBoardLoad,
                    cardupdated: this._publishContentUpdatedNoDashboardLayout,
                    cardcopied: this._onCardCopied,
                    scope: this
                },
                columnConfig: {
                    xtype: 'rallykanbancolumn',
                    additionalFetchFields: additionalFetchFields,
                    enablePolicies: true
                },
                cardConfig: {
                    xtype: 'kanbancard',
                    editable: true,
                    showSplitInHeaderMenu: this.getContext().isFeatureEnabled('SHOW_SPLIT_IN_CARD_HEADER_MENU'),
                    showHeaderMenu: true,
                    fields: this.getSetting('cardFields').split(','),
                    columnField: this.groupByField,
                    showCardAge: this.getSetting('showCardAge'),
                    cardAgeThreshold: this.getSetting('cardAgeThreshold'),
                    useCollectionSummary: this.getContext().isFeatureEnabled('SUMMARY_COLLECTIONS_FOR_CARDS')
                },
                loadMask: false,
                storeConfig: {
                    context: this.getContext().getDataContext(),
                    filters: this.getSetting('query') ?
                        Rally.data.QueryFilter.fromQueryString(this.getSetting('query')) : []
                }
            };
        },

        _getLastColumnFilter: function() {
            return this.getSetting('hideReleasedCards') ?
                [
                    {
                        property: 'Release',
                        value: null
                    }
                ] : [];
        },

        _getColumnSetting: function() {
            var columnSetting = this.getSetting('columns');
            return columnSetting && Ext.JSON.decode(columnSetting);
        },

        _buildReportConfig: function(report) {
            var shownTypes = this._getShownTypes();
            var workItems = shownTypes.length === 2 ? 'N' : shownTypes[0].workItemType;

            var reportConfig = {
                report: report,
                work_items: workItems
            };
            if (this.getSetting('groupByField') !== 'ScheduleState') {
                reportConfig.filter_field = this.groupByField.displayName;
            }
            return reportConfig;
        },

        _showCycleTimeReport: function() {
            this._showReportDialog('Cycle Time Report',
                this._buildReportConfig(Rally.ui.report.StandardReport.Reports.CycleLeadTime));
        },

        _showThroughputReport: function() {
            this._showReportDialog('Throughput Report',
                this._buildReportConfig(Rally.ui.report.StandardReport.Reports.Throughput));
        },

        _print: function() {
            this.cardboard.openPrintPage({title: 'Kanban Board'});
        },

        _getShownTypes: function() {
            return this.gridboard.artifactTypeChooserPlugin.getChosenTypesConfig();
        },

        _getDefaultTypes: function() {
            return ['User Story', 'Defect'];
        },

        _buildStandardReportConfig: function(reportConfig) {
            var scope = this.getContext().getDataContext();
            return {
                xtype: 'rallystandardreport',
                padding: 10,
                project: scope.project,
                projectScopeUp: scope.projectScopeUp,
                projectScopeDown: scope.projectScopeDown,
                reportConfig: reportConfig
            };
        },

        _showReportDialog: function(title, reportConfig) {
            var height = 450, width = 600;
            this.getEl().mask();
            Ext.create('Rally.ui.dialog.Dialog', {
                title: title,
                autoShow: true,
                draggable: false,
                closable: true,
                modal: false,
                height: height,
                width: width,
                items: [
                    Ext.apply(this._buildStandardReportConfig(reportConfig),
                        {
                            height: height,
                            width: width
                        })
                ],
                listeners: {
                    close: function() {
                        this.getEl().unmask();
                    },
                    scope: this
                }
            }).alignTo(this.getEl(), 'c-c');
        },

        _onBoardLoad: function() {
            this._publishContentUpdated();
            this.setLoading(false);
            this._initializeChosenTypes();
        },

        _initializeChosenTypes: function() {
            var artifactsPref = this.gridboard.artifactTypeChooserPlugin.artifactsPref;
            var allowedArtifacts = this.gridboard.getHeader().getRight().query('checkboxfield');
            if(!Ext.isEmpty(artifactsPref) && artifactsPref.length !== allowedArtifacts.length){
                this.gridboard.getGridOrBoard().addLocalFilter('ByType', artifactsPref);
            }
            if (Ext.Array.contains(artifactsPref,'agreement')) {
                this._onShowAgreementsClicked(null, true);
            }
        },

        _onCheckboxChecked: function(checkbox, checked) {
            var types = Ext.Array.clone(this.cardboard.types);
            if (checked) {
                types.push(checkbox.inputValue);
            } else {
                Ext.Array.remove(types, checkbox.inputValue);
            }
            this.setLoading();
            this.cardboard.refresh({ types: types });
        },

        _onShowAgreementsClicked: function(checkbox, checked) {
            Ext.each(this.cardboard.getColumns(), function(column) {
                column.togglePolicy(checked);
            });

            this.cardboard.resizeAllColumns();
        },

        _onBeforeCreate: function(addNew, record, params) {
            Ext.apply(params, {
                rankTo: 'BOTTOM',
                rankScope: 'BACKLOG'
            });
            record.set(this.getSetting('groupByField'), this.cardboard.getColumns()[0].getValue());
        },

        _onBeforeEditorShow: function(addNew, params) {
            params.rankTo = 'BOTTOM';
            params.rankScope = 'BACKLOG';
        },

        _onCreate: function(addNew, record) {
            this._showCreationFlair(record);
        },

        _onCardCopied: function(card, record) {
            this._showCreationFlair(record);
        },

        _showCreationFlair: function(record) {
            Rally.ui.notify.Notifier.showCreate({
                artifact: record,
                rankScope: 'BACKLOG'
            });
        },

        _publishContentUpdated: function() {
            this.fireEvent('contentupdated');
            if (Rally.BrowserTest) {
                Rally.BrowserTest.publishComponentReady(this);
            }
        },

        _publishContentUpdatedNoDashboardLayout: function() {
            this.fireEvent('contentupdated', {dashboardLayout: false});
        },

        _onBeforeCardSaved: function(column, card, type) {
            var columnSetting = this._getColumnSetting();
            if (columnSetting) {
                var setting = columnSetting[column.getValue()];
                if (setting && setting.scheduleStateMapping) {
                    card.getRecord().set('ScheduleState', setting.scheduleStateMapping);
                }
            }
        },

        _getAgreementsTypeConfig: function() {
            return {
                xtype: 'checkboxfield',
                cls: 'type-checkbox agreements-checkbox',
                boxLabel: 'Agreements',
                itemId: 'showAgreements',
                inputValue: 'agreement',
                handler: this._onShowAgreementsClicked,
                scope: this
            };
        }
    });
})();
