Ext = window.Ext4 || window.Ext

Ext.require [
  'Rally.apps.board.BoardApp',
]

describe 'Rally.apps.board.BoardApp', ->

  beforeEach ->
    @ajax.whenQuerying('userstory').respondWithCount(1, {
      values: [{
        ScheduleState: 'In-Progress'
      }]
      createImmediateSubObjects: true
    })

    @ajax.whenQueryingAllowedValues('hierarchicalrequirement', 'ScheduleState').respondWith ['Defined', 'In-Progress', 'Completed', 'Accepted']
    @ajax.whenQueryingAllowedValues('defect', 'State').respondWith ['Submitted', 'Open', 'Fixed', 'Closed']

  afterEach ->
    Rally.test.destroyComponentsOfQuery 'boardapp'

  it 'has the correct default settings', ->
    @createApp().then =>
      expect(@app.getSetting('groupByField')).toBe 'ScheduleState'
      expect(@app.getSetting('type')).toBe 'HierarchicalRequirement'
      expect(@app.getSetting('pageSize')).toBe 25
      expect(@app.getSetting('order')).toBe 'Rank'
      expect(@app.getSetting('query')).toBe ''
      expect(@app.getSetting('fields')).toBe 'FormattedID,Name,Owner'

  it 'should show correct fields on cards', ->
    @createApp(fields: 'Name,Defects,Project').then =>

      expect(@_getBoard().cardConfig.fields).toContain 'Name'
      expect(@_getBoard().cardConfig.fields).toContain 'Defects'
      expect(@_getBoard().cardConfig.fields).toContain 'Project'

  it 'shows the correct type on the board', ->
    @createApp(type: 'Defect', groupByField: 'State').then =>

      expect(@_getBoard().getTypes().length).toBe 1
      expect(@_getBoard().getTypes()[0]).toBe 'Defect'

  it 'groups by the correct attribute on the board', ->
    @createApp(type: 'Defect', groupByField: 'State').then =>

      expect(@_getBoard().getAttribute()).toBe 'State'

  it 'passes the current context to the board', ->
    @createApp({}, context:
      project:
        _ref: '/project/2'
    ).then =>

      expect(@_getBoard().getContext().getProject()._ref).toBe '/project/2'

  it 'passes the page size to the board', ->
    @createApp(pageSize: 1).then =>

      expect(@_getBoard().getStoreConfig().pageSize).toBe 1

  it 'passes the filters to the board', ->
    query = '(Name contains foo)'
    @createApp(query: query).then =>

      expect(@_getBoard().getStoreConfig().filters.length).toBe 1
      expect(@_getBoard().getStoreConfig().filters[0].toString())
        .toBe Rally.data.QueryFilter.fromQueryString(query).toString()

  it 'scopes the board to the current timebox scope', ->
    @createApp({}, context:
      timebox: @_createIterationRecord()
    ).then =>

      expect(@_getBoard().getStoreConfig().filters.length).toBe 1
      expect(@_getBoard().getStoreConfig().filters[0].toString())
        .toBe @app.getContext().getTimeboxScope().getQueryFilter().toString()

  it 'scopes the board to the current timebox scope and specified query filter', ->
    query = '(Name contains foo)'
    @createApp({query: query}, context:
        timebox: @_createIterationRecord()
    ).then =>

      expect(@_getBoard().getStoreConfig().filters.length).toBe 2
      expect(@_getBoard().getStoreConfig().filters[0].toString())
        .toBe Rally.data.QueryFilter.fromQueryString(query).toString()

      expect(@_getBoard().getStoreConfig().filters[1].toString())
        .toBe @app.getContext().getTimeboxScope().getQueryFilter().toString()

  it 'refreshes the board when the timebox scope changes', ->
    newTimebox = @_createIterationRecord(
      _ref: '/iteration/2'
      Name: 'Iteration 2',
      StartDate: '2012-01-01',
      EndDate: '2012-01-15'
    )

    @createApp({}, context:
      timebox: @_createIterationRecord()
    ).then =>

      refreshSpy = @spy(@_getBoard(), 'refresh')
      Rally.environment.getMessageBus().publish(Rally.app.Message.timeboxScopeChange,
        Ext.create('Rally.app.TimeboxScope', record: newTimebox))

      @once(condition: -> refreshSpy.calledOnce).then =>

        filters = refreshSpy.getCall(0).args[0].storeConfig.filters
        expect(filters.length).toBe 1
        expect(filters[0].toString())
          .toBe @app.getContext().getTimeboxScope().getQueryFilter().toString()

  it 'returns settings fields with correct context', ->
    @createApp().then =>

      getFieldsSpy = @spy(Rally.apps.board.Settings, 'getFields')
      settingsFields = @app.getSettingsFields()

      expect(getFieldsSpy).toHaveBeenCalledOnce()
      expect(getFieldsSpy.getCall(0).returnValue).toBe settingsFields
      expect(getFieldsSpy.getCall(0).args[0]).toBe @app.getContext()

  helpers
    createApp: (settings = {}, options = {}) ->
      @app = Ext.create 'Rally.apps.board.BoardApp',
        context: @_createContext options.context
        settings: settings
        renderTo: options.renderTo || 'testDiv'

      @waitForComponentReady @_getBoard()

    _createContext: (context={}) ->
      Ext.create('Rally.app.Context',
        initialValues: Ext.apply(
          project:
            _ref: '/project/1'
            Name: 'Project 1'
          workspace:
            WorkspaceConfiguration:
              DragDropRankingEnabled: true
        , context)
      )

    _createIterationRecord: (data={}) ->
      IterationModel = Rally.test.mock.data.WsapiModelFactory.getIterationModel()
      Ext.create(IterationModel, Ext.apply(
        _ref: '/iteration/1',
        Name: 'Iteration 1',
        StartDate: '2013-01-01',
        EndDate: '2013-01-15'
      , data))

    _getBoard: ->
      @app.down('rallycardboard')