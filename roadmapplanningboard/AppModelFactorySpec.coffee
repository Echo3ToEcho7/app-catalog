Ext = window.Ext4 || window.Ext

Ext.require [
  'Rally.apps.roadmapplanningboard.AppModelFactory'
  'Rally.test.apps.roadmapplanningboard.helper.TestDependencyHelper'
]
describe 'Rally.apps.roadmapplanningboard.AppModelFactory', ->

  beforeEach ->
    Rally.test.apps.roadmapplanningboard.helper.TestDependencyHelper.loadDependencies()

  afterEach ->
    Deft.Injector.reset()

  it 'should have valid url setup for the model proxy', ->

    expect(Rally.apps.roadmapplanningboard.AppModelFactory.getPlanModel().proxy.url).toBe "http://localhost:9999/api/plan"
    expect(Rally.apps.roadmapplanningboard.AppModelFactory.getTimeframeModel().proxy.url).toBe "http://localhost:8888/api/timeframe"
    expect(Rally.apps.roadmapplanningboard.AppModelFactory.getRoadmapModel().proxy.url).toBe "http://localhost:9999/api/roadmap"

