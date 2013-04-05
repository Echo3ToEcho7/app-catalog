(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define("Rally.apps.charts.burndown.BurnDownApp", {
        extend: "Rally.app.App",
        cls: "burndown-app",

        requires: [
            'Rally.ui.chart.Chart'
        ],

        help: {
            cls:'burndown-help-container',
            id: 0
        }
    });
}());
