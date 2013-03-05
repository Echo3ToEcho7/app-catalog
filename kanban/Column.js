(function() {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.kanban.Column', {
        extend: 'Rally.ui.cardboard.KanbanColumn',
        alias: 'widget.kanbancolumn',

        getStoreFilter: function(model) {
            var filters = [];
            Ext.Array.push(filters, this.callParent(arguments));
            if (model.elementName === 'HierarchicalRequirement') {
                if (this.context.getSubscription().StoryHierarchyEnabled) {
                    filters.push({
                        property: 'DirectChildrenCount',
                        value: 0
                    });
                }
            }

            return filters;
        },

        getStores: function(models) {
            var stores = this.callParent(arguments);
            return Ext.Array.filter(stores, function(store) {
                var validFilters = store.filters.filterBy(function(filter) {
                    return Ext.isDefined(store.model.getField(filter.property));
                });
                return validFilters.length === store.filters.length;
            });
        }
    });
})();
