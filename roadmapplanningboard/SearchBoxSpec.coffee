Ext = window.Ext4 || window.Ext
describe 'Rally.apps.roadmapplanningboard.SearchBox', ->
  beforeEach ->
    @searchBox = Ext.create 'Rally.apps.roadmapplanningboard.SearchBox'

    @_setUpSearchQuery = (searchText) ->
      # setup objects to query
      @searchBox.setRecords(["blah 1", "wow", "blah 2"])
      # set query text to some subset
      @searchBox.setQueryText(searchText)


      searchFilter = (items, query) ->
        filteredItems = (item for item in items when (item.indexOf(query) != -1))
        return filteredItems

      @searchBox.setSearchFilter(searchFilter)

  afterEach ->
    @searchBox.destroy()

  it 'is defined', ->
    expect(@searchBox).toBeDefined()

  it 'has search content accessible', ->
    query = "blah blah blah"
    @searchBox.setQueryText(query)

    expect(@searchBox.getSearchText()).toBe(query)

  it 'can execute the search', ->
    @_setUpSearchQuery("blah")
    expect(@searchBox.executeQuery().length).toBe(2)

  # wait until we have something that allows us to click
  xit 'will execute the search on button click', ->
    @_setUpSearchQuery("blah")
    buttonClickStub = sinon.stub @searchBox, 'executeQuery'
    @searchBox.down("#searchButton").fireEvent('click')

    expect(buttonClickStub.calledOnce).toBeTruthy()

