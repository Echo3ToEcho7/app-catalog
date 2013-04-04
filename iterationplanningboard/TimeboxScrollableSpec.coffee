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
      @assertButtonIsInColumnHeader @plugin.forwardsButton, @plugin.getLastScrollableColumn()

  it 'should render backwards button into header of first column', ->
    @createBoard().then =>
      @assertButtonIsInColumnHeader @plugin.backwardsButton, @plugin.getFirstScrollableColumn()

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
        expect(@plugin.getLastScrollableColumn().timeboxRecords).toBe (Rally.util.Array.last @bucketedIterationRecords)

  it 'should scroll backwards when the back button is clicked', ->
    @createBoard().then =>
      @scrollBackwards().then =>
        expect(@plugin.getFirstScrollableColumn().timeboxRecords).toBe @bucketedIterationRecords[0]

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
      columnToRemove = @plugin.getFirstScrollableColumn()
      @scrollForwards().then =>
        expect(columnToRemove.isDestroyed).toBe true

  it 'should destroy column removed when scrolling backwards', ->
    @createBoard().then =>
      columnToRemove = @plugin.getLastScrollableColumn()
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
        expect(@plugin.getLastScrollableColumn().getColumnHeaderCell().dom).toBe (Rally.util.Array.last @getColumnHeaderCells())
        expect(@plugin.getLastScrollableColumn().getContentCell().dom).toBe (Rally.util.Array.last @getColumnContentCells())

  it 'should render newly visible column in left-most column when scrolling backwards', ->
    @createBoard().then =>
      @scrollBackwards().then =>
        expect(@plugin.getFirstScrollableColumn().getColumnHeaderCell().dom).toBe @getColumnHeaderCells()[0]
        expect(@plugin.getFirstScrollableColumn().getContentCell().dom).toBe @getColumnContentCells()[0]

  it 'should re-render scroll buttons after scrolling forwards', ->
    @createBoard().then =>
      @scrollForwards().then =>
        @assertButtonIsInColumnHeader @plugin.forwardsButton, @plugin.getLastScrollableColumn()
        @assertButtonIsInColumnHeader @plugin.backwardsButton, @plugin.getFirstScrollableColumn()

  it 'should re-render scroll buttons after scrolling backwards', ->
    @createBoard().then =>
      @scrollBackwards().then =>
        @assertButtonIsInColumnHeader @plugin.forwardsButton, @plugin.getLastScrollableColumn()
        @assertButtonIsInColumnHeader @plugin.backwardsButton, @plugin.getFirstScrollableColumn()

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
      filterSpy = @spy @cardboard, 'locallyFilter'
      @scrollForwards().then =>
        expect(filterSpy.callCount).toBe 1

  it 'should filter newly added column after scrolling backwards', ->
    @createBoard().then =>
      filterSpy = @spy @cardboard, 'locallyFilter'
      @scrollBackwards().then =>
        expect(filterSpy.callCount).toBe 1

  it 'should size forwards button to column header when there is no progress bar', ->
    @createBoard().then =>
      expect(@plugin.forwardsButton.getHeight()).toBe @plugin.getLastScrollableColumn().getColumnHeaderCell().getHeight(Ext.isGecko || Ext.isIE)

  it 'should size backwards button to column header when there is no progress bar', ->
    @createBoard().then =>
      expect(@plugin.backwardsButton.getHeight()).toBe @plugin.getFirstScrollableColumn().getColumnHeaderCell().getHeight(Ext.isGecko || Ext.isIE)

  it 'should size forwards button to column header minus progress bar when there is a progress bar', ->
    @createBoard(
      plannedVelocity: 10
    ).then =>
      expect(@plugin.forwardsButton.getHeight()).toBe @plugin.getLastScrollableColumn().getProgressBar().getTop() - @plugin.getLastScrollableColumn().getColumnHeader().getEl().getTop()

  it 'should size backwards button to column header minus progress bar when there is a progress bar', ->
    @createBoard(
      plannedVelocity: 10
    ).then =>
      expect(@plugin.backwardsButton.getHeight()).toBe  @plugin.getLastScrollableColumn().getProgressBar().getTop() - @plugin.getFirstScrollableColumn().getColumnHeader().getEl().getTop()

  helpers
    createBoard: (options = {}) ->
      @bucketedIterationRecords = Helpers.IterationDataCreatorHelper.createIterationData
        bucketIterations: true
        createRecords: true
        iterationCount: 5
        plannedVelocity: options.plannedVelocity

      columns = @createColumns @bucketedIterationRecords[options.recordsStartIndex ? 1 .. options.recordsEndIndex ? -2]
      @numColumns = columns.length

      @cardboard = Ext.create 'Rally.ui.cardboard.CardBoard',
        columnConfig:
          xtype: 'iterationplanningboardappplanningcolumn'
        columns: columns
        plugins: [
          ptype: 'rallytimeboxscrollablecardboard'
          pluginId: 'scrollablePlugin'
          getFirstScrollableColumn: ->
            @cmp.getColumns()[0]
          getLastScrollableColumn: ->
            Rally.util.Array.last @cmp.getColumns()
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