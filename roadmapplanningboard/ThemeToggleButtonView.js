(function () {
    var Ext;

    Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.roadmapplanningboard.ThemeToggleButtonView', {
        extend: 'Ext.container.Container',
        xtype: 'roadmapthemetogglebuttonview',
        requires: ['Rally.apps.roadmapplanningboard.ThemeToggleButtonController'],
        controller: 'Rally.apps.roadmapplanningboard.ThemeToggleButtonController'
    });

}).call(this);
