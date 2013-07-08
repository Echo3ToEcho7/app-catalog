(function() {
    var Ext = window.Ext4 || window.Ext;

    /**
     * Portfolio Planning Board App
     */
    Ext.define('Rally.apps.roadmapplanningboard.RoadmapPlanningBoardApp', {
        extend: 'Rally.app.App',
        alias: 'widget.rallyroadmapplanningboard',
        
        requires: [
            'Rally.ui.LeftRight',
            'Rally.data.util.PortfolioItemHelper',
            'Rally.apps.roadmapplanningboard.TimeframeModel',
            'Rally.apps.roadmapplanningboard.PlanningModel',
            'Rally.apps.roadmapplanningboard.RoadmapPlanningBoardColumn'
        ],
        
        componentCls: 'app',
        
        cls: 'roadmapPlanningBoardApp',

        layout: {
            type: 'vbox',
            align: 'stretch',
            flex: 1
        },
        items: [
            {
                itemId: 'header',
                xtype: 'rallyleftright',
                padding: 4
            }
        ],

        launch: function() {
            
            this.setLoading(true);
            
            Rally.data.util.PortfolioItemHelper.loadTypeOrDefault({
                defaultToLowest: true,
                success: function(typeDefRecord){
                    this.piTypePath = typeDefRecord.get('TypePath');
                    this.loadTimeframes();
                },
                scope: this
            });
            
        },

        loadTimeframes: function () {

            this.timeframeStore = Ext.create('Ext.data.Store', {
                model: Rally.apps.roadmapplanningboard.TimeframeModel,
                data: [
                    {id: '1', name: 'Q4', start: new Date('10/01/2012'), end: new Date('12/31/2012')},
                    {id: '2', name: 'Q1', start: new Date('1/01/2013'), end: new Date('3/31/2013')},
                    {id: '3', name: 'Q2', start: new Date('4/01/2013'), end: new Date('6/30/2013')},
                    {id: '4', name: 'Q3', start: new Date('7/01/2013'), end: new Date('10/30/2013')}
                ]
            });

            this.timeframeStore.mon(this.timeframeStore, 'datachanged', this.fetchedPlans, this);

            this.timeframeStore.load();
        },

        fetchedPlans: function (store) {
            this.planningStore = Ext.create('Ext.data.Store', {
                model: Rally.apps.roadmapplanningboard.PlanningModel,
                data: [
                    {id: '1', name: 'Plan 1', timeframe: '1', capacity: '50'},
                    {id: '2', name: 'Plan 2', timeframe: '2', capacity: '60'},
                    {id: '3', name: 'Plan 3', timeframe: '3', capacity: '70'},
                    {id: '4', name: 'Plan 4', timeframe: '4', capacity: '80'}
                ]
            });

            this.planningStore.mon(this.planningStore, 'datachanged', this.buildCardboard, this);

            this.planningStore.load();
        },

        _getColumns: function(store){
            var columns = [{
                displayValue: 'Backlog'
            }];

            store.each(function(plan){

                var timeframe = this.timeframeStore.findRecord('id', plan.get('timeframe'));
                columns.push({
                    displayValue: timeframe.get('name'),
                    startDate: timeframe.get('start'),
                    endDate: timeframe.get('end'),
                    capacity: plan.get('capacity')
                });
            }, this);

            return columns;
        },

        buildCardboard: function (store) {
            this.setLoading(false);

            var columns = this._getColumns(store);

            var cardboard = Ext.create('Rally.ui.cardboard.CardBoard', {
                types: this.piTypePath,
                columns: columns,
                columnConfig: {
                    xtype: 'roadmapplanningboardcolumn',
                    additionalFetchFields: ['PlannedEndDate']
                },
                listeners: {
                    load: this._onBoardLoad,
                    scope: this
                }
            });

            this.add(cardboard);
        },

        _onBoardLoad: function() {
            if (Rally.BrowserTest) {
                Rally.BrowserTest.publishComponentReady(this);
            }
        }
    });

})();
