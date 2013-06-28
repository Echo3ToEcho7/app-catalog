Ext = window.Ext4 || window.Ext

describe 'Rally.apps.roadmapplanningboard.PlanningStore', ->
  beforeEach ->
    @store = Ext.create('Rally.apps.roadmapplanningboard.PlanningStore')

  it 'should use the planning model', ->
    expect(@store).toBeTruthy()
    expect(@store.model.$className).toEqual 'Rally.apps.roadmapplanningboard.PlanningModel'

