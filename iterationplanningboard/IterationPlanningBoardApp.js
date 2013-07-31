(function() {
    var Ext = window.Ext4 || window.Ext;

    /**
     * Iteration Planning Board App
     * The Iteration Planning Board can be used to visualize and assign your User Stories and Defects within the appropriate iteration.
     */
    Ext.define('Rally.apps.iterationplanningboard.IterationPlanningBoardApp', {
        extend: 'Rally.app.App',
        requires: [
            'Rally.data.ModelFactory',
            'Rally.apps.iterationplanningboard.TimeboxGridBoard',
            'Rally.apps.iterationplanningboard.TimeboxScrollable',
            'Rally.ui.gridboard.plugin.GridBoardAddNew',
            'Rally.ui.gridboard.plugin.GridBoardArtifactTypeChooser',
            'Rally.ui.gridboard.plugin.GridBoardManageIterations',
            'Rally.ui.gridboard.plugin.GridBoardFilterInfo',
            'Rally.util.Array'
        ],
        cls: 'planning-board',

        launch: function() {
            this._showBoard();
        },

        _showBoard: function() {
            var rankScope = 'BACKLOG',
                plugins = [
                    {
                        ptype: 'rallygridboardfilterinfo',
                        isGloballyScoped: Ext.isEmpty(this.getSetting('project')) ? true : false
                    },
                    {
                        ptype: 'rallygridboardaddnew',
                        rankScope: rankScope
                    },
                    {
                        ptype: 'rallygridboardartifacttypechooser',
                        artifactTypePreferenceKey: 'artifact-types'
                    }
                ];

            var subscription = this.getContext().getSubscription();
            if (subscription.isHsEdition() || subscription.isExpressEdition()) {
                plugins.push({ptype: 'rallygridboardmanageiterations'});
            }

            this.gridboard = this.add({
                xtype: 'iterationplanningboardapptimeboxgridboard',
                context: this.getContext(),
                modelNames: ['User Story', 'Defect'],
                plugins: plugins,
                cardBoardConfig: {
                    listeners: {
                        filter: this._onBoardFilter,
                        filtercomplete: this._onBoardFilterComplete,
                        scope: this
                    },
                    plugins: [
                        {
                            ptype: 'rallytimeboxscrollablecardboard',
                            backwardsButtonConfig: {
                                elTooltip: 'Previous Iteration'
                            },
                            columnRecordsProperty: 'timeboxRecords',
                            forwardsButtonConfig: {
                                elTooltip: 'Next Iteration'
                            },
                            getFirstVisibleScrollableColumn: function(){
                                return this.getScrollableColumns()[0];
                            },
                            getLastVisibleScrollableColumn: function(){
                                return Rally.util.Array.last(this.getScrollableColumns());
                            },
                            getScrollableColumns: function(){
                                return Ext.Array.slice(this.cmp.getColumns(), 1, this.cmp.getColumns().length);
                            }
                        }
                    ]
                },
                listeners: {
                    load: this._onLoad,
                    toggle: this._publishContentUpdated,
                    recordupdate: this._publishContentUpdatedNoDashboardLayout,
                    recordcreate: this._publishContentUpdatedNoDashboardLayout,
                    preferencesaved: this._publishPreferenceSaved,
                    scope: this
                }
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

        _publishPreferenceSaved: function(record) {
            this.fireEvent('preferencesaved', record);
        }
    });
})();
