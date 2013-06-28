Ext = window.Ext4 || window.Ext

Ext.define 'Rally.test.apps.roadmapplanningboard.helper.TestDependencyHelper',
#  singleton: true

  constructor: ->
    Ext.create 'Rally.apps.roadmapplanningboard.Dependencies'
    @callParent arguments

  loadDependencies: ->
    Deft.Injector.configure
      appModelFactory:
        className: 'Rally.apps.roadmapplanningboard.AppModelFactory'

      featureStore:
        fn: ->
          storeFixtureFactory.getFeatureStoreFixture()

      planningStore:
        fn: ->
          storeFixtureFactory.getPlanningStoreFixture()

      timeframeStore:
        fn: ->
          storeFixtureFactory.getTimeframeStoreFixture()

      roadmapStore:
        fn: ->
          storeFixtureFactory.getRoadmapStoreFixture()

    storeFixtureFactory = Ext.create 'Rally.test.apps.roadmapplanningboard.mocks.StoreFixtureFactory'

