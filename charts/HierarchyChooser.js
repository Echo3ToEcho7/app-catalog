(function() {
    var Ext = window.Ext4 || window.Ext;

    Ext.define("Rally.apps.charts.HierarchyChooser", {
        extend: "Ext.form.FieldContainer",
        alias: "widget.hierarchychooser",

        config: {
            /**
             * @cfg Object context
             * The application context data the setting is being run in
             */
            context: {}
        },

        items: [
            {
                xtype: "container",
                itemId: "comboboxContainer"
            },
            {
                xtype: "container",
                itemId: "chooserContainer",
                items: [
                    {
                        xtype: 'rallyprojectscopefield',
                        itemId: 'projectScopeField',
                        mapsToMultiplePreferenceKeys: ['project', 'projectScopeUp', 'projectScopeDown'],
                        storeConfig: {
                            autoLoad: true
                        },
                        hidden: true
                    },
                    {
                        type: "rallychooserdialog",
                        itemId: "epicstoryScopeField",
                        artifactTypes: ['userstory'],
                        autoShow: false,
                        height: 300,
                        title: "Choose User Story",
                        storeConfig: {
                            context: {
                                project: null
                            },
                            fetch: ["UserStoryType"]
                        },
                        hidden: true
                    }
                ]
            }
        ],

        constructor: function(config) {
            this._addPortfolioItemChooser(config);

            this.callParent(arguments);
        },

        initComponent: function() {
            this.callParent(arguments);

            this.combobox = this.down("#comboboxContainer").add(this._getCombobox());
            this.combobox.on('change', this._onComboboxChange, this);

            this._showSelected();
        },

        _addPortfolioItemChooser: function(config) {
            this.items[1].items.push({
                xtype: "rallybuttonchooser",
                label: "Portfolio Item",
                itemId: "portfolioitemScopeField",
                type: "portfolioitem",
                cls: "pichooser",
                context: config.context,
                hidden: true
            });
        },

        _getCombobox: function() {
            return {
                xtype: "rallycombobox",
                name: "chartScope",
                queryMode: "local",
                editable: false,
                store: {
                    xtype: "store",
                    fields: ["name", "value"],
                    data: [
                        {name: "Project", value: "project"},
                        {name: "Portfolio Item", value: "portfolioitem"},
                        {name: "Epic Story", value: "epicstory"}
                    ]
                },
                displayField: "name",
                valueField: "value",
                listeners: {
                    added: function() {
                        this.setValue("project");
                    }
                }
            };
        },

        _onComboboxChange: function() {
            var components = this.query("#chooserContainer > component", "{isVisible()}");
            for(var i = 0; i < components.length; i++) {
                if(components[i]) {
                    components[i].hide();
                }
            }

            this._showSelected();
        },

        _showSelected: function() {
            this._getChooser(this.combobox.value).show();
        },

        _getChooser: function(settingValue) {
            return this.down("#chooserContainer").down("#" + settingValue + "ScopeField");
        },

        getSubmitData: function () {
            var returnObject = {};
            returnObject[this.getName()] = this.getValue();
            return returnObject;
        }
    });
}());
