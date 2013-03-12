Ext = window.Ext4 || window.Ext

Ext.require [
  'Rally.ui.report.StandardReport'
]

describe 'Rally.apps.kanban.KanbanApp', ->

  helpers
    createApp: (settings = {}) ->
      @app = Ext.create('Rally.apps.kanban.KanbanApp',
        context: Ext.create('Rally.app.Context',
          initialValues:
            project:
              _ref: @projectRef,
              Name: 'Project 1'
        ),
        settings: settings,
        renderTo: 'testDiv'
      )

      @waitForComponentReady @app

  beforeEach ->
    @ajax.whenQuerying('userstory').respondWith()
    @ajax.whenQuerying('defect').respondWith()

    @projectRef = Rally.environment.getContext().getProject()._ref

  afterEach ->
    @app?.destroy()

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
      expect(@app.getSetting('cardFields')).toBe 'Name,Discussion,Tasks,Defects'

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
        expect(editorOpenedStub).toHaveBeenCalledOnce
        expect(editorOpenedStub.getCall(0).args[1].iteration).toBe 'u'

  it 'should set group by field to first column value', ->
    @createApp().then =>
      editorOpenedStub = @stub(Rally.nav.Manager, 'create')
      addNewHelper = new Helpers.AddNewHelper '.kanban'
      addNewHelper.addWithDetails('foo').then =>
        expect(editorOpenedStub).toHaveBeenCalledOnce
        expect(editorOpenedStub.getCall(0).args[1]['c_' + @app.getSetting('groupByField')]).toBe @app.cardboard.getColumns()[0].getValue()

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
      @createApp(project: @projectRef, projectScopeUp: projectScopeUp, projectScopeDown: projectScopeDown).then =>
        filterInfo = @app.down('rallyfilterinfo')
        expect(filterInfo.getProjectName()).toBe @app.getContext().getProject().Name
        expect(filterInfo.getScopeUp()).toBe projectScopeUp
        expect(filterInfo.getScopeDown()).toBe projectScopeDown

  it 'should show filter info when a query is set', ->
      query = '(Name contains Foo)'
      @createApp(query: query).then =>
        filterInfo = @app.down('rallyfilterinfo')
        expect(filterInfo.getQuery()).toBe query