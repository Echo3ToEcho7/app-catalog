Ext = window.Ext4 || window.Ext

Ext.require [
  'Rally.util.DateTime',
  'Rally.alm.FeatureToggle'
]

describe 'Rally.apps.iterationtrackingboard.IterationTrackingBoardApp', ->
  
  helpers
    createApp: (config)->
      now = new Date()
      tomorrow = Rally.util.DateTime.add(now, 'day', 1)
      nextDay = Rally.util.DateTime.add(tomorrow, 'day', 1)
      dayAfter = Rally.util.DateTime.add(nextDay, 'day', 1)
      @iterationData = [
        {Name:'Iteration 1', _ref:'/iteration/0', StartDate:Rally.util.DateTime.toIsoString(now), EndDate:Rally.util.DateTime.toIsoString(tomorrow)}
        {Name:'Iteration 2', _ref:'/iteration/2', StartDate:Rally.util.DateTime.toIsoString(nextDay), EndDate:Rally.util.DateTime.toIsoString(dayAfter)}
      ]

      @IterationModel = Rally.mock.data.ModelFactory.getIterationModel()
      @iterationRecord = new @IterationModel @iterationData[0]
      
      @app = Ext.create('Rally.apps.iterationtrackingboard.IterationTrackingBoardApp', Ext.apply(
        context: Ext.create('Rally.app.Context',
          initialValues:
            timebox: @iterationRecord
            project:
              _ref: @projectRef
            featureToggles: Rally.alm.FeatureToggle
        ),
        renderTo: 'testDiv'
      , config))

      @waitForComponentReady(@app)

  beforeEach ->
    @ajax.whenReading('project').respondWith {
      TeamMembers: []
      Editors: []
    }

    @ajax.whenQuerying('userstory').respondWith()
    @ajax.whenQuerying('defect').respondWith()
    @ajax.whenQuerying('defectsuite').respondWith()
    @ajax.whenQuerying('testset').respondWith()

    @toggleStub = @stub(Rally.alm.FeatureToggle, "isEnabled").returns false

    @tooltipHelper = new Helpers.TooltipHelper this

  afterEach ->
    @app?.destroy()

  it 'resets view on scope change', ->
    @createApp().then =>
      removeStub = @stub(@app, 'remove')
      addContentStub = @stub(@app, 'addContent')

      newScope = Ext.create('Rally.app.TimeboxScope',
        record: new @IterationModel @iterationData[1]
      )

      @app.onTimeboxScopeChange newScope

      expect(removeStub).toHaveBeenCalledOnce
      sinon.assert.calledWith removeStub, 'gridBoard'

      expect(addContentStub).toHaveBeenCalledOnce
      sinon.assert.calledWith addContentStub, newScope

  it 'fires contentupdated event after board load', ->
    contentUpdatedHandlerStub = @stub()
    @createApp(
      listeners:
        contentupdated: contentUpdatedHandlerStub
    ).then =>
      contentUpdatedHandlerStub.reset()
      @app.gridboard.fireEvent('load')

      expect(contentUpdatedHandlerStub).toHaveBeenCalledOnce

  it 'should include PortfolioItem in columnConfig.additionalFetchFields', ->
    @createApp().then =>

      expect(@app.gridboard.getGridOrBoard().columnConfig.additionalFetchFields).toContain 'PortfolioItem'
