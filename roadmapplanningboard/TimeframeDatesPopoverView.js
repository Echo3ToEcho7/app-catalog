(function () {
    var Ext;

    Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.roadmapplanningboard.TimeframeDatesPopoverView', {
        extend: 'Rally.ui.popover.Popover',
        alias: 'widget.capacitypopover',
        requires: ['Rally.apps.roadmapplanningboard.TimeframeDatesPopoverController'],
        controller: 'Rally.apps.roadmapplanningboard.TimeframeDatesPopoverController',
        modal: false,
        placement: 'bottom',
        shouldHidePopoverOnBodyClick: true,
        shouldHidePopoverOnIframeClick: true,
        waitTimeForDateFieldValidation: 100,
        items: [
            {
                itemId: 'datesPopoverLayout',
                layout: {
                    type: 'table',
                    align: 'center',
                    columns: 3
                },
                items: [
                    {
                        xtype: 'component',
                        html: 'Date Range',
                        cls: 'popoverDateRangeText',
                        colspan: 3
                    },
                    {
                        xtype: 'datefield',
                        itemId: 'startDate',
                        cls: 'dateField',
                        format: 'm-d-Y',
                        msgTarget: 'startdate-validation-error',
                        triggerCls: 'en-calendar',
                        checkChangeBuffer: this.waitTimeForDateFieldValidation
                    },
                    {
                        xtype: 'component',
                        html: 'to',
                        cls: 'popoverToText'
                    },
                    {
                        xtype: 'datefield',
                        cls: 'dateField',
                        itemId: 'endDate',
                        format: 'm-d-Y',
                        msgTarget: 'date-validation-error',
                        triggerCls: 'en-calendar',
                        checkChangeBuffer: this.waitTimeForDateFieldValidation
                    },
                    {
                        xtype: 'component',
                        itemId: 'dateType',
                        tpl: "<div class='popoverDateText'>{dateType}</div>",
                        colspan: 3
                    }
                ]
            },
            {
                xtype: 'component',
                autoEl: 'div',
                id: 'date-validation-error',
                cls: ['x-form-error-msg', 'form-error-msg-field'],
                hidden: true
            },
            {
                xtype: 'component',
                autoEl: 'div',
                id: 'startdate-validation-error',
                cls: ['x-form-error-msg', 'form-error-msg-field'],
                hidden: true
            }
        ],
        _getDateFields: function () {
            return this.query('datefield');
        },
        _addDateSelectedTransitions: function (dateField) {
            dateField.addCls('transition-bg-color');
            dateField.addCls('dateSelected');
            return setTimeout((function () {
                return dateField.removeCls('dateSelected');
            }), 1);
        },
        _resetAndAddClsToDateField: function (dateField) {
            _.each(this._getDateFields(), function (component) {
                return component.removeCls('triggerSelected');
            });
            return dateField.addCls('triggerSelected');
        },
        _addPickerClasses: function (picker) {
            var datePickerMonthButton, datePickerNext, datePickerPrev;

            datePickerPrev = picker.getEl().down( '.' + Ext.baseCSSPrefix + 'datepicker-prev a');
            datePickerPrev.addCls('en-triangle-left');
            datePickerNext = picker.getEl().down('.' + Ext.baseCSSPrefix + 'datepicker-next a');
            datePickerNext.addCls('en-triangle-right');
            datePickerMonthButton = picker.getEl().down('.' + Ext.baseCSSPrefix + 'datepicker-month ' +  '.' + Ext.baseCSSPrefix + 'btn-icon');
            return datePickerMonthButton.addCls('en-triangle-down');
        }
    });

}).call(this);
