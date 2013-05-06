(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define("Rally.apps.charts.settings.ChartDisplayTypePicker", {
        extend: "Rally.apps.charts.settings.RadioGroupSetting",
        alias: "widget.chartdisplaytypepicker",

        mixins: [
            "Ext.form.field.Field"
        ],

        config: {
            settingName: "chartDisplayType"
        },

        settingsParent: undefined,

        initComponent: function () {
            this.callParent(arguments);
            this.add(this._getPicker());
        },

        _getPicker: function () {
            return {
                xtype: "radiogroup",
                name: this.settingName,
                columns: [100, 100],
                vertical: false,
                items: [
                    { boxLabel: "Line", name: this.settingName, inputValue: "line" },
                    { boxLabel: "Column", name: this.settingName, inputValue: "column" }
                ],
                listeners: {
                    beforerender: this.setRadioValue,
                    scope: this
                }
            };
        }
    });
}());
