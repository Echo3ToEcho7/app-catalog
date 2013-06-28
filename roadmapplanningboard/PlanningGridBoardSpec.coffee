Ext = window.Ext4 || window.Ext

describe 'Rally.apps.roadmapplanningboard.PlanningGridBoard', ->
  beforeEach ->
    deps = Ext.create 'Rally.test.apps.roadmapplanningboard.helper.TestDependencyHelper'
    deps.loadDependencies()

    @gridboard = Ext.create 'Rally.apps.roadmapplanningboard.PlanningGridBoard',
      roadmapId: '413617ecef8623df1391fabc'
      renderTo: Ext.getBody()

  afterEach ->
    @gridboard.destroy()
    Deft.Injector.reset()

  it 'should wrap a roadmap planning board', ->
    expect(@gridboard.getComponent('gridOrBoard')).toBeTruthy()
    expect(@gridboard.getComponent('gridOrBoard').$className).toEqual('Rally.apps.roadmapplanningboard.PlanningBoard')
