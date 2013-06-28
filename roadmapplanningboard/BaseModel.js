(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.roadmapplanningboard.BaseModel', {
        extend: 'Ext.data.Model',
        requires: ['Ext.data.Model'],
        /*
         # Returns true if the model has a value for the specified field that is
         # neither null, undefined nor empty string.
         */

        hasValue: function (field) {
            return this._isNotEmpty(field) && this._isNotEmpty(this.get(field.name));
        },
        isFieldVisible: function (fieldName) {
            return true;
        },
        isCustomField: function (fieldName) {
            return false;
        },
        getField: function (fieldName) {
            return Ext.merge({
                readOnly: false,
                required: true,
                updatable: true
            }, this.fields.get(fieldName));
        },
        inheritableStatics: {
            getField: function (fieldName) {
                var fields;

                if (Ext.isString(fieldName) && fieldName.indexOf(":summary") !== -1) {
                    return this.getField(fieldName.split(":summary")[0]);
                }
                fields = this.getFields();
                return _.find(fields, {
                    name: fieldName
                }) || _.find(fields, {
                    name: "c_" + fieldName
                });
            },
            hasField: function (fieldName) {
                return Ext.isObject(this.getField(fieldName));
            }
        },

        _isNotEmpty: function (val) {
            return !_.contains([null, undefined, ''], val);
        }
    });

}).call(this);
