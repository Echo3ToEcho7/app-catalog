(function() {
    var Ext = window.Ext4 || window.Ext;

    /**
     *
     */
    Ext.define('Rally.apps.kanban.Card', {
        requires: ['Rally.apps.kanban.CardAgeTemplate'],
        alias: 'widget.kanbancard',
        extend: 'Rally.ui.cardboard.Card',

        config: {
            cardAgeThreshold: 3,
            showCardAge: false,
            columnField: undefined
        },

        afterRender: function() {
            this.callParent(arguments);
            this._queryForAge();
        },

        reRender: function() {
            this.callParent(arguments);
            this._queryForAge();
        },

        _queryForAge: function() {
            if (!this._queryingForRevisionHistory && this.showCardAge && !this.getRecord().get('RevisionHistory')) {
                this._queryingForRevisionHistory = true;
                this.getRecord().self.load(this.getRecord().get('ObjectID'), {
                    fetch: ['RevisionHistory', 'Revisions', 'Description', 'CreationDate'],
                    callback: this._onRevisionHistoryLoaded,
                    scope: this
                });
            }
        },

        _onRevisionHistoryLoaded: function(record, operation) {
            if (operation.success) {
                delete this._queryingForRevisionHistory;
                this.getRecord().set('RevisionHistory', record.get('RevisionHistory'));
                this.addField({
                    name: 'RevisionHistory',
                    renderTpl: Ext.create('Rally.apps.kanban.CardAgeTemplate', {
                        field: this.getColumnField(),
                        threshold: this.cardAgeThreshold
                    }),
                    isStatus: true
                });
            }
        }
    });
})();
