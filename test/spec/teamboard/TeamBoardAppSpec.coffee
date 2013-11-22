Ext = window.Ext4 || window.Ext

Ext.require [
  'Rally.apps.teamboard.TeamBoardProjectRecordsLoader'
]

describe 'Rally.apps.teamboard.TeamBoardApp', ->

  helpers
    assertFieldsShownOnCard: (fieldNames) ->
      cardEl = @cardboard().getColumns()[0].getCards()[0].getEl()

      expect(cardEl.query('.field-content').length).toBe fieldNames.length

      for fieldName in fieldNames
        expect(cardEl.down('.field-content.' + fieldName)).not.toBeNull()

    assertFilter: (filter, property, operator, value) ->
      expect(filter.property).toBe property
      expect(filter.operator).toBe operator
      expect(filter.value).toBe value

    cardboard: ->
      @app.down('.rallycardboard')

    createApp: (options = {}) ->
      @stubIsAdmin if options.isAdmin? then options.isAdmin else true
      @stubProjectRecords options.projectRecords || @projectRecords

      @app = Ext.create 'Rally.apps.teamboard.TeamBoardApp', Ext.apply(
        context: Ext.create 'Rally.app.Context'
      , options.appConfig)

      if options.appConfig?.renderTo then @waitForComponentReady(@app) else webdriver.promise.fulfilled(@app)

    stubIsAdmin: (isAdmin) ->
      @stub(Rally.environment.getContext().getPermissions(), 'isWorkspaceOrSubscriptionAdmin').returns isAdmin

    stubProjectRecords: (projectRecords) ->
      @stub Rally.apps.teamboard.TeamBoardProjectRecordsLoader, 'load', (teamOids, callback, scope) ->
        callback.call scope, projectRecords

  beforeEach ->
    @ajax.whenQuerying('user').respondWith @mom.getData('user')

    @projectRecords = @mom.getRecords 'project',
      count: 4

  afterEach ->
    @app?.destroy()

  it 'should show a message when user does not have access to any of the teams chosen', ->
    @createApp(
      projectRecords: []
      appConfig:
        renderTo: 'testDiv'
    ).then =>
      expect(@app.getEl().down('.no-data')).not.toBe null

  it 'should show a board with one column per team', ->
    @createApp().then =>
      expect(@cardboard().columns.length).toBe @projectRecords.length

  it 'should show non-disabled team members in each column', ->
    @createApp(
      appConfig:
        renderTo: 'testDiv'
    ).then =>
      filters = @cardboard().getColumns()[0].store.filters
      expect(filters.getCount()).toBe 2
      @assertFilter filters.getAt(0), 'TeamMemberships', 'contains', @projectRecords[0].get('_ref')
      @assertFilter filters.getAt(1), 'Disabled', '=', 'false'

  it 'should create a readOnly board when current user is not an admin', ->
    @createApp(
      isAdmin: false
    ).then =>
      expect(@cardboard().readOnly).toBe true

  it 'should create a drag-n-drop-able board when current user is an admin', ->
    @createApp(
      isAdmin: true
    ).then =>
      expect(@cardboard().readOnly).toBe false

  it 'should show the team name in the column header', ->
    @createApp(
      appConfig:
        renderTo: 'testDiv'
    ).then =>
      headerHtml = @cardboard().getColumns()[0].getHeaderTitle().getEl().down('.columnTpl').getHTML()
      Assert.contains headerHtml, @projectRecords[0].get('_refObjectName')

  it 'should show OfficeLocation and Phone on the cards by default', ->
    @createApp(
      appConfig:
        renderTo: 'testDiv'
    ).then =>
      @assertFieldsShownOnCard ['OfficeLocation', 'Phone']

  it 'should show the chosen card fields on the cards', ->
    @createApp(
      appConfig:
        renderTo: 'testDiv'
        settings:
          cardFields: 'EmailAddress,OnpremLdapUsername'
    ).then =>
      @assertFieldsShownOnCard ['EmailAddress', 'OnpremLdapUsername']

  it 'should not show card fields not visible to non-admins when user is a non-admin', ->
    @createApp(
      appConfig:
        renderTo: 'testDiv'
        settings:
          cardFields: 'EmailAddress,OnpremLdapUsername'
      isAdmin: false
    ).then =>
      @assertFieldsShownOnCard ['EmailAddress']