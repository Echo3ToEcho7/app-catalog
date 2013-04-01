(function() {
    var Ext = window.Ext4 || window.Ext;

    /**
     * @private
     */
    Ext.define('Rally.apps.iterationplanningboard.TimeboxCardBoard', {
        extend: 'Rally.ui.cardboard.CardBoard',
        alias: 'widget.iterationplanningboardapptimeboxcardboard',
        requires:['Rally.util.Array'],

        getFirstScrollableColumn: function(){
            return this.getColumns()[1];
        },

        getLastScrollableColumn: function(){
            return Rally.util.Array.last(this.getColumns());
        }

    });
})();