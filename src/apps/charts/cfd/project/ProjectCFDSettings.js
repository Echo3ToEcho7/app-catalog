(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define("Rally.apps.charts.cfd.project.ProjectCFDSettings", {
        requires: [
            "Rally.apps.charts.settings.StateFieldPicker",
            "Rally.apps.charts.settings.ProjectPicker",
            "Rally.ui.datetime.TimeFrame"
        ],

        app: undefined, // Parent RallyApp instance

        constructor: function () {
            this._parseConstructorParams.apply(this, arguments);
            this.callParent(arguments);
        },

        _parseConstructorParams: function() {
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
                xtype: 'rallychartssettingsstatefieldpicker',
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
