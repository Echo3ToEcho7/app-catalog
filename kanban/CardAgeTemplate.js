(function() {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.kanban.CardAgeTemplate', {
        extend: 'Ext.XTemplate',

        /**
         * @cfg {Number} threshold The minimum age to be displayed
         */
        threshold: 3,

        /**
         * @cfg {Ext.data.Field} field The field used to signal age
         */
        field: undefined,

        constructor: function(config) {
            this.callParent([
                '<tpl exec="this.cardAge = this.getAge(values)"></tpl>',
                '<tpl if="this.cardAge &gt; this.threshold">',
                '<div class="age">{[this.cardAge]} days</div>',
                '</tpl>',
                Ext.apply(config, {

                    getAge: function(recordData) {
                        var revisions = (recordData && recordData.RevisionHistory && recordData.RevisionHistory.Revisions) || [];
                        var lastStateChangeDate = Rally.util.DateTime.toIsoString(new Date());
                        var fieldName = this.field.displayName.toUpperCase();

                        Ext.Array.each(revisions, function(revision) {
                            if (revision.Description.indexOf(fieldName + ' changed from') !== -1 ||
                                revision.Description.indexOf(fieldName + ' added') !== -1 ||
                                revision.Description.indexOf('Original revision') !== -1) {
                                lastStateChangeDate = revision.CreationDate;
                            }
                        }, this, true);

                        var lastUpdateDate = Rally.util.DateTime.fromIsoString(lastStateChangeDate);
                        return Rally.util.DateTime.getDifference(new Date(), lastUpdateDate, 'day');
                    }
                })
            ]);
        }
    });
})();