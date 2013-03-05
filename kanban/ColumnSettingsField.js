(function() {
    var Ext = window.Ext4 || window.Ext;

    /**
     * Allows configuration of wip and schedule state mapping for kanban columns
     *
     *      @example
     *      Ext.create('Ext.Container', {
     *          items: [{
     *              xtype: 'kanbancolumnsettingsfield',
     *              value: {}
     *          }],
     *          renderTo: Ext.getBody().dom
     *      });
     *
     */
    Ext.define('Rally.apps.kanban.ColumnSettingsField', {
        extend: 'Ext.form.field.Base',
        alias: 'widget.kanbancolumnsettingsfield',

        fieldSubTpl: '<div id="{id}" class="settings-grid"></div>',

        width: 600,
        cls: 'column-settings',
        invalidCls: 'rally-invalid',
        msgTarget: 'under',
        labelAlign: 'left',

        config: {
            /**
             * @cfg {Object}
             *
             * The column settings value for this field
             */
            value: undefined
        },

        onRender: function() {
            this.callParent(arguments);

            this._store = Ext.create('Ext.data.Store', {
                fields: ['column', 'shown', 'wip', 'scheduleStateMapping'],
                data: []
            });

            this._grid = Ext.create('Rally.ui.grid.Grid', {
                autoWidth: true,
                renderTo: this.inputEl,
                columnCfgs: [
                    {
                        text: 'Column',
                        dataIndex: 'column',
                        emptyCellText: 'None',
                        width: 200
                    },
                    {
                        text: 'Show',
                        dataIndex: 'shown',
                        width: 100,
                        renderer: function(value) {
                            return value === true ? 'Yes' : 'No';
                        },
                        editor: {
                            xtype: 'rallycombobox',
                            displayField: 'name',
                            valueField: 'value',
                            editable: false,
                            storeType: 'Ext.data.Store',
                            storeConfig: {
                                remoteFilter: false,
                                fields: ['name', 'value'],
                                data: [
                                    {'name': 'Yes', 'value': true},
                                    {'name': 'No', 'value': false}
                                ]
                            }
                        }
                    },
                    {
                        text: 'WIP',
                        dataIndex: 'wip',
                        width: 100,
                        emptyCellText: '&#8734;',
                        editor: {
                            xtype: 'rallytextfield',
                            maskRe: /[0-9]/,
                            validator: function(value) {
                                return (value === '' || (value > 0 && value <= 9999)) || 'WIP must be > 0 and < 9999.';
                            },
                            rawToValue: function(value) {
                                return value === '' ? value : parseInt(value, 10);
                            }
                        }
                    },
                    {
                        text: 'Schedule State Mapping',
                        dataIndex: 'scheduleStateMapping',
                        emptyCellText: '--No Mapping--',
                        flex: 1,
                        editor: {
                            xtype: 'rallyfieldvaluecombobox',
                            model: 'HierarchicalRequirement',
                            field: 'ScheduleState',
                            listeners: {
                                ready: function(combo) {
                                    var noMapping = {};
                                    noMapping[combo.displayField] = '--No Mapping--';
                                    noMapping[combo.valueField] = '';

                                    combo.store.insert(0, [noMapping]);
                                }
                            }
                        }
                    }
                ],
                showPagingToolbar: false,
                store: this._store,
                editingConfig: {
                    publishMessages: false
                }
            });
        },

        /**
         * When a form asks for the data this field represents,
         * give it the name of this field and the ref of the selected project (or an empty string).
         * Used when persisting the value of this field.
         * @return {Object}
         */
        getSubmitData: function() {
            var data = {};
            data[this.name] = Ext.JSON.encode(this._buildSettingValue());
            return data;
        },

        _buildSettingValue: function() {
            var columns = {};
            this._store.each(function(record) {
                if (record.get('shown')) {
                    columns[record.get('column')] = {
                        wip: record.get('wip'),
                        scheduleStateMapping: record.get('scheduleStateMapping')
                    };
                }
            }, this);
            return columns;
        },

        getErrors: function() {
            var errors = [];
            if (!Ext.Object.getSize(this._buildSettingValue())) {
                errors.push('At least one column must be shown.');
            }
            return errors;
        },

        setValue: function(value) {
            this.callParent(arguments);
            this._value = value;
        },

        _getColumnValue: function(columnName) {
            var value = this._value;
            return value && Ext.JSON.decode(value)[columnName];
        },

        refreshWithNewField: function(field) {
            var data = [];
            Ext.Array.each(field.allowedValues, function(allowedValue) {

                var columnName = allowedValue.StringValue;
                var pref = this._store.getCount() === 0 ? this._getColumnValue(columnName) : null;

                var column = {
                    column: columnName,
                    shown: false,
                    wip: '',
                    scheduleStateMapping: ''
                };

                if (pref) {
                    Ext.apply(column, {
                        shown: true,
                        wip: pref.wip,
                        scheduleStateMapping: pref.scheduleStateMapping
                    });
                }

                data.push(column);

            }, this);

            this._store.loadRawData(data);
        }
    });
})();


