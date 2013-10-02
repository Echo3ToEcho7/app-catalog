Ext = window.Ext4 || window.Ext

Ext.require [
  'Rally.apps.iterationplanningboard.IterationPlanningBoardColumn'
  'Rally.apps.iterationplanningboard.TimeboxScrollable'
  'Rally.util.Array'
]

describe 'Rally.apps.iterationplanningboard.TimeboxScrollable', ->
  beforeEach ->
    @ajax.whenQuerying('userstory').respondWith()

  afterEach ->
    @cardboard.destroy()

  it 'should render forward button into header of last column', ->
    @createBoard().then =>
      @assertButtonIsInColumnHeader @plugin.forwardsButton, @plugin.getLastVisibleScrollableColumn()

  it 'should render backwards button into header of first column', ->
    @createBoard().then =>
      @assertButtonIsInColumnHeader @plugin.backwardsButton, @plugin.getFirstVisibleScrollableColumn()

  it 'should create visible forward button when there are forward columns', ->
    @createBoard(
      recordsEndIndex: -2
    ).then =>
      expect(@plugin.forwardsButton.hidden).toBe false

  it 'should create visible back button when there are back columns', ->
    @createBoard(
      recordsStartIndex: 1
    ).then =>
      expect(@plugin.backwardsButton.hidden).toBe false

  it 'should create hidden forward button when there are no forward columns', ->
    @createBoard(
      recordsEndIndex: -1
    ).then =>
      expect(@plugin.forwardsButton.hidden).toBe true

  it 'should create hidden back button when there are no back columns', ->
    @createBoard(
      recordsStartIndex: 0
    ).then =>
      expect(@plugin.backwardsButton.hidden).toBe true

  it 'should scroll forward when the forward button is clicked', ->
    @createBoard().then =>
      @scrollForwards().then =>
        expect(@plugin.getLastVisibleScrollableColumn().timeboxRecords).toBe (Rally.util.Array.last @bucketedIterationRecords)

  it 'should scroll backwards when the back button is clicked', ->
    @createBoard().then =>
      @scrollBackwards().then =>
        expect(@plugin.getFirstVisibleScrollableColumn().timeboxRecords).toBe @bucketedIterationRecords[0]

  it 'should contain same number of columns after scrolling forwards', ->
    @createBoard().then =>
      @scrollForwards().then =>
        expect(@cardboard.getColumns().length).toBe @numColumns

  it 'should contain same number of columns after scrolling backwards', ->
    @createBoard().then =>
      @scrollBackwards().then =>
        expect(@cardboard.getColumns().length).toBe @numColumns

  it 'should destroy column removed when scrolling forwards', ->
    @createBoard().then =>
      columnToRemove = @plugin.getFirstVisibleScrollableColumn()
      @scrollForwards().then =>
        expect(columnToRemove.isDestroyed).toBe true

  it 'should destroy column removed when scrolling backwards', ->
    @createBoard().then =>
      columnToRemove = @plugin.getLastVisibleScrollableColumn()
      @scrollBackwards().then =>
        expect(columnToRemove.isDestroyed).toBe true

  it 'should only contain 1 header cell for each column after scrolling forwards', ->
    @createBoard().then =>
      @scrollForwards().then =>
        expect(@getColumnHeaderCells().length).toBe @numColumns

  it 'should only contain 1 header cell for each column after scrolling backwards', ->
    @createBoard().then =>
      @scrollBackwards().then =>
        expect(@getColumnHeaderCells().length).toBe @numColumns

  it 'should only contain 1 content cell for each column after scrolling forwards', ->
    @createBoard().then =>
      @scrollForwards().then =>
        expect(@getColumnContentCells().length).toBe @numColumns

  it 'should only contain 1 content cell for each column after scrolling backwards', ->
    @createBoard().then =>
      @scrollBackwards().then =>
        expect(@getColumnContentCells().length).toBe @numColumns

  it 'should render newly visible column in right-most column when scrolling forwards', ->
    @createBoard().then =>
      @scrollForwards().then =>
        expect(@plugin.getLastVisibleScrollableColumn().getColumnHeaderCell().dom).toBe (Rally.util.Array.last @getColumnHeaderCells())
        expect(@plugin.getLastVisibleScrollableColumn().getContentCell().dom).toBe (Rally.util.Array.last @getColumnContentCells())

  it 'should render newly visible column in left-most column when scrolling backwards', ->
    @createBoard().then =>
      @scrollBackwards().then =>
        expect(@plugin.getFirstVisibleScrollableColumn().getColumnHeaderCell().dom).toBe @getColumnHeaderCells()[0]
        expect(@plugin.getFirstVisibleScrollableColumn().getContentCell().dom).toBe @getColumnContentCells()[0]

  it 'should re-render scroll buttons after scrolling forwards', ->
    @createBoard().then =>
      @scrollForwards().then =>
        @assertButtonIsInColumnHeader @plugin.forwardsButton, @plugin.getLastVisibleScrollableColumn()
        @assertButtonIsInColumnHeader @plugin.backwardsButton, @plugin.getFirstVisibleScrollableColumn()

  it 'should re-render scroll buttons after scrolling backwards', ->
    @createBoard().then =>
      @scrollBackwards().then =>
        @assertButtonIsInColumnHeader @plugin.forwardsButton, @plugin.getLastVisibleScrollableColumn()
        @assertButtonIsInColumnHeader @plugin.backwardsButton, @plugin.getFirstVisibleScrollableColumn()

  it 'should destroy old scroll buttons after scrolling forwards', ->
    @createBoard().then =>
      @scrollForwards().then =>
        expect(@cardboard.getEl().query('.scroll-button').length).toBe 2

  it 'should destroy old scroll buttons after scrolling backwards', ->
    @createBoard().then =>
      @scrollBackwards().then =>
        expect(@cardboard.getEl().query('.scroll-button').length).toBe 2

  it 'should filter newly added column after scrolling forwards', ->
    @createBoard().then =>
      filterSpy = @spy @cardboard, 'applyLocalFilters'
      @scrollForwards().then =>
        expect(filterSpy.callCount).toBe 1

  it 'should filter newly added column after scrolling backwards', ->
    @createBoard().then =>
      filterSpy = @spy @cardboard, 'applyLocalFilters'
      @scrollBackwards().then =>
        expect(filterSpy.callCount).toBe 1

  helpers
    createBoard: (options = {}) ->
      @bucketedIterationRecords = Helpers.IterationDataCreatorHelper.createIterationData
        bucketIterations: true
        createRecords: true
        iterationCount: 5
        plannedVelocity: options.plannedVelocity

      columns = @createColumns @bucketedIterationRecords[options.recordsStartIndex ? 1 .. options.recordsEndIndex ? -2]
      @numColumns = columns.length

      @cardboard = Ext.create 'Rally.apps.iterationplanningboard.TimeboxCardBoard',
        columnConfig:
          xtype: 'iterationplanningboardappplanningcolumn'
        columns: columns
        plugins: [
          ptype: 'rallytimeboxscrollablecardboard'
          pluginId: 'scrollablePlugin'
          getFirstVisibleScrollableColumn: ->
            @cmp.getColumns()[0]
          getLastVisibleScrollableColumn: ->
            Rally.util.Array.last @cmp.getColumns()
          getScrollableColumns: ->
            @cmp.getColumns()
        ]
        renderTo: 'testDiv'
        scrollableColumnRecords: @bucketedIterationRecords

      @plugin = @cardboard.getPlugin('scrollablePlugin')

      @waitForComponentReady @cardboard

    createColumns: (bucketedRecords) ->
      (
        xtype: 'iterationplanningboardappplanningcolumn'
        timeboxRecords: records
      ) for records in bucketedRecords

    scrollBackwards: ->
      @click(className: 'scroll-backwards')

    scrollForwards: ->
      @click(className: 'scroll-forwards')

    getColumnHeaderCells: ->
      @cardboard.getEl().query('th.card-column')

    getColumnContentCells: ->
      @cardboard.getEl().query('td.card-column')

    assertButtonIsInColumnHeader: (button, column) ->
      expect(column.getColumnHeader().getEl().getById(button.getEl().id)).not.toBeNull()