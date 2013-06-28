(function () {
    var Ext = window.Ext4 || window.Ext;
    Ext.define('Rally.apps.roadmapplanningboard.TimeframeDatesPopoverController', {
        extend: 'Deft.mvc.ViewController',
        config: {
            model: null
        },
        control: {
            startDate: true,
            endDate: true,
            datesPopoverLayout: true,
            dateType: true
        },
        clientMetrics: {
            userActionProperty: '_datesUpdatedAction',
            method: '_saveModel'
        },
        init: function () {
            this.callParent(arguments);
            this._initDateField({
                dateField: this.getStartDate(),
                fieldName: 'start',
                displayText: 'Start Date'
            });
            return this._initDateField({
                dateField: this.getEndDate(),
                fieldName: 'end',
                displayText: 'End Date',
                pickerOptions: {
                    minDate: this.getStartDate().getValue()
                }
            });
        },
        destroy: function () {
            this._validateAndSave();
            return this.callParent(arguments);
        },
        _initDateField: function (options) {
            var _this = this;

            options.dateField.setValue(this.model.get(options.fieldName));
            options.dateField.validator = function () {
                return _this._dateRangeValidator();
            };
            options.dateField.on('focus', function () {
                if (_this.picker) {
                    return _this._createPicker(options.dateField, options.displayText, options.pickerOptions);
                }
            });

            options.dateField.onTriggerClick = function () {
                return _this._createPicker(options.dateField, options.displayText, options.pickerOptions);
            };
        },
        _createPicker: function (dateField, displayText, opts) {
            var pickerOpts,
                _this = this;

            if (opts === null) {
                opts = {};
            }
            if (this.picker) {
                this.picker.destroy();
            }
            pickerOpts = Ext.applyIf({
                xtype: 'datepicker',
                itemId: 'datePicker',
                floating: false,
                hidden: false,
                colspan: 3,
                listeners: {
                    afterrender: this._onAfterPickerRender,
                    scope: this
                },
                handler: function (picker, date) {
                    dateField.setValue(date);
                    return _this.getView()._addDateSelectedTransitions(dateField);
                }
            }, opts);
            this.picker = this.getDatesPopoverLayout().add(pickerOpts);
            this.picker.setValue(dateField.getValue());
            this.getView()._resetAndAddClsToDateField(dateField);
            return this.getDateType().update({
                dateType: displayText
            });
        },
        _validateAndSave: function () {
            if (this.getStartDate().hasActiveError() || this.getEndDate().hasActiveError()) {
                return;
            }
            return this._saveDates();
        },
        _dateRangeValidator: function () {
            if (_.any(this.getView()._getDateFields(), this._isNotADate, this)) {
                return true;
            }
            if (this.getStartDate().getValue().getTime() > this.getEndDate().getValue().getTime()) {
                return 'Start date is after End date';
            }
            this.getStartDate().clearInvalid();
            this.getEndDate().clearInvalid();
            return true;
        },
        _isNotADate: function (dateField) {
            return !Ext.isDate(dateField.getValue());
        },
        _saveDates: function () {
            this.model.set('start', this.getStartDate().getValue());
            this.model.set('end', this.getEndDate().getValue());
            if (this.model.dirty) {
                return this._saveModel();
            }
        },
        _saveModel: function () {
            return this.model.save();
        },
        _datesUpdatedAction: function () {
            return "Timeframe dates changed -  start: [" + (this._formattedDate(this.getStartDate())) + "], end: [" + (this._formattedDate(this.getEndDate())) + "]";
        },
        _formattedDate: function (dateField) {
            return Ext.Date.format(dateField.getValue(), dateField.format);
        },
        _onAfterPickerRender: function (picker) {
            return this.getView()._addPickerClasses(picker);
        },
        _overrideActiveError: function (msg, dateField) {
            if (this.getStartDate().getActiveError() === msg || this.getEndDate().getActiveError() === msg) {
                return true;
            }
            return msg;
        }
    });

}).call(this);
