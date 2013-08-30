Ext = window.Ext4 || window.Ext

Ext.require ['Rally.apps.roadmapplanningboard.AppModelFactory']
describe 'Rally.apps.roadmapplanningboard.AppModelFactory', ->

  beforeEach ->
    deps = Ext.create 'Rally.test.apps.roadmapplanningboard.helper.TestDependencyHelper'
    deps.loadDependencies()

  afterEach ->
    Deft.Injector.reset()

  it 'should have valid url setup for the model proxy', ->
    appModelFactory = Rally.apps.roadmapplanningboard.AppModelFactory

    expect(appModelFactory.getPlanModel().proxy.url).toBe "http://localhost:9999/api/plan"
    expect(appModelFactory.getTimeframeModel().proxy.url).toBe "http://localhost:8888/api/timeframe"
    expect(appModelFactory.getRoadmapModel().proxy.url).toBe "http://localhost:9999/api/roadmap"

