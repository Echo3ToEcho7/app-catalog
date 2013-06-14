(function() {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.teamboard.TeamBoardColumn', {
        extend: 'Rally.ui.cardboard.Column',
        alias: 'widget.rallyteamcolumn',
        requires: [
            'Rally.ui.cardboard.plugin.ColumnCardCounter'
        ],

        plugins: [
            {ptype: 'rallycolumncardcounter'}
        ],

        initComponent: function(){
            this.callParent(arguments);

            this.on('aftercarddroppedsave', this._onAfterCardDroppedSave, this);
        },

        assign: function(record){
            // Don't need to do anything to the User record
        },

        getStoreFilter: function(type) {
            return {
                property: this.attribute,
                operator: 'contains',
                value: this.getValue()
            };
        },

        isMatchingRecord: function(record){
            return true;
        },

        doesRecordAttributeMatch: function(record, attribute, value) {
            return true;
        },

        _onAfterCardDroppedSave: function(column, card, type, sourceColumn){
            card.getRecord().getCollection(this.attribute, {
                autoLoad: true,
                limit: Infinity,
                listeners: {
                    load: function(store){
                        store.add(column.getValue());
                        store.remove(sourceColumn.getValue());
                        store.sync();
                    },
                    scope: this
                }
            });
        }
    });

})();