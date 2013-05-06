(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define("Rally.apps.charts.burndown.BurnDownSettings", {
        requires: [
            "Rally.apps.charts.settings.ChartDisplayTypePicker",
            "Rally.apps.charts.settings.DataTypePicker",
            "Rally.apps.charts.settings.TimeboxPicker"
        ],

        config: {
            app: undefined
        },

        constructor: function(config) {
            this.mergeConfig(config);
            this.callParent(config);
        },

        _getDashboardType: function() {
            var timeboxScope = this.app.context.getTimeboxScope();
            if (timeboxScope) {
                return timeboxScope.getType();
            } else {
                return "";
            }
        },

        _buildSettingsComponent: function(type, label) {
            var self = this;

            var componentAdded = function(cmp) {
                this.settingsParent = this.settingsParent || self;
            };

            return {
                xtype: type,
                label: label,
                listeners: {
                    added: componentAdded
                }
            };
        },

        getFields: function() {
            var dashboardType = this._getDashboardType();

            var dataTypePicker = this._buildSettingsComponent("chartdatatypepicker", "Data Type"),
                displayPicker = this._buildSettingsComponent("chartdisplaytypepicker", "Chart Type"),
                timeboxPicker = this._buildSettingsComponent("charttimeboxpicker", "Level");

            if(dashboardType === "release" || dashboardType === "iteration") {
                return [dataTypePicker, displayPicker];
            } else {
                return [timeboxPicker, dataTypePicker, displayPicker];
            }
        }
    });
}());
