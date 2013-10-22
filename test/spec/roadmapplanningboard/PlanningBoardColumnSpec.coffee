Ext = window.Ext4 || window.Ext

Ext.require [
  'Rally.apps.roadmapplanningboard.PlanningBoardColumn'
  'Rally.test.apps.roadmapplanningboard.helper.TestDependencyHelper'
]

describe 'Rally.apps.roadmapplanningboard.PlanningBoardColumn', ->
  beforeEach ->
    Rally.test.apps.roadmapplanningboard.helper.TestDependencyHelper.loadDependencies()

    target = Ext.getBody()
    @column = Ext.create 'Rally.apps.roadmapplanningboard.PlanningBoardColumn',
      store: Deft.Injector.resolve('featureStore')
      renderTo: target
      contentCell: target
      headerCell: target

  afterEach ->
    Deft.Injector.reset()
    @column?.destroy()

  it 'should have a column existing', ->
    expect(@column).toBeTruthy()

  it 'should filter by queryFilter configured function', ->
    @column.isMatchingRecord = ->
      true

    expect(@column.getCards().length).toBe 10

    @column.isMatchingRecord = (record) ->
      record.get('ObjectID') == 1000
    @column.refresh()

    expect(@column.getCards().length).toBe 1

  it 'should have the planning-column css class on header and content', ->
    expect(@column.getContentCell().hasCls 'planning-column').toBeTruthy()
    expect(@column.getColumnHeaderCell().hasCls 'planning-column').toBeTruthy()
