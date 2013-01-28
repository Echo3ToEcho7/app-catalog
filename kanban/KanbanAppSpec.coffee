Ext = window.Ext4 || window.Ext

describe 'Rally.apps.kanban.App', ->

  beforeEach ->
    @ajax.whenQuerying('userstory').respondWith()
    @ajax.whenQuerying('defect').respondWith()

    @projectRef = Rally.environment.getContext().getProject()._ref

  afterEach ->
    @app?.destroy()

  it 'has the correct default settings', ->
    @createApp()

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
    expect(@app.getSetting('cardFields')).toBe 'Name,Discussion,Tasks,Defects'

  it 'does not show add new when user is not a project editor', ->
    Rally.environment.getContext().getPermissions().userPermissions[0].Role = 'Viewer'
    @createApp()

    Assert.isNull @app.down 'rallyaddnew'

  it 'shows add new for user who is a project editor', ->
    @createApp()
    Assert.isObject @app.down 'rallyaddnew'

  it 'should show correct fields on cards', ->
    @createApp({cardFields: 'Name,Defects,Project'});

    Assert.arrayContains @app.down('rallycardboard').cardConfig.fields, 'Name'
    Assert.arrayContains @app.down('rallycardboard').cardConfig.fields, 'Defects'
    Assert.arrayContains @app.down('rallycardboard').cardConfig.fields, 'Project'

  it 'should show columns with correct wips based on settings', ->
    columnSettings = {
      Defined: {wip: 1},
      'In-Progress': {wip: 2}
    }
    @createApp({columns: Ext.JSON.encode(columnSettings), groupByField: 'ScheduleState'})

    columns = @app.down('rallycardboard').getColumns()
    Assert.areEqual(2, columns.length)
    Assert.areEqual(columnSettings.Defined.wip, columns[0].wipLimit);
    Assert.areEqual(columnSettings['In-Progress'].wip, columns[1].wipLimit);

  it 'should filter the board when a type checkbox is clicked', ->
    @createApp()
    board = @app.down('rallycardboard')
    filterSpy = @spy board, 'addLocalFilter'

#   Clicking defect will uncheck it as its checked by default
    @driver.findElement(By.css('.defect-type-checkbox input')).click()

    once(
      condition: => filterSpy.calledOnce
      description: 'filter to be called without defect'
    ).then =>
      args = filterSpy.getCall(0).args
      expect(args[1]).toEqual ['hierarchicalrequirement']

    @driver.findElement(By.css('.defect-type-checkbox input')).click()
    once(
      condition: => filterSpy.calledTwice
      description: 'filter to be called with defect'
    ).then =>
      args = filterSpy.getCall(1).args
      expect(args[1]).toEqual ['hierarchicalrequirement', 'defect']

  it 'should contain menu options', ->
    @createApp()
    options = @app.getOptions()

    Assert.areEqual(3, options.length)
    Assert.areEqual('Show Cycle Time Report', options[0].text)
    Assert.areEqual('Show Throughput Report', options[1].text)
    Assert.areEqual('Print', options[2].text)

  it 'should correctly build report config for non schedule state field stories', ->
    @createApp()
    @stub(@app, 'getSetting').returns('KanbanState')
    @stub(@app, '_getShownTypes').returns([{workItemType: 'G'}])
    report_config = @app._buildReportConfig(Rally.ui.report.StandardReport.Reports.CycleLeadTime)

    Assert.areEqual(@app.groupByField.displayName, report_config.filter_field)
    Assert.areEqual('G', report_config.work_items)
    Assert.areEqual(Rally.ui.report.StandardReport.Reports.CycleLeadTime.id, report_config.report.id)

  it 'should correctly build report config for schedule state field with story and defect types', ->
    @createApp()
    report_config = @app._buildReportConfig(Rally.ui.report.StandardReport.Reports.Throughput)

    Assert.isUndefined(report_config.filter_field)
    Assert.areEqual('N', report_config.work_items)
    Assert.areEqual(Rally.ui.report.StandardReport.Reports.Throughput.id, report_config.report.id)

  it 'should correctly build standard report component config', ->
    @createApp()
    report_config = {report: 5}
    standard_report_config = @app._buildStandardReportConfig(report_config)

    Assert.areEqual(@app.getContext().getDataContext().project, standard_report_config.project)
    Assert.areEqual(@app.getContext().getDataContext().projectScopeDown, standard_report_config.projectScopeDown)
    Assert.areEqual(@app.getContext().getDataContext().projectScopeUp, standard_report_config.projectScopeUp)
    Assert.areEqual(report_config, standard_report_config.reportConfig)

  it 'should display Agreements row when checked', ->
    @createApp()
    @click(css: '.agreements-checkbox input').then =>
      @waitForVisible(css: '.kanban .columnHeader .policy')

  helpers
    createApp: (settings = {}) ->
      @app = Ext.create('Rally.apps.kanban.App',
        context: Ext.create('Rally.app.Context',
          initialValues:
            project:
              _ref: @projectRef
        ),
        settings: settings,
        renderTo: 'testDiv'
      )