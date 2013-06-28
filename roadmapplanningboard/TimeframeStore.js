(function () {
    var Ext = window.Ext4 || window.Ext;
    Ext.define('Rally.apps.roadmapplanningboard.TimeframeStore', {
        extend: 'Ext.data.Store',
        inject: ['appModelFactory'],
        constructor: function (config) {
            this.model = this.appModelFactory.getTimeframeModel();
            return this.callParent(arguments);
        }
    });

}).call(this);
