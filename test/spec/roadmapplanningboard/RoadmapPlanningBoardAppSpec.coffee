Ext = window.Ext4 || window.Ext

Ext.require [
  'Rally.test.apps.roadmapplanningboard.helper.TestDependencyHelper'
  'Rally.apps.roadmapplanningboard.RoadmapPlanningBoardApp'
  'Rally.test.mock.ModelObjectMother'
]

describe 'Rally.apps.roadmapplanningboard.RoadmapPlanningBoardApp', ->

  helpers
    createApp: (settings = {}) ->
      globalContext = Rally.environment.getContext()
      context = Ext.create 'Rally.app.Context',
        initialValues:
          project: globalContext.getProject()
          workspace: globalContext.getWorkspace()
          user: globalContext.getUser()
          subscription: globalContext.getSubscription()

      config =
        context: context
        _retrieveLowestLevelPI: (callback) -> callback.call(@, Rally.test.mock.ModelObjectMother.getRecord('typedefinition',  {values: { TypePath : 'PortfolioItem/Feature' }}))
        renderTo: 'testDiv'

      config.settings = _.extend
        test: true
      , settings

      @app = Ext.create 'Rally.apps.roadmapplanningboard.RoadmapPlanningBoardApp', config

  beforeEach ->
    Rally.test.apps.roadmapplanningboard.helper.TestDependencyHelper.loadDependencies()
    @ajax.whenQuerying('PortfolioItem/Feature').respondWith []

  afterEach ->
    @app?.destroy()
    Deft.Injector.reset()

  describe 'Service error handling', ->

    it 'should display a friendly notification if any service (planning, timeline, WSAPI) is unavailable', ->
      @createApp()
      Ext.Ajax.fireEvent('requestexception', null, null, { operation: requester: @app })

      expect(@app.getEl().getHTML()).toContain 'temporarily unavailable'
