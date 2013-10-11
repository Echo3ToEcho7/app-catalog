Ext = window.Ext4 || window.Ext

Ext.require [
  'Rally.ui.report.StandardReport',
  'Rally.apps.kanban.KanbanApp',
  'Rally.util.Array',
  'Rally.util.Element',
  'Rally.ui.notify.Notifier',
  'Rally.app.Context'
]

describe 'Rally.apps.kanban.KanbanApp', ->

  beforeEach ->
    @ajax.whenQuerying('userstory').respondWithCount(1, {
      values: [{
        ScheduleState: 'In-Progress'
      }]
      createImmediateSubObjects: true
    })

    @ajax.whenQuerying('defect').respondWith()

    @projectRef = Rally.environment.getContext().getProject()._ref
    @projectName = 'Project 1'

  afterEach ->
    Rally.test.destroyComponentsOfQuery 'kanbanapp'

  it 'has the correct default settings', ->
    @createApp().then =>
      expect(@app.getSetting('groupByField')).toBe 'ScheduleState'
      expect(@app.getSetting('columns')).toBe Ext.JSON.encode(
        Defined:
          wip: ''
        'In-Progress':
          wip: ''
        Completed:
          wip: ''
        Accepted:
          wip: ''
      )
      expect(@app.getSetting('cardFields')).toBe 'FormattedID,Name,Owner,Discussion,Tasks,Defects'

  it 'does not show add new when user is not a project editor', ->
    Rally.environment.getContext().getPermissions().userPermissions[0].Role = 'Viewer'
    @createApp().then =>

      expect(@app.down 'rallyaddnew').toBeNull()

  it 'shows add new for user who is a project editor', ->
    @createApp().then =>
      expect(@app.down 'rallyaddnew').toBeDefined()

  it 'should not schedule a new item in an iteration', ->
    @createApp().then =>
      editorOpenedStub = @stub(Rally.nav.Manager, 'create')
      addNewHelper = new Helpers.AddNewHelper '.kanban'
      addNewHelper.addWithDetails('foo').then =>
        expect(editorOpenedStub).toHaveBeenCalledOnce()
        expect(editorOpenedStub.getCall(0).args[1].iteration).toBe 'u'

  it 'should set group by field to first column value', ->
    @createApp().then =>
      editorOpenedStub = @stub(Rally.nav.Manager, 'create')
      addNewHelper = new Helpers.AddNewHelper '.kanban'
      addNewHelper.addWithDetails('foo').then =>
        expect(editorOpenedStub).toHaveBeenCalledOnce()
        expect(editorOpenedStub.getCall(0).args[1][@app.getSetting('groupByField')]).toBe @app.cardboard.getColumns()[0].getValue()

  it 'should set custom group by field to first column value', ->
    @createApp(
      groupByField: 'KanbanState'
    ).then =>
      editorOpenedStub = @stub(Rally.nav.Manager, 'create')
      addNewHelper = new Helpers.AddNewHelper '.kanban'
      addNewHelper.addWithDetails('foo').then =>
        expect(editorOpenedStub).toHaveBeenCalledOnce()
        groupByField = "c_#{@app.getSetting('groupByField')}"
        expect(editorOpenedStub.getCall(0).args[1][groupByField]).toBe @app.cardboard.getColumns()[0].getValue()

  it 'should show correct fields on cards', ->
    @createApp({cardFields: 'Name,Defects,Project'}).then =>

      expect(@app.down('rallycardboard').cardConfig.fields).toContain 'Name'
      expect(@app.down('rallycardboard').cardConfig.fields).toContain 'Defects'
      expect(@app.down('rallycardboard').cardConfig.fields).toContain 'Project'

  it 'should show columns with correct wips based on settings', ->
    columnSettings =
      Defined:
        wip: 1
      'In-Progress':
        wip: 2

    @createApp({columns: Ext.JSON.encode(columnSettings), groupByField: 'ScheduleState'}).then =>

      columns = @app.down('rallycardboard').getColumns()
      expect(columns.length).toBe 2
      expect(columns[0].wipLimit).toBe columnSettings.Defined.wip
      expect(columns[1].wipLimit).toBe columnSettings['In-Progress'].wip

  it 'should show columns with correct card fields when COLUMN_LEVEL_FIELD_PICKER_ON_KANBAN_SETTINGS enabled', ->
    @stub(Rally.app.Context.prototype, 'isFeatureEnabled').withArgs('COLUMN_LEVEL_FIELD_PICKER_ON_KANBAN_SETTINGS').returns(true)
    columnSettings =
      Defined:
        cardFields: 'Name,Defects,Project'
      'In-Progress':
        cardFields: 'ScheduleState'

    @createApp({columns: Ext.JSON.encode(columnSettings)}).then =>
      columns = @app.down('rallycardboard').getColumns()

      expect(columns.length).toBe 2
      expect(columns[0].cardConfig.fields).toEqual []
      expect(columns[0].fields).toEqual columnSettings.Defined.cardFields.split(',')
      expect(columns[1].fields).toEqual columnSettings['In-Progress'].cardFields.split(',')
      expect(columns[1].cardConfig.fields).toEqual []

  it 'should show columns with cardFields when no column.cardFields settings', ->
    @stub(Rally.app.Context.prototype, 'isFeatureEnabled').withArgs('COLUMN_LEVEL_FIELD_PICKER_ON_KANBAN_SETTINGS').returns(true)
    columnSettings =
      Defined:
        wip: 1
      'In-Progress':
        wip: 2

    @createApp({cardFields: 'foobar', columns: Ext.JSON.encode(columnSettings)}).then =>
      columns = @app.down('rallycardboard').getColumns()

      expect(columns.length).toBe 2
      expect(columns[0].fields).toEqual ['foobar']
      expect(columns[1].fields).toEqual ['foobar']

  it 'should show columns with defaultCardFields when no cardFields or column.cardFields settings', ->
    @stub(Rally.app.Context.prototype, 'isFeatureEnabled').withArgs('COLUMN_LEVEL_FIELD_PICKER_ON_KANBAN_SETTINGS').returns(true)
    columnSettings =
      Defined:
        wip: 1
      'In-Progress':
        wip: 2
    @createApp({columns: Ext.JSON.encode(columnSettings)}).then =>
      columns = @app.down('rallycardboard').getColumns()

      expect(columns.length).toBe 2
      expect(columns[0].fields).toEqual @app.getSetting('cardFields').split(',')
      expect(columns[1].fields).toEqual @app.getSetting('cardFields').split(',')

  it 'should filter the board when a type checkbox is clicked', ->
    @createApp().then =>
      board = @app.down('rallycardboard')
      filterSpy = @spy board, 'addLocalFilter'

      # Clicking defect will uncheck it as its checked by default
      @click(css: '.defect-type-checkbox input')

      once(
        condition: => filterSpy.calledOnce
        description: 'filter to be called without defect'
      ).then =>
        args = filterSpy.getCall(0).args
        expect(args[1]).toEqual ['hierarchicalrequirement']

      @click(css: '.defect-type-checkbox input')
      once(
        condition: => filterSpy.calledTwice
        description: 'filter to be called with defect'
      ).then =>
        args = filterSpy.getCall(1).args
        expect(args[1]).toEqual ['defect', 'hierarchicalrequirement']

  it 'should contain menu options', ->
    @createApp().then =>
      options = @app.getOptions()

      expect(options.length).toBe 3
      expect(options[0].text).toBe 'Show Cycle Time Report'
      expect(options[1].text).toBe 'Show Throughput Report'
      expect(options[2].text).toBe 'Print'

  it 'should correctly build report config for non schedule state field stories', ->
    @createApp().then =>
      @stub(@app, 'getSetting').returns('KanbanState')
      @stub(@app, '_getShownTypes').returns([{workItemType: 'G'}])
      report_config = @app._buildReportConfig(Rally.ui.report.StandardReport.Reports.CycleLeadTime)

      expect(report_config.filter_field).toBe @app.groupByField.displayName
      expect(report_config.work_items).toBe 'G'
      expect(report_config.report.id).toBe Rally.ui.report.StandardReport.Reports.CycleLeadTime.id

  it 'should correctly build report config for schedule state field with story and defect types', ->
    @createApp().then =>
      report_config = @app._buildReportConfig(Rally.ui.report.StandardReport.Reports.Throughput)

      expect(report_config.filter_field).toBeUndefined()
      expect(report_config.work_items).toBe 'N'
      expect(report_config.report.id).toBe Rally.ui.report.StandardReport.Reports.Throughput.id

  it 'should correctly build standard report component config', ->
    @createApp().then =>
      report_config = {report: 5}
      standard_report_config = @app._buildStandardReportConfig(report_config)

      expect(standard_report_config.project).toBe @app.getContext().getDataContext().project
      expect(standard_report_config.projectScopeDown).toBe @app.getContext().getDataContext().projectScopeDown
      expect(standard_report_config.projectScopeUp).toBe @app.getContext().getDataContext().projectScopeUp
      expect(standard_report_config.reportConfig).toBe report_config

  it 'should exclude items with a release set in the last column', ->
    @createApp(hideReleasedCards: true).then =>
      columns = @app.down('rallycardboard').getColumns()
      lastColumn = columns[columns.length-1]

      expect(lastColumn.storeConfig.filters.length).toBe 1
      expect(lastColumn.storeConfig.filters[0].property).toBe 'Release'
      expect(lastColumn.storeConfig.filters[0].value).toBeNull()

  it 'should not exclude items with a release set in the last column', ->
    @createApp(hideReleasedCards: false).then =>
      columns = @app.down('rallycardboard').getColumns()
      lastColumn = columns[columns.length-1]

      expect(lastColumn.storeConfig.filters.length).toBe 0

  it 'should show filter info when following global project', ->
    @createApp().then =>
      filterInfo = @app.down('rallyfilterinfo')
      expect(filterInfo.getProjectName()).toBe 'Following Global Project Setting'

  it 'should show filter info when scoped to a specific project', ->
    projectScopeUp = true
    projectScopeDown = false
    @createApp({project: @projectRef}, null,
      project: {_ref: @projectRef, Name: 'blah'}
      projectScopeUp: projectScopeUp
      projectScopeDown: projectScopeDown
    ).then =>
      filterInfo = @app.down('rallyfilterinfo')
      expect(filterInfo.getProjectName()).toBe @app.getContext().getProject().Name
      expect(filterInfo.getScopeUp()).toBe projectScopeUp
      expect(filterInfo.getScopeDown()).toBe projectScopeDown

  it 'should show filter info when a query is set', ->
    query = '(Name contains Foo)'
    @createApp(query: query).then =>
      filterInfo = @app.down('rallyfilterinfo')
      expect(filterInfo.getQuery()).toBe query

  it 'should show plan estimate when plan estimate field is enabled', ->
    @createApp(cardFields: "Name,Discussion,Tasks,Defects,PlanEstimate").then =>
      expect(@app.getEl().down('.PlanEstimate')).not.toBeNull()

  it 'should not show plan estimate when plan estimate field is disabled', ->
    @createApp(cardFields: "Name,Discussion,Tasks,Defects").then =>
      expect(@app.getEl().down('.rui-card-content')).toBeDefined()
      expect(@app.getEl().down('.PlanEstimate')).toBeNull()

  it 'should specify the correct policy preference setting key', ->
    policy = 'Foo'
    settingsKey = 'ScheduleStateDefinedPolicy'
    settings = {}
    settings[settingsKey] = policy
    @createApp(settings).then =>
      @assertPolicyCmpConfig(settingsKey, policy)

  it 'should load legacy non field scoped policy setting', ->
    policy = 'Foo'
    settingsKey = 'ScheduleStateDefinedPolicy'
    settings = {}
    settings['DefinedPolicy'] = policy
    @createApp(settings).then =>
      @assertPolicyCmpConfig(settingsKey, policy)

  it 'should load policy setting when column has WSAPI 2.x c_ prefix', ->
    policy = 'Foo'
    groupByRoot = 'SomeCustomField'
    groupByField = 'c_' + groupByRoot
    settingsKey = groupByRoot + "DefinedPolicy"
    settings = {}
    settings.groupByField = groupByField
    settings[settingsKey] = policy

    @createApp(settings).then =>
      @assertPolicyCmpConfig('c_' + settingsKey, policy)

  it 'should be able to scroll forwards', ->
    @createApp({},
      renderTo: @createSmallContainer()
    ).then =>
      indexOfLastVisibleColumn = Ext.Array.indexOf(@app.down('rallycardboard').getColumns(), Rally.util.Array.last @app.down('rallycardboard').getVisibleColumns())
      columnToShow = @app.down('rallycardboard').getColumns()[indexOfLastVisibleColumn + 1]
      expect(columnToShow.hidden).toBe true
      @click(className: 'scroll-forwards').then =>
        expect(columnToShow.hidden).toBe false

  it 'should be able to scroll backwards', ->
    @createApp({},
      renderTo: @createSmallContainer()
    ).then =>
      columnToShow = @app.down('rallycardboard').getColumns()[0]
      expect(columnToShow.hidden).toBe false
      @click(className: 'scroll-forwards').then =>
        expect(columnToShow.hidden).toBe true
        @click(className: 'scroll-backwards').then =>
          expect(columnToShow.hidden).toBe false

  it 'should show warning message when workspace DnD ranking disabled', ->
    warningStub = @stub(Rally.ui.notify.Notifier, 'showWarning')
    @createApp({},
      DragDropRankingEnabled: false
    ).then =>
      expect(warningStub).toHaveBeenCalledOnce()
      args = warningStub.getCall(0).args[0]
      expect(args.message).toBe Rally.ui.gridboard.plugin.GridBoardDnDWarning.DRAG_AND_DROP_DISABLED_WARNING

  it 'should show a warning message when an invalid filter was specified', ->
    notificationStub = @stub(Rally.ui.notify.Notifier, 'showError')
    @createApp(query: '(Foo = Bar)').then =>
      expect(notificationStub).toHaveBeenCalled()
      args = notificationStub.getCall(0).args[0]
      expect(args.message).toBe 'Invalid query: (Foo = Bar)'

  it 'should have correct icons on cards', ->
    @createApp().then =>
      expect(@app.getEl().query('.rally-card-icon').length).toBe 5
      expect(@app.getEl().query('.card-gear-icon').length).toBe 1
      expect(@app.getEl().query('.card-plus-icon').length).toBe 1
      expect(@app.getEl().query('.card-ready-icon').length).toBe 1
      expect(@app.getEl().query('.card-blocked-icon').length).toBe 1
      expect(@app.getEl().query('.card-color-icon').length).toBe 1



  helpers
    createApp: (settings = {}, options = {}, context = {}) ->
      @app = Ext.create 'Rally.apps.kanban.KanbanApp',
        context: Ext.create('Rally.app.Context',
          initialValues:
            Ext.merge({
              project:
                _ref: @projectRef
                Name: @projectName
              workspace:
                WorkspaceConfiguration:
                  DragDropRankingEnabled: if Ext.isDefined(options.DragDropRankingEnabled) then options.DragDropRankingEnabled else true},
              context)
        )
        settings: settings
        renderTo: options.renderTo || 'testDiv'

      @waitForComponentReady @app

    createSmallContainer: ->
      Ext.get('testDiv').createChild
        style:
          width: '500px'

    assertPolicyCmpConfig: (settingsKey, policy) ->
      column = @app.down('rallycardboard').getColumns()[0]
      plugin = _.find(column.plugins, {ptype: 'rallycolumnpolicy'});
      prefConfigSettings = plugin.policyCmpConfig.prefConfig.settings
      expect(Ext.Object.getKeys(prefConfigSettings)[0]).toBe settingsKey
      expect(prefConfigSettings[settingsKey]).toBe policy
      expect(plugin.policyCmpConfig.policies).toBe policy
