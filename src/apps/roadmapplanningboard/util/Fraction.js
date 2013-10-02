(function () {
    var Ext = window.Ext4 || window.Ext;
    Ext.define('Rally.apps.roadmapplanningboard.util.Fraction', {
        config: {
            denominator: null,
            numeratorItems: null,
            numeratorItemValueFunction: function (item) {
                return item;
            }
        },
        _numerator: null,
        applyDenominatorItems: function (denominatorItems) {
            this._numerator = null;
            return denominatorItems;
        },
        applyDenominatorItemValueFunction: function (denominatorItemValueFunction) {
            this._numerator = null;
            return denominatorItemValueFunction;
        },
        constructor: function (config) {
            return this.initConfig(config);
        },
        getPercent: function () {
            if (this.denominator <= 0) {
                return 0;
            }
            return this.getNumerator() / this.denominator;
        },
        getNumerator: function () {
            return this._numerator || (this._numerator = Ext.Array.sum(Ext.Array.map(this.numeratorItems, this.numeratorItemValueFunction)));
        },
        getFormattedPercent: function () {
            return "" + (Ext.util.Format.number(this.getPercent() * 100, '0')) + "%";
        },
        _sumNumerator: function () {
            return Ext.Array.sum(Ext.Array.map(this.numeratorItems, this.numeratorItemValueFunction));
        }
    });

}).call(this);
