Ext = window.Ext4 || window.Ext

Ext.define 'Rally.test.apps.roadmapplanningboard.helper.TestDependencyHelper',

  singleton: true

  requires: [
    'Rally.test.apps.roadmapplanningboard.mocks.StoreFixtureFactory'
  ]

  loadDependencies: ->

    Rally.test.mock.env.Global.setupEnvironment
      services:
        planning_service_url: 'http://localhost:9999'
        timeline_service_url: 'http://localhost:8888'

    Deft.Injector.configure
      appModelFactory:
        className: 'Rally.apps.roadmapplanningboard.AppModelFactory'

      featureStore:
        fn: ->
          Rally.test.apps.roadmapplanningboard.mocks.StoreFixtureFactory.getFeatureStoreFixture()

      secondFeatureStore:
        fn: ->
          Rally.test.apps.roadmapplanningboard.mocks.StoreFixtureFactory.getSecondFeatureStoreFixture()

      planStore:
        fn: ->
          Rally.test.apps.roadmapplanningboard.mocks.StoreFixtureFactory.getPlanStoreFixture()

      timeframeStore:
        fn: ->
          Rally.test.apps.roadmapplanningboard.mocks.StoreFixtureFactory.getTimeframeStoreFixture()

      roadmapStore:
        fn: ->
          Rally.test.apps.roadmapplanningboard.mocks.StoreFixtureFactory.getRoadmapStoreFixture()

      uuidMapper:
        fn: ->
          getUuid: ->
              deferred = Ext.create('Deft.promise.Deferred')
              deferred.resolve('12345678-1234-1234-1234-12345678')
              deferred.promise
