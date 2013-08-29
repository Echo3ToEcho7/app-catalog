Ext = window.Ext4 || window.Ext

Ext.define 'Rally.test.apps.roadmapplanningboard.helper.TestDependencyHelper',

  loadDependencies: ->

    Rally.test.mock.env.Global.setupEnvironment({
      services: {
        planning_service_url: 'http://localhost:9999',
        timeline_service_url: 'http://localhost:8888'
      }
    });

    Deft.Injector.configure
      appModelFactory:
        className: 'Rally.apps.roadmapplanningboard.AppModelFactory'

      featureStore:
        fn: ->
          storeFixtureFactory.getFeatureStoreFixture()

      secondFeatureStore:
        fn: ->
          storeFixtureFactory.getSecondFeatureStoreFixture()

      planStore:
        fn: ->
          storeFixtureFactory.getPlanStoreFixture()

      timeframeStore:
        fn: ->
          storeFixtureFactory.getTimeframeStoreFixture()

      roadmapStore:
        fn: ->
          storeFixtureFactory.getRoadmapStoreFixture()

    storeFixtureFactory = Ext.create 'Rally.test.apps.roadmapplanningboard.mocks.StoreFixtureFactory'

