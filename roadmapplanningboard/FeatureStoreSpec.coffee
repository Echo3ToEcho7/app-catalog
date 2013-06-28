Ext = window.Ext4 || window.Ext
Ext.require [
  'Rally.apps.roadmapplanningboard.FeatureStore'
]

describe 'Rally.apps.roadmapplanningboard.FeatureStore', ->
  it 'should use the feature model', ->
    @store = Ext.create('Rally.apps.roadmapplanningboard.FeatureStore')
    expect(@store).toBeTruthy()
    expect(@store.model.$className).toEqual 'Rally.apps.roadmapplanningboard.FeatureModel'
