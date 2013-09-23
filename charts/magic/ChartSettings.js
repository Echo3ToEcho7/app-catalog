(function() {
    var Ext = window.Ext4 || window.Ext;

    Ext.define("Rally.apps.charts.magic.ChartSettings", {
        requires: [
            "Rally.apps.charts.settings.StateFieldPicker"
        ],

        app: undefined, // Parent RallyApp instance

        constructor: function () {
            this._parseConstructorParams(arguments);
            this.callParent(arguments);
        },

        _parseConstructorParams: function() {
            if (arguments.length > 1) {
                throw 'ChartSettings constructor takes a map';
            }
            if (!arguments[0].app) {
                throw 'Missing parent application in ChartSettings';
            }
            this.app = arguments[0].app;
        },

        _buildSettingsComponent: function (type, label) {
            var self = this;
            return {
                xtype: type,
                label: label,
                listeners: {
                    added: function (cmp) {
                        this.settingsParent = this.settingsParent || self;
                    }
                }
            };
        },

        _getDatePicker: function() {
            return {
                xtype: "chartdatepicker",
                name: "date",
                label: "Date Picker Label"
            };
        },

        _getProjectPicker: function() {
            return {
                type: "project",
                name: "project",
                label: "Project"
            };
        },

        _getGroupByStatePicker: function() {
            return {
                xtype: 'charts_settings_statefieldpicker',
                name: 'stateField',
                settings: this.app.getSettings()
            };
        },

        getFields: function() {
            return [this._getGroupByStatePicker()];
        }

    });
}());
