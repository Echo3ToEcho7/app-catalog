Ext = window.Ext4 || window.Ext

describe 'Rally.apps.portfoliokanban.PortfolioKanbanApp', ->

  helpers

    _createApp: (settings) ->
      globalContext = Rally.environment.getContext()
      context = Ext.create 'Rally.app.Context',
        initialValues:
          project:globalContext.getProject()
          workspace:globalContext.getWorkspace()
          user:globalContext.getUser()
          subscription:globalContext.getSubscription(),
          featureToggles:Rally.alm.FeatureToggle

      options =
        context: context,
        renderTo: 'testDiv'

      options.settings = settings if settings?

      @app = Ext.create('Rally.apps.portfoliokanban.PortfolioKanbanApp', options)

      @waitForComponentReady @app

    _getTextsForElements: (cssQuery) ->
      Ext.Array.map(@app.getEl().query(cssQuery), (el) -> el.innerHTML).join('__')

  beforeEach ->

    @toggleStub = @stub(Rally.alm.FeatureToggle, "isEnabled")

    @ajax.whenQuerying('typedefinition').respondWith([
      {
        '_ref':'/typedefinition/1'
        ObjectID:'1'
        Ordinal:1
        Name:'Feature'
        TypePath:'PortfolioItem/Feature'
      }
    ])

  afterEach ->
    if @app?
      if @app.down('rallyfilterinfo')?.tooltip?
        @app.down('rallyfilterinfo').tooltip.destroy()

      @app.destroy()

  it 'loads type with ordinal of 1 if no type setting is provided', ->

    @_createApp().then (app) =>

      expect(app.currentType.get('_ref')).toEqual '/typedefinition/1'
      expect(app.currentType.get('Name')).toEqual 'Feature'

  it 'shows help component', ->
    @_createApp().then (app) =>

      expect(@app.down('#header').getEl().down('.rally-help-icon').dom.innerHTML).toContain 'Help &amp; Training'

  it 'shows ShowPolicies checkbox', ->
    @_createApp().then (app) =>

      expect(@app.down('#header').el.down('input[type="button"]')).toHaveCls 'showPoliciesCheckbox'

  it 'creates columns from states', ->
    @ajax.whenQuerying('state').respondWith([
      {
        '_type': "State"
        'Name': "Column1"
        '_ref': '/state/1'
        'WIPLimit': 4
      },
      {
        '_type': "State"
        'Name': "Column2"
        '_ref': '/state/2'
        'WIPLimit': 3
      }
    ])

    app = @_createApp(type:'/typedefinition/1').then =>

      expect(@app.down('#bodyContainer').query('.rallykanbancolumn').length).toEqual 3

  it 'shows message if no states are found', ->
    @ajax.whenQuerying('state').respondWith()

    @_createApp().then (app) =>

      expect(@app.el.dom.textContent).toContain "This Type has no states defined."

  it 'displays filter icon', ->
    @_createApp().then (app) =>

      expect(app.getEl().down('.filterInfo') instanceof Ext.Element).toBeTruthy()

  it 'shows project setting label if following a specific project scope', ->

    @_createApp(
      project: '/project/431439'
    ).then (app) =>

      app.down('rallyfilterinfo').tooltip.show()

      tooltipContent = Ext.get Ext.query('.filterInfoTooltip')[0]

      expect(tooltipContent.dom.textContent).toContain 'Project'
      expect(tooltipContent.dom.textContent).toContain 'Project 1'

  it 'shows "Following Global Project Setting" in project setting label if following global project scope', ->
    @ajax.whenQuerying('project').respondWith([
      {
        Name: 'Test Project'
        '_ref': '/project/2'
      }
    ])

    @_createApp().then (app) =>

      app.down('rallyfilterinfo').tooltip.show()

      tooltipContent = Ext.get Ext.query('.filterInfoTooltip')[0]

      expect(tooltipContent.dom.textContent).toContain 'Following Global Project Setting'

  it 'shows Discussion on Card', ->
    @ajax.whenQuerying('state').respondWith([
      {
        '_type': "State"
        'Name': "Column1"
        '_ref': '/state/1'
        'WIPLimit': 4
      }
    ])
    feature =
      ObjectID: 878
      _ref: '/portfolioitem/feature/878'
      FormattedID: 'F1'
      Name: 'Name of first PI'
      Owner:
        _ref: '/user/1'
        _refObjectName: 'Name of Owner'
      State: '/state/1'
      Discussion: [
        ObjectID: 5940385
        _ref: '/conversationpost/5940385'
      ]

    @ajax.whenQuerying('PortfolioItem/Feature').respondWith [feature]

    @_createApp().then (app) =>

      expect(app.down('.rallyportfoliokanbancard').getEl().down('.status-field.Discussion')).not.toBeNull()

  it 'displays mandatory fields on the cards', ->
    @ajax.whenQuerying('state').respondWith([
      {
        '_type': "State"
        'Name': "Column1"
        '_ref': '/state/1'
        'WIPLimit': 4
      }
    ])
    feature =
      ObjectID: 878
      _ref: '/portfolioitem/feature/878'
      FormattedID: 'F1'
      Name: 'Name of first PI'
      Owner:
        _ref: '/user/1'
        _refObjectName: 'Name of Owner'
      State: '/state/1'

    @ajax.whenQuerying('PortfolioItem/Feature').respondWith [feature]

    @_createApp().then (app) =>

      expect(@_getTextsForElements('.field-content')).toContain feature.Name
      expect(@_getTextsForElements('.card-header-left')).toContain feature.FormattedID
      expect(@_getTextsForElements('.card-owner-name')).toContain feature.Owner._refObjectName

  it 'creates loading mask with unique id', ->
    @_createApp().then (app) =>

      expect(app.getMaskId()).toBe('btid-portfolio-kanban-board-load-mask-' + app.id)
