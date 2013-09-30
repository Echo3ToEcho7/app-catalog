(function() {
    var Ext = window.Ext4 || window.Ext;

    /**
     * @private
     * Allows the Roadmap Planning Board CardBoard to be scrolled forwards and backwards
     */
    Ext.define('Rally.apps.roadmapplanningboard.plugin.RoadmapScrollable', {
        alias: 'plugin.rallytimeframescrollablecardboard',
        extend: 'Rally.ui.cardboard.plugin.Scrollable',

        /**
         * @cfg {Number} The number of timeframe columns
         */
        timeframeColumnCount: 4,

        init: function (cmp) {
            var pluginScope = this;
            this.originBuildColumnsFromStore = cmp.buildColumnsFromStore;
            cmp.buildColumnsFromStore = function (store) {
                pluginScope.buildColumnsFromStore(store);
            };
            this.callParent(arguments);
        },

        /**
         *
         * @param store
         */
        buildColumnsFromStore: function (store) {
            var columns = this.originBuildColumnsFromStore.call(this.cmp, store);

            this.backlogColumn = columns[0];
            this.scrollableColumns = columns.slice(1);

            this.cmp.columns = [this.backlogColumn].concat(this._getVisibleColumns(this._getPresentColumns(this.scrollableColumns)));
            return this.cmp.columns;
        },

        _getPresentColumns: function (columns) {
            var now = new Date();
            var format = 'Y-m-d';

            this.presentColumns = this.presentColumns || _.filter(columns, function (column) {
                return Ext.Date.format(column.timeframeRecord.get('end'), format) >= Ext.Date.format(now, format);
            }, this);

            return this.presentColumns;
        },

        _getPastColumns: function (columns) {
            this.presentColumns = this.presentColumns || this._getPresentColumns(columns);
            this.pastColumns = this.pastColumns || _.difference(columns, this.presentColumns);

            return this.pastColumns;
        },

        _getVisibleColumns: function (presentColumns) {
            return _.first(presentColumns, this.timeframeColumnCount);
        },

        _isBackwardsButtonHidden: function () {
            return this.scrollableColumns[0].timeframeRecord === this.getFirstVisibleScrollableColumn().timeframeRecord;
        },

        _isForwardsButtonHidden: function () {
            return _.last(this.scrollableColumns).timeframeRecord === this.getLastVisibleScrollableColumn().timeframeRecord;
        },

        _scroll: function (forwards) {
            var insertNextToColumn = this._getInsertNextToColumn(forwards);
            var scrollableColumnRecords = _.pluck(this.scrollableColumns, 'timeframeRecord');
            var newlyVisibleColumn = this.scrollableColumns[_.indexOf(scrollableColumnRecords, insertNextToColumn.timeframeRecord) + (forwards ? 1 : -1)];

            var indexOfNewColumn = _.indexOf(this.cmp.getColumns(), insertNextToColumn);
            var columnEls = this.cmp.createColumnElements(forwards ? 'after' : 'before', insertNextToColumn);
            this.cmp.destroyColumn(this._getColumnToRemove(forwards));

            var column = this.cmp.addColumn(newlyVisibleColumn, indexOfNewColumn);
            column.on('ready', this._onNewlyAddedColumnReady, this, {single: true});

            this.cmp.renderColumn(column, columnEls);

            this.cmp.drawThemeToggle();

            this.cmp.fireEvent('scroll', this.cmp);

            this._afterScroll(forwards);
        },

        _onNewlyAddedColumnReady: function () {
            this.cmp.applyLocalFilters();
        },

        _sizeButtonToColumnHeader: function(button, column){
            var columnHeaderHeight = column.getHeaderTitle().getHeight();

            button.getEl().setHeight(columnHeaderHeight);
        },

        getFirstVisibleScrollableColumn: function () {
            return this.getScrollableColumns()[0];
        },

        getLastVisibleScrollableColumn: function () {
            return _.last(this.getScrollableColumns());
        },

        getScrollableColumns: function () {
            return this.cmp.getColumns().slice(1);
        }
    });
})();