(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.piburnup.PIBurnupApp', {
        extend:'Rally.apps.PortfolioChartApp',
        cls:'portfolio-burnup-app',
        appName:'Portfolio Item Burn Up',
        config:{
            chart:{
                xtype:'rallyburnchart',
                typeOptions:{
                    aggregationType:'estimate',
                    series:[
                        'up',
                        'scope'
                    ],
                    acceptedStates:['Accepted', 'Released']
                }
            },
            help:{
                cls:'piburnup-help-container',
                id:273
            }
        }
    });
})();
