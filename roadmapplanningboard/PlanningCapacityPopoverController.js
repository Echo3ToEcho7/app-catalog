(function () {
    var Ext = window.Ext4 || window.Ext;
    Ext.define('Rally.apps.roadmapplanningboard.PlanningCapacityPopoverController', {
        extend: 'Deft.mvc.ViewController',
        config: {
            model: null
        },
        control: {
            view: {
                blur: function () {
                    return this.persistIfChangedAndValid();
                },
                validitychange: function () {
                    return this.onValidityChange();
                }
            }
        },
        clientMetrics: {
            descriptionProperty: 'getClickAction',
            method: 'onBeforeDestroy'
        },
        init: function () {
            var highCapacity, lowCapacity;

            this.callParent(arguments);
            if (!this.model) {
                throw "Model is required";
            }
            lowCapacity = this.model.get('lowCapacity') || 0;
            this.getView().getLowCapacityField().setValue(lowCapacity).resetOriginalValue();
            highCapacity = this.model.get('highCapacity') || 0;
            return this.getView().getHighCapacityField().setValue(highCapacity).resetOriginalValue();
        },
        validateRange: function () {
            var highValue, lowValue;

            lowValue = this.getView().getLowCapacityField().getValue();
            highValue = this.getView().getHighCapacityField().getValue();
            if ((lowValue === null) || (highValue === null)) {
                return true;
            }
            if (lowValue > highValue) {
                return "Low estimate should not exceed the high estimate";
            } else {
                return true;
            }
        },
        persistIfChangedAndValid: function () {
            var highField, highValue, lowField, lowValue;

            lowField = this.getView().getLowCapacityField();
            highField = this.getView().getHighCapacityField();
            if (lowField.isDirty() || highField.isDirty()) {
                lowValue = lowField.getValue() || 0;
                highValue = highField.getValue() || 0;
                if ((lowValue !== null) && (highValue !== null) && lowField.validate() && highField.validate()) {
                    lowField.resetOriginalValue();
                    highField.resetOriginalValue();
                    this.persistIfStoreAvailable(lowValue, highValue);
                }
            }
            return true;
        },
        persistIfStoreAvailable: function (lowValue, highValue) {
            this.model.beginEdit();
            this.model.set('lowCapacity', lowValue);
            this.model.set('highCapacity', highValue);
            this.model.endEdit();
            return this.model.store && this.model.store.sync();
        },
        onValidityChange: function () {
            var highField, lowField;

            lowField = this.getView().getLowCapacityField();
            highField = this.getView().getHighCapacityField();
            lowField.isValid();
            highField.isValid();
            return true;
        }
    });

}).call(this);
