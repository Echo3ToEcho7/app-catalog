(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define("Rally.apps.charts.burndown.Settings", {
        singleton: true,

        _setChooserValue: function(cmp) {
            var value = {};
            value[cmp.name] = cmp.value;

            cmp.setValue(value);
        },

        getFields: function(app, context) {
            return [
                {
                    xtype: "radiogroup",
                    name: "chartLevel",
                    label: "Level",
                    columns: [100, 100, 100],
                    vertical: false,
                    items: [
                        { boxLabel: "Iteration", name: "chartLevel", inputValue: "iteration" },
                        { boxLabel: "Release", name: "chartLevel", inputValue: "release" }
                    ],
                    listeners: {
                        added: this._setChooserValue
                    },
                    config: {
                        cls: "levelchooser"
                    }
                },
                {
                    xtype: "radiogroup",
                    name: "chartDataType",
                    label: "Data Type",
                    columns: [150, 100],
                    vertical: false,
                    items: [
                        { boxLabel: "Story Plan Estimate", name: "chartDataType", inputValue: "storypoints" },
                        { boxLabel: "Story Count", name: "chartDataType", inputValue: "storycount" }
                    ],
                    listeners: {
                        added: this._setChooserValue
                    },
                    config: {
                        cls: "datatypechooser"
                    }
                },
                {
                    xtype: "rallycombobox",
                    name: "chartDisplayType",
                    label: "Chart Type",
                    queryMode: "local",
                    editable: false,
                    store: {
                        xtype: "store",
                        fields: ["name", "value"],
                        data: [
                            {name: "Line", value: "line"},
                            {name: "Column", value: "column"}
                        ]
                    },
                    displayField: "name",
                    valueField: "value"
                },
//                {
//                    xtype: "hierarchychooser",
//                    label: "Chart Scope",
//                    config: {
//                        cls: "scopechooser"
//                    },
//                    context: {
//                        getWorkspace: function() {
//                            return {
//                                _ref: context.getWorkspace()._ref
//                            }
//                        }
//                    }
//                }
            ];
        }
    });
}());
