(function() {
    var Ext = window.Ext4 || window.Ext;

    /**
     *
     */
    Ext.define('Rally.apps.kanban.CardAgeSettingsField', {
        extend: 'Ext.form.FieldContainer',
        requires: [
            'Rally.ui.CheckboxField',
            'Rally.ui.TextField',
            'Rally.ui.plugin.FieldValidationUi'
        ],
        alias: 'widget.kanbancardagesettingsfield',

        mixins: {
            field: 'Ext.form.field.Field'
        },

        layout: 'hbox',

        cls: 'card-age-settings',

        config: {
            /**
             * @cfg {Object}
             *
             * The column settings value for this field
             */
            value: undefined
        },

        initComponent: function() {
            this.callParent(arguments);

            this.mixins.field.initField.call(this);

            this.add([
                {
                    xtype: 'rallycheckboxfield',
                    name: 'showCardAge',
                    boxLabel: 'Show age for card after',
                    submitValue: false,
                    value: this.getValue().showCardAge
                },
                {
                    xtype: 'rallytextfield',
                    plugins: ['rallyfieldvalidationui'],
                    name: 'cardAgeThreshold',
                    width: 20,
                    margin: '0 5px',
                    maskRe: /[0-9]/,
                    submitValue: false,
                    value: this.getValue().cardAgeThreshold,
                    getErrors: function() {
                        this.allowBlank = !this.ownerCt.down('rallycheckboxfield').getValue();
                        return Rally.ui.TextField.prototype.getErrors.apply(this, arguments);
                    }
                },
                {
                    xtype: 'component',
                    autoEl: 'label',
                    margin: '3px 0 0 0',
                    html: 'day(s) in column'
                }
            ]);
        },

        /**
         * When a form asks for the data this field represents,
         * give it the name of this field and the ref of the selected project (or an empty string).
         * Used when persisting the value of this field.
         * @return {Object}
         */
        getSubmitData: function() {
            var data = {};
            var showCardAgeField = this.down('rallycheckboxfield');
            data[showCardAgeField.name] = showCardAgeField.getValue();
            if (showCardAgeField.getValue()) {
                var cardAgeThreshold = this.down('rallytextfield');
                data[cardAgeThreshold.name] = cardAgeThreshold.getValue();
            }
            return data;
        }
    });
})();


