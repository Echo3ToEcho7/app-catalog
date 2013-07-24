Ext = window.Ext4 || window.Ext

Ext.require [
  'Rally.util.DateTime'
]

describe 'Rally.apps.charts.burndown.BurnDownApp', ->
  helpers
    getContext: (initialValues) ->
      globalContext = Rally.environment.getContext()

      Ext.create 'Rally.app.Context',
        initialValues: Ext.merge(
          project: globalContext.getProject()
          workspace: globalContext.getWorkspace()
          user: globalContext.getUser()
          subscription: globalContext.getSubscription()
        , initialValues)

  describe 'app-scoped', ->
    it 'does not load twice when an iteration is current', ->
      iterations = @mom.getData 'iteration', values:
        StartDate: Rally.util.DateTime.toIsoString(Rally.util.DateTime.add(new Date(), "day", -2))
        EndDate: Rally.util.DateTime.toIsoString(Rally.util.DateTime.add(new Date(), "day", 2))

      settings = 
        chartAggregationType: 'storycount'
        chartDisplayType: 'line'
        chartTimebox: 'iteration'

      @ajax.whenQuerying('iteration').respondWith iterations
      iterReadRequest = @ajax.whenReading('iteration', iterations[0].ObjectID).respondWith iterations[0]

      prefNameValues = _.map(Ext.merge({iteration: iterations[0]._ref}, settings), (value, key) -> Name: key, Value: value)
      prefRequest = @ajax.whenQuerying('preference').respondWith @mom.getData('preference', values: prefNameValues)

      addSpy = @spy()
      app = Ext.create 'Rally.apps.charts.burndown.BurnDownApp',
        context: @getContext()
        scopeType: 'iteration'
        settings: settings
        renderTo: 'testDiv'
        listeners:
          add: addSpy

      @waitForCallback(iterReadRequest).then =>
        rallychartAdds = _.where(_.map(addSpy.args, (arg) -> arg[1]), xtype: 'rallychart').length
        expect(rallychartAdds).toBe 1

  describe 'dashboard-scoped', ->
