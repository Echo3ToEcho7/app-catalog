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

  it 'should display 4 columns with the scheduleStateMapping picker as the last column', ->
     @_createKanbanSettingsField(
       renderTo: 'testDiv',
       shouldShowColumnLevelFieldPicker: false
     )
     @_refreshField()

     @waitForCallback(@readyCallback).then =>
       expect(@field._grid.columns.length).toBe 4
       expect(@field._grid.columns[3].dataIndex).toBe 'scheduleStateMapping'

  it 'should display 5 columns with the cardFields field picker as the last column if shouldShowColumnLevelFieldPicker on', ->
    @_createKanbanSettingsField(
      renderTo: 'testDiv',
      shouldShowColumnLevelFieldPicker: true
    )
    @_refreshField()

    @waitForCallback(@readyCallback).then =>
      expect(@field._grid.columns.length).toBe 5
      expect(@field._grid.columns[4].dataIndex).toBe 'cardFields'

  it 'should display saved columns pref data', ->
    @_assertFieldSetWithPredefinedData(
      shouldShowColumnLevelFieldPicker: false
      expectedValues: ['Defined', 'Yes', '2', 'Defined', 'In-Progress', 'No', '∞', '--No Mapping--']
    )

  it 'should display saved columns pref data with a cardFields column when shouldShowColumnLevelFieldPicker on', ->
    @_assertFieldSetWithPredefinedData(
      shouldShowColumnLevelFieldPicker: true
      expectedValues: ['Defined', 'Yes', '2', 'Defined', 'mycardfield', 'In-Progress', 'No', '∞', '--No Mapping--', 'FormattedID, Name, Owner']
    )

  it 'should display saved columns pref data with default cardFields values when no cardFields saved and shouldShowColumnLevelFieldPicker on', ->
    @_assertFieldSetWithPredefinedData(
      shouldShowColumnLevelFieldPicker: true
      defaultCardFields: 'FooBar,MyField'
      expectedValues: ['Defined', 'Yes', '2', 'Defined', 'mycardfield', 'In-Progress', 'No', '∞', '--No Mapping--', 'FooBar, MyField']
    )

  it 'should submit columns pref data when user saves settings', ->
    @_assertFieldSetWithPredefinedData(
      shouldShowColumnLevelFieldPicker: false
      expectedValues: ['Defined', 'Yes', '2', 'Defined', 'In-Progress', 'No', '∞', '--No Mapping--']
    )

    @waitForCallback(@readyCallback).then =>
      data = @field.getSubmitData()
      expect(data.foo).toBe @value

  it 'should submit columns pref data with cardFields when user saves settings and shouldShowColumnLevelFieldPicker on', ->
    @_assertFieldSetWithPredefinedData(
      shouldShowColumnLevelFieldPicker: true
      expectedValues: ['Defined', 'Yes', '2', 'Defined', 'mycardfield', 'In-Progress', 'No', '∞', '--No Mapping--', 'FormattedID, Name, Owner']
    )

    @waitForCallback(@readyCallback).then =>
      data = @field.getSubmitData()
      expect(data.foo).toBe @value

  it 'should destroy columns grid when destroyed', ->
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