Ext = window.Ext4 || window.Ext

Ext.require [
  'Rally.apps.kanban.CardAgeSettingsField'
]

describe 'Rally.apps.kanban.CardAgeSettingsField', ->
  afterEach ->
    Rally.test.destroyComponentsOfQuery 'kanbancardagesettingsfield'

  it 'should bind settings fields from initial value', ->
    @_createSettingsField(
      value:
        showCardAge: true
        cardAgeThreshold: 5
    )

    expect(@field.down('rallycheckboxfield').getValue()).toBe true
    expect(@field.down('rallytextfield').getValue()).toBe '5'

  it 'should require card age threshold if show card age checked', ->
    @_createSettingsField(
      value:
        showCardAge: true
        cardAgeThreshold: ''
    )

    expect(@field.down('rallytextfield').getErrors()[0]).toBe 'This field is required'

  it 'should not require card age threshold if show card age checked', ->
    @_createSettingsField(
      value:
        showCardAge: false
        cardAgeThreshold: ''
    )

    expect(@field.down('rallytextfield').getErrors().length).toBe 0


  helpers
    _createSettingsField: (config) ->
      @field = Ext.create('Rally.apps.kanban.CardAgeSettingsField', Ext.apply({
        renderTo: 'testDiv'
      }, config))
