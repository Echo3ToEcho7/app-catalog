(function() {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.recentactivity.App', {
        extend: 'Rally.app.App',

        requires: ['Rally.ui.discussion.DiscussionRichTextStreamView'],

        appName: 'Recent Activity',

        launch: function() {
            this.add({
                xtype: 'rallydiscussionrichtextstreamview',
                emptyText: '<div class="no-data">' +
                           '  <p>Once your team starts working, this app will keep you informed of active discussions.</p>' +
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
