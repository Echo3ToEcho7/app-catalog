(function() {
    var Ext = window.Ext4 || window.Ext;

    /**
     *
     */
    Ext.define('Rally.apps.kanban.Settings', {
        singleton: true,
        requires: [
            'Rally.apps.kanban.ColumnSettingsField',
            'Rally.apps.kanban.CardAgeSettingsField',
            'Rally.ui.combobox.FieldComboBox',
            'Rally.ui.picker.FieldPicker',
            'Rally.ui.CheckboxField',
            'Rally.ui.plugin.FieldValidationUi'
        ],

        getFields: function(config) {
            var items = [
                {
                    name: 'groupByField',
                    xtype: 'rallyfieldcombobox',
                    model: 'UserStory',
                    margin: '10px 0 0 0',
                    fieldLabel: 'Group By',
                    listeners: {
                        select: function(combo) {
                            this.fireEvent('fieldselected', combo.getRecord().get('fieldDefinition'));
                        },
                        ready: function(combo) {
                            combo.store.filterBy(function(record) {
                                var attr = record.get('fieldDefinition').attributeDefinition;
                                return attr && !attr.ReadOnly && attr.Constrained && attr.AttributeType !== 'OBJECT' && attr.AttributeType !== 'COLLECTION';
                            });
                            if (combo.getRecord()) {
                                this.fireEvent('fieldselected', combo.getRecord().get('fieldDefinition'));
                            }
                        }
                    },
                    bubbleEvents: ['fieldselected', 'fieldready']
                },
                {
                    name: 'columns',
                    readyEvent: 'ready',
                    fieldLabel: '',
                    margin: '5px 0 0 80px',
                    xtype: 'kanbancolumnsettingsfield',
                    shouldShowColumnLevelFieldPicker: config.shouldShowColumnLevelFieldPicker,
                    defaultCardFields: config.defaultCardFields,
                    handlesEvents: {
                        fieldselected: function(field) {
                            this.refreshWithNewField(field);
                        }
                    },
                    listeners: {
                        ready: function() {
                            this.fireEvent('columnsettingsready');
                        }
                    },
                    bubbleEvents: 'columnsettingsready'
                }
            ];

            if (!config.shouldShowColumnLevelFieldPicker) {
                items.push({
                    name: 'cardFields',
                    fieldLabel: 'Card Fields',
                    xtype: 'rallyfieldpicker',
                    modelTypes: ['userstory', 'defect'],
                    fieldBlackList: ['DefectStatus', 'TaskStatus'],
                    alwaysSelectedValues: ['FormattedID', 'Name', 'Owner'],
                    listeners: {
                        selectionchange: function(picker) {
                            picker.validate();
                        }
                    },
                    handlesEvents: {
                        columnsettingsready: function() {
                            if (this.picker) {
                                this.alignPicker();
                            }
                        }
                    }
                });
            }

            items.push(
                {
                    name: 'hideReleasedCards',
                    xtype: 'rallycheckboxfield',
                    fieldLabel: 'Options',
                    margin: '10 0 0 0',
                    boxLabel: 'Hide cards in last visible column if assigned to a release'
                },
                {
                    xtype: 'kanbancardagesettingsfield',
                    fieldLabel: '',
                    margin: '5 0 10 80',
                    mapsToMultiplePreferenceKeys: ['showCardAge', 'cardAgeThreshold']
                },
                {
                    name: 'pageSize',
                    xtype: 'rallynumberfield',
                    plugins: ['rallyfieldvalidationui'],
                    fieldLabel: 'Page Size',
                    allowDecimals: false,
                    minValue: 1,
                    maxValue: 100,
                    allowBlank: false,
                    validateOnChange: false,
                    validateOnBlur: false
                },
                {
                    type: 'query'
                }
            );

            return items;
        }
    });
})();