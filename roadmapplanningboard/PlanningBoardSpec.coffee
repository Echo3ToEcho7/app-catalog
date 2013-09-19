Ext = window.Ext4 || window.Ext

Ext.require [
  'Rally.test.apps.roadmapplanningboard.helper.TestDependencyHelper'
  'Rally.apps.roadmapplanningboard.PlanningBoard'
]

describe 'Rally.apps.roadmapplanningboard.PlanningBoard', ->

  helpers
    createCardboard: (config) ->
      @cardboard = Ext.create 'Rally.apps.roadmapplanningboard.PlanningBoard',
        _.extend
          roadmapId: '413617ecef8623df1391fabc'
          _retrieveLowestLevelPI: (callback) -> callback.call(@, Rally.test.mock.ModelObjectMother.getRecord('typedefinition',  {values: { TypePath : 'PortfolioItem/Feature' }}))
          slideDuration: 10
          renderTo: 'testDiv'
        , config

      @waitForComponentReady(@cardboard)

    clickCollapse: ->
      collapseStub = @stub()
      @cardboard.on 'headersizechanged', collapseStub
      @click(css: '.themeButtonCollapse').then =>
        @once
          condition: ->
            collapseStub.called

    clickExpand: ->
      expandStub = @stub()
      @cardboard.on 'headersizechanged', expandStub
      @click(css: '.themeButtonExpand').then =>
        @once
          condition: ->
            expandStub.called

    getThemeElements: ->
      _.map(@cardboard.getEl().query('.theme_container'), Ext.get)


  beforeEach ->
    Rally.test.apps.roadmapplanningboard.helper.TestDependencyHelper.loadDependencies()

    @ajax.whenQuerying('PortfolioItem/Feature').respondWith([
                        {
                            "ObjectID": "1000",
                            "_ref": '/portfolioitem/feature/1000',
                            "name": "Android Support",
                            "refinedEstimate": 4,
                            "subscriptionId": "1"
                        },
                        {
                            "ObjectID": "1001",
                            "_ref": '/portfolioitem/feature/1001',
                            "name": "iOS Support",
                            "refinedEstimate": 2,
                            "subscriptionId": "1"
                        },
                        {
                            "ObjectID": "1002",
                            "_ref": '/portfolioitem/feature/1002',
                            "name": "HTML 5 Webapp",
                            "refinedEstimate": 3,
                            "subscriptionId": "1"
                        },
                        {
                            "ObjectID": "1003",
                            "_ref": '/portfolioitem/feature/1003',
                            "name": "Blackberry Native App",
                            "refinedEstimate": 1,
                            "subscriptionId": "1"
                        },
                        {
                            "ObjectID": "1004",
                            "_ref": '/portfolioitem/feature/1004',
                            "name": "Windows Phone Support",
                            "refinedEstimate": 3,
                            "subscriptionId": "2"
                        },
                        {
                            "ObjectID": "1005",
                            "_ref": '/portfolioitem/feature/1005',
                            "name": "Ubuntu Phone Application",
                            "refinedEstimate": 4,
                            "subscriptionId": "2"
                        },
                        {
                            "ObjectID": "1006",
                            "_ref": '/portfolioitem/feature/1006',
                            "name": "Tester's Large Test Card 1",
                            "refinedEstimate": 13,
                            "subscriptionId": "2"
                        },
                        {
                            "ObjectID": "1007",
                            "_ref": '/portfolioitem/feature/1007',
                            "name": "Tester's Large Test Card 2",
                            "refinedEstimate": 21,
                            "subscriptionId": "2"
                        },
                        {
                            "ObjectID": "1008",
                            "_ref": '/portfolioitem/feature/1008',
                            "name": "Tester's Large Test Card 3",
                            "refinedEstimate": 13,
                            "subscriptionId": "2"
                        },
                        {
                            "ObjectID": "1009",
                            "_ref": '/portfolioitem/feature/1009',
                            "name": "Tester's Large Test Card 4",
                            "refinedEstimate": 8,
                            "subscriptionId": "2"
                        }
                    ])
  afterEach ->
    @cardboard.destroy()
    Deft.Injector.reset()

  it 'should render with a backlog column', ->
    @createCardboard().then =>
      backlogColumn = @cardboard.getColumns()[0]

      expect(backlogColumn.getColumnHeader().getHeaderValue()).toBe "Backlog"

  it 'should have three visible planning columns', ->
    @createCardboard().then =>

      expect(@cardboard.getColumns()[1].getColumnHeader().getHeaderValue()).toBe "Q1"
      expect(@cardboard.getColumns()[2].getColumnHeader().getHeaderValue()).toBe "Q2"
      expect(@cardboard.getColumns()[3].getColumnHeader().getHeaderValue()).toBe "Future Planning Period"

  it 'should have features in the appropriate columns', ->
    @createCardboard().then =>
      expect(@cardboard.getColumns()[1].getCards().length).toBe 3
      expect(@cardboard.getColumns()[2].getCards().length).toBe 1
      expect(@cardboard.getColumns()[3].getCards().length).toBe 0
      expect(@cardboard.getColumns().length).toBe(5)

  it 'should be correctly configured with stores from deft', ->
    @createCardboard().then =>
      expect(@cardboard.timeframeStore).toBeTruthy()
      expect(@cardboard.planStore).toBeTruthy()

  it 'should have appropriate plan capacity range', ->
    @createCardboard().then =>
      expect(@cardboard.getColumns()[1].getPlanRecord().get('lowCapacity')).toBe 2
      expect(@cardboard.getColumns()[1].getPlanRecord().get('highCapacity')).toBe 8
      expect(@cardboard.getColumns()[2].getPlanRecord().get('lowCapacity')).toBe 3
      expect(@cardboard.getColumns()[2].getPlanRecord().get('highCapacity')).toBe 30
      expect(@cardboard.getColumns()[3].getPlanRecord().get('lowCapacity')).toBe 15
      expect(@cardboard.getColumns()[3].getPlanRecord().get('highCapacity')).toBe 25

  it 'attribute should be set to empty', ->
    @createCardboard().then =>
      expect(@cardboard.attribute == '').toBeTruthy()

  describe 'theme container interactions', ->

    it 'should show expanded themes when the board is created', ->
      @createCardboard().then =>
        _.each @getThemeElements(), (element) =>
          expect(element.isVisible()).toBe true

    it 'should collapse themes when the theme collapse button is clicked', ->
      @createCardboard().then =>
        @clickCollapse().then =>
          _.each @getThemeElements(), (element) =>
            expect(element.isVisible()).toBe false

    it 'should expand themes when the theme expand button is clicked', ->
      @createCardboard(showTheme: false).then =>
        @clickExpand().then =>
          _.each @getThemeElements(), (element) =>
            expect(element.isVisible()).toBe true

    it 'should return client metrics message when collapse button is clicked', ->
      @createCardboard().then =>
        @clickCollapse().then =>
          expect(@cardboard._getClickAction()).toEqual("Themes toggled from [true] to [false]")

    it 'should return client metrics message when expand button is clicked', ->
      @createCardboard(showTheme: false).then =>
        @clickExpand().then =>
          expect(@cardboard._getClickAction()).toEqual("Themes toggled from [false] to [true]")