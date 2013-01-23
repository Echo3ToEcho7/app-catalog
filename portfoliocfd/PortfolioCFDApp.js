(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.portfoliocfd.PortfolioCFDApp', {
        extend:'Rally.apps.PortfolioChartApp',
        cls:'portfolio-cfd-app',
        appName:'Portfolio Item Cumulative Flow',
        config:{
            chart:{
                xtype:'rallycumulativeflowchart',
                typeOptions:{
                    aggregationType:'count'
                }
            },
            help:{
                cls:'portfolio-cfd-help-container',
                id:274
            }
        }
    });
})();
