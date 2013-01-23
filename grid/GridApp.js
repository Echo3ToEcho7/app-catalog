(function() {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.grid.GridApp', {
        extend: 'Rally.app.App',
        layout: 'fit',

        launch: function() {
            // TODO: need to pass dataScope here
            Rally.data.ModelFactory.getModel({
                type: this.getContext().get('objectType'),
                success: this._createGrid,
                scope: this
            });
        },

        _createGrid: function(model) {
            var context = this.getContext(),
                    pageSize = context.get('pageSize');
            var columns = [
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
            ].concat(context.get('fetch').split(','));
            var gridConfig = {
                xtype: 'rallygrid',
                model: model,
                columnCfgs: columns,
                enableColumnHide: false,
                storeConfig: {
                    sorters: Rally.data.util.Sorter.sorters(context.get('order')),
                    context: context.getDataContext()
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
        }
    });
})();
