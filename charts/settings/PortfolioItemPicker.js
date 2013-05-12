(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define("Rally.apps.charts.settings.PortfolioItemPicker", {
        extend: "Ext.form.FieldContainer",
        alias: "widget.chartportfolioitempicker",

        settingsParent: undefined,
        requestContext: undefined,

        requires: [
            'Deft.Deferred',
            'Rally.util.Test',
            'Rally.ui.EmptyTextFactory',
            'Rally.ui.dialog.ChooserDialog',
            'Rally.data.WsapiDataStore'
        ],

        mixins: [
            'Ext.form.field.Field',
            'Rally.apps.charts.settings.SettingsChangeMixin'
        ],

        chooserConfig: {
            artifactTypes: ['portfolioitem'],
            storeConfig: {
                context: {
                    project: null
                },
                fetch: true
            },
            title: 'Choose a Portfolio Item',
            closeAction: 'hide',
            selectionButtonText: 'Select'
        },

        emptyText: '<p>No portfolio items match your search criteria.</p>',

        items: [
            {
                xtype: "label",
                text: "Portfolio Item",
                cls: "settingsLabel"
            },
            {
                xtype: "container",
                name: "portfolioItemPicker",
                layout: {
                    type: "hbox"
                },
                items: [
                    {

                        xtype: 'rallybutton',
                        text: 'Choose',
                        itemId: 'portfolioItemButton',
                        cls: 'piButton'
                    },
                    {
                        xtype: 'container',
                        cls: 'piDisplayField',
                        items: [
                            {
                                xtype: 'displayfield',
                                itemId: 'portfolioItemDisplay',
                                value: "&nbsp;"
                            }
                        ]
                    }

                ]
            }
        ],

        initComponent: function () {
            this.callParent(arguments);

            this.addCls(Rally.util.Test.toBrowserTestCssClass('buttonChooser'));
            this.down('#portfolioItemButton').on('click', this._onButtonClick, this);
            this.on('beforerender', this._configurePicker, this);
        },

        _configurePicker: function () {
            this.requestContext = {
                workspace: this.settingsParent.app.context.getWorkspaceRef(),
                project: null
            };

            this._setValueFromSettings();

            this._loadPortfolioItem();
            this._configureChooser();
        },

        _setValueFromSettings: function() {
            var newSettingsValue = this.settingsParent.app.getSetting("portfolioItemPicker"),
                oldSettingsValue = this.settingsParent.app.getSetting("buttonchooser"),
                value = "";

            if(this._isSettingValid(newSettingsValue)) {
                value = newSettingsValue;
            } else if(this._isSettingValid(oldSettingsValue)) {
                value = Ext.JSON.decode(oldSettingsValue).artifact._ref;
            } else { }

            this.setValue(value);
        },

        _isSettingValid: function(value) {
            return value && value !== "undefined";
        },

        _loadPortfolioItem: function () {
            if (typeof this.value !== "string" || this.value === "undefined") {
                return;
            }

            var store = Ext.create("Rally.data.WsapiDataStore", {
                model: "Portfolio Item",
                filters: [
                    {
                        property: "ObjectID",
                        operator: "=",
                        value: Rally.util.Ref.getOidFromRef(this.value)
                    }
                ],
                context: this.requestContext,
                scope: this
            });

            store.on('load', this._onPortfolioItemRetrieved, this);
            store.load();
        },

        _onPortfolioItemRetrieved: function (store) {
            var storeData = store.getAt(0);

            if (storeData && storeData.data) {
                this.portfolioItem = storeData.data;
                this._setDisplayValue();
                this.sendSettingsChange(this.portfolioItem);
            }
        },

        _setDisplayValue: function () {
            this.down("#portfolioItemDisplay").setValue(this._getPortfolioItemDisplay());
        },

        _onButtonClick: function () {
            if (this.dialog) {
                this.dialog.destroy();
            }

            this.dialog = Ext.create("Rally.ui.dialog.ChooserDialog", this.chooserConfig);
            this.dialog.show();
        },

        _getPortfolioItemDisplay: function () {
            return this.portfolioItem.FormattedID + ': ' + this.portfolioItem.Name;
        },

        _onPortfolioItemChosen: function (results) {
            if (results) {
                this.portfolioItem = results.data;
                this._setDisplayValue();
                this.sendSettingsChange(this.portfolioItem);
            }

            this.dialog.destroy();
        },

        _configureChooser: function () {
            Ext.Object.merge(this.chooserConfig, {
                listeners: {
                    artifactChosen: this._onPortfolioItemChosen,
                    scope: this
                },
                storeConfig: {
                    project: null,
                    context: this.requestContext
                },
                gridConfig: {
                    viewConfig: {
                        emptyText: Rally.ui.EmptyTextFactory.getEmptyTextFor(this.emptyText)
                    }
                }
            });
        },

        setValue: function (value) {
            if (value && value !== "undefined") {
                this.value = value;
            }
            else {
                this.value = this.settingsParent.app.getSetting("portfolioItemPicker");
            }
        },

        getSubmitData: function () {
            var returnObject = {};

            if (this.portfolioItem) {
                this.setValue(this.portfolioItem._ref);
                returnObject.portfolioItemPicker = this.portfolioItem._ref;
            }
            else {
                returnObject.portfolioItemPicker = "";
            }

            return returnObject;
        }
    });
}());
