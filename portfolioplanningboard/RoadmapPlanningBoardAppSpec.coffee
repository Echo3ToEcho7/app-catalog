Ext = window.Ext4 || window.Ext
describe 'Rally.apps.roadmapplanningboard.RoadmapPlanningBoardApp', ->

    beforeEach ->

        @ajax.whenQuerying('preference').respondWith()
        @ajax.whenQuerying('portfolioitem/feature').respondWith [
            {ObjectID: 1, Name: 'test', FormattedID: 'F1'}
        ]
        @ajax.whenQuerying('typedefinition').respondWith [
            Rally.mock.data.types.PortfolioItemFeature.getModelDefinition()
        ]

        globalContext = Rally.environment.getContext()
        context = Ext.create 'Rally.app.Context',
            initialValues:
                project: globalContext.getProject()
                workspace: globalContext.getWorkspace()
                user: globalContext.getUser()
                subscription: globalContext.getSubscription()

        @app = Ext.create 'Rally.apps.roadmapplanningboard.RoadmapPlanningBoardApp', {
             context
             renderTo: 'testDiv'
        }

    afterEach ->
        @app.destroy()

    it 'has features in columns', ->
        cards = @app.down('roadmapplanningboardcolumn').query('rallycard')
        expect(cards.length).toBe 1

    describe 'Manage timeline columns', ->
        beforeEach ->
            @columns = @app.query('roadmapplanningboardcolumn')

        it 'should load columns for each timeframe', ->
            expect(Ext.Array.pluck(@columns, 'displayValue')).toEqual [ 'Backlog', 'Q4', 'Q1', 'Q2', 'Q3' ]

        it 'should show capacity from the plan', ->
            expect(Ext.Array.pluck(@columns, 'capacity')).toEqual [ undefined, 50, 60, 70, 80 ]

        it 'should show start and end dates from the timeframes', ->
            expect(Ext.Array.pluck(@columns, 'startDate')).toEqual [
                undefined
                new Date('10/01/2012')
                new Date('1/01/2013')
                new Date('4/01/2013')
                new Date('7/01/2013')
            ]
            expect(Ext.Array.pluck(@columns, 'endDate')).toEqual [
                undefined
                new Date('12/31/2012')
                new Date('3/31/2013')
                new Date('6/30/2013')
                new Date('10/30/2013')
            ]
