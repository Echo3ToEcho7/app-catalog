Ext = window.Ext4 || window.Ext

describe 'Rally.apps.iterationplanningboard.TimeboxGridBoard', ->
  helpers
    createGridBoard: ->
      @context = Ext.create 'Rally.app.Context',
        initialValues:
          project:
            _ref: '/project/1'
          featureToggles: Rally.alm.FeatureToggle
          subscription: Rally.environment.getContext().getSubscription()
      @gridBoard = Ext.create 'Rally.apps.iterationplanningboard.TimeboxGridBoard',
        renderTo: 'testDiv'
        context: @context
        messageBus: Ext.create 'Rally.MessageBus'
      @waitForComponentReady @gridBoard

  afterEach ->
    if @gridBoard
      @gridBoard.destroy()

  describe 'when there are no iterations', ->
    helpers
      shouldRefreshAfterIterationMessage: (message) ->
        @gridBoard.getGridOrBoard().originalBoard = true

        @gridBoard.publish message,
          get: (key) ->
            if key == '_type'
              return 'iteration'

        @once
          condition: =>
            @gridBoard.getGridOrBoard()? and Ext.isEmpty @gridBoard.getGridOrBoard().originalBoard
          description: 'gridOrBoard refreshed'

    beforeEach ->
      @ajax.whenQuerying('iteration').respondWith([])

    it 'should display blank slate', ->
      @createGridBoard().then =>
        expect(@gridBoard.items.getCount()).toBe 2
        expect(@gridBoard.items.getAt(1).getEl().down('.blank-slate-msg')).not.toBe null

    it 'should include PortfolioItem in columnConfig.additionalFetchFields', ->
      @createGridBoard().then =>
        expect(@gridBoard.getGridOrBoard().columnConfig.additionalFetchFields).toContain 'PortfolioItem'

    it 'should refresh after objectCreate is published', ->
      @createGridBoard().then =>
        @shouldRefreshAfterIterationMessage Rally.Message.objectCreate

    it 'should refresh after objectUpdate is published', ->
      @createGridBoard().then =>
        @shouldRefreshAfterIterationMessage Rally.Message.objectUpdate

    it 'should refresh after objectDestroy is published', ->
      @createGridBoard().then =>
        @shouldRefreshAfterIterationMessage Rally.Message.objectDestroy

    it 'should destroy blank slate', ->
      @createGridBoard().then =>
        @gridBoard.destroy()
        expect(Ext.ComponentQuery.query('rallytimeboxblankslate').length).toBe 0

