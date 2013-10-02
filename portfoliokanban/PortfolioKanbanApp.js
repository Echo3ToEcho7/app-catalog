(function () {
    var Ext = window.Ext4 || window.Ext;

    /**
     * PI Kanban Board App
     * Displays a cardboard and a type selector. Board shows States for the selected Type.
     */
    Ext.define('Rally.apps.portfoliokanban.PortfolioKanbanApp', {
        extend: 'Rally.app.App',
        requires: [
            'Rally.data.util.PortfolioItemHelper',
            'Rally.apps.portfoliokanban.PortfolioKanbanCard',
            'Rally.apps.portfoliokanban.PortfolioKanbanPolicy',
            'Rally.ui.cardboard.plugin.ColumnPolicy',
            'Rally.ui.cardboard.Column',
            'Rally.ui.cardboard.CardBoard',
            'Rally.ui.cardboard.Card',
            'Rally.data.QueryFilter',
            'Rally.ui.notify.Notifier',
            'Rally.util.Help',
            'Rally.util.Test'
        ],
        layout: 'auto',
        appName: 'Portfolio Kanban',

        cls: 'portfolio-kanban',

        config: {
            defaultSettings: {
                fields: 'PercentDoneByStoryCount'
            }
        },

        clientMetrics: [
            {
                method: '_showHelp',
                description: 'portfolio-kanban-show-help'
            }
        ],

        items: [
            {
                xtype: 'container',
                itemId: 'header',
                cls: 'header'
            },
            {
                xtype: 'container',
                itemId: 'bodyContainer',
                width: '100%'
            }
        ],

        afterRender: function () {
            this.callParent(arguments);

            if (Rally.environment.getContext().getSubscription().isModuleEnabled('Rally Portfolio Manager')) {

                Rally.data.util.PortfolioItemHelper.loadTypeOrDefault({
                    typeRef: this.getSetting('type'),
                    defaultToLowest: true,
                    context: this.getContext().getDataContext(),
                    success: function (record) {
                        this.currentType = record;

                        this._drawHeader();
                        this._loadCardboard();
                    },
                    scope: this
                });
            } else {
                this.down('#bodyContainer').add({
                    xtype: 'container',
                    html: '<div class="rpm-turned-off" style="padding: 50px; text-align: center;">You do not have RPM enabled for your subscription</div>'
                });

                this._publishContentUpdated();
            }
        },

        onDestroy: function() {
            if(this._percentDonePopover) {
                this._percentDonePopover.destroy();
                delete this._percentDonePopover;
            }

            this.callParent(arguments);
        },

        _drawHeader: function () {
            var header = this.down('#header');

            header.add([
                this._buildHelpComponent(),
                this._buildShowPolicies(),
                this._buildFilterInfo()
            ]);
        },

        _loadCardboard: function () {
            this._loadStates({
                success: function (states) {
                    var columns = this._createColumns(states);
                    if (this.rendered) {
                        this._drawCardboard(columns);
                    } else {
                        this.on('afterrender', Ext.bind(this._drawCardboard, this, [columns]), this, {single: true});
                    }
                },
                scope: this
            });

        },

        /**
         * @private
         * We need the States of the selected Portfolio Item Type to know what columns to show.
         * Whenever the type changes, reload the states to redraw the cardboard.
         * @param options
         * @param options.success called when states are loaded
         * @param options.scope the scope to call success with
         */
        _loadStates: function (options) {
            Ext.create('Rally.data.WsapiDataStore', {
                model: 'State',
                context: this.getContext().getDataContext(),
                autoLoad: true,
                fetch: ['Name', 'WIPLimit', 'Description'],
                filters: [
                    {
                        property: 'TypeDef',
                        value: this.currentType.get('_ref')
                    },
                    {
                        property: 'Enabled',
                        value: true
                    }
                ],
                sorters: [
                    {
                        property: 'OrderIndex',
                        direction: 'ASC'
                    }
                ],
                listeners: {
                    load: function (store, records) {
                        if (options.success) {
                            options.success.call(options.scope || this, records);
                        }
                    }
                }
            });

        },

        /**
         * Given a set of columns, build a cardboard component. Otherwise show an empty message.
         * @param columns
         */
        _drawCardboard: function (columns) {
            if (columns) {
                this._showColumns(columns);
            }
            else {
                this._showNoColumns();
            }
        },

        _showColumns: function (columns) {
            var cardboard = this.down('#cardboard'),
                filters = [
                    {
                        property: 'PortfolioItemType',
                        value: this.currentType.get('_ref')
                    }
                ];

            if (cardboard) {
                cardboard.destroy();
            }

            if (this.getSetting('query')) {
                try {
                    filters.push(Rally.data.QueryFilter.fromQueryString(this.getSetting('query')));
                } catch (e) {
                    Rally.ui.notify.Notifier.showError({
                        message: e.message
                    });
                }
            }

            var columnConfig = {
                xtype: 'rallycardboardcolumn',
                cardLimit: 50,
                drawFooter: Ext.emptyFn,
                enableWipLimit: true
            };

            var cardConfig = {
                xtype: 'rallyportfoliokanbancard',
                editable: true,
                showColorIcon: true
            };

            var fields = this.getSetting('fields');

            if (fields) {
                columnConfig.additionalFetchFields = fields.split(',');
                cardConfig.fields = fields.split(',').sort();
            } else {
                columnConfig.additionalFetchFields = [];
                cardConfig.fields = Rally.apps.portfoliokanban.PortfolioKanbanCard.defaultFields;
            }

            if (Ext.Array.intersect(cardConfig.fields, ['PercentDoneByStoryPlanEstimate', 'PercentDoneByStoryCount']).length > 0) {
                columnConfig.additionalFetchFields = Ext.Array.merge(cardConfig.fields, ['PercentDoneByStoryPlanEstimate', 'PercentDoneByStoryCount']);
            }

            columnConfig.additionalFetchFields.push('Discussion');
            cardConfig.fields.push('Discussion');

            cardboard = this.cardboard = Ext.widget('rallycardboard', {
                types: [this.currentType.get('TypePath')],
                context: this.getContext(),
                itemId: 'cardboard',
                attribute: 'State',
                columns: columns,
                ddGroup: this.currentType.get('TypePath'),
                cls: 'cardboard',
                columnConfig: columnConfig,
                cardConfig: cardConfig,
                storeConfig: {
                    filters: filters,
                    context: this.context.getDataContext()
                },
                listeners: {
                    load: this._onBoardLoad,
                    cardupdated: this._publishContentUpdatedNoDashboardLayout,
                    scope: this
                },

                loadDescription: 'Portfolio Kanban',
                loadMask: false
            });

            this.down('#bodyContainer').add(cardboard);
            this.setLoading({ id: this.getMaskId() });

            this._renderPolicies();
        },

        getMaskId: function () {
            return 'btid-portfolio-kanban-board-load-mask-' + this.id;
        },

        _onBoardLoad: function (cardboard) {
            this._attachPercentDoneToolTip(cardboard);
            this._publishContentUpdated();
            this.setLoading(false);
            Rally.environment.getMessageBus().publish(Rally.Message.piKanbanBoardReady);
        },

        _showNoColumns: function () {
            this.add({
                xtype: 'container',
                cls: 'no-type-text',
                html: '<p>This Type has no states defined.</p>'
            });
            this._publishContentUpdated();
        },

        /**
         * @private
         * @return columns for the cardboard, as a map with keys being the column name.
         */
        _createColumns: function (states) {
            if (!states.length) {
                return undefined;
            }

            var columns = [
                {
                    columnHeaderConfig: {
                        headerTpl: 'No Entry'
                    },
                    value: null,
                    plugins: [{
                        ptype: 'rallycolumnpolicy',
                        policyCmpConfig: {
                            xtype: 'rallyportfoliokanbanpolicy',
                            hidden: true,
                            title: 'Exit Policy'
                        }
                    }]
                }
            ];

            Ext.Array.each(states, function (state) {
                columns.push({
                    value: state.get('_ref'),
                    wipLimit: state.get('WIPLimit'),
                    enableWipLimit: true,
                    columnHeaderConfig: {
                        record: state,
                        fieldToDisplay: 'Name',
                        editable: false
                    },
                    plugins: [{
                        ptype: 'rallycolumnpolicy',
                        policyCmpConfig: {
                            xtype: 'rallyportfoliokanbanpolicy',
                            hidden: true,
                            stateRecord: state,
                            title: 'Exit Policy'
                        }
                    }]
                });
            });

            return columns;
        },

        _attachPercentDoneToolTip: function (cardboard) {
            cardboard.getEl().select('.rui-card .progress-bar-container').each(function (flyEl) {
                var el = Ext.get(flyEl.dom);
                el.on('click', function () {
                    var cardEl = el.up('.rui-card');
                    var card = Ext.getCmp(cardEl.id);
                    var record = card.getRecord();
                    this._percentDonePopover = Ext.create('Rally.ui.popover.PercentDonePopover', {
                        target: el,
                        targetSelector: '#' + cardEl.id + ' .progress-bar-container',
                        percentDoneData: record.data,
                        percentDoneName: 'PercentDoneByStoryCount',
                        piRef: record.data._ref,
                        listeners: {
                            destroy: function() {
                                delete this._percentDonePopover;
                            },
                            scope: this
                        }
                    });
                }, this);
            }, this);
        },

        _renderPolicies: function () {
            var showPoliciesCheckbox = this.down("#showPoliciesCheckbox");

            Ext.each(this.cardboard.getColumns(), function (column) {
                if (showPoliciesCheckbox.getValue()) {
                    column.fireEvent('showpolicy');
                } else {
                    column.fireEvent('hidepolicy');
                }
            });
        },

        _buildShowPolicies: function () {
            return Ext.widget('checkbox', {
                cls: 'showPolicies',
                itemId: 'showPoliciesCheckbox',
                fieldCls: 'showPoliciesCheckbox',
                boxLabel: "Show Policies",
                listeners: {
                    change: {
                        fn: this._renderPolicies,
                        scope: this
                    }
                }
            });

        },

        _buildHelpComponent: function (config) {
            return Ext.create('Ext.Component', Ext.apply({
                cls: Rally.util.Test.toBrowserTestCssClass('portfolio-kanban-help-container'),
                renderTpl: Rally.util.Help.getIcon({
                    id: 265
                })
            }, config));
        },

        _buildFilterInfo: function () {
            return Ext.create('Rally.ui.tooltip.FilterInfo', {
                projectName: this.getSetting('project') && this.getContext().get('project').Name || 'Following Global Project Setting',
                typePath: this.currentType.get('Name'),
                scopeUp: this.getSetting('projectScopeUp'),
                scopeDown: this.getSetting('projectScopeDown'),
                query: this.getSetting('query')
            });
        },

        _publishContentUpdated: function () {
            this.fireEvent('contentupdated');
            if (Rally.BrowserTest) {
                Rally.BrowserTest.publishComponentReady(this);
            }
        },

        _publishContentUpdatedNoDashboardLayout: function () {
            this._attachPercentDoneToolTip(this.cardboard);
            this.fireEvent('contentupdated', {dashboardLayout: false});
        }

    });
})();
