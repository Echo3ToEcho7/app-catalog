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

            this.on("beforerender", this._enablePicker, this);
        },

        _enablePicker: function () {
            var dashboardType = this.settingsParent._getDashboardType();

            if (dashboardType === "iteration" || dashboardType === "release") {
                this.destroy();
            } else {
                this.add(this.getRadioGroup());

                this._addReleasePicker();
                this._addIterationPicker();
                this._togglePicker();
            }
        },

        _getSavedPickerSetting: function(name) {
            return this.settingsParent.app.getSetting(name);
        },

        _setSavedTimeboxSetting: function(cmp) {
            var settingValue = this._getSavedPickerSetting(cmp.name);
            cmp.setValue(settingValue);
        },

        _addIterationPicker: function () {
            this.iterationPicker = this.iterationPicker || {
                xtype: "container",
                itemId: "iterationPicker",
                hidden: true,
                items: [
                    {
                        xtype: 'rallyiterationcombobox',
                        listeners: {
                            beforerender: this._setSavedTimeboxSetting,
                            scope: this
                        }
                    }
                ]
            };

            if(!this.down("#iterationPicker")) {
                this.add(this.iterationPicker);
            }
        },

        _addReleasePicker: function () {
            this.releasePicker = this.releasePicker || {
                xtype: "container",
                itemId: "releasePicker",
                hidden: true,
                items: [
                    {
                        xtype: 'rallyreleasecombobox',
                        listeners: {
                            beforerender: this._setSavedTimeboxSetting,
                            scope: this
                        }
                    }
                ]
            };

            if(!this.down("#releasePicker")) {
                this.add(this.releasePicker);
            }
        },

        _togglePicker: function() {
            var cmp = this.down("#" + this.settingName);

            var selectedValue = cmp.getValue()[this.settingName] || this.getSetting();
            if(selectedValue === "release") {
                this.down("#iterationPicker").hide();
                this.down("#releasePicker").show();
            } else {
                this.down("#releasePicker").hide();
                this.down("#iterationPicker").show();
            }
        },

        getRadioGroup: function () {
            return {
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
                    change: this._togglePicker,
                    scope: this
                },
                config: {
                    cls: "levelchooser"
                }
            };
        }
    });
}());
