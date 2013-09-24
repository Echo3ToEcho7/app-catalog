(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define("Rally.apps.charts.magic.ChartSettings", {
        requires: [
            "Rally.apps.charts.settings.StateFieldPicker",
            "Rally.apps.charts.settings.ProjectPicker",
            "Rally.ui.datetime.TimeFrame"
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

        _getTimeFrame: function () {
            return {
                xtype: "rallytimeframe",
                name: "timeFrame",
                label: "Time Frame",
                mapsToMultiplePreferenceKeys: [ "timeFrameQuantity", "timeFrameUnit" ]
            };
        },

        _getStatePicker: function () {
            return {
                xtype: 'charts_settings_statefieldpicker',
                name: 'stateField',
                settings: this.app.getSettings()
            };
        },

        _getProjectPicker: function () {
            return {
                type: "project",
                name: "project",
                label: "Project"
            };
        },

        getFields: function () {
            return [
                this._getStatePicker(),
                this._getTimeFrame(),
                this._getProjectPicker()
            ];
        }
    });
}());
