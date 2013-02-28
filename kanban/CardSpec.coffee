Ext = window.Ext4 || window.Ext

Ext.require [
  'Rally.apps.kanban.Card'
], ->
  describe 'Rally.apps.kanban.Card', ->
    it 'should not query for card age if setting is false', ->
      loadStub = @stub(Rally.domain.WsapiModel, 'load')
      @createCard showCardAge: false
      sinon.assert.notCalled loadStub

    it 'should query for card age if setting is true', ->
      loadStub = @stub(Rally.domain.WsapiModel, 'load')
      @createCard showCardAge: true
      sinon.assert.calledOnce loadStub
      args = loadStub.getCall(0).args
      expect(args[0]).toBe @record.get('ObjectID')
      expect(args[1].fetch.join(',')).toBe 'RevisionHistory,Revisions,Description,CreationDate'

    it 'should requery for card age if setting is true when the card is re rendered', ->
      loadStub = @stub(Rally.domain.WsapiModel, 'load')
      @createCard showCardAge: true
      @card.reRender()
      sinon.assert.calledTwice loadStub
      args = loadStub.getCall(1).args
      expect(args[0]).toBe @record.get('ObjectID')
      expect(args[1].fetch.join(',')).toBe 'RevisionHistory,Revisions,Description,CreationDate'

    it 'should add the age field to the card', ->
      addFieldStub = @stub(Rally.apps.kanban.Card.prototype, 'addField')
      @createRecord()
      @ajax.whenReading('userstory', @record.get('ObjectID')).respondWith
        RevisionHistory:
          Revisions: [
            Description: 'Original revision'
          ]

      columnField = displayName: 'Foo'
      threshold = 5
      @createCard showCardAge: true, record: @record, columnField: columnField, cardAgeThreshold: threshold
      sinon.assert.calledOnce addFieldStub
      field = addFieldStub.getCall(0).args[0]
      expect(field.name).toBe 'RevisionHistory'
      expect(field.isStatus).toBe true
      expect(field.renderTpl.initialConfig.field).toEqual columnField
      expect(field.renderTpl.initialConfig.threshold).toBe threshold

    helpers
      createRecord: (options) ->
        StoryModel = Rally.mock.data.ModelFactory.getUserStoryModel()
        @record = new StoryModel Ext.apply
          ObjectID: 1
          Name: 'Foo'
        , options

      createCard: (options) ->
        @card = new Rally.apps.kanban.Card Ext.apply
          renderTo: 'testDiv'
          record: @createRecord()
        , options
