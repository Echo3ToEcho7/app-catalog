(function() {
    var Ext = window.Ext4 || window.Ext;

    /**
     * @private
     * Should this be in rui?
     */
    Ext.define('Rally.apps.iterationplanningboard.IterationPlanningBoardBacklogColumn', {
        extend: 'Rally.ui.cardboard.Column',
        alias: 'widget.iterationplanningboardappbacklogcolumn',

        cls: 'column planning-column backlog',

        requires: [
            'Rally.ui.TextField'
        ],

        mixins: {
            maskable: 'Rally.ui.mask.Maskable'
        },

        config: {
            value: null,
            displayValue: 'Backlog'
        },

        drawHeader: function() {
            this.callParent(arguments);

            this.getColumnHeader().add(
                {
                    xtype: 'container',
                    layout: 'hbox',
                    cls: 'search',
                    items: [
                        {
                            xtype: 'rallytextfield',
                            cls: 'search-text',
                            flex: 1,
                            itemId: 'searchText',
                            enableKeyEvents: true,
                            emptyText: 'Search',
                            listeners: {
                                specialkey: this._onSearchTextSpecialKey,
                                scope: this
                            }
                        },
                        {
                            itemId: 'spacer',
                            xtype: 'component',
                            width: 6
                        },
                        {
                            xtype: 'component',
                            cls: 'search-button',
                            listeners: {
                                click: {
                                    element: 'el',
                                    fn: this._onSearchClicked,
                                    scope: this
                                }
                            }
                        }
                    ]
                }
            );
        },

        _onSearchClicked: function() {
            this._refreshColumn(this.down('#searchText').getValue());
        },

        _onSearchTextSpecialKey: function(searchTextField, e) {
            if (e.getKey() == e.ENTER) {
                this._refreshColumn(searchTextField.getValue());
            }
        },

        _refreshColumn: function(searchValue) {
            this.showMask();

            this._deactivatedCards = [];

            this.on('load', function() {
                this.fireEvent('filter', this);
                this.hideMask();
            }, this, {single: true});

            this.refresh({
                storeConfig: {
                    search: searchValue ? Ext.String.trim(searchValue) : ""
                }
            });
        },

        getStoreFilter: function(type) {
            var filters = [];
            Ext.Array.push(filters, this.callParent(arguments));
            if (type === 'HierarchicalRequirement') {
                if (this.context.getSubscription().StoryHierarchyEnabled) {
                    filters.push({
                        property: 'DirectChildrenCount',
                        value: 0
                    });
                }
            } else if (type === 'Defect') {
                filters.push({
                    property: 'Requirement',
                    value: null
                });
            }

            return filters;
        },

        isMatchingRecord: function(record) {
            var isMatching = this.callParent(arguments);
            if (record.self.elementName === 'HierarchicalRequirement') {
                isMatching = isMatching && (!record.hasField('DirectChildrenCount') || record.get('DirectChildrenCount') === 0);
            } else if (record.self.elementName === 'Defect') {
                isMatching = isMatching && (!record.hasField('Requirement') || !record.get('Requirement'));
            }
            return isMatching;
        }
    });
})();
