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
            'Rally.ui.cardboard.plugin.ColumnPolicy'
        ],
        componentCls: 'iterationtrackingboard',
        alias: 'widget.rallyiterationtrackingboard',

        scopeType: 'iteration',

        onScopeChange: function(scope) {
            this.remove('gridBoard');
            this._loadModels();
        },

        _addGridBoard: function() {
            this.gridboard = this.add({
                itemId: 'gridBoard',
                xtype: 'rallygridboard',
                context: this.getContext(),
                enableToggle: this.getContext().isFeatureEnabled('ITERATION_TRACKING_BOARD_GRID_TOGGLE'),
                plugins: [
                    {
                        ptype: 'rallygridboardfilterinfo',
                        isGloballyScoped: Ext.isEmpty(this.getSetting('project')) ? true : false,
                        stateId: 'iteration-tracking-owner-filter-' + this.getAppId()
                    },
                    'rallygridboardaddnew',
                    {
                        ptype: 'rallygridboardartifacttypechooser',
                        artifactTypePreferenceKey: 'artifact-types',
                        showAgreements: this.getContext().isFeatureEnabled('SHOW_POLICIES_ON_ITERATION_BOARDS')
                    },
                    'rallygridboardownerfilter'
                ],
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
                        fields: ['Parent', 'Tasks', 'Defects', 'Discussion', 'PlanEstimate']
                    },
                    listeners: {
                        filter: this._onBoardFilter,
                        filtercomplete: this._onBoardFilterComplete
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
        }
    });
})();
