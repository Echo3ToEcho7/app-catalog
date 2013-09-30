(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.roadmapplanningboard.ThemeHeader', {
        extend: 'Ext.container.Container',
        alias: 'widget.roadmapthemeheader',
        cls: 'theme_container',
        requires: [
            'Rally.ui.detail.FieldContainer'
        ],
        config: {
            record: undefined
        },
        initComponent: function () {
            this.callParent(arguments);
            this.on('afterrender', function () {
                this.add(this._createThemeContainer());
            });
        },
        getCardboardComponent: function () {
            if(this.container !== null && this.container.parent('.cardboard') !== null) {
                return Ext.getCmp(this.container.parent('.cardboard').id);
            }
        },
        _createThemeContainer: function () {
            var field, record;

            record = this.record;
            field = this.record.getField('theme');
            this.themeContainer = Ext.create('Rally.ui.detail.FieldContainer', {
                record: record,
                field: field,
                cls: 'field_container',
                clickToEdit: true,
                completeOnEnter: false,
                autoDestroy: true,
                listeners: {
                    fieldupdated: function (options) {
                        if (options.field.value !== record.get('theme')) {
                            record.set('theme', options.field.value);
                            record.save();
                        }
                        return this.refresh(record);
                    }
                }
            });
            this._customizeThemeContainer(record, field);
            this.themeContainer.draw();
            return this.themeContainer;
        },
        _customizeThemeContainer: function (record, field) {
            var themeHeader;

            this.themeContainer.removeAll(true);
            themeHeader = this;
            this.themeContainer._drawViewMode = function () {
                var themeClass, themeValue, viewComponentHeight;

                themeValue = record.data[field.name];
                if (themeValue) {
                    themeValue = Ext.String.trim(themeValue);
                }
                themeClass = ['fieldContainerView'];
                if (themeValue) {
                    themeClass.push('setTheme');
                } else {
                    themeValue = '+ Add theme';
                    themeClass.push('unsetTheme');
                }
                viewComponentHeight = 0;
                this.add({
                    xtype: 'component',
                    cls: themeClass,
                    itemId: 'field-view',
                    html: Rally.ui.detail.view.DetailRendererFactory.getRenderTemplate(this.getField(), themeHeader.getRecord()).apply({
                        theme: themeValue
                    }),
                    listeners: {
                        resize: function () {
                            var resizeHeight;

                            resizeHeight = this.el !== null && this.el.getHeight();
                            if (resizeHeight !== viewComponentHeight) {
                                viewComponentHeight = resizeHeight;
                                if (themeHeader.getCardboardComponent()) {
                                    themeHeader.getCardboardComponent().fireEvent('headersizechanged');
                                }
                            }
                        },
                        boxready: function () {
                            viewComponentHeight = this.el !== null && this.el.getHeight();
                            if (themeHeader.getCardboardComponent()) {
                                themeHeader.getCardboardComponent().fireEvent('headersizechanged');
                            }
                        }
                    }
                });
            };
            this.themeContainer._drawEditMode = function () {
                this.editor = Ext.create('Ext.form.field.TextArea', {
                    name: field.name,
                    value: record.get(field.name),
                    emptyText: '+ Add theme',
                    width: '100%',
                    grow: true
                });
                this.editor.on('autosize', function () {
                    if (themeHeader.getCardboardComponent()) {
                        themeHeader.getCardboardComponent().fireEvent('headersizechanged');
                    }
                });
                this.add(this.editor);
                if (this.singleEdit) {
                    if (this.editor.getEl() && (this.cancelOnEsc || this.completeOnEnter)) {
                        this.editor.getEl().on('keydown', function (event) {
                            if (event.getKey() === Ext.EventObject.ENTER && this.completeOnEnter) {
                                return this._fireFieldUpdated();
                            } else if (event.getKey() === Ext.EventObject.ESC && this.cancelOnEsc) {
                                return this.refresh(this.record);
                            }
                        }, this);
                    }
                    this.editor.on('select', this._fireFieldUpdated, this);
                    this.editor.on('blur', this._fireFieldUpdated, this);
                    return this.editor.focus();
                }
            };
        }
    });

}).call(this);
