Ext = window.Ext4 || window.Ext

Ext.require [
  'Rally.util.DateTime',
  'Rally.app.Context'
]

describe 'Rally.apps.iterationtrackingboard.IterationTrackingBoardApp', ->

  helpers
    createApp: (config)->
      now = new Date(1384305300 * 1000);
      tomorrow = Rally.util.DateTime.add(now, 'day', 1)
      nextDay = Rally.util.DateTime.add(tomorrow, 'day', 1)
      dayAfter = Rally.util.DateTime.add(nextDay, 'day', 1)
      @iterationData = [
        {Name:'Iteration 1', _ref:'/iteration/0', StartDate: now, EndDate: tomorrow}
        {Name:'Iteration 2', _ref:'/iteration/2', StartDate: nextDay, EndDate: dayAfter}
      ]

      @IterationModel = Rally.test.mock.data.WsapiModelFactory.getIterationModel()
      @iterationRecord = new @IterationModel @iterationData[0]

      @app = Ext.create('Rally.apps.iterationtrackingboard.IterationTrackingBoardApp', Ext.apply(
        context: Ext.create('Rally.app.Context',
          initialValues:
            timebox: @iterationRecord
            project:
              _ref: @projectRef
        ),
        renderTo: 'testDiv'
      , config))

      @waitForComponentReady(@app)

    getIterationFilter: ->
      iteration = @iterationData[0]

      [
        { property: 'Iteration.Name', operator: '=', value: iteration.Name }
        { property: "Iteration.StartDate", operator: '=', value: Rally.util.DateTime.toIsoString(iteration.StartDate) }
        { property: "Iteration.EndDate", operator: '=', value: Rally.util.DateTime.toIsoString(iteration.EndDate) }
      ]

    stubRequests: ->
      @ajax.whenQueryingAllowedValues('userstory', 'ScheduleState').respondWith(["Defined", "In-Progress", "Completed", "Accepted"]);

      @ajax.whenQuerying('artifact').respondWith [{
        RevisionHistory: {
          _ref: '/revisionhistory/1'
        }
      }]

    toggleToGridOrBoard: (view) ->
      toggler = @app.gridboard.down('rallygridboardtoggle')
      toggler.applyState toggle: view
      toggler.fireEvent 'toggle', view

    toggleToBoard: ->
      @toggleToGridOrBoard('board')

    toggleToGrid: ->
      @toggleToGridOrBoard('grid')

    stubFeatureToggle: (toggles) ->
      stub = @stub(Rally.app.Context.prototype, 'isFeatureEnabled');
      stub.withArgs(toggle).returns(true) for toggle in toggles
      stub

  beforeEach ->
    @ajax.whenReading('project').respondWith {
      TeamMembers: []
      Editors: []
    }

    @stubRequests()

    @tooltipHelper = new Helpers.TooltipHelper this

  afterEach ->
    @app?.destroy()

  describe 'when blank slate is not shown', ->
    it 'should show field picker in settings ', ->
      @createApp(isShowingBlankSlate: -> false).then =>
        @app.showFieldPicker = true
        expect(Ext.isObject(_.find(@app.getSettingsFields(), name: 'cardFields'))).toBe true

  describe 'when blank slate is shown', ->
    it 'should not show field picker in settings ', ->
      @createApp(isShowingBlankSlate: -> true).then =>
        @app.showFieldPicker = true
        expect(Ext.isEmpty(_.find(@app.getSettingsFields(), name: 'cardFields'))).toBe true

  it 'resets view on scope change', ->
    @createApp().then =>
      removeStub = @stub(@app, 'remove')

      newScope = Ext.create('Rally.app.TimeboxScope',
        record: new @IterationModel @iterationData[1]
      )

      @app.onTimeboxScopeChange newScope

      expect(removeStub).toHaveBeenCalledOnce()
      expect(removeStub).toHaveBeenCalledWith 'gridBoard'

      expect(@app.down('#gridBoard')).toBeDefined()

  it 'fires contentupdated event after board load', ->
    contentUpdatedHandlerStub = @stub()
    @createApp(
      listeners:
        contentupdated: contentUpdatedHandlerStub
    ).then =>
      contentUpdatedHandlerStub.reset()
      @app.gridboard.fireEvent('load')

      expect(contentUpdatedHandlerStub).toHaveBeenCalledOnce()

  it 'should include PortfolioItem in columnConfig.additionalFetchFields', ->
    @createApp().then =>

      expect(@app.gridboard.getGridOrBoard().columnConfig.additionalFetchFields).toContain 'PortfolioItem'

  it 'should have a default card fields setting', ->
    @createApp().then =>
      expect(@app.getSetting('cardFields')).toBe 'Parent,Tasks,Defects,Discussion,PlanEstimate'

  it 'should filter the grid to the currently selected iteration', ->
    @stubFeatureToggle ['EXT4_GRID_BULK_EDIT', 'ITERATION_TRACKING_BOARD_GRID_TOGGLE']
    @createApp().then =>
      @toggleToGrid()
      expect(@app.down('#gridBoard').getGridOrBoard().enableBulkEdit).toBe true

  it 'should filter the grid to the currently selected iteration', ->
    @stubFeatureToggle ['ITERATION_TRACKING_BOARD_GRID_TOGGLE']
    requestStub = @stubRequests()

    @createApp().then =>
      @toggleToGrid()

      expect(requestStub).toBeWsapiRequestWith filters: @getIterationFilter()

  it 'should filter the board to the currently selected iteration', ->
    @stubFeatureToggle ['ITERATION_TRACKING_BOARD_GRID_TOGGLE']
    requests = @stubRequests()

    @createApp().then =>
      @toggleToBoard()

      expect(request).toBeWsapiRequestWith(filters: @getIterationFilter()) for request in requests

  it 'should show the filter control button in the board mode', ->
    @stubFeatureToggle ['ITERATION_TRACKING_BOARD_GRID_TOGGLE', 'F4359_FILTER']

    @createApp().then =>
      @toggleToBoard()
      expect(@app.down('rallyfiltercontrol').isVisible()).toBeTruthy()

  it 'should not show the filter control button in the board mode when feature not enabled', ->
    @stubFeatureToggle ['ITERATION_TRACKING_BOARD_GRID_TOGGLE']

    @createApp().then =>
      @toggleToBoard()
      expect(@app.down('rallyfiltercontrol')).toBeNull()


  it 'should not show the filter control button in the grid mode', ->
    @stubFeatureToggle ['ITERATION_TRACKING_BOARD_GRID_TOGGLE', 'F4359_FILTER']

    @createApp().then =>
      @toggleToGrid()
      expect(@app.down('rallyfiltercontrol').isVisible()).toBeFalsy()

  describe '#getSettingsFields', ->

    describe 'when user is opted into beta tracking experience', ->

      it 'should have grid and board fields', ->
        @stubFeatureToggle ['ITERATION_TRACKING_BOARD_GRID_TOGGLE']

        @createApp().then =>
          settingsFields = @app.getSettingsFields()

          expect(_.find(settingsFields, {settingsType: 'grid'})).toBeTruthy()
          expect(_.find(settingsFields, {settingsType: 'board'})).toBeTruthy()

    describe 'when user is NOT opted into beta tracking experience', ->

      it 'should not have grid and board fields when BETA_TRACKING_EXPERIENCE is disabled', ->
        @createApp().then =>
          settingsFields = @app.getSettingsFields()

          expect(_.find(settingsFields, {settingsType: 'grid'})).toBeFalsy()
          expect(_.find(settingsFields, {settingsType: 'board'})).toBeTruthy()
