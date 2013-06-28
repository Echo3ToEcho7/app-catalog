Ext = window.Ext4 || window.Ext
Ext.require [
  'Rally.apps.roadmapplanningboard.PlanningBoard'
  'Rally.apps.roadmapplanningboard.ThemeHeader'
]

describe 'Rally.apps.roadmapplanningboard.ThemeHeader', ->
  beforeEach ->
    storeFixtureFactory = Ext.create 'Rally.test.apps.roadmapplanningboard.mocks.StoreFixtureFactory'

    Deft.Injector.configure
      appModelFactory:
        className: 'Rally.apps.roadmapplanningboard.AppModelFactory'

      featureStore:
        fn: ->
          storeFixtureFactory.getFeatureStoreFixture()

      planningStore:
        fn: ->
          storeFixtureFactory.getPlanningStoreFixture()

      timeframeStore:
        fn: ->
          storeFixtureFactory.getTimeframeStoreFixture()

      roadmapStore:
        fn: ->
          storeFixtureFactory.getRoadmapStoreFixture()

    @appModelFactory = Deft.Injector.resolve 'appModelFactory'

    @themeHeader = undefined

  afterEach ->
    @themeHeader?.destroy()

  it 'displays theme from planModel', ->
    planRecord = Ext.create @appModelFactory.getPlanningModel(),
      id: 'ABC123',
      name: 'Q1',
      theme: 'Take over the world!'

    @themeHeader = Ext.create 'Rally.apps.roadmapplanningboard.ThemeHeader',
      record: planRecord

    @themeHeader.render Ext.getBody()

    expect(@themeHeader.el.dom.innerHTML.indexOf(planRecord.get('theme'))).not.toBe -1

  it 'displays "Add Theme" when model theme is blank', ->
    planRecord = Ext.create @appModelFactory.getPlanningModel(),
      id: 'ABC123',
      name: 'Q1',
      theme: undefined

    @themeHeader = Ext.create 'Rally.apps.roadmapplanningboard.ThemeHeader',
      record: planRecord

    @themeHeader.render Ext.getBody()

    expect(@themeHeader.el.dom.innerHTML.indexOf('Add theme')).not.toBe -1

  it 'displays "Add Theme" when model theme is whitespace', ->
    planRecord = Ext.create @appModelFactory.getPlanningModel(),
      id: 'ABC123',
      name: 'Q1',
      theme: '  \n'

    @themeHeader = Ext.create 'Rally.apps.roadmapplanningboard.ThemeHeader',
      record: planRecord

    @themeHeader.render Ext.getBody()

    expect(@themeHeader.el.dom.innerHTML.indexOf('Add theme')).not.toBe -1

  it 'should trim whitespace from theme', ->
    planRecord = Ext.create @appModelFactory.getPlanningModel(),
      id: 'ABC123',
      name: 'Q1',
      theme: 'My Theme  \n'

    @themeHeader = Ext.create 'Rally.apps.roadmapplanningboard.ThemeHeader',
      record: planRecord

    @themeHeader.render Ext.getBody()

    expect(@themeHeader.el.dom.innerHTML.indexOf('My Theme')).not.toBe -1
    expect(@themeHeader.el.dom.innerHTML.indexOf('My Theme ')).toBe -1

  it 'should find containg cardboard with getCardboardComponent', ->
    board = Ext.create 'Rally.apps.roadmapplanningboard.PlanningBoard',
      roadmapId: '413617ecef8623df1391fabc'
    board.render Ext.getBody()
    themeHeader = board.getColumns()[1].getColumnHeader().query('roadmapthemeheader')[0]

    expect(themeHeader.getCardboardComponent()).toBe(board)

    board.destroy()

  it 'should fire headersizechanged when edit mode textarea resizes based on content', ->
    board = Ext.create 'Rally.apps.roadmapplanningboard.PlanningBoard',
      roadmapId: '413617ecef8623df1391fabc'
      renderTo: Ext.getBody()

    # Allows us to verify whether headersizechanged was fired
    resizeStub = sinon.stub()
    board.on 'headersizechanged', resizeStub

    themeHeader = board.getColumns()[1].getColumnHeader().query('roadmapthemeheader')[0]
    themeHeader.themeContainer.goToEditMode()

    resizeStub.reset()

    textField = themeHeader.themeContainer.down('textareafield')
    textField.setValue('Updated theme\nWith enough more\nlines that we are sure it will\nresize itself\nand tell the header to resize\nfor multi-line content')

    expect(resizeStub).toHaveBeenCalledOnce()

    resizeStub.reset()

    textField.setValue('One line\nAnd another')

    expect(resizeStub).toHaveBeenCalledOnce()

    board.destroy()

  it 'should fire headersizechanged when editor mode switches back to view mode',  ->
    board = Ext.create 'Rally.apps.roadmapplanningboard.PlanningBoard',
      roadmapId: '413617ecef8623df1391fabc'
      renderTo: Ext.getBody()

    themeHeader = board.getColumns()[1].getColumnHeader().query('roadmapthemeheader')[0]
    themeHeader.themeContainer.goToEditMode()
    textField = themeHeader.themeContainer.down('textareafield')
    textField.setValue 'Updated theme'

    # Allows us to verify whether headersizechanged was fired
    resizeStub = sinon.stub()
    board.on 'headersizechanged', resizeStub

    # fieldContainer's refresh uses a defer - use afterDraw stub to push our checks and cleanup past the defer
    afterDrawStub = sinon.stub()
    themeHeader.themeContainer.afterDraw = afterDrawStub

    textField.blur()

    @once(
      condition: ->
        afterDrawStub.called
    ).then =>
      # In IE8, resizeStub may have been called 1 or 2 times (timing-dependent), so just verify it was called
      expect(resizeStub.called).toBeTruthy()

      board.destroy()

  it 'should not fire headersizechanged until editor has been deleted', ->
    board = Ext.create 'Rally.apps.roadmapplanningboard.PlanningBoard',
      roadmapId: '413617ecef8623df1391fabc'
      renderTo: Ext.getBody()

    themeHeader = board.getColumns()[1].getColumnHeader().query('roadmapthemeheader')[0]

    themeHeader.themeContainer.goToEditMode()
    textField = themeHeader.themeContainer.down('textareafield')
    textField.setValue 'Updated theme'

    # Sorry! -- expectation lexically ordered before action so that we can verify precise timing of setEditMode() and headersizechanged
    board.on 'headersizechanged', ->
      expect(themeHeader.themeContainer.getEditMode()).toBeFalsy()

    # fieldContainer's refresh uses a defer - use afterDraw stub to push our checks and cleanup past the defer
    afterDrawStub = sinon.stub()
    themeHeader.themeContainer.afterDraw = afterDrawStub

    textField.blur()

    @once(
      condition: ->
        afterDrawStub.called
    ).then =>
      board.destroy()
