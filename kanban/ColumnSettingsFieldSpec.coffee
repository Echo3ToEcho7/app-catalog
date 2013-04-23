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

    _refreshField: ->
      scheduleStateField = Rally.test.mock.data.ModelFactory.getModel('UserStory').getField('ScheduleState')
      @allowedValues = ["Defined", "In-Progress"]
      @ajax.whenQueryingAllowedValues(scheduleStateField).respondWith @allowedValues
      @field.refreshWithNewField scheduleStateField

