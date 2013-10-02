(function() {
    var Ext = window.Ext4 || window.Ext;

    /**
     * Iteration Tracking Board App
     * The Iteration Tracking Board can be used to visualize and manage your User Stories and Defects within an Iteration.
     */
    Ext.define('Rally.apps.iterationtrackingboard.IterationTrackingBoardApp', {
        extend: 'Rally.app.TimeboxScopedApp',
        requires: [
            'Rally.data.ModelFactory',
            'Rally.ui.gridboard.GridBoard',
            'Rally.ui.gridboard.plugin.GridBoardAddNew',
            'Rally.ui.gridboard.plugin.GridBoardOwnerFilter',
            'Rally.ui.gridboard.plugin.GridBoardFilterInfo',
            'Rally.ui.gridboard.plugin.GridBoardArtifactTypeChooser',
            'Rally.ui.gridboard.plugin.GridBoardFieldPicker',
            'Rally.ui.cardboard.plugin.ColumnPolicy',
            'Rally.ui.gridboard.plugin.GridBoardFilterInfo',
            'Rally.data.PreferenceManager'
        ],
        mixins: ['Rally.app.CardFieldSelectable'],
        componentCls: 'iterationtrackingboard',
        alias: 'widget.rallyiterationtrackingboard',

        settingsScope: 'project',
        scopeType: 'iteration',

        config: {
            defaultSettings: {
                showCardAge: true,
                cardAgeThreshold: 3,
                cardFields: 'Parent,Tasks,Defects,Discussion,PlanEstimate'
            }
        },

        onScopeChange: function(scope) {
            this.remove('gridBoard');
            this._loadModels();
        },

        getSettingsFields: function () {
            var fields = this.callParent(arguments);

            if (!this.isShowingBlankSlate()) {
                this.appendCardFieldPickerSetting(fields);
            }

            if(this.showCardAgeEnabled)  {
                fields.push({
                    type: 'cardage',
                    config: {
                        margin: '0 0 0 80'
                    }
                });
            }

            return fields;
        },

        launch: function() {
            //  When deleting this toggle, also remove the alwaysSelectBlockedReason param from CardFieldSelectable
            //  and make it behave so that the BlockedReason is always selected.
            this.alwaysSelectBlockedReason = this.getContext().isFeatureEnabled('F929_ENABLE_BLOCKED_REASON_PROMPT_ON_BOARDS');

            this.showFieldPicker = this.getContext().isFeatureEnabled('SHOW_FIELD_PICKER_IN_ITERATION_BOARD_SETTINGS');
            this.showCardAgeEnabled = this.getContext().isFeatureEnabled('SHOW_CARD_AGE_IN_ITERATION_BOARD_SETTINGS');
            this.callParent(arguments);
        },

        _addGridBoard: function() {
            var plugins = [
                'rallygridboardaddnew',
                {
                    ptype: 'rallygridboardfilterinfo',
                    isGloballyScoped: Ext.isEmpty(this.getSetting('project')) ? true : false,
                    stateId: 'iteration-tracking-owner-filter-' + this.getAppId()
                },
                'rallygridboardownerfilter'
            ];

            if (this.getContext().isFeatureEnabled('SHOW_COLUMN_CHOOSER_ON_ITERATION_TRACKING_BOARD')) {
                plugins.push('rallygridboardfieldpicker');
            }

            if (this.getContext().isFeatureEnabled('SHOW_ARTIFACT_CHOOSER_ON_ITERATION_BOARDS')) {
                plugins.push({
                    ptype: 'rallygridboardartifacttypechooser',
                    artifactTypePreferenceKey: 'artifact-types',
                    showAgreements: true
                });
            }

            this.gridboard = this.add({
                itemId: 'gridBoard',
                xtype: 'rallygridboard',
                context: this.getContext(),
                enableToggle: this.getContext().isFeatureEnabled('ITERATION_TRACKING_BOARD_GRID_TOGGLE'),
                plugins: plugins,
                modelNames: this.modelNames,
                cardBoardConfig: {
                    columnConfig: {
                        useArtifactStore: this.getContext().isFeatureEnabled('USE_ARTIFACT_STORE_ON_KANBAN_APP'),
                        additionalFetchFields: ['PortfolioItem'],
                        plugins: [{
                            ptype: 'rallycolumnpolicy',
                            app: this
                        }]
                    },
                    cardConfig: {
                        fields: this.getCardFieldNames(),
                        showAge: (this.getSetting('showCardAge') && this.showCardAgeEnabled) ? this.getSetting('cardAgeThreshold') : -1,
                        showBlockedReason: this.getContext().isFeatureEnabled('F929_ENABLE_BLOCKED_REASON_PROMPT_ON_BOARDS')
                    },
                    listeners: {
                        filter: this._onBoardFilter,
                        filtercomplete: this._onBoardFilterComplete
                    }
                },
                gridConfig: {
                    columnCfgs: [
                        'FormattedID',
                        'Name',
                        'ScheduleState',
                        'Blocked',
                        'PlanEstimate',
                        'TaskStatus',
                        'TaskEstimateTotal',
                        'TaskRemainingTotal',
                        'Owner',
                        'DefectStatus',
                        'Discussion']
                },
                listeners: {
                    load: this._onLoad,
                    toggle: this._publishContentUpdated,
                    recordupdate: this._publishContentUpdatedNoDashboardLayout,
                    recordcreate: this._publishContentUpdatedNoDashboardLayout,
                    scope: this
                }
            });
        },

        _loadModels: function() {
            Rally.data.ModelFactory.getModels({
                types: ['User Story', 'Defect', 'Defect Suite', 'Test Set'],
                context: this.getContext().getDataContext(),
                success: function(models) {
                    this.modelNames = Ext.Object.getKeys(models);
                    this._addGridBoard();
                },
                scope: this
            });
        },

        _onLoad: function() {
            this._publishContentUpdated();
            if (Rally.BrowserTest) {
                Rally.BrowserTest.publishComponentReady(this);
            }
        },

        _onBoardFilter: function() {
           this.setLoading(true);
        },

        _onBoardFilterComplete: function() {
           this.setLoading(false);
        },

        _publishContentUpdated: function() {
            this.fireEvent('contentupdated');
        },

        _publishContentUpdatedNoDashboardLayout: function() {
            this.fireEvent('contentupdated', {dashboardLayout: false});
        },

        _getAddNewParams: function() {
            return this.gridboard.addNewPlugin._getAddNewParams();
        },

        _onAddNewBeforeCreate: function(addNew, record, params) {
            this.gridboard.addNewPlugin._onAddNewBeforeCreate(addNew, record, params);
        },

        _onAddNewBeforeEditorShow: function(addNew, params) {
            params.Iteration = this.getIterationRef() || 'u';
            params.Release = 'u';
            Ext.apply(params, this._getAddNewParams());
        },

        _onAddNewCreate: function(addNew, record) {
            this.gridboard.addNewPlugin._onAddNewBeforeCreate(addNew, record);
        }
    });
})();
