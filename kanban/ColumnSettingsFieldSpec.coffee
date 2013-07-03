Ext = window.Ext4 || window.Ext

Ext.require [
  'Rally.apps.kanban.ColumnSettingsField'
]

describe 'Rally.apps.kanban.ColumnSettingsField', ->
  beforeEach ->
    @customFieldSubmitValue = 'c_mycardfield'
    @customFieldRenderValue = 'mycardfield'

  afterEach ->
    Rally.test.destroyComponentsOfQuery 'editor'
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

  it 'should destroy columns grid when destroyed', ->
    @_createKanbanSettingsField(
      renderTo: 'testDiv'
    )
    gridDestroySpy = @spy(@field._grid, 'destroy')
    @field.destroy()
    expect(gridDestroySpy).toHaveBeenCalledOnce()

  describe 'shouldShowColumnLevelFieldPicker off', ->
    it 'should display 4 columns with the scheduleStateMapping picker as the last column', ->
       @_createKanbanSettingsField(
         renderTo: 'testDiv',
         shouldShowColumnLevelFieldPicker: false
       )
       @_refreshField()

       @waitForCallback(@readyCallback).then =>
         expect(@field._grid.columns.length).toBe 4
         expect(@field._grid.columns[3].dataIndex).toBe 'scheduleStateMapping'

    it 'should display saved columns pref data', ->
      @_assertGridSetWithValues(
        shouldShowColumnLevelFieldPicker: false
        expectedValues: ['Defined', 'Yes', '2', 'Defined', 'In-Progress', 'No', '∞', '--No Mapping--']
      )

    it 'should submit columns pref data when user saves settings', ->
      @_assertGridSetWithValues(
        shouldShowColumnLevelFieldPicker: false
        expectedValues: ['Defined', 'Yes', '2', 'Defined', 'In-Progress', 'No', '∞', '--No Mapping--']
      )

      @waitForCallback(@readyCallback).then =>
        data = @field.getSubmitData()
        expect(data.foo).toBe @value

  describe 'shouldShowColumnLevelFieldPicker on', ->
    it 'should display 5 columns with the cardFields field picker as the last column', ->
      @_createKanbanSettingsField(
        renderTo: 'testDiv',
        shouldShowColumnLevelFieldPicker: true
      )
      @_refreshField()

      @waitForCallback(@readyCallback).then =>
        expect(@field._grid.columns.length).toBe 5
        expect(@field._grid.columns[4].dataIndex).toBe 'cardFields'

    it 'should display saved preferences for cardFields column', ->
      @_assertGridSetWithValues(
        shouldShowColumnLevelFieldPicker: true
        expectedValues: ['Defined', 'Yes', '2', 'Defined', @customFieldRenderValue, 'In-Progress', 'No', '∞', '--No Mapping--', 'FormattedID, Name, Owner']
      )

    it 'should display cardFields column with default cardFields values when no cardFields preferences saved', ->
      @_assertGridSetWithValues(
        shouldShowColumnLevelFieldPicker: true
        defaultCardFields: 'FooBar,MyField'
        expectedValues: ['Defined', 'Yes', '2', 'Defined', @customFieldRenderValue, 'In-Progress', 'No', '∞', '--No Mapping--', 'FooBar, MyField']
      )

    it 'should remove leading c_ in card field name when saving settings', ->
      @_assertGridSetWithValues(
        shouldShowColumnLevelFieldPicker: true
        expectedValues: ['Defined', 'Yes', '2', 'Defined', @customFieldRenderValue, 'In-Progress', 'No', '∞', '--No Mapping--', 'FormattedID, Name, Owner']
      )

      @waitForCallback(@readyCallback).then =>
        data = @field.getSubmitData()
        expect(data.foo).toBe @value

    it 'should not remove non-leading c_ in card field name when saving settings', ->
      fieldName = 'foo_c_'
      @_assertGridSetWithValues(
        cardFields: fieldName
        shouldShowColumnLevelFieldPicker: true
        expectedValues: ['Defined', 'Yes', '2', 'Defined', fieldName, 'In-Progress', 'No', '∞', '--No Mapping--', 'FormattedID, Name, Owner']
      )

      @waitForCallback(@readyCallback).then =>
        data = @field.getSubmitData()
        expect(data.foo).toBe @value

    it 'should update column card field settings when "apply to all" is clicked', ->
      fieldValue = 'AcceptedDate'
      @_setupWithTwoColumnsShown(fieldValue)
      @waitForCallback(@readyCallback).then =>
        gridHelper = new Helpers.Grid(@field._grid)
        gridHelper.startEditingCell('', 'cardFields').then (inlineEditor) =>
          @click(css: '.' + inlineEditor.editor.field.rightCls.replace(' ', '.')).then =>
            expect(@field._grid.store.getAt(0).get('cardFields')).toBe 'AcceptedDate'
            expect(@field._grid.store.getAt(1).get('cardFields')).toContain 'AcceptedDate'

    it 'should update column card field settings when "remove from all" is clicked', ->
      fieldValue = 'AcceptedDate'
      @_setupWithTwoColumnsShown(fieldValue)
      @waitForCallback(@readyCallback).then =>
        gridHelper = new Helpers.Grid(@field._grid)
        gridHelper.startEditingCell('', 'cardFields').then (inlineEditor) =>
          field = inlineEditor.editor.field
          @click(css: '.' + field.rightCls.replace(' ', '.')).then =>
            @once(
              condition: => field.list.getEl().down('.' + field.rightCls.replace(' ', '.')).getHTML() == field.rightUpdateText
              description: 'wait for right side action text to swap'
            ).then =>
              @click(css: '.' + field.rightCls.replace(' ', '.')).then =>
                rowOneCardFieldsNameArray = Ext.Array.pluck(Ext.Array.pluck(@field._grid.store.getAt(0).get('cardFields'), 'data'), 'name')
                expect(rowOneCardFieldsNameArray).not.toContain 'AcceptedDate'
                expect(@field._grid.store.getAt(1).get('cardFields')).not.toContain 'AcceptedDate'

  helpers
    _createKanbanSettingsField: (config) ->
      @readyCallback = @stub()

      @field = Ext.create('Rally.apps.kanban.ColumnSettingsField', Ext.apply(
        name: 'foo'
        listeners:
          ready: @readyCallback
        , config)
      )

    _assertGridSetWithValues: (options) ->
      @_createKanbanSettingsField(
        renderTo: 'testDiv',
        shouldShowColumnLevelFieldPicker: options.shouldShowColumnLevelFieldPicker
        defaultCardFields: options.defaultCardFields
      )
      @_refreshField()
      if options.shouldShowColumnLevelFieldPicker
        @value = Ext.JSON.encode({
          Defined: {wip:2, scheduleStateMapping:"Defined",cardFields: options.cardFields || @customFieldSubmitValue}
        })
      else
        @value = Ext.JSON.encode({
          Defined: {wip:2, scheduleStateMapping:"Defined"}
        })

      @field.setValue(@value)
      @waitForCallback(@readyCallback).then =>
        cells = Ext.dom.Query.select('.x4-grid-cell > .x4-grid-cell-inner')
        expect(html).toBe options.expectedValues[i] for html, i in Ext.Array.pluck(cells, 'innerHTML')

    _refreshField: (allowedValues)->
      scheduleStateField = Rally.test.mock.data.ModelFactory.getModel('UserStory').getField('ScheduleState')
      @allowedValues = allowedValues || ["Defined", "In-Progress"]
      @ajax.whenQueryingAllowedValues(scheduleStateField).respondWith @allowedValues
      @field.refreshWithNewField scheduleStateField

    _setupWithTwoColumnsShown: (cardFieldForFirstColumn) ->
      @_createKanbanSettingsField(
             renderTo: 'testDiv',
             shouldShowColumnLevelFieldPicker: true
      )
      @_refreshField()
      value = Ext.JSON.encode(
        Defined: {wip: 2, scheduleStateMapping: "Defined", cardFields: cardFieldForFirstColumn}
        "In-Progress": {wip: 2, scheduleStateMapping: "Defined"}
      )
      @field.setValue(value)