(function () {
    var Ext;

    Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.roadmapplanningboard.FeatureStore', {
        extend: 'Ext.data.Store',
        inject: ['appModelFactory'],
        constructor: function (config) {
            this.model = this.appModelFactory.getFeatureModel();
            return this.callParent(arguments);
        }
    });

}).call(this);
