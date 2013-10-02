Ext = window.Ext4 || window.Ext

describe 'Rally.apps.storyhierarchy.StoryHierarchyApp', ->

  helpers
    _createApp: (settings) ->
      globalContext = Rally.environment.getContext()
      context = Ext.create 'Rally.app.Context',
        initialValues:
          project: globalContext.getProject()
          workspace: globalContext.getWorkspace()
          user: globalContext.getUser()
          subscription: globalContext.getSubscription()

      options =
        context: context
        renderTo: 'testDiv'

      options.settings = settings if settings?

      @app = Ext.create 'Rally.apps.storyhierarchy.StoryHierarchyApp', options

      @waitForComponentReady @app

  afterEach ->
    Rally.test.destroyComponentsOfQuery 'storyhierarchyapp'

  it 'shows tree of user stories', ->
    @ajax.whenQuerying('userstory').respondWithCount 3,
      values: [
        null,
        null,
        TaskStatus: null
      ]

    @_createApp().then =>

      expandStub = @ajax.whenQuerying('userstory').respondWithCount 1

      #expand last treeItem
      @app.query('rallytreeitem')[2].expandOrCollapse()

      @once(condition: -> expandStub.calledOnce).then =>

        expect(@app.query('rallytreeitem').length).toBe 4

  it 'should display filter info', ->
    @ajax.whenQuerying('userstory').respondWith()

    @_createApp().then =>

      expect(@app.getEl().down('.filterInfo')).toBeInstanceOf(Ext.Element)

  it 'should show project setting label if following a specific project scope', ->
    @ajax.whenQuerying('userstory').respondWith()

    @_createApp(project: '/project/431439').then =>

      @app.down('rallyfilterinfo').tooltip.show()

      tooltipContent = Ext.get(Ext.query('.filterInfoTooltip')[0])

      expect(tooltipContent.dom.textContent.indexOf('Project') > -1).toBe true
      expect(tooltipContent.dom.textContent.indexOf('Project 1') > -1).toBe true

  it 'should show "Following Global Project Setting" label if following global project scope', ->
    @ajax.whenQuerying('project').respondWithCount(1);

    @_createApp().then =>

      @app.down('rallyfilterinfo').tooltip.show()

      tooltipContent = Ext.get(Ext.query('.filterInfoTooltip')[0])

      expect(tooltipContent.dom.textContent).toContain 'Following Global Project Setting'

  it 'should show help component', ->
    @ajax.whenQuerying('userstory').respondWith()

    @_createApp().then =>

      expect(@app.down('#header').getEl().down('.rally-help-icon').dom.innerHTML.indexOf('Help &amp; Training') >= 0).toBe true

  it 'should not add to PI user story query if PortfolioItem field is not available on the model', ->
    @ajax.whenQuerying('userstory').respondWith()

    @_createApp().then =>

      filter = @app._buildQueryFilter(Rally.test.mock.data.ExpressModelFactory.getUserStoryModel());

      expect(filter.toString()).not.toContain 'PortfolioItem'

  it 'should add to PI user story query if PortfolioItem field is available on the model', ->
    @ajax.whenQuerying('userstory').respondWith()

    @_createApp().then =>

      filter = @app._buildQueryFilter(Rally.test.mock.data.WsapiModelFactory.getUserStoryModel());

      expect(filter.toString()).toContain 'PortfolioItem'


  it 'should not create a filter when query string is empty', ->
    @ajax.whenQuerying('userstory').respondWith()
    @_createApp(query: '').then =>

      tree = @app.down('rallytree')

      expect(tree.topLevelStoreConfig.filters.length).toBe 1
      expect(tree.topLevelStoreConfig.filters[0].toString()).toBe '((Parent = "null") AND (PortfolioItem = "null"))'

  it 'should create a filter when non-empty query string', ->
    @ajax.whenQuerying('userstory').respondWith()
    @_createApp(query: '(Name = "blah")').then =>

      tree = @app.down('rallytree')

      expect(tree.topLevelStoreConfig.filters.length).toBe 1
      expect(tree.topLevelStoreConfig.filters[0].toString()).toBe '(((Parent = "null") AND (PortfolioItem = "null")) AND (Name = "blah"))'