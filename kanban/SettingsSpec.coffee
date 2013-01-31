Ext = window.Ext4 || window.Ext

Ext.require [
  'Rally.apps.kanban.Settings'
], ->

  describe 'Rally.apps.kanban.Settings', ->
  
    it 'should require at least one column', ->
      columnSettingsConfig = Ext.Array.filter(Rally.apps.kanban.Settings.getFields(), (field) -> field.xtype == 'kanbancolumnsettingsfield')[0]
  
      @assertFieldCannotBeEmpty columnSettingsConfig, 'At least one column must be shown.'
  
    it 'should require at least one card field', ->
      cardSettingsConfig = Ext.Array.filter(Rally.apps.kanban.Settings.getFields(), (field) -> field.xtype == 'rallyfieldpicker')[0]
  
      @assertFieldCannotBeEmpty cardSettingsConfig, 'At least one field must be selected.'
  
    helpers
      assertFieldCannotBeEmpty: (fieldConfig, errMsg) ->
        form = Ext.create('Ext.form.Panel',
          items: [
            fieldConfig
          ]
          renderTo: 'testDiv'
        )
  
        field = form.form.getFields().get(0)
        expect(form.form.isValid()).toBe false
        expect(field.getErrors().length).toBe 1
        expect(field.getErrors()[0]).toBe errMsg
