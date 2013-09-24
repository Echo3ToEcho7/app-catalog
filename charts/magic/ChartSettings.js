(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define("Rally.apps.charts.magic.ChartSettings", {
        singleton: true,

        requires: [
            "Rally.apps.charts.settings.GroupByState",
            "Rally.apps.charts.settings.ProjectPicker",
            "Rally.ui.datetime.TimeFrame"
        ],

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
                xtype: "chartgroupbystate",
                name: "groupBy",
                label: "Group By Label"
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
