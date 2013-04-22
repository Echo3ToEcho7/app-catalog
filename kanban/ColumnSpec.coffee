Ext = window.Ext4 || window.Ext;

Ext.require [
  'Rally.app.Context'
  'Rally.apps.kanban.Column'
], ->

  describe 'Rally.apps.kanban.Column', ->

    beforeEach ->
      @stub(Rally.app.Context.prototype, 'getSubscription').returns StoryHierarchyEnabled: true

      @Model = Rally.test.mock.data.ModelFactory.getUserStoryModel()

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
      defectModel = Rally.test.mock.data.ModelFactory.getDefectModel()
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

    it 'should not exclude a store when a compound query is valid', ->
      models = [@Model]
      column = @createColumn(
        models: models
        storeConfig:
          filters: [
            Rally.data.QueryFilter.fromQueryString '((ScheduleState = Accepted) AND (PlanEstimate > 5))'
          ]
      )

      stores = column.getStores(models)
      expect(stores.length).toBe 1

    it 'should not exclude a store when a query is specified using dot notation', ->
      models = [@Model]
      column = @createColumn(
        models: models
        storeConfig:
          filters: [
            Rally.data.QueryFilter.fromQueryString '(WorkProduct.Owner.UserName = foo)'
          ]
      )

      stores = column.getStores(models)
      expect(stores.length).toBe 1

    it 'should exclude a store when a compound query is invalid', ->
      models = [@Model]
      column = @createColumn(
        models: models
        storeConfig:
          filters: [
            Rally.data.QueryFilter.fromQueryString '((ScheduleState = Accepted) AND (Invalid = X))'
          ]
      )

      stores = column.getStores(models)
      expect(stores.length).toBe 0

    it 'should fire invalidfilter event when no valid filters are specified', ->
      defectModel = Rally.test.mock.data.ModelFactory.getDefectModel()
      models = [@Model, defectModel]
      column = @createColumn(
        models: models
        storeConfig:
          filters: [
            property: 'foo'
            value: 'bar'
          ]
      )

      invalidFilterStub = @stub()
      column.on('invalidfilter', invalidFilterStub)
      stores = column.getStores(models)
      expect(stores.length).toBe 0
      expect(invalidFilterStub).toHaveBeenCalledOnce()

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
