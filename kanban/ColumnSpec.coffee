Ext = window.Ext4 || window.Ext;

Ext.require [
  'Rally.app.Context'
  'Rally.apps.kanban.Column'
], ->

  describe 'Rally.apps.kanban.Column', ->

    beforeEach ->
      @stub(Rally.app.Context.prototype, 'getSubscription').returns StoryHierarchyEnabled: true

      @Model = Rally.mock.data.ModelFactory.getUserStoryModel()

      @ajax.whenQuerying('userstory').respondWith()
      @ajax.whenQuerying('defect').respondWith()

    afterEach ->
      Ext.Array.forEach Ext.ComponentQuery.query('kanbancolumn'), (component) ->
        component.destroy()

    it 'should only show stories with no children', ->
      storeFilterSpy = @spy(Rally.apps.kanban.Column.prototype, 'getStoreFilter')
      @createColumn()

      expect(storeFilterSpy.returnValues[0][1].property).toBe 'DirectChildrenCount'
      expect(storeFilterSpy.returnValues[0][1].value).toBe 0

    it 'should exclude a store when filtering on an invalid field', ->
      defectModel = Rally.mock.data.ModelFactory.getDefectModel()
      models = [@Model, defectModel]
      column = @createColumn(
        models: models
        storeConfig:
          filters: [
            property: 'State'
            value: 'Fixed'
          ]
      )

      stores = column.getStores(models)
      expect(stores.length).toBe 1
      expect(stores[0].model).toBe defectModel

    helpers
      createColumn: (config = {}) ->
        Ext.create('Rally.apps.kanban.Column', Ext.apply(
          context: Rally.environment.getContext()
          value: 'Defined'
          attribute: 'ScheduleState'
          wipLimit: 0
          renderTo: 'testDiv'
          headerCell: Ext.get 'testDiv'
          contentCell: Ext.get 'testDiv'
          models: [@Model]
          , config)
        )
