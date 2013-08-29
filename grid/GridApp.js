(function() {
    var Ext = window.Ext4 || window.Ext;
    var appAutoScroll = Ext.isIE7 || Ext.isIE8;
    var gridAutoScroll = !appAutoScroll;

    Ext.define('Rally.apps.grid.GridApp', {
        extend: 'Rally.app.App',
        layout: 'fit',
        
        requires: [
            'Rally.ui.menu.item.Edit',
            'Rally.ui.menu.item.Copy',
            'Rally.ui.menu.item.Delete',
            'Rally.ui.grid.Grid',
            'Rally.ui.grid.RowActionColumn',
            'Rally.data.util.Sorter',
            'Rally.data.QueryFilter',
            'Rally.ui.grid.plugin.PercentDonePopoverPlugin'
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
                this.appContainer.setSize({height: grid.getHeight() + _.reduce(grid.getDockedItems(), function(acc, item) {
                    return acc + item.getHeight() + item.el.getMargin('tb');
                }, 0)});
            }
        },

        _getColumns: function(fetch){
            var defaultColumns = [
                {
                    xtype: 'rallyrowactioncolumn',
                    rowActionsFn: function(record) {
                        return [
                            {
                                xtype: 'rallyrecordmenuitemedit',
                                record: record
                            },
                            {
                                xtype: 'rallyrecordmenuitemcopy',
                                record: record
                            },
                            {
                                xtype: 'rallyrecordmenuitemdelete',
                                record: record
                            }
                        ];
                    }
                }
            ];

            if (fetch) {
                var columnsFromFetch = Ext.Array.difference(fetch.split(','), this._getFetchOnlyFields());
                return defaultColumns.concat(columnsFromFetch);
            } else {
                return defaultColumns;
            }

        },

        _getPlugins: function(columns) {
            var plugins = [];

            if (Ext.Array.intersect(columns, ['PercentDoneByStoryPlanEstimate','PercentDoneByStoryCount']).length > 0) {
                plugins.push('rallypercentdonepopoverplugin');
            }

            return plugins;
        }
    });
})();
