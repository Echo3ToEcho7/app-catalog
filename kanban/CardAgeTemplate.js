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
                '<tpl if="this.isOld(values)">',
                '<div class="age">{[this.getAge(values)]} days</div>',
                '</tpl>',
                Ext.apply(config, {
                    isOld: function(recordData) {
                        return recordData.RevisionHistory &&
                            recordData.RevisionHistory.Revisions &&
                            this.getAge(recordData) >= this.threshold;
                    },

                    getAge: function(recordData) {
                        var revisions = recordData.RevisionHistory.Revisions;
                        var lastStateChangeDate = '';
                        var fieldName = this.field.displayName.toUpperCase();

                        Ext.Array.each(revisions.reverse(), function(revision) {
                            if (revision.Description.indexOf(fieldName + ' changed from') !== -1 ||
                                revision.Description.indexOf(fieldName + ' added') !== -1 ||
                                revision.Description.indexOf('Original revision') !== -1) {
                                lastStateChangeDate = revision.CreationDate;
                            }
                        });

                        var lastUpdateDate = Rally.util.DateTime.fromIsoString(lastStateChangeDate);
                        return Rally.util.DateTime.getDifference(new Date(), lastUpdateDate, 'day');
                    }
                })
            ]);
        }
    });
})();