Ext = window.Ext4 || window.Ext

Ext.require [
  'Rally.apps.roadmapplanningboard.DataTypes'
]

describe 'Rally.apps.roadmapplanningboard.DataTypes', ->

  it 'should define a collection type', ->
    expect(Ext.data.Types.COLLECTION).toBeDefined()