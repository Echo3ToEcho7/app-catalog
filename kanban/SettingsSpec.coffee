Ext = window.Ext4 || window.Ext

Ext.require [
  'Rally.apps.kanban.Settings'
]

describe 'Rally.apps.kanban.Settings', ->
  it 'should destroy grid for kanbancolumnsettingsfield when settings are destroyed', ->
    columnSettingsConfig = Ext.Array.filter(Rally.apps.kanban.Settings.getFields(), (field) -> field.xtype == 'kanbancolumnsettingsfield')[0]
    @renderFieldInForm columnSettingsConfig
    @formPanel.close()

    expect(@formPanel.getForm().getFields().get(0)._grid).toBeUndefined()

  it 'should require at least one card field', ->
    cardSettingsConfig = Ext.Array.filter(Rally.apps.kanban.Settings.getFields(), (field) -> field.xtype == 'rallyfieldpicker')[0]

    @assertFieldCannotBeEmpty cardSettingsConfig, 'At least one field must be selected.'

  helpers
    renderFieldInForm: (fieldConfig) ->
      @formPanel = Ext.create 'Ext.form.Panel',
        items: [
          fieldConfig
        ]
        renderTo: 'testDiv'

    assertFieldCannotBeEmpty: (fieldConfig, errMsg) ->
      @renderFieldInForm fieldConfig
      field = @formPanel.getForm().getFields().get(0)
      expect(@formPanel.getForm().isValid()).toBe false
      expect(field.getErrors().length).toBe 1
      expect(field.getErrors()[0]).toBe errMsg
