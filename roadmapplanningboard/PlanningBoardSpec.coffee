Ext = window.Ext4 || window.Ext

describe 'Rally.apps.roadmapplanningboard.PlanningBoard', ->
  beforeEach ->
    deps = Ext.create 'Rally.test.apps.roadmapplanningboard.helper.TestDependencyHelper'
    deps.loadDependencies()

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
    @board = Ext.create 'Rally.apps.roadmapplanningboard.PlanningBoard',
      roadmapId: '413617ecef8623df1391fabc'
      _retrieveLowestLevelPI: (callback) -> callback(Rally.test.mock.ModelObjectMother.getRecord('typedefinition',  {values: { TypePath : 'PortfolioItem/Feature' }}))

  afterEach ->
    @board.destroy()
    Deft.Injector.reset()


  it 'should render with a backlog column', ->
    @board.render(Ext.getBody())
    backlogColumn = @board.getColumns()[0]

    expect(backlogColumn).toBeTruthy()
    expect(backlogColumn.getColumnHeader().getHeaderValue()).toBe "Backlog"

  it 'should have three visible planning columns', ->
    @board.render(Ext.getBody())

    expect(@board.getColumns()[1].getColumnHeader().getHeaderValue()).toBe "Q1"
    expect(@board.getColumns()[2].getColumnHeader().getHeaderValue()).toBe "Q2"
    expect(@board.getColumns()[3].getColumnHeader().getHeaderValue()).toBe "Future Planning Period"

  it 'should have features in the appropriate columns', ->
    @board.render(Ext.getBody())

    deferred = Ext.create 'Deft.Deferred'
    _this = this
    @board.on 'load', ->
      expect(_this.board.getColumns()[1].getCards().length).toBe 3
      expect(_this.board.getColumns()[2].getCards().length).toBe 1
      expect(_this.board.getColumns()[3].getCards().length).toBe 0
      expect(_this.board.getColumns().length).toBe(4)
      deferred.resolve()

    deferred.promise
  # 3 + backlog

  it 'should be correctly configured with stores from deft', ->
    expect(@board.timeframeStore).toBeTruthy()
    expect(@board.planStore).toBeTruthy()

  it 'should have appropriate plan capacity range', ->
    @board.render(Ext.getBody())
    deferred = Ext.create 'Deft.Deferred'
    _this = this
    
    @board.on 'load', ->
      expect(_this.board.getColumns()[1].getPlanRecord().get('lowCapacity')).toBe 2
      expect(_this.board.getColumns()[1].getPlanRecord().get('highCapacity')).toBe 8
      expect(_this.board.getColumns()[2].getPlanRecord().get('lowCapacity')).toBe 3
      expect(_this.board.getColumns()[2].getPlanRecord().get('highCapacity')).toBe 30
      expect(_this.board.getColumns()[3].getPlanRecord().get('lowCapacity')).toBe 15
      expect(_this.board.getColumns()[3].getPlanRecord().get('highCapacity')).toBe 25

      deferred.resolve()

    deferred.promise


  # it 'should have a blank roadmap with 3 plans', ->
  #   newboard = Ext.create 'Rally.apps.roadmapplanningboard.PlanningBoard',
  #     roadmapId: null

  #   newboard.render(Ext.getBody())

  #   deferred = Ext.create 'Deft.Deferred'
  #   newboard.on 'load', ->
  #     expect(newboard.getColumns().length).toBe(1)
  #     backlogColumn = newboard.getColumns()[0]
  #     expect(backlogColumn).toBeTruthy()
  #     expect(backlogColumn.getColumnHeader().getHeaderValue()).toBe "Backlog"
  #     deferred.resolve()
    
  #   deferred.promise.then newboard.destroy()
    
  # it 'should not throw an error if no plan in the roadmap exists in the plans list', ->
  #   testBoard = Ext.create 'Rally.apps.roadmapplanningboard.PlanningBoard',
  #     roadmapId: '77'

  #   testBoard.render(Ext.getBody())

  #   expect(testBoard.getColumns()[1].getColumnHeader().getHeaderValue()).toBe ""
  #   expect(testBoard.getColumns()[1].getCards().length).toBe 0
  #   expect(testBoard.getColumns().length).toBe(2)
  #   # just backlog and the one valid plan

  #   testBoard.destroy()

  it 'should set isRightmostColumn flag in last column only', ->
    @board.render(Ext.getBody())

    expect(@board.getColumns()[0].isRightmostColumn).not.toBeTruthy()
    expect(@board.getColumns()[1].isRightmostColumn).not.toBeTruthy()
    expect(@board.getColumns()[2].isRightmostColumn).not.toBeTruthy()
    expect(@board.getColumns()[3].isRightmostColumn).toBeTruthy()

  it 'attribute should be set to empty', ->
    @board.render(Ext.getBody())
    expect(@board.attribute == '').toBeTruthy()

    
