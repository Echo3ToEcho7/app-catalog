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

            var gridConfig = {
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
                enableBulkEdit: context.isFeatureEnabled('EXT4_GRID_BULK_EDIT')
            };

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
                        // var type = record.get('_type');
                        // if (type === 'Defect') {
                        //     return 'data:image/png;base64,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';
                        // } else if (type === 'Task') {
                        //     return 'data:image/png;base64,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';
                        // } else if (type === 'TestCase') {
                        //     return 'data:image/png;base64,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';
                        // } else if (type === 'HierarchicalRequirement') {
                        //     return 'data:image/png;base64,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';
                        // }
                        return '';
                    }
                });
            }

            this.gridboard = this.add({
                itemId: 'gridBoard',
                xtype: 'rallygridboard',
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
                
                gridConfig: gridConfig,
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
                        compositeModel = Rally.domain.WsapiModelBuilder.buildCompositeArtifact(topLevelModels, this.getContext());
                    this.modelNames = topLevelTypes;
                    if (this.getContext().isFeatureEnabled('F2903_USE_ITERATION_TREE_GRID')) {
                        var treeGridModel = Rally.domain.WsapiModelBuilder.buildCompositeArtifact(_.values(models), this.getContext());
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
