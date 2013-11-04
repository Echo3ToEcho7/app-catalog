Ext = window.Ext4 || window.Ext

Ext.define 'Rally.apps.roadmapplanningboard.DeftInjector', { singleton: true, init: Ext.emptyFn }

Ext.require [
  'Rally.test.apps.roadmapplanningboard.helper.TestDependencyHelper'
  'Rally.apps.roadmapplanningboard.RoadmapPlanningBoardApp'
  'Rally.test.mock.ModelObjectMother'
]

describe 'Rally.apps.roadmapplanningboard.RoadmapPlanningBoardApp', ->

  helpers
    createApp: ->
      context = Ext.create 'Rally.app.Context',
        initialValues:
          project: Rally.environment.getContext().getProject()
          workspace: Rally.environment.getContext().getWorkspace()
          user: Rally.environment.getContext().getUser()
          subscription: Rally.environment.getContext().getSubscription()


      @app = Ext.create 'Rally.apps.roadmapplanningboard.RoadmapPlanningBoardApp',
        context: context
        renderTo: 'testDiv'

      @waitForComponentReady @app

  beforeEach ->
    Rally.test.apps.roadmapplanningboard.helper.TestDependencyHelper.loadDependencies()
    @ajax.whenQuerying('TypeDefinition').respondWith Rally.test.mock.data.WsapiModelFactory.getModelDefinition('PortfolioItemFeature')
    @ajax.whenQuerying('PortfolioItem/Feature').respondWith []

  afterEach ->
    @app?.destroy()
    Deft.Injector.reset()

  it 'should render a planning board', ->
    @createApp().then =>
      roadmapId = Deft.Injector.resolve('roadmapStore').first().getId()
      planningBoard = @app.down 'roadmapplanningboard'
      expect(planningBoard.roadmapId).toBe roadmapId

  describe 'Service error handling', ->

    it 'should display a friendly notification if any service (planning, timeline, WSAPI) is unavailable', ->
      @createApp().then =>
        Ext.Ajax.fireEvent('requestexception', null, null, { operation: requester: @app })

        expect(@app.getEl().getHTML()).toContain 'temporarily unavailable'