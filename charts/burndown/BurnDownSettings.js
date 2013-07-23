(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define("Rally.apps.charts.burndown.BurnDownSettings", {
        requires: [
            "Rally.apps.charts.settings.ChartDisplayTypePicker",
            "Rally.apps.charts.settings.DataTypePicker",
            "Rally.apps.charts.settings.TimeboxPicker",
            "Rally.apps.charts.settings.ScheduleStatePicker"
        ],

        config: {
            app: undefined
        },

        constructor: function (config) {
            this.mergeConfig(config);
            this.callParent(config);
        },

        _buildSettingsComponent: function (type, label) {
            var self = this;

            var componentAdded = function (cmp) {
                this.settingsParent = this.settingsParent || self;
                if(cmp.label == "Completed Schedule States") {
                    cmp._onComboboxBeforeRender = function(combobox) {
                        var stringValue = this.settingsParent.app.getSetting(this.settingName),
                            values = [];

                        if(_.isString(stringValue)) {
                            values = stringValue.split(",");
                        }

                        if(values.length == 1 && values[0] == "") {
                            var acceptedSeen = false;
                            values = [];
                            for(var i = 0; i < combobox.store.data.items.length; i++) {
                                if(combobox.store.data.items[i].data.StringValue == 'Accepted') {
                                acceptedSeen = true;
                                }
                                if(acceptedSeen) {
                                    values.push(combobox.store.data.items[i].data.StringValue);
                                }
                            }
                        }
                        combobox.setValue(values);
                    }
                }
            };

            return {
                xtype: type,
                label: label,
                listeners: {
                    added: componentAdded
                }
            };
        },

        _isOnScopedDashboard: function() {
            return this.app.isOnScopedDashboard() && !!this.app.context.getTimeboxScope();
        },

        getFields: function() {
            var dataTypePicker = this._buildSettingsComponent("chartdatatypepicker", "Data Type"),
                displayPicker = this._buildSettingsComponent("chartdisplaytypepicker", "Chart Type"),
                timeboxPicker = this._buildSettingsComponent("charttimeboxpicker", "Level"),
                scheduleStatePicker = this._buildSettingsComponent("chartschedulestatepicker",
                    "Completed Schedule States");

            if(this._isOnScopedDashboard()) {
                return [dataTypePicker, displayPicker, scheduleStatePicker];
            } else {
                return [timeboxPicker, dataTypePicker, displayPicker, scheduleStatePicker];
            }
        }
    });
}());
