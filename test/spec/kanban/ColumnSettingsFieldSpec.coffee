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
    @createKanbanSettingsField(
      renderTo: 'testDiv'
    )
    @refreshField()

    @waitForCallback(@readyCallback).then =>
      firstCells = Ext.dom.Query.select(".#{Ext.baseCSSPrefix}grid-cell-first > .#{Ext.baseCSSPrefix}grid-cell-inner")
      expect(firstCells.length).toBe 2
      expect(html).toBe @allowedValues[i] for html, i in Ext.Array.pluck(firstCells, 'innerHTML')

  it 'only validates field if the store has been loaded', ->
    @createKanbanSettingsField()
    expect(@field.getErrors().length).toBe 0

  it 'validates field when store loaded', ->
    @createKanbanSettingsField(
      renderTo: 'testDiv'
    )
    @refreshField()

    @waitForCallback(@readyCallback).then =>
      expect(@field.getErrors().length).toBe 1
      expect(@field.getErrors()[0]).toBe 'At least one column must be shown.'

  it 'should destroy columns grid when destroyed', ->
    @createKanbanSettingsField(
      renderTo: 'testDiv'
    )
    gridDestroySpy = @spy(@field._grid, 'destroy')
    @field.destroy()
    expect(gridDestroySpy).toHaveBeenCalledOnce()

  describe 'with shouldShowColumnLevelFieldPicker off', ->
    it 'should display 4 columns with the scheduleStateMapping picker as the last column', ->
       @createKanbanSettingsField(
         renderTo: 'testDiv',
         shouldShowColumnLevelFieldPicker: false
       )
       @refreshField()

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

  describe 'with shouldShowColumnLevelFieldPicker on', ->
    it 'should display 5 columns with the cardFields field picker as the last column', ->
      @createKanbanSettingsField(
        renderTo: 'testDiv',
        shouldShowColumnLevelFieldPicker: true
      )
      @refreshField()

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

    it 'should update column card field settings when apply to all is clicked', ->
      fieldValue = 'AcceptedDate'
      @_setupWithTwoColumnsShown(fieldValue)
      @waitForCallback(@readyCallback).then =>
        gridHelper = new Helpers.Grid(@field._grid, this)
        gridHelper.startEditingCell('', 'cardFields').then (inlineEditor) =>
          @click(css: '.' + inlineEditor.editor.field.rightCls.replace(' ', '.')).then =>
            expect(@field._grid.store.getAt(0).get('cardFields')).toBe 'AcceptedDate'
            expect(@field._grid.store.getAt(1).get('cardFields')).toContain 'AcceptedDate'

    it 'should update column card field settings when remove from all is clicked', ->
      fieldValue = 'AcceptedDate'
      @_setupWithTwoColumnsShown(fieldValue)
      @waitForCallback(@readyCallback).then =>
        gridHelper = new Helpers.Grid(@field._grid, this)
        gridHelper.startEditingCell('', 'cardFields').then (inlineEditor) =>
          field = inlineEditor.editor.field
          fieldRightClsSelector = '.' + field.rightCls.replace(' ', '.')
          @click(css: fieldRightClsSelector).then =>
            @once(
              condition: => field.list.getEl().down(fieldRightClsSelector).getHTML() == field.rightUpdateText
              description: 'wait for right side action text to swap'
            ).then =>
              @click(css: fieldRightClsSelector).then =>
                rowOneCardFieldsNameArray = _.pluck(_.pluck(@field._grid.store.getAt(0).get('cardFields'), 'data'), 'name')
                expect(rowOneCardFieldsNameArray).not.toContain 'AcceptedDate'
                expect(@field._grid.store.getAt(1).get('cardFields')).not.toContain 'AcceptedDate'

  helpers
    createKanbanSettingsField: (config) ->
      @readyCallback = @stub()

      @field = Ext.create('Rally.apps.kanban.ColumnSettingsField', Ext.apply(
        name: 'foo'
        listeners:
          ready: @readyCallback
        , config)
      )

    _assertGridSetWithValues: (options) ->
      @createKanbanSettingsField(
        renderTo: 'testDiv',
        shouldShowColumnLevelFieldPicker: options.shouldShowColumnLevelFieldPicker
        defaultCardFields: options.defaultCardFields
      )
      @refreshField()
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
        cells = Ext.dom.Query.select(".#{Ext.baseCSSPrefix}grid-cell > .#{Ext.baseCSSPrefix}grid-cell-inner")
        expect(html).toBe options.expectedValues[i] for html, i in Ext.Array.pluck(cells, 'innerHTML')

    refreshField: (@allowedValues = ["Defined", "In-Progress"]) ->
      scheduleStateField = Rally.test.mock.data.WsapiModelFactory.getModel('UserStory').getField('ScheduleState')
      @ajax.whenQueryingAllowedValues(scheduleStateField).respondWith @allowedValues
      @field.refreshWithNewField scheduleStateField

    _setupWithTwoColumnsShown: (cardFieldForFirstColumn) ->
      @createKanbanSettingsField(
             renderTo: 'testDiv',
             shouldShowColumnLevelFieldPicker: true
      )
      @refreshField()
      value = Ext.JSON.encode(
        Defined: {wip: 2, scheduleStateMapping: "Defined", cardFields: cardFieldForFirstColumn}
        "In-Progress": {wip: 2, scheduleStateMapping: "In-Progress"}
      )
      @field.setValue(value)