Ext = window.Ext4 || window.Ext
Ext.require [
  'Rally.apps.roadmapplanningboard.PlanningBoard'
  'Rally.apps.roadmapplanningboard.util.Fraction'
]

describe 'Rally.apps.roadmapplanningboard.PlanningBoard', ->
  beforeEach ->
    storeFixtureFactory = Ext.create 'Rally.test.apps.roadmapplanningboard.mocks.StoreFixtureFactory'

    Deft.Injector.configure
      appModelFactory:
        className: 'Rally.apps.roadmapplanningboard.AppModelFactory'

      featureStore:
        fn: ->
          storeFixtureFactory.getFeatureStoreFixture()

      planningStore:
        fn: ->
          storeFixtureFactory.getPlanningStoreFixture()

      timeframeStore:
        fn: ->
          storeFixtureFactory.getTimeframeStoreFixture()

      roadmapStore:
        fn: ->
          storeFixtureFactory.getRoadmapStoreFixture()

    @board = Ext.create 'Rally.apps.roadmapplanningboard.PlanningBoard',
      roadmapId: '413617ecef8623df1391fabc'

  afterEach ->
    @board.destroy()

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

    expect(@board.getColumns()[1].getCards().length).toBe 3
    expect(@board.getColumns()[2].getCards().length).toBe 1
    expect(@board.getColumns()[3].getCards().length).toBe 0
    expect(@board.getColumns().length).toBe(4)
  # 3 + backlog

  it 'should be correctly configured with stores from deft', ->
    expect(@board.featureStore).toBeTruthy()
    expect(@board.timeframeStore).toBeTruthy()
    expect(@board.planningStore).toBeTruthy()

  it 'should have appropriate plan capacity range', ->
    @board.render(Ext.getBody())

    expect(@board.getColumns()[1].getPlanRecord().get('lowCapacity')).toBe 2
    expect(@board.getColumns()[1].getPlanRecord().get('highCapacity')).toBe 8
    expect(@board.getColumns()[2].getPlanRecord().get('lowCapacity')).toBe 3
    expect(@board.getColumns()[2].getPlanRecord().get('highCapacity')).toBe 30
    expect(@board.getColumns()[3].getPlanRecord().get('lowCapacity')).toBe 15
    expect(@board.getColumns()[3].getPlanRecord().get('highCapacity')).toBe 25

  it 'should have a blank roadmap with 3 plans', ->
    newboard = Ext.create 'Rally.apps.roadmapplanningboard.PlanningBoard',
      roadmapId: null

    newboard.render(Ext.getBody())
    expect(newboard.getColumns().length).toBe(1)

    backlogColumn = newboard.getColumns()[0]

    expect(backlogColumn).toBeTruthy()
    expect(backlogColumn.getColumnHeader().getHeaderValue()).toBe "Backlog"

    newboard.destroy()

  it 'should not throw an error if no plan in the roadmap exists in the plans list', ->
    testBoard = Ext.create 'Rally.apps.roadmapplanningboard.PlanningBoard',
      roadmapId: '77'

    testBoard.render(Ext.getBody())

    expect(testBoard.getColumns()[1].getColumnHeader().getHeaderValue()).toBe ""
    expect(testBoard.getColumns()[1].getCards().length).toBe 0
    expect(testBoard.getColumns().length).toBe(2)
    # just backlog and the one valid plan

    testBoard.destroy()

  it 'should set isRightmostColumn flag in last column only', ->
    @board.render(Ext.getBody())

    expect(@board.getColumns()[0].isRightmostColumn).not.toBeTruthy()
    expect(@board.getColumns()[1].isRightmostColumn).not.toBeTruthy()
    expect(@board.getColumns()[2].isRightmostColumn).not.toBeTruthy()
    expect(@board.getColumns()[3].isRightmostColumn).toBeTruthy()
