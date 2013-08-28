Ext = window.Ext4 || window.Ext

describe 'Rally.apps.iterationplanningboard.IterationPlanningBoardBacklogColumn', ->
  beforeEach ->
    @storyModel = Rally.test.mock.data.WsapiModelFactory.getUserStoryModel()
    @defectModel = Rally.test.mock.data.WsapiModelFactory.getDefectModel()
    @ajax.whenQuerying('HierarchicalRequirement').respondWith()

  afterEach ->
    @column?.destroy()

  it 'show user stories that are not scheduled in an iteration', ->
    @createColumn()
    filter = @column.getStoreFilter(@storyModel)

    @shouldHaveFilterByNullIteration(filter)

  it 'show user stories that have no direct children', ->
    @createColumn()
    filter = @column.getStoreFilter(@storyModel)

    expect(filter[1].property).toBe 'DirectChildrenCount'
    expect(filter[1].value).toBe 0

  it 'show defects that are not scheduled in an iteration', ->
    @createColumn()
    filter = @column.getStoreFilter(@defectModel)

    @shouldHaveFilterByNullIteration(filter)

  it 'show defects that are not associated to a requirement', ->
    @createColumn()
    filter = @column.getStoreFilter(@defectModel)

    expect(filter[1].property).toBe 'Requirement'
    expect(filter[1].value).toBeNull()

  it 'should not show closed defects', ->
    @createColumn()
    filter = @column.getStoreFilter(@defectModel)

    expect(filter[2].property).toBe 'State'
    expect(filter[2].operator).toBe '!='
    expect(filter[2].value).toBe 'Closed'

  it 'should not show user stories with children', ->
    @createColumn()
    record = @createStoryRecord
      DirectChildrenCount: 5
      Iteration: null

    expect(@column.isMatchingRecord(record)).toBe false

  it 'isMatchingRecord should not care about DirectChildrenCount in subs with no story hierarchy', ->
    @createColumn subscriptionStoryHierarchyEnabled: false
    record = @createStoryRecord
      Iteration: null
    @stub(record, 'hasField').withArgs('DirectChildrenCount').returns false

    expect(@column.isMatchingRecord(record)).toBe true

  it 'should not show defects with a requirement', ->
    @createColumn()
    record = @createDefectRecord
      Requirement:
        _ref: '/hierarchicalrequirement/5'
      Iteration: null

    expect(@column.isMatchingRecord(record)).toBe false

  it 'should not filter by DirectChildrenCount if story hierarchy is not enabled', ->
    record = @createStoryRecord
      Iteration: null
    @createColumn subscriptionStoryHierarchyEnabled: false
    filter = @column.getStoreFilter(@storyModel)

    @shouldHaveFilterByNullIteration(filter)
    expect(filter.length).toBe 1

  it 'should refresh column on enter in search box', ->
    searchText = 'foo'
    @createColumn()
    refreshStub = @stub(@column, 'refresh')

    @enterSearchText(searchText).then =>
      @enterSearchText(webdriver.Key.RETURN).then =>
        @assertSearch(refreshStub, searchText)

  it 'should refresh column when clicking search button', ->
    searchText = 'foo'
    @createColumn()
    refreshStub = @stub(@column, 'refresh')

    @enterSearchText(searchText).then =>
      @click(className: 'search-button').then =>
        @assertSearch(refreshStub, searchText)

  it 'should clear search filter on enter in empty search box', ->
    @createColumn()
    refreshStub = @stub(@column, 'refresh')

    @enterSearchText(webdriver.Key.RETURN).then =>
      expect(refreshStub).toHaveBeenCalledOnce()
      refreshConfig = refreshStub.getCall(0).args[0]
      expect(refreshConfig.storeConfig.search).toBe ""

  helpers
    createColumn: (options={}) ->
      Rally.test.mock.env.Global.setupEnvironment
        subscription:
          StoryHierarchyEnabled: options.subscriptionStoryHierarchyEnabled ? true

      contentCell = Ext.get('testDiv').createChild()

      @column = Ext.create('Rally.apps.iterationplanningboard.IterationPlanningBoardBacklogColumn',
        models: [@storyModel]
        renderTo: contentCell
        attribute: 'Iteration'
        contentCell: contentCell
        headerCell: Ext.get('testDiv').createChild()
        statusCell: Ext.get('testDiv').createChild()
        context: Ext.create('Rally.app.Context',
          initialValues:
            featureToggles: Rally.alm.FeatureToggle
            subscription: Rally.environment.getContext().getSubscription()
        )
      )

    createStoryRecord: (data) ->
      Model = Rally.test.mock.data.WsapiModelFactory.getUserStoryModel()
      new Model(data)

    createDefectRecord: (data) ->
      Model = Rally.test.mock.data.WsapiModelFactory.getDefectModel()
      new Model(data)

    shouldHaveFilterByNullIteration: (filter) ->
      expect(filter[0].property).toBe 'Iteration'
      expect(filter[0].operator).toBe '='
      expect(filter[0].value).toBeNull()

    enterSearchText: (text) ->
      @click(css: '.search-text input').sendKeys text

    assertSearch: (refreshStub, searchText) ->
      expect(refreshStub).toHaveBeenCalledOnce()
      refreshConfig = refreshStub.getCall(0).args[0]

      expect(refreshConfig.storeConfig.search).not.toBeNull()
      expect(refreshConfig.storeConfig.search).toEqual searchText


