(function() {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.board.BoardApp', {
        extend: 'Rally.app.App',
        layout: 'fit',

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
                        fetch: ['DisplayName', 'ElementName', 'TypePath', 'Attributes'],
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
                            combo.store.filterBy(function(record) {
                                return Ext.Array.some(record.get('Attributes'), function(attribute) {
                                    return attribute.ElementName === 'FormattedID';
                                });
                            });
                            //combo.store.sort('DisplayName');
                            this.fireEvent('typeselected', combo.getRecord().get('TypePath'), this.store.context);
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
                                var attr = record.get('fieldDefinition').attributeDefinition;
                                return attr && !attr.ReadOnly && attr.AllowedValues.length; 
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
                    alwaysExpanded: true,
                    maintainScrollPosition: true,
                    pickerAlign: 'tl-bl',
                    width: 300,
                    margin: '0 0 255 0',
                    pickerCfg: {
                        style: {
                            border: '1px solid #DDD',
                            'border-top': 'none'
                        },
                        height: 248,
                        shadow: false
                    },
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
            
            return (settingsQuery && timeboxQuery) ? settingsQuery.and(timeboxQuery) : (settingsQuery || timeboxQuery);
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
