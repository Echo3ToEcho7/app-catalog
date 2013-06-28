Ext = window.Ext4 || window.Ext

describe 'Rally.apps.roadmapplanningboard.BacklogBoardColumn', ->
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

    @target = Ext.getBody()
    @backlogColumn = Ext.create 'Rally.apps.roadmapplanningboard.BacklogBoardColumn',
      renderTo: @target
      contentCell: @target
      headerCell: @target
      roadmap: storeFixtureFactory.getRoadmapStoreFixture().getById('413617ecef8623df1391fabc')

  afterEach ->
    @backlogColumn?.destroy()

  it 'is defined', ->
    expect(@backlogColumn).toBeDefined()

  it 'is using injected stores', ->
    expect(@backlogColumn.featureStore).toBeTruthy()

  it 'has a backlog filter', ->
    expect(@backlogColumn.getCards().length).toBe(6)

  it 'will filter by roadmap in addition to feature and plans', ->
    roadMapModel = Ext.create 'Rally.apps.roadmapplanningboard.RoadmapModel',
      id: 'Foo',
      name: "bar",
      plans: []

    column = Ext.create 'Rally.apps.roadmapplanningboard.BacklogBoardColumn',
      renderTo: Ext.getBody()
      contentCell: Ext.getBody()
      headerCell: Ext.getBody()
      roadmap: roadMapModel

    expect(column.getCards().length).toBe(10)

    column.destroy()
