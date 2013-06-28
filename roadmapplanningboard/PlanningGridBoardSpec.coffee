Ext = window.Ext4 || window.Ext

describe 'Rally.apps.roadmapplanningboard.PlanningGridBoard', ->
  beforeEach ->
    @gridboard = Ext.create 'Rally.apps.roadmapplanningboard.PlanningGridBoard',
      roadmapId: '413617ecef8623df1391fabc'
      renderTo: Ext.getBody()

  afterEach ->
    @gridboard.destroy()

  it 'should wrap a roadmap planning board', ->
    expect(@gridboard.getComponent('gridOrBoard')).toBeTruthy()
    expect(@gridboard.getComponent('gridOrBoard').$className).toEqual('Rally.apps.roadmapplanningboard.PlanningBoard')
