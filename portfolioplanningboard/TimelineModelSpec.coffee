Ext = window.Ext4 || window.Ext
describe 'Rally.apps.roadmapplanningboard.TimelineModel', ->

  it 'is defined', ->
    record = Ext.create 'Rally.apps.roadmapplanningboard.TimelineModel'
    expect(record).toBeDefined()