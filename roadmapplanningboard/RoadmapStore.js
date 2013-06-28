(function () {
    var Ext = window.Ext4 || window.Ext;
    Ext.define('Rally.apps.roadmapplanningboard.RoadmapStore', {
        extend: 'Ext.data.Store',
        inject: ['appModelFactory'],
        constructor: function (config) {
            this.model = this.appModelFactory.getRoadmapModel();
            return this.callParent(arguments);
        }
    });

}).call(this);
