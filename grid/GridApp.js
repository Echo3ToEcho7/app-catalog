(function() {
    var Ext = window.Ext4 || window.Ext;
    var appAutoScroll = Ext.isIE7 || Ext.isIE8;
    var gridAutoScroll = !appAutoScroll;

    Ext.define('Rally.apps.grid.GridApp', {
        extend: 'Rally.app.App',
        layout: 'fit',
        
        requires: [
            'Rally.data.util.Sorter',
            'Rally.data.QueryFilter',
            'Rally.ui.grid.Grid',
            'Rally.ui.grid.plugin.PercentDonePopoverPlugin',
            'Rally.ui.grid.plugin.BlockedReasonPopoverPlugin'
        ],

        autoScroll: appAutoScroll,

        launch: function() {
            // TODO: need to pass dataScope here
            Rally.data.ModelFactory.getModel({
                type: this.getContext().get('objectType'),
                success: this._createGrid,
                scope: this
            });
        },

        _getFetchOnlyFields:function(){
            return ['LatestDiscussionAgeInMinutes'];
        },

        _createGrid: function(model) {
            var context = this.getContext(),
                pageSize = context.get('pageSize'),
                fetch = context.get('fetch'),
                columns = this._getColumns(fetch);

            var gridConfig = {
                xtype: 'rallygrid',
                model: model,
                columnCfgs: columns,
                enableColumnHide: false,
                enableRanking: true,
                enableBulkEdit: Rally.environment.getContext().isFeatureEnabled("EXT4_GRID_BULK_EDIT"),
                disableBlockedEdit: Rally.environment.getContext().isFeatureEnabled("F929_ENABLE_BLOCKED_REASON_PROMPT_ON_EXT_GRIDS"),
                autoScroll: gridAutoScroll,
                plugins: this._getPlugins(columns),
                storeConfig: {
                    fetch: fetch,
                    sorters: Rally.data.util.Sorter.sorters(context.get('order')),
                    context: context.getDataContext(),
                    listeners: {
                        load: this._updateAppContainerSize,
                        scope: this
                    }
                },
                pagingToolbarCfg: {
                    pageSizes: [pageSize]
                }
            };
            if (pageSize) {
                pageSize = pageSize - 0;
                if (!isNaN(pageSize)) {
                    gridConfig.storeConfig.pageSize = pageSize;
                }
            }
            if (context.get('query')) {
                gridConfig.storeConfig.filters = [
                    Rally.data.QueryFilter.fromQueryString(context.get('query'))
                ];
            }
            this.add(gridConfig);
        },

        _updateAppContainerSize: function() {
            if (this.appContainer) {
                var grid = this.down('rallygrid');
                grid.el.setHeight('auto');
                grid.body.setHeight('auto');
                grid.view.el.setHeight('auto');
                this.setSize({height: grid.getHeight() + _.reduce(grid.getDockedItems(), function(acc, item) {
                    return acc + item.getHeight() + item.el.getMargin('tb');
                }, 0)});
                this.appContainer.setPanelHeightToAppHeight();
            }
        },

        _getColumns: function(fetch){
            if (fetch) {
                return Ext.Array.difference(fetch.split(','), this._getFetchOnlyFields());
            }
            return [];

        },

        _getPlugins: function(columns) {
            var plugins = [];

            if (Ext.Array.intersect(columns, ['PercentDoneByStoryPlanEstimate','PercentDoneByStoryCount']).length > 0) {
                plugins.push('rallypercentdonepopoverplugin');
            }

            if (Rally.environment.getContext().isFeatureEnabled("F929_ENABLE_BLOCKED_REASON_PROMPT_ON_EXT_GRIDS") && Ext.Array.contains(columns, 'Blocked')) {
                plugins.push('rallyblockedreasonpopoverplugin');
            }

            return plugins;
        }
    });
})();
