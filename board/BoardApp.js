(function() {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.board.BoardApp', {
        extend: 'Rally.app.App',
        layout: 'fit',
        requires: [
            'Rally.ui.combobox.FieldComboBox',
            'Rally.ui.cardboard.CardBoard',
            'Rally.ui.combobox.ComboBox',
            'Rally.ui.picker.FieldPicker',
            'Rally.ui.TextField',
            'Rally.ui.NumberField'
        ],

        config: {
            defaultSettings: {
                type: 'HierarchicalRequirement',
                groupByField: 'ScheduleState',
                pageSize: 25,
                fields: 'Name',
                query: '',
                order: 'Rank'
            }
        },

        launch: function() {
            this.add({
                xtype: 'rallycardboard',
                types: [this.getSetting('type')],
                attribute: this.getSetting('groupByField'),
                context: this.getContext(),
                storeConfig: {
                    pageSize: this.getSetting('pageSize'),
                    filters: this._getQueryFilters()
                },
                cardConfig: {
                    editable: true,
                    showHeaderMenu: true,
                    fields: this.getSetting('fields').split(',')
                },
                listeners: {
                    load: this._publishContentUpdated,
                    cardupdated: this._publishContentUpdatedNoDashboardLayout,
                    scope: this
                },
                loadMask: true
            });
        },

        getSettingsFields: function() {
            return [
                {
                    name: 'type',
                    xtype: 'rallycombobox',
                    storeConfig: {
                        context: this.getContext().getDataContext(),
                        model: 'TypeDefinition',
                        sorters: [
                            {
                                property: 'Name'
                            }
                        ],
                        fetch: ['DisplayName', 'ElementName', 'TypePath'],
                        filters: [
                            {
                                property: 'Creatable',
                                value: true
                            }
                        ],
                        autoLoad: false
                    },
                    displayField: 'DisplayName',
                    valueField: 'ElementName',
                    listeners: {
                        select: function(combo, records) {
                            this.fireEvent('typeselected', records[0].get('TypePath'), this.store.context);
                        },
                        ready: function(combo) {
                            Rally.data.ModelFactory.getModels({
                                types: Ext.Array.map(combo.store.getRange(), function(record) {
                                    return record.get('TypePath');
                                }),
                                success: function(models) {

                                    combo.store.filterBy(function(record) {
                                        return models[record.get('TypePath')].hasField('FormattedID');
                                    });
                                    this.fireEvent('typeselected', combo.getRecord().get('TypePath'), this.store.context);
                                },
                                scope: this
                            });

                        }
                    },
                    bubbleEvents: ['typeselected']
                },
                {
                    name: 'groupByField',
                    fieldLabel: 'Group By',
                    xtype: 'rallyfieldcombobox',
                    handlesEvents: {
                        typeselected: function(type, context) {
                            this.refreshWithNewModelType(type, context);
                        }
                    },
                    listeners: {
                        ready: function(combo) {
                            combo.store.filterBy(function(record) {
                                var field = record.get('fieldDefinition');
                                return field && !field.readOnly && field.hasAllowedValues();
                            });
                        }
                    }
                },
                {
                    name: 'fields',
                    fieldLabel: 'Card Fields',
                    xtype: 'rallyfieldpicker',
                    handlesEvents: {
                        typeselected: function(type, context) {
                            this.refreshWithNewModelTypes([type], context);
                        }
                    },
                    width: 300,
                    margin: '0 0 255 0',
                    storeConfig: {
                        autoLoad: false
                    }
                },
                {
                    name: 'order',
                    xtype: 'rallytextfield'
                },
                {
                    name: 'pageSize',
                    xtype: 'rallynumberfield',
                    fieldLabel: 'Page Size'
                },
                {
                    type: 'query'
                }
            ];
        },

        _getQueryFilters: function() {
            var settingsQuery = this.getSetting('query') && Rally.data.QueryFilter.fromQueryString(this.getSetting('query'));
            var timeboxQuery = this.getContext().getTimeboxScope() && this.getContext().getTimeboxScope().getQueryFilter();

            return (settingsQuery && timeboxQuery) ? settingsQuery.and(timeboxQuery) : (settingsQuery || timeboxQuery || []);
        },

        onTimeboxScopeChange: function() {
            this.callParent(arguments);
            this.down('rallycardboard').refresh({
                storeConfig: {
                    filters: this._getQueryFilters()
                }
            });
        },

        _publishContentUpdated: function() {
            this.fireEvent('contentupdated');
        },

        _publishContentUpdatedNoDashboardLayout: function() {
            this.fireEvent('contentupdated', {dashboardLayout: false});
        }
    });
})();
