(function() {
    var Ext = window.Ext4 || window.Ext;

    /**
     * Blocked Work App
     * View most recently blocked work
     */
    Ext.define('Rally.apps.blockedwork.BlockedWorkApp', {
        extend: 'Rally.app.App',

        requires: [
            'Rally.apps.blockedwork.BlockedWorkView'
        ],

        alias: 'widget.blockedworkapp',
        layout: 'auto',
        appName: 'Blocked Work',
        cls: 'blocked-work-app',

        launch: function() {
            this.add({
                xtype: 'rallyblockedworkview',
                emptyText: '<div class="no-data">' +
                           '  <p>There are no blocked work products.</p>' +
                           '</div>',
                storeConfig: {
                    context: this.getContext().getDataContext()
                },
                listeners: {
                    refresh: function(){
                        this.fireEvent('contentupdated', {dashboardLayout: false});
                    },
                    scope: this
                }
            });
        }
    });
})();