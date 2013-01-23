(function() {
    var Ext = window.Ext4 || window.Ext;

    /**
     *
     */
    Ext.define('Rally.apps.kanban.Card', {
        requires: [],
        alias: 'widget.kanbancard',
        extend: 'Rally.ui.cardboard.Card',

        config: {
            cardAgeThreshold: 3,
            showCardAge: false,
            columnField: undefined
        },

        afterRender: function() {
            this.callParent(arguments);
            if (this.showCardAge && !this.getRecord().get('RevisionHistory')) {
                var lastUpdated = this.getRecord().get('LastUpdateDate');
                var thresholdDate = Rally.util.DateTime.add(new Date(), 'day', -this.cardAgeThreshold);
                if (lastUpdated && lastUpdated < thresholdDate) {
                    this.getRecord().self.load(this.getRecord().get('ObjectID'), {
                        fetch: ['RevisionHistory', 'Revisions', 'Description', 'CreationDate'],
                        callback: this._onRevisionHistoryLoaded,
                        scope: this
                    });
                }
            }
        },

        _onRevisionHistoryLoaded: function(record, operation) {
            if (operation.success) {
                this.getRecord().set('RevisionHistory', record.get('RevisionHistory'));
                this.addField({
                    name: 'RevisionHistory',
                    renderTpl: this._getAgeRenderTpl(),
                    isStatus: true
                });
                this.on('fieldclick', this._onFieldClick, this);
            }
        },

        _onFieldClick: function(fieldName) {
            if (fieldName === 'RevisionHistory') {
                Rally.nav.Manager.goToDetailPage(this.getRecord(), 'revisions');
            }
        },

        _getAgeRenderTpl: function() {
            var fieldName = this.getColumnField().displayName.toUpperCase();

            return Ext.create('Ext.XTemplate',
                '<tpl if="this.hasRevisions(values)">',
                "<div class='age'>{[this.getCardAge(values)]} days</div>",
                '</tpl>',
                {
                    hasRevisions: function(recordData) {
                        return recordData.RevisionHistory && recordData.RevisionHistory.Revisions;
                    },

                    getCardAge: function(recordData) {
                        var revisions = recordData.RevisionHistory.Revisions;
                        var lastStateChangeDate = "";

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
                });
        }
    });
})();
