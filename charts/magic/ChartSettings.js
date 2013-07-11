(function() {
    var Ext = window.Ext4 || window.Ext;

    Ext.define("Rally.apps.charts.magic.ChartSettings", {
        singleton: true,

        requires: [
            "Rally.apps.charts.settings.GroupByState",
            "Rally.apps.charts.settings.ProjectPicker",
            "Rally.apps.charts.settings.DatePicker"
        ],

        _getDatePicker: function() {
            return {
                xtype: "chartdatepicker",
                name: "date",
                label: "Date Picker Label"
            }
        },

        _getStatePicker: function() {
            return {
                xtype: "chartgroupbystate",
                name: "groupBy",
                label: "Group By Label"
            }
        },

        _getProjectPicker: function() {
            return {
                type: "project",
                name: "project",
                label: "Project"
            }
        },

        getFields: function() {
            return [
                this._getStatePicker(),
                this._getDatePicker(),
                this._getProjectPicker()
            ]
        }
    });
}());