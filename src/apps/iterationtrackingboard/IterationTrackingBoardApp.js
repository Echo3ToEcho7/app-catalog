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
            'Rally.ui.grid.TreeGrid',
            'Rally.ui.gridboard.plugin.GridBoardAddNew',
            'Rally.ui.gridboard.plugin.GridBoardOwnerFilter',
            'Rally.ui.gridboard.plugin.GridBoardFilterInfo',
            'Rally.ui.gridboard.plugin.GridBoardArtifactTypeChooser',
            'Rally.ui.gridboard.plugin.GridBoardFieldPicker',
            'Rally.ui.cardboard.plugin.ColumnPolicy',
            'Rally.ui.gridboard.plugin.GridBoardFilterInfo',
            'Rally.ui.gridboard.plugin.GridBoardFilterControl'
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
                if (this.showGridSettings) {
                    fields.push({settingsType: 'grid', html: 'no grid settings'});
                }
            }

            fields.push({
                type: 'cardage',
                settingsType: 'board',
                config: {
                    margin: '0 0 0 80',
                    width: 300
                }
            });

            return fields;
        },

        launch: function() {
            this.showGridSettings = this.getContext().isFeatureEnabled('ITERATION_TRACKING_BOARD_GRID_TOGGLE');
            this.callParent(arguments);
        },

        _addGridBoard: function(compositeModel, treeGridModel) {
            var plugins = ['rallygridboardaddnew'],
                context = this.getContext();

            if (context.isFeatureEnabled('F4359_FILTER')) {
                plugins.push({
                    ptype: 'rallygridboardfiltercontrol',
                    filterControlConfig: {
                        cls: 'secondary small button picto gridboard-filter-control'
                    }
                });
            }

            plugins = plugins.concat([{
                    ptype: 'rallygridboardfilterinfo',
                    isGloballyScoped: Ext.isEmpty(this.getSetting('project')) ? true : false,
                    stateId: 'iteration-tracking-owner-filter-' + this.getAppId()
                },
                'rallygridboardownerfilter',
                'rallygridboardfieldpicker'
            ]);

            if (context.isFeatureEnabled('SHOW_ARTIFACT_CHOOSER_ON_ITERATION_BOARDS')) {
                plugins.push({
                    ptype: 'rallygridboardartifacttypechooser',
                    artifactTypePreferenceKey: 'artifact-types',
                    showAgreements: true
                });
            }

            if (this.getContext().isFeatureEnabled('F2903_USE_ITERATION_TREE_GRID')) {
                
                Ext.apply(gridConfig, {
                    xtype: 'rallytreegrid',
                    model: treeGridModel,
                    storeConfig: {
                        nodeParam: 'Parent',
                        parentFieldNames: ['Requirement', 'WorkProduct'],
                        parentTypes: ['HierarchicalRequirement', 'Defect', 'DefectSuite', 'TestSet'],
                        childTypes: ['Defect', 'Task', 'TestCase'],
                        topLevelQuery: this.context.getTimeboxScope().getQueryFilter(),
                        sorters: ['Rank DESC'],
                        fetch: ['FormattedID', 'Tasks', 'Defects', 'TestCases']
                    },
                    rootVisible: false,
                    isLeaf: function(record) {
                        return  (!record.raw.Tasks || record.raw.Tasks.Count === 0) &&
                                (!record.raw.Defects || record.raw.Defects.Count === 0) &&
                                (!record.raw.TestCases || record.raw.TestCases.Count === 0);
                    },
                    getIcon: function(record) {
                        return '';
                    }
                });
            }

            this.gridboard = this.add({
                itemId: 'gridBoard',
                xtype: 'rallygridboard',
                stateId: 'iterationtracking-gridboard',
                context: context,
                enableToggle: context.isFeatureEnabled('ITERATION_TRACKING_BOARD_GRID_TOGGLE'),
                plugins: plugins,
                modelNames: this.modelNames,
                cardBoardConfig: {
                    columnConfig: {
                        additionalFetchFields: ['PortfolioItem'],
                        plugins: [{
                            ptype: 'rallycolumnpolicy',
                            app: this
                        }]
                    },
                    cardConfig: {
                        fields: this.getCardFieldNames(),
                        showAge: this.getSetting('showCardAge') ? this.getSetting('cardAgeThreshold') : -1,
                        showBlockedReason: true
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
                        'Discussion'
                    ],
                    enableBulkEdit: context.isFeatureEnabled('EXT4_GRID_BULK_EDIT'),
                    stateEnabled: context.isFeatureEnabled('ITERATION_TRACKING_PERSISTENT_PREFERENCES')
                },
                addNewPluginConfig: {
                    style: {
                        'float': 'left'
                    }
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
            var topLevelTypes = ['User Story', 'Defect', 'Defect Suite', 'Test Set'],
                allTypes = topLevelTypes.concat(['Task', 'Test Case']);
            Rally.data.ModelFactory.getModels({
                types: allTypes,
                context: this.getContext().getDataContext(),
                success: function(models) {
                    var topLevelModels = _.filter(models, function(model, key) {
                            return _.contains(topLevelTypes, key);
                        }),
                        compositeModel = Rally.domain.WsapiModelBuilder.buildCompositeArtifact(topLevelModels, this.getContext()),
                        treeGridModel;
                    this.modelNames = topLevelTypes;
                    if (this.getContext().isFeatureEnabled('F2903_USE_ITERATION_TREE_GRID')) {
                        treeGridModel = Rally.domain.WsapiModelBuilder.buildCompositeArtifact(_.values(models), this.getContext());
                    }
                    this._addGridBoard(compositeModel, treeGridModel);
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
