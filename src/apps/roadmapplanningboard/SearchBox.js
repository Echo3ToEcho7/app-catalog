(function () {
    var Ext;

    Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.roadmapplanningboard.SearchBox', {
        extend: 'Ext.container.Container',
        alias: 'widget.rallysearchbox',
        requires: ['Rally.ui.TextField'],
        config: {
            layout: 'hbox',
            cls: 'search',
            searchFilter: null,
            records: null,
            items: [
                {
                    xtype: 'rallytextfield',
                    cls: 'search-text',
                    flex: 1,
                    itemId: 'searchText',
                    enableKeyEvents: true,
                    emptyText: 'Search'
                },
                {
                    xtype: 'component',
                    cls: 'search-button',
                    itemId: 'searchButton',
                    listeners: {
                        click: {
                            element: 'el',
                            fn: this.executeQuery,
                            scope: this
                        }
                    }
                }
            ]
        },
        setQueryText: function (text) {
            return this.down("#searchText").setValue(text);
        },
        getSearchText: function () {
            return this.down("#searchText").getValue();
        },
        executeQuery: function () {
            return this.searchFilter(this.records, this.getSearchText());
        }
    });

}).call(this);
