(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define("Rally.apps.charts.settings.DataTypePicker", {
        extend: "Rally.apps.charts.settings.RadioGroupSetting",
        alias: "widget.chartdatatypepicker",

        mixins: [
            "Ext.form.field.Field"
        ],

        config: {
            settingName: "chartAggregationType"
        },

        settingsParent: undefined,

        initComponent: function () {
            this.callParent(arguments);
            this.add(this._getRadioGroup());
        },

        _getRadioGroup: function () {
            return {
                xtype: "radiogroup",
                name: this.settingName,
                columns: [100, 150],
                vertical: false,
                items: [
                    { boxLabel: "Story Count", name: this.settingName, inputValue: "storycount" },
                    { boxLabel: "Story Plan Estimate", name: this.settingName, inputValue: "storypoints" }
                ],
                listeners: {
                    beforerender: this.setRadioValue,
                    scope: this
                }
            };
        }
    });
}());
