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
            'Rally.ui.CheckboxField'
        ],

        getFields: function() {
            return [
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
                    fieldLabel: '',
                    margin: '5px 0 0 80px',
                    xtype: 'kanbancolumnsettingsfield',
                    handlesEvents: {
                        fieldselected: function(field) {
                            this.refreshWithNewField(field);
                        }
                    }
                },
                {
                    name: 'cardFields',
                    fieldLabel: 'Card Fields',
                    xtype: 'rallyfieldpicker',
                    cls: 'card-fields',
                    modelType: 'userstory',
                    alwaysExpanded: true,
                    maintainScrollPosition: true,
                    pickerAlign: 'tl-bl',
                    width: 300,
                    margin: '10px 0 255px 0',
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
                    },
                    getErrors: function() {
                        var errors = [];
                        if (!this.getValue().length) {
                            errors.push('At least one field must be selected.');
                        }
                        return errors;
                    },
                    listeners: {
                        selectionchange: function(picker) {
                            picker.validate();
                        }
                    },
                    labelAlign: 'left',
                    msgTarget: 'under',
                    invalidCls: 'rally-invalid',
                    handlesEvents: {
                        fieldselected: function(field) {
                            this.alignPicker();
                        }
                    }
                },
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
                    fieldLabel: 'Page Size'
                },
                {
                    type: 'query'
                }
            ];
        }
    });
})();