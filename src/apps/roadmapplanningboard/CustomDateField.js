(function () {
    var Ext = window.Ext4 || window.Ext;
    Ext.define('Rally.apps.roadmapplanningboard.CustomDateField', {
        extend: 'Rally.ui.DateField',
        alias: 'widget.rallycustomdatefield',
        config: {
            picker: undefined
        },
        getPicker: function () {
            return this.picker;
        },
        onTriggerClick: function () {
            return console.info('clicked the trigger!!');
        }
    });

}).call(this);
