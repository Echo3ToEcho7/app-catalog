(function() {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.kanban.Column', {
        extend: 'Rally.ui.cardboard.Column',
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

            var validStores = _.filter(stores, function(store) {
                var validFilters = store.filters.filterBy(function(filter) {
                    return this._validateStoreFilter(store, filter);
                }, this);
                return validFilters.length === store.filters.length;
            }, this);

            if (!validStores.length) {
                this.fireEvent('invalidfilter', this);
            }

            return validStores;
        },

        _validateStoreFilter: function(store, filter) {
            if(Ext.isString(filter.property)) {
                return filter.property === 'TypeDefOid' || filter.property.split('.').length > 1 || store.model.hasField(filter.property);
            } else {
                return this._validateStoreFilter(store, filter.property) && this._validateStoreFilter(store, filter.value);
            }
        }
    });
})();
