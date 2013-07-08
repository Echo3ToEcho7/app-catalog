Ext = window.Ext4 || window.Ext
describe 'Rally.apps.roadmapplanningboard.TimeframeModel', ->

  it 'is defined', ->
    record = Ext.create 'Rally.apps.roadmapplanningboard.TimeframeModel'
    expect(record).toBeDefined()