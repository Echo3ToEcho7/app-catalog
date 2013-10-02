(function () {
    var Ext = window.Ext4 || window.Ext;

    /**
     * A special cardboard card for use by the PortfolioKanbanApp
     */
    Ext.define('Rally.apps.portfoliokanban.PortfolioKanbanCard', {
        extend:'Rally.ui.cardboard.Card',
        alias:'widget.rallyportfoliokanbancard',

        inheritableStatics:{

            getFetchFields:function () {
                return [
                    'Owner',
                    'FormattedID',
                    'Name',
                    'StateChangedDate',
                    'Blocked',
                    'Ready',
                    'DisplayColor'
                ];
            }

        },

        constructor: function(config) {
            config.fields = Ext.Array.union(config.fields || [], ['StateChangedDate']);
            this.callParent(arguments);
        }
    });
})();