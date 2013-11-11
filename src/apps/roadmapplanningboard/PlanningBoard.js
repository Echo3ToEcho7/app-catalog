(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.roadmapplanningboard.PlanningBoard', {
        extend: 'Rally.ui.cardboard.CardBoard',
        alias: 'widget.roadmapplanningboard',

        inject: ['timeframeStore', 'planStore', 'roadmapStore'],
        
        requires: [
            'Rally.data.util.PortfolioItemHelper',
            'Rally.ui.cardboard.plugin.FixedHeader',
            'Rally.apps.roadmapplanningboard.PlanningBoardColumn',
            'Rally.apps.roadmapplanningboard.TimeframePlanningColumn',
            'Rally.apps.roadmapplanningboard.BacklogBoardColumn'
        ],
        
        config: {
            roadmapId: null,
            cardConfig: {
                fields: ['FormattedID', 'Owner','Name', 'PreliminaryEstimate'],
                skipDefaultFields: true
            },
            ddGroup: 'planningBoard',
            dropAllowed: "planningBoard",
            dropNotAllowed: "planningBoard",
            attribute: '',

            /**
             * @cfg {Number} The duration of the theme slide animation in milliseconds
             */
            slideDuration: 500
        },

        clientMetrics: [
            {
                method: '_clickCollapseButton',
                descriptionProperty: '_getClickAction'
            },
            {
                method: '_clickExpandButton',
                descriptionProperty: '_getClickAction'
            }
        ],

        _roadmap: null,

        /**
         * @cfg {Boolean}
         * Toggle whether the theme is expanded or collapsed
         */
        showTheme: true,

        cls: 'roadmap-board cardboard',

        _retrieveModels: function (callback) {
            if (this.columns && this.columns.length > 0) {
                success.call(this);
            } else {
                this._roadmap = this.roadmapStore.getById(this.roadmapId);

                this._retrieveLowestLevelPI(function(record) {
                    Rally.data.ModelFactory.getModels({
                        types: [record.get('TypePath')],
                        context: this.context,
                        success: function(models) {
                            this.models = _.values(models);
                            this.planStore.load({
                                callback: function(records, operation, success) {
                                    if (success) {
                                        this.timeframeStore.load({
                                            callback: function(records, operation, success) {
                                                if (success) {
                                                    this.buildColumnsFromStore(this.timeframeStore);
                                                    callback.call(this);
                                                }
                                            },
                                            requester: this,
                                            scope: this
                                        });
                                    }
                                },
                                reqester: this,
                                scope: this
                            });
                        },
                        scope: this
                    });
                });
            }
        },

        /**
         * @inheritDoc
         */
        renderColumns: function () {
            this.callParent(arguments);
            this.drawThemeToggle();
        },

        _retrieveLowestLevelPI: function(callback) {
            Rally.data.util.PortfolioItemHelper.loadTypeOrDefault({
                defaultToLowest: true,
                success: callback,
                scope: this
            });
        },

        /**
         * This method will build an array of columns built from a timeframe store
         * @param {Ext.data.Store} timeframeStore
         * @returns {Array} columns
         */
        buildColumnsFromStore: function (timeframeStore) {
            this.columns = [this._getBacklogColumnConfig()];
            _.each(timeframeStore.data.items, function (timeframe) {
                this.columns.push(this._addColumnFromTimeframe(timeframe));
            }, this);

            return this.columns;
        },

        _getBacklogColumnConfig: function () {
            return {
                xtype: 'backlogplanningcolumn',
                cls: 'column backlog',
                roadmap: this._roadmap
            };
        },

        /**
         * @public
         * Draws the theme toggle buttons to show/hide the themes
         */
        drawThemeToggle: function () {
            this._destroyThemeButtons();

            this.themeCollapseButton = Ext.create('Ext.Component', {
                cls: ['themeButton', 'themeButtonCollapse'],
                autoEl: {
                    tag: 'a',
                    href: '#',
                    title: 'Hide themes'
                },
                listeners: {
                    click: {
                        element: 'el',
                        fn: this._clickCollapseButton,
                        scope: this
                    }
                }
            });
            var themeContainer = _.last(this.getEl().query('.theme_container'));
            if (themeContainer) {
                this.themeCollapseButton.render(themeContainer, 0);
            }

            this.themeExpandButton = Ext.create('Ext.Component', {
                cls: ['themeButton', 'themeButtonExpand'],
                hidden: this.showTheme,
                autoEl: {
                    tag: 'a',
                    href: '#',
                    title: 'Show themes'
                },
                listeners: {
                    click: {
                        element: 'el',
                        fn: this._clickExpandButton,
                        scope: this
                    }
                },
                renderTo: _.last(this.getEl().query('.column-header'))
            });
        },

        _clickCollapseButton: function () {
            this.showTheme = false;
            _.map(this._getThemeContainerElements(), this._collapseThemeContainers, this);
        },

        _clickExpandButton: function () {
            this.showTheme = true;
            this.themeExpandButton.hide();
            _.map(this._getThemeContainerElements(), this._expandThemeContainers, this);
        },

        _getThemeContainerElements: function () {
            return _.map(this.getEl().query('.theme_container'), Ext.get);
        },

        _collapseThemeContainers: function (el) {
            el.slideOut('t', {
                duration: this.getSlideDuration(),
                listeners: {
                    afteranimate: function () {
                        this.themeExpandButton.show(true);
                        this.fireEvent('headersizechanged');
                    },
                    scope: this
                }
            });
        },

        _expandThemeContainers: function (el) {
            el.slideIn('t', {
                duration: this.getSlideDuration(),
                listeners: {
                    afteranimate: function () {
                        this.fireEvent('headersizechanged');
                    },
                    scope: this
                }
            });
        },

        _addColumnFromTimeframe: function (timeframe) {
            var planForTimeframe = this._getPlanForTimeframe(timeframe);

            if (!planForTimeframe) {
                return null;
            }
            return this._addColumnFromTimeframeAndPlan(timeframe, planForTimeframe);
        },

        _getPlanForTimeframe: function (timeframe) {
            return this.planStore.getAt(this.planStore.findBy(function (record) {
                return record.get('timeframe').id === timeframe.getId();
            }));
        },

        destroy: function () {
            this._destroyThemeButtons();
            this.callParent(arguments);
        },

        _destroyThemeButtons: function() {
            if (this.themeCollapseButton && this.themeExpandButton) {
                this.themeCollapseButton.destroy();
                this.themeExpandButton.destroy();
            }
        },

        _addColumnFromTimeframeAndPlan: function (timeframe, plan) {

            return {
                xtype: 'timeframeplanningcolumn',
                timeframeRecord: timeframe,
                planRecord: plan,
                columnHeaderConfig: {
                    record: timeframe,
                    fieldToDisplay: 'name',
                    editable: true
                },
                isMatchingRecord: function (featureRecord) {
                    return plan && _.find(plan.get('features'), function(feature) { return feature.id === featureRecord.getId().toString(); });
                }
            };
        },

        _getClickAction: function () {
            var themesVisible = this.showTheme;
            var message = "Themes toggled from [" + !themesVisible + "] to [" + themesVisible + "]";
            return message;
        }
    });

})();
