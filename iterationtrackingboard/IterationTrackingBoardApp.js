(function() {
    var Ext = window.Ext4 || window.Ext;

    /**
     * Iteration Tracking Board App
     * The Iteration Tracking Board can be used to visualize and manage your User Stories and Defects within an Iteration.
     */
    Ext.define('Rally.apps.iterationtrackingboard.App', {
        extend: 'Rally.app.TimeboxScopedApp',
        requires: [
            'Rally.data.ModelFactory',
            'Rally.ui.gridboard.GridBoard',
            'Rally.ui.gridboard.plugin.GridBoardAddNew',
            'Rally.ui.gridboard.plugin.GridBoardNotification',
            'Rally.ui.gridboard.plugin.GridBoardFilter'
        ],
        componentCls: 'iterationtrackingboard',
        alias: 'widget.rallyiterationtrackingboard',

        scopeType: 'iteration',

        addContent: function(scope) {
            this._loadModels();
        },

        onScopeChange: function(scope) {
            this.remove('gridBoard');
            this.addContent(scope);
        },

        _addGridBoard: function() {
            this.gridboard = this.add({
                itemId: 'gridBoard',
                xtype: 'rallygridboard',
                context: this.getContext(),
                enableToggle: this.getContext().isFeatureEnabled('ITERATION_TRACKING_BOARD_GRID_TOGGLE'),
                plugins: [
                    {ptype: 'rallygridboardaddnew'},
                    {ptype: 'rallygridboardfilter'},
                    {ptype: 'rallygridboardnotification'}
                ],
                modelNames: this.modelNames,
                cardBoardConfig: {
                    columnConfig: {
                        additionalFetchFields: ['PortfolioItem']
                    },
                    cardConfig: {
                        showSplitInHeaderMenu: this.getContext().isFeatureEnabled('SHOW_SPLIT_IN_CARD_HEADER_MENU'),
                        fields: ['Parent', 'Tasks', 'Defects', 'Discussion'],
                        useCollectionSummary: this.getContext().isFeatureEnabled('SUMMARY_COLLECTIONS_FOR_CARDS')
                    }
                },
                listeners: {
                    load: this._publishContentUpdated,
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

        _publishContentUpdated: function() {
            this.fireEvent('contentupdated');
        },

        _publishContentUpdatedNoDashboardLayout: function() {
            this.fireEvent('contentupdated', {dashboardLayout: false});
        }
    });
})();
