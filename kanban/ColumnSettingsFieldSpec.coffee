Ext = window.Ext4 || window.Ext

Ext.require [
  'Rally.apps.kanban.ColumnSettingsField'
]

describe 'Rally.apps.kanban.ColumnSettingsField', ->
  afterEach ->
    Rally.test.destroyComponentsOfQuery 'kanbancolumnsettingsfield'

  it 'creates rows for each allowed value', ->
    @_createKanbanSettingsField(
      renderTo: 'testDiv'
    )
    @_refreshField()

    @waitForCallback(@readyCallback).then =>
      firstCells = Ext.dom.Query.select('.x4-grid-cell-first > .x4-grid-cell-inner')
      expect(firstCells.length).toBe 2
      expect(html).toBe @allowedValues[i] for html, i in Ext.Array.pluck(firstCells, 'innerHTML')

  it 'only validates field if the store has been loaded', ->
    @_createKanbanSettingsField()
    expect(@field.getErrors().length).toBe 0

  it 'validates field when store loaded', ->
    @_createKanbanSettingsField(
      renderTo: 'testDiv'
    )
    @_refreshField()

    @waitForCallback(@readyCallback).then =>
      expect(@field.getErrors().length).toBe 1
      expect(@field.getErrors()[0]).toBe 'At least one column must be shown.'

  it 'should display saved pref data for field when form loaded', ->
    @_assertFieldSetWithPredefinedData(
      shouldShowColumnLevelFieldPicker: false
      expectedValues: ['Defined', 'Yes', '2', 'Defined', 'In-Progress', 'No', '∞', '--No Mapping--']
    )

  it 'should submit columns data for field when user saves form', ->
    @_assertFieldSetWithPredefinedData(
      shouldShowColumnLevelFieldPicker: false
      expectedValues: ['Defined', 'Yes', '2', 'Defined', 'In-Progress', 'No', '∞', '--No Mapping--']
    )

    @waitForCallback(@readyCallback).then =>
      data = @field.getSubmitData()
      expect(data.foo).toBe @value

  it 'should create column field picker if shouldShowColumnLevelFieldPicker enabled', ->
    @_createKanbanSettingsField(
      renderTo: 'testDiv',
      shouldShowColumnLevelFieldPicker: true
    )
    @_refreshField()

    @waitForCallback(@readyCallback).then =>
      expect(@field._grid.columns.length).toBe 5
      expect(@field._grid.columns[4].dataIndex).toBe 'cardFields'

  it 'should not create column field picker if shouldShowColumnLevelFieldPicker disabled', ->
    @_createKanbanSettingsField(
      renderTo: 'testDiv',
      shouldShowColumnLevelFieldPicker: false
    )
    @_refreshField()

    @waitForCallback(@readyCallback).then =>
      expect(@field._grid.columns.length).toBe 4
      expect(@field._grid.columns[3].dataIndex).toBe 'scheduleStateMapping'

  it 'should display saved pref data for field with cardFields', ->
    defaultCardFields = 'FooBar,MyField'
    @_assertFieldSetWithPredefinedData(
      shouldShowColumnLevelFieldPicker: true
      defaultCardFields: defaultCardFields
      expectedValues: ['Defined', 'Yes', '2', 'Defined', 'mycardfield', 'In-Progress', 'No', '∞', '--No Mapping--', defaultCardFields]
    )

  it 'should destroy grid when destroyed', ->
    @_createKanbanSettingsField(
      renderTo: 'testDiv'
    )
    gridDestroySpy = @spy(@field._grid, 'destroy')
    @field.destroy()
    expect(gridDestroySpy).toHaveBeenCalledOnce()

  helpers
    _createKanbanSettingsField: (config) ->
      @readyCallback = @stub()

      @field = Ext.create('Rally.apps.kanban.ColumnSettingsField', Ext.apply(
        name: 'foo'
        listeners:
          ready: @readyCallback
        , config)
      )

    _assertFieldSetWithPredefinedData: (options) ->
      @_createKanbanSettingsField(
        renderTo: 'testDiv',
        shouldShowColumnLevelFieldPicker: options.shouldShowColumnLevelFieldPicker
        defaultCardFields: options.defaultCardFields
      )
      @_refreshField()
      if options.shouldShowColumnLevelFieldPicker
        @value = Ext.JSON.encode({
          Defined: {wip:2, scheduleStateMapping:"Defined",cardFields:"mycardfield"}
        })
      else
        @value = Ext.JSON.encode({
          Defined: {wip:2, scheduleStateMapping:"Defined"}
        })

      @field.setValue(@value)
      @waitForCallback(@readyCallback).then =>
        cells = Ext.dom.Query.select('.x4-grid-cell > .x4-grid-cell-inner')
        expect(html).toBe options.expectedValues[i] for html, i in Ext.Array.pluck(cells, 'innerHTML')

    _refreshField: ->
      scheduleStateField = Rally.test.mock.data.ModelFactory.getModel('UserStory').getField('ScheduleState')
      @allowedValues = ["Defined", "In-Progress"]
      @ajax.whenQueryingAllowedValues(scheduleStateField).respondWith @allowedValues
      @field.refreshWithNewField scheduleStateField