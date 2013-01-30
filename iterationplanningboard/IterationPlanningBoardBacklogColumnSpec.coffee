Ext = window.Ext4 || window.Ext

describe 'Rally.apps.iterationplanningboard.IterationPlanningBoardBacklogColumn', ->
  beforeEach ->
    @ajax.whenQuerying('HierarchicalRequirement').respondWith()

  afterEach ->
    @column?.destroy()

  it 'show user stories that are not scheduled in an iteration', ->
    @createColumn()
    filter = @column.getStoreFilter('HierarchicalRequirement')

    @shouldHaveFilterByNullIteration(filter)

  it 'show user stories that have no direct children', ->
    @createColumn()
    filter = @column.getStoreFilter('HierarchicalRequirement')

    expect(filter[1].property).toBe 'DirectChildrenCount'
    expect(filter[1].value).toBe 0

  it 'show defects that are not scheduled in an iteration', ->
    @createColumn()
    filter = @column.getStoreFilter('Defect')

    @shouldHaveFilterByNullIteration(filter)

  it 'show defects that are not associated to a requirement', ->
    @createColumn()
    filter = @column.getStoreFilter('Defect')

    expect(filter[1].property).toBe 'Requirement'
    expect(filter[1].value).toBeNull()

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
    filter = @column.getStoreFilter('HierarchicalRequirement')

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
      sinon.assert.calledOnce(refreshStub)
      refreshConfig = refreshStub.getCall(0).args[0]
      expect(refreshConfig.storeConfig.search).toBe ""

  helpers
    createColumn: (options={}) ->
      Rally.mock.env.Global.setupEnvironment
        subscription:
          StoryHierarchyEnabled: options.subscriptionStoryHierarchyEnabled ? true

      @column = Ext.create('Rally.apps.iterationplanningboard.IterationPlanningBoardBacklogColumn',
        types: ['HierarchicalRequirement']
        renderTo: Ext.getBody().createChild(),
        attribute: 'Iteration',
        context: Ext.create('Rally.app.Context',
          initialValues:
            featureToggles: Rally.alm.FeatureToggle
            subscription: Rally.environment.getContext().getSubscription()
        )
      )

    createStoryRecord: (data) ->
      Model = Rally.mock.data.ModelFactory.getUserStoryModel()
      new Model(data)

    createDefectRecord: (data) ->
      Model = Rally.mock.data.ModelFactory.getDefectModel()
      new Model(data)

    shouldHaveFilterByNullIteration: (filter) ->
      expect(filter[0].property).toBe 'Iteration'
      expect(filter[0].operator).toBe '='
      expect(filter[0].value).toBeNull()

    enterSearchText: (text) ->
      @click(css: '.search-text input').sendKeys text

    assertSearch: (refreshStub, searchText) ->
      sinon.assert.calledOnce(refreshStub)
      refreshConfig = refreshStub.getCall(0).args[0]

      expect(refreshConfig.storeConfig.search).not.toBeNull()
      expect(refreshConfig.storeConfig.search).toEqual searchText


