Ext = window.Ext4 || window.Ext
Ext.require [
  'Rally.test.apps.roadmapplanningboard.mocks.StoreFixtureFactory'
]

describe 'Rally.apps.roadmapplanningboard.PlanningBoardColumn', ->
  beforeEach ->
    Deft.Injector.configure
      appModelFactory:
        className: 'Rally.apps.roadmapplanningboard.AppModelFactory'

    storeFixtureFactory = Ext.create 'Rally.test.apps.roadmapplanningboard.mocks.StoreFixtureFactory'

    target = Ext.getBody()
    @column = Ext.create 'Rally.apps.roadmapplanningboard.PlanningBoardColumn',
      stores: [storeFixtureFactory.getFeatureStoreFixture()]
      renderTo: target
      contentCell: target
      headerCell: target

  afterEach ->
    @column?.destroy()

  it 'should have a column existing', ->
    expect(@column).toBeTruthy()

  it 'should filter by queryFilter configured function', ->
    @column.isMatchingRecord = ->
      true

    expect(@column.getCards().length).toBe 10

    @column.isMatchingRecord = (record) ->
      record.get('name') == "Ubuntu Phone Application"
    @column.refresh()

    expect(@column.getCards().length).toBe 1

  it 'should have the planning-column css class on header and content', ->
    expect(@column.getContentCell().hasCls 'planning-column').toBeTruthy()
    expect(@column.getColumnHeaderCell().hasCls 'planning-column').toBeTruthy()

  it 'should fire ready when the column has not stores', ->
    isReady = false
    blankColumn = Ext.create 'Rally.apps.roadmapplanningboard.PlanningBoardColumn',
      stores: []
      renderTo: Ext.getBody()
      contentCell: Ext.getBody()
      headerCell: Ext.getBody()
      listeners:
        ready:
          fn: ->
            isReady = true


    expect(isReady).toBeTruthy()

    blankColumn.destroy()
