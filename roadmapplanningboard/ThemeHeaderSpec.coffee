Ext = window.Ext4 || window.Ext

describe 'Rally.apps.roadmapplanningboard.ThemeHeader', ->
  beforeEach ->
    @ajax.whenQuerying('PortfolioItem/Feature').respondWith([])
    Ext.create('Rally.test.apps.roadmapplanningboard.helper.TestDependencyHelper').loadDependencies()

  afterEach ->
    @board?.destroy()
    Deft.Injector.reset()
    @themeHeader?.destroy()

  it 'displays theme from planModel', ->
    planRecord = Ext.create Deft.Injector.resolve('planningStore').model,
      id: 'ABC123',
      name: 'Q1',
      theme: 'Take over the world!'

    @themeHeader = Ext.create 'Rally.apps.roadmapplanningboard.ThemeHeader',
      record: planRecord

    @themeHeader.render Ext.getBody()

    expect(@themeHeader.el.dom.innerHTML.indexOf(planRecord.get('theme'))).not.toBe -1

  it 'displays "Add Theme" when model theme is blank', ->
    planRecord = Ext.create Deft.Injector.resolve('planningStore').model,
      id: 'ABC123',
      name: 'Q1',
      theme: undefined

    @themeHeader = Ext.create 'Rally.apps.roadmapplanningboard.ThemeHeader',
      record: planRecord

    @themeHeader.render Ext.getBody()

    expect(@themeHeader.el.dom.innerHTML.indexOf('Add theme')).not.toBe -1

  it 'displays "Add Theme" when model theme is whitespace', ->
    planRecord = Ext.create Deft.Injector.resolve('planningStore').model,
      id: 'ABC123',
      name: 'Q1',
      theme: '  \n'

    @themeHeader = Ext.create 'Rally.apps.roadmapplanningboard.ThemeHeader',
      record: planRecord

    @themeHeader.render Ext.getBody()

    expect(@themeHeader.el.dom.innerHTML.indexOf('Add theme')).not.toBe -1

  it 'should trim whitespace from theme', ->
    planRecord = Ext.create Deft.Injector.resolve('planningStore').model,
      id: 'ABC123',
      name: 'Q1',
      theme: 'My Theme  \n'

    @themeHeader = Ext.create 'Rally.apps.roadmapplanningboard.ThemeHeader',
      record: planRecord

    @themeHeader.render Ext.getBody()

    expect(@themeHeader.el.dom.innerHTML.indexOf('My Theme')).not.toBe -1
    expect(@themeHeader.el.dom.innerHTML.indexOf('My Theme ')).toBe -1

  it 'should find containing cardboard with getCardboardComponent', ->

    @board = Ext.create 'Rally.apps.roadmapplanningboard.PlanningBoard',
      roadmapId: '413617ecef8623df1391fabc'
      _retrieveLowestLevelPI: (callback) -> callback(Rally.test.mock.ModelObjectMother.getRecord('typedefinition',  {values: { TypePath : 'PortfolioItem/Feature' }}))

    @board.render Ext.getBody()
    deferred = Ext.create 'Deft.Deferred'
    @board.on 'load', =>
      themeHeader = @board.getColumns()[1].getColumnHeader().query('roadmapthemeheader')[0]
      expect(themeHeader.getCardboardComponent()).toBe(@board)
      deferred.resolve()

    deferred.promise

  it 'should fire headersizechanged when edit mode textarea resizes based on content', ->
    @board = Ext.create 'Rally.apps.roadmapplanningboard.PlanningBoard',
      roadmapId: '413617ecef8623df1391fabc'
      _retrieveLowestLevelPI: (callback) -> callback(Rally.test.mock.ModelObjectMother.getRecord('typedefinition',  {values: { TypePath : 'PortfolioItem/Feature' }}))
      renderTo: Ext.getBody()

    # Allows us to verify whether headersizechanged was fired
    resizeStub = sinon.stub()
    @board.on 'headersizechanged', resizeStub

    deferred = Ext.create 'Deft.Deferred'
    
    @board.on 'load', =>
      themeHeader = @board.getColumns()[1].getColumnHeader().query('roadmapthemeheader')[0]
      themeHeader.themeContainer.goToEditMode()

      resizeStub.reset()

      textField = themeHeader.themeContainer.down('textareafield')
      textField.setValue('Updated theme\nWith enough more\nlines that we are sure it will\nresize itself\nand tell the header to resize\nfor multi-line content')

      expect(resizeStub).toHaveBeenCalledOnce()

      resizeStub.reset()

      textField.setValue('One line\nAnd another')

      expect(resizeStub).toHaveBeenCalledOnce()
      deferred.resolve()

    deferred.promise

  it 'should fire headersizechanged when editor mode switches back to view mode',  ->
    board = Ext.create 'Rally.apps.roadmapplanningboard.PlanningBoard',
      roadmapId: '413617ecef8623df1391fabc'
      _retrieveLowestLevelPI: (callback) -> callback(Rally.test.mock.ModelObjectMother.getRecord('typedefinition',  {values: { TypePath : 'PortfolioItem/Feature' }}))
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
      _retrieveLowestLevelPI: (callback) -> callback(Rally.test.mock.ModelObjectMother.getRecord('typedefinition',  {values: { TypePath : 'PortfolioItem/Feature' }}))
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
