Ext = window.Ext4 || window.Ext

Ext.require [
  'Rally.apps.kanban.ColumnSettingsField'
]

describe 'Rally.apps.kanban.ColumnSettingsField', ->

  afterEach ->
    Rally.test.destroyComponentsOfQuery 'kanbancolumnsettingsfield'

  it 'creates rows for each allowed value', ->
    readyCallback = @stub()
    scheduleStateField = Rally.test.mock.data.ModelFactory.getModel('UserStory').getField('ScheduleState')
    field = Ext.widget(
      name: 'foo'
      xtype: 'kanbancolumnsettingsfield'
      renderTo: 'testDiv'
      listeners:
        ready: readyCallback
    )
    allowedValues = ["Defined", "In-Progress"]
    @ajax.whenQueryingAllowedValues(scheduleStateField).respondWith allowedValues
    field.refreshWithNewField scheduleStateField
    @waitForCallback(readyCallback).then =>
      firstCells = Ext.dom.Query.select('.x4-grid-cell-first > .x4-grid-cell-inner')
      expect(firstCells.length).toBe 2
      expect(html).toBe allowedValues[i] for html, i in Ext.Array.pluck(firstCells, 'innerHTML')
