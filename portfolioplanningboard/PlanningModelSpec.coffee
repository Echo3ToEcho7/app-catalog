Ext = window.Ext4 || window.Ext
describe 'Rally.apps.roadmapplanningboard.PlanningModel', ->

  it 'is defined', ->
    record = Ext.create 'Rally.apps.roadmapplanningboard.PlanningModel'
    expect(record).toBeDefined()