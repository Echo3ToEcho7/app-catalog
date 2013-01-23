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
            Ext.isEmpty @gridBoard.getGridOrBoard().originalBoard
          description: 'gridOrBoard refreshed'

    beforeEach ->
      @ajax.whenQuerying('iteration').respondWith([])
      @createGridBoard()

    it 'should display blank slate', ->
      expect(@gridBoard.items.getCount()).toBe 2
      expect(@gridBoard.items.getAt(1).getEl().down('.blank-slate-msg')).not.toBe null

    it 'should include PortfolioItem in columnConfig.additionalFetchFields', ->
      expect(@gridBoard.getGridOrBoard().columnConfig.additionalFetchFields).toContain 'PortfolioItem'

    it 'should refresh after objectCreate is published', ->
      @shouldRefreshAfterIterationMessage Rally.Message.objectCreate

    it 'should refresh after objectUpdate is published', ->
      @shouldRefreshAfterIterationMessage Rally.Message.objectUpdate

    it 'should refresh after objectDestroy is published', ->
      @shouldRefreshAfterIterationMessage Rally.Message.objectDestroy
