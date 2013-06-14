Ext = window.Ext4 || window.Ext

Ext.require [
  'Rally.apps.teamboard.TeamBoardProjectRecordsLoader'
]

describe 'Rally.apps.teamboard.TeamBoardApp', ->
  beforeEach ->
    @ajax.whenQuerying('user').respondWith @mom.getData('user')

    @projectRecords = @mom.getRecords 'project',
      count: 15

  afterEach ->
    @app?.destroy()

  it 'should show a message when user does not have access to any of the teams chosen', ->
    @createApp(
      projectRecords: []
    ).then =>
      expect(@app.getEl().down('.no-data')).not.toBe null

  it 'should show a board with one column per team', ->
    @createApp(
      projectRecords: @projectRecords
    ).then =>
      expect(@cardboard().columns.length).toBe @projectRecords.length

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
    @createApp().then =>
      headerHtml = @cardboard().getColumns()[0].getHeaderTitle().getEl().down('.columnTpl').getHTML()
      Assert.contains headerHtml, @projectRecords[0].get('_refObjectName')

  it 'should show OfficeLocation and Phone on the cards by default', ->
    @createApp().then =>
      @assertFieldsShownOnCard ['OfficeLocation', 'Phone']

  it 'should show the chosen card fields on the cards', ->
    @createApp(
      appConfig:
        settings:
          cardFields: 'EmailAddress,OnpremLdapUsername'
    ).then =>
      @assertFieldsShownOnCard ['EmailAddress', 'OnpremLdapUsername']

  it 'should not show card fields not visible to non-admins when user is a non-admin', ->
    @createApp(
      appConfig:
        settings:
          cardFields: 'EmailAddress,OnpremLdapUsername'
      isAdmin: false
    ).then =>
      @assertFieldsShownOnCard ['EmailAddress']

  helpers
    assertFieldsShownOnCard: (fieldNames) ->
      cardEl = @cardboard().getColumns()[0].getCards()[0].getEl()

      expect(cardEl.query('.field-content').length).toBe fieldNames.length

      for fieldName in fieldNames
        expect(cardEl.down('.field-content.' + fieldName)).not.toBe null

    cardboard: ->
      @app.down('.rallycardboard')

    createApp: (options = {}) ->
      @stubIsAdmin if options.isAdmin? then options.isAdmin else true
      @stubProjectRecords options.projectRecords || @projectRecords

      @app = Ext.create 'Rally.apps.teamboard.TeamBoardApp', Ext.apply(
        context: Ext.create 'Rally.app.Context'
        renderTo: 'testDiv'
      , options.appConfig)

      @waitForComponentReady @app

    stubIsAdmin: (isAdmin) ->
      @stub(Rally.environment.getContext().getPermissions(), 'isWorkspaceOrSubscriptionAdmin').returns isAdmin

    stubProjectRecords: (projectRecords) ->
      @stub Rally.apps.teamboard.TeamBoardProjectRecordsLoader, 'load', (teamOids, callback, scope) ->
        callback.call scope, projectRecords