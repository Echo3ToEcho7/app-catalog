(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define("Rally.apps.charts.settings.TimeboxPicker", {
        extend: "Rally.apps.charts.settings.RadioGroupSetting",
        alias: "widget.charttimeboxpicker",

        mixins: [
            "Ext.form.field.Field"
        ],

        config: {
            settingName: "chartTimebox"
        },

        settingsParent: undefined,

        initComponent: function () {
            this.callParent(arguments);
            this._addRadioGroup();
        },

        _addRadioGroup: function () {
            this.add({
                xtype: "radiogroup",
                name: this.settingName,
                itemId: this.settingName,
                label: "Level",
                columns: [100, 100, 100],
                vertical: false,
                items: [
                    { boxLabel: "Iteration", name: this.settingName, inputValue: "iteration" },
                    { boxLabel: "Release", name: this.settingName, inputValue: "release" }
                ],
                listeners: {
                    beforerender: this.setRadioValue,
                    scope: this
                },
                config: {
                    cls: "levelchooser"
                }
            });
        }
    });
}());
