Ext = window.Ext4 || window.Ext

describe 'Rally.apps.roadmapplanningboard.PlanningBoardColumn', ->
  beforeEach ->
    deps = Ext.create 'Rally.test.apps.roadmapplanningboard.helper.TestDependencyHelper'
    deps.loadDependencies()

    target = Ext.getBody()
    @column = Ext.create 'Rally.apps.roadmapplanningboard.PlanningBoardColumn',
      stores: [Deft.Injector.resolve('featureStore')]
      getStores: -> @stores
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

  it 'should fire ready when the column has no stores', ->
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
