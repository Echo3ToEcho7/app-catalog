(function() {
    var Ext = window.Ext4 || window.Ext;

    /**
     * @private
     *
     * If we end up having both an IterationPlanningBoardApp and a RelasePlanningBoardApp, then this should probably be in rui.
     *
     * A GridBoard that displays timebox information.
     */
    Ext.define('Rally.apps.iterationplanningboard.TimeboxGridBoard', {
        extend: 'Rally.ui.gridboard.GridBoard',
        alias: 'widget.iterationplanningboardapptimeboxgridboard',
        requires: [
            'Rally.util.Ui',
            'Rally.data.ModelFactory',
            'Rally.ui.gridboard.TimeboxBlankSlate',
            'Rally.apps.iterationplanningboard.IterationPlanningBoardBacklogColumn',
            'Rally.apps.iterationplanningboard.IterationPlanningBoardColumn'
        ],
        mixins: ['Rally.Messageable'],

        initComponent: function() {
            this.on('toggle', function(toggleState, gridOrBoard) {
                if (toggleState === 'board' && !this._hasTimeboxes()) {
                    this.mon(gridOrBoard, 'aftercolumnrender', this._addBoardBlankSlate, this);
                }
            }, this);

            this.subscribe(Rally.Message.objectCreate, this._onObjectChange, this);
            this.subscribe(Rally.Message.objectUpdate, this._onObjectChange, this);
            this.subscribe(Rally.Message.objectDestroy, this._onObjectChange, this);

            this.callParent(arguments);
        },
        
        _addGridOrBoard: function() {
            if (!this.timeboxes) {
                this.timeboxType = 'Iteration';
                Rally.data.ModelFactory.getModel({
                    type: this.timeboxType,
                    context: this.getContext().getDataContext(),
                    success: this._findTimeboxes,
                    scope: this
                });
                this.setLoading(true);
            } else {
                this.callParent(arguments);
            }
        },

        _getBoardConfig: function() {
            return Ext.merge(this.callParent(arguments), {
                attribute: this.timeboxType,
                columns: this._getColumnConfigs(),
                columnConfig: {
                    additionalFetchFields: ['PortfolioItem']
                },
                cardConfig: {
                    editable: true,
                    showHeaderMenu: true,
                    enableDescriptionHover: this.getContext().isFeatureEnabled('SHOW_DESCRIPTION_ON_CARDS'),
                    fields: ['Parent', 'Tasks', 'Defects', 'Discussion']
                }
            });
        },

        _getColumnConfigs: function() {
            var fieldsNeededToValidateCardBelongsInColumn = ['Parent', 'Requirement'],
                columns = [{
                    xtype: 'iterationplanningboardappbacklogcolumn',
                    flex: this._hasTimeboxes() ? 1 : 1/3,
                    cardLimit: Ext.isIE ? 25 : 100,
                    storeConfig : {
                        fetch: fieldsNeededToValidateCardBelongsInColumn
                    }
                }];

            Ext.Array.each(this.timeboxes, function(timeboxRecords, index) {
                var detailToken = Rally.nav.Manager.getDetailHash(timeboxRecords[0], {scope: '', subPage: 'scheduled'});

                columns.push({
                    xtype: 'iterationplanningboardappplanningcolumn',
                    currentTimebox: index === 0,
                    timeboxRecords: timeboxRecords,
                    storeConfig : {fetch: fieldsNeededToValidateCardBelongsInColumn},
                    moreItemsConfig: {token: detailToken}
                });
            }, this);

            return columns;
        },

        _hasTimeboxes: function() {
            return this.timeboxes && this.timeboxes.length > 0;
        },

        _findTimeboxes: function(model) {
            Ext.create('Rally.data.WsapiDataStore', {
                model: model,
                fetch: ['Name', 'StartDate', 'EndDate', 'Project', 'PlannedVelocity'],
                filters: [
                    {
                        property: 'EndDate',
                        operator: '>=',
                        value: 'Today'
                    }
                ],
                autoLoad: true,
                listeners: {
                    load: this._onTimeboxesLoad,
                    scope: this
                },
                context: this.getContext().getDataContext(),
                limit: Infinity
            });
        },

        _addBoardBlankSlate: function(board) {
            board.add({
                xtype: 'rallytimeboxblankslate',
                flex: 2/3,
                timeboxType: this.timeboxType,
                context: this.getContext()
            });
            if (Rally.BrowserTest) {
                Rally.BrowserTest.publishComponentReady(this);
            }
        },

        _onTimeboxesLoad: function(store) {
            var likeTimeboxesObj = {};
            store.each(function(timebox) {
                var timeboxKey = Ext.String.format("{0}{1}{2}",
                    timebox.get('Name'), timebox.get('StartDate'), timebox.get('EndDate'));
                likeTimeboxesObj[timeboxKey] = Ext.Array.push(likeTimeboxesObj[timeboxKey] || [], timebox);
            });

            var sortedLikeTimeboxes = Ext.Array.sort(Ext.Object.getValues(likeTimeboxesObj), function(likeTimeboxes1, likeTimeboxes2) {
                return likeTimeboxes1[0].get('EndDate') - likeTimeboxes2[0].get('EndDate');
            });

            var projectsSortedLikeTimeboxes = Ext.Array.filter(sortedLikeTimeboxes, function(likeTimeboxes) {
                return Ext.Array.some(likeTimeboxes, function(timebox) {
                    return Rally.util.Ref.getRelativeUri(timebox.get('Project')) === Rally.util.Ref.getRelativeUri(this.getContext().getProject());
                }, this);
            }, this);

            this.timeboxes = Ext.Array.slice(projectsSortedLikeTimeboxes, 0, 3);
            this.setLoading(false);
            this._addGridOrBoard('board');
        },

        _onObjectChange: function(record) {
            if (Ext.isArray(record)) {
                Ext.Array.each(record, this._onObjectChange, this);
                return;
            }

            if (record.get('_type').toLowerCase() === this.timeboxType.toLowerCase()) {
                var gridOrBoard = this.getGridOrBoard();
                if (gridOrBoard) {
                    gridOrBoard.destroy();
                }

                this.timeboxes = null;
                this._addGridOrBoard();
            }
        }
    });
})();
