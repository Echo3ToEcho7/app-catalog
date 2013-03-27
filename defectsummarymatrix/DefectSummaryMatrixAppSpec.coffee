Ext = window.Ext4 || window.Ext

Ext.require [
  'Rally.apps.defectsummarymatrix.DefectSummaryMatrixApp'
  'Rally.mock.data.ModelFactory'
]

describe 'Rally.apps.defectsummarymatrix.DefectSummaryMatrixApp', ->

  helpers
    createApp: (settings = {}) ->
      @app = Ext.create('Rally.apps.defectsummarymatrix.DefectSummaryMatrixApp',
        context: Ext.create('Rally.app.Context',
          initialValues:
            project: Rally.environment.getContext().getProject()
        ),
        settings: settings,
        renderTo: 'testDiv'
      )

    createAppAndWaitForGrid: (settings = {}) ->
      app = @createApp settings
      once
        condition: ->
          grid = app.down('rallygrid')
          grid && grid.getStore() && grid.getStore().getCount() > 0
        description: 'matrix grid populated'

    createAppWaitForGridAndClickOnCell: (row, col, settings = {}) ->
      @createAppAndWaitForGrid().then =>
        @ajax.whenQuerying('defect').respondWith(Rally.mock.ModelObjectMother.getData('Defect')[0])
        @clickCellInMatrixGrid(col, row)
        once
          condition: =>
            grid = @app.defectGrid
            grid && grid.getStore().getCount() > 0
          description: 'the defect grid has been loaded'

    getCellInMatrixGrid: (rowNumber, colNumber) ->
      @app.down('rallygrid').getEl().down('table tr:nth-child(' + rowNumber + ') td:nth-child(' + colNumber + ') a')

    clickCellInMatrixGrid: (rowNumber, colNumber) ->
      @getCellInMatrixGrid(rowNumber, colNumber).dom.click()

    getCountForCellInMatrixGrid: (rowNumber, colNumber) ->
      @getCellInMatrixGrid(rowNumber, colNumber).getHTML()

    getStateNameForColumn: (colNumber) ->
      @app.down('rallygrid').getEl().down('div.x4-column-header:nth-child(' + colNumber + ') span').getHTML()

    getPriorityNameForRow: (rowNumber) ->
      @app.down('rallygrid').getEl().down('table tr:nth-child(' + rowNumber + ') td div').getHTML()

    getDefectTableHeaderText: () ->
      header = @app.defectGridHeader
      if (header)
        header.getEl().getHTML()
      else
        ''

    getMockDefectDataForAttribute: (attr) ->
      Ext.Array.pluck(Ext.Array.filter(Rally.mock.data.ModelFactory.getModelDefinition('Defect').Attributes, (el) ->
        el.Name == attr
      )[0].AllowedValues, 'StringValue')

    getMockPriorityDataWithBlankValuesConvertedToNone: () ->
      priorities = @getMockDefectDataForAttribute('Priority')
      Ext.Array.map(priorities, (el) ->
        if el == ''
          return 'None'
        return el
      )

    createCustomDefectResponse: () ->
      @ajax.whenQuerying('defect').respondWith([
        { State: @states[0], Priority: @priorities[0] },
        { State: @states[0], Priority: @priorities[0] },
        { State: @states[1], Priority: @priorities[0] },
        { State: @states[0], Priority: @priorities[1] },
      ])

    verifyHeaderContainsText: (txt) ->
      @getDefectTableHeaderText().indexOf(txt) > -1

  beforeEach ->
    @ajax.whenQuerying('release').respondWith [{
      ReleaseStartDate: "2010-07-11T00:00:00.000Z",
      ReleaseDate: "2010-07-15T23:59:59.000Z"
    }, {
      ReleaseStartDate: "2010-07-04T00:00:00.000Z",
      ReleaseDate: "2010-07-08T23:59:59.000Z"
    }
    ]
    @ajax.whenQuerying('defect').respondWithCount 1
    @states = @getMockDefectDataForAttribute('State')
    @priorities = @getMockPriorityDataWithBlankValuesConvertedToNone()
    @statesLength = @states.length
    @prioritiesLength = @priorities.length
    @col = 3
    @row = 4

  afterEach ->
    @app?.destroy()

  describe 'once the data loads', ->

    it 'shows the expected states', ->
      @createAppAndWaitForGrid().then =>
        expect(@app.states).toEqual(@states)

    it 'shows the expected priorities', ->
      @createAppAndWaitForGrid().then =>
        expect(@app.priorities).toEqual(@priorities)

    it 'adds the total row to the table', ->
      @createAppAndWaitForGrid().then =>
        once
          condition: =>
            @getPriorityNameForRow(@prioritiesLength + 2) == 'Total'
          description: 'The table contains a total row'

    it 'adds the total column to the table', ->
      @createAppAndWaitForGrid().then =>
        once
          condition: =>
            @getStateNameForColumn(@statesLength + 2) == 'Total'
          description: 'The table contains a total column'

    it 'updates the data in the table when the release is changed', ->
      @createAppAndWaitForGrid().then =>
        oldTotal = @getCountForCellInMatrixGrid(@prioritiesLength + 2, @statesLength + 2)
        @createCustomDefectResponse()
        @app.getEl().down('.combobox-left-arrow').dom.click()
        once
          condition: =>
            grid = @app.down('rallygrid')
            grid &&
              grid.getStore() &&
              grid.getStore().getCount() > 0 &&
              @getCountForCellInMatrixGrid(@prioritiesLength + 2, @statesLength + 2) != oldTotal
          description: 'The data in the table has changed'

    it 'loads proper counts for all cells', ->
      @createCustomDefectResponse()
      @createAppAndWaitForGrid().then =>
        once
          condition: =>
            @getCountForCellInMatrixGrid(2, 2) == "2" &&
              @getCountForCellInMatrixGrid(3, 2) == "1" &&
              @getCountForCellInMatrixGrid(2, 3) == "1" &&
              @getCountForCellInMatrixGrid(2, @statesLength + 2) == "3" &&
              @getCountForCellInMatrixGrid(3, @statesLength + 2) == "1" &&
              @getCountForCellInMatrixGrid(@prioritiesLength + 2, 2) == "3" &&
              @getCountForCellInMatrixGrid(@prioritiesLength + 2, 3) == "1" &&
              @getCountForCellInMatrixGrid(@prioritiesLength + 2, @statesLength + 2) == "4"
          description: 'all the cell counts are as expected'

    it 'shows a message and no grid when there are no releases', ->
      @ajax.whenQuerying('release').respondWith([])
      @createApp()
      once(
        condition: =>
          msgBox = @app.getEl().down('.rui-timebox-blank-slate span')
          msgBox and msgBox.getHTML().indexOf('There are no Releases defined.') isnt -1
        description: 'shows "no releases" message'
      ).then =>
        once(
          condition: =>
            @app.down('rallygrid') is null
          description: 'does not display grid'
        ).then =>
          once
            condition: =>
              @app.loadMask is null
            description: 'does not show load mask'


  describe 'when a cell is clicked', ->

    it 'shows the expected title over the defect grid table', ->
      @createAppAndWaitForGrid().then =>
        @clickCellInMatrixGrid(@row, @col)
        once
          condition: =>
            @verifyHeaderContainsText(@getStateNameForColumn(@col)) &&
            @verifyHeaderContainsText(@getPriorityNameForRow(@row))
          description: 'The table header contains the expected state and priority'

    it 'loads the defect grid when you click on a matrix grid cell with a non-zero value', ->
      @createAppAndWaitForGrid().then =>
        @ajax.whenQuerying('defect').respondWith(Rally.mock.ModelObjectMother.getData('Defect')[0])
        @clickCellInMatrixGrid(@row, @col)
        once
          condition: =>
            grid = @app.defectGrid
            grid && grid.getStore().getCount() > 0
          description: 'the defect grid has been loaded'

    it 'shows an empty defect grid when clicking an zero value in the table', ->
      @createAppAndWaitForGrid().then =>
        @ajax.whenQuerying('defect').respondWith([])
        @clickCellInMatrixGrid(@row, @col)
        once
          condition: =>
            grid = @app.defectGrid
            grid && grid.getEl().down('.x4-grid-view-empty')
          description: 'The empty table message is shown'

  describe 'once both tables are shown', ->

    it 'changes the title over the defect table when clicking a different cell in the upper table', ->
      @createAppWaitForGridAndClickOnCell(@row - 1, @col - 1).then =>
        originalTitle = @getDefectTableHeaderText()
        @clickCellInMatrixGrid(@col, @row)
        once
          condition: =>
            newTitle = @getDefectTableHeaderText()
            newTitle != '' && newTitle != originalTitle
          description: 'the table title has been changed'

    it 'loads new data in the defect table when clicking a different cell in the upper table', ->
      @createAppWaitForGridAndClickOnCell(@row - 1, @col - 1).then =>
        originalRowCount = @app.defectGrid.getStore().getCount()
        @ajax.whenQuerying('defect').respondWith(Rally.mock.ModelObjectMother.getData('Defect'))
        @clickCellInMatrixGrid(@col, @row)
        once
          condition: =>
            grid = @app.defectGrid
            grid && grid.getStore().getCount != originalRowCount
          description: 'the data in the table has been changed'

  describe 'the various table header combinations all work as expected', ->
    beforeEach ->
      @priority = 'priority'
      @state = 'state'

    it 'constructs a base title', ->
      @createAppAndWaitForGrid().then =>
        title = @app._determineDefectGridTitle(@priority, @state, false, false)
        expect(title).toBe('state priority Defects')

    it 'constructs a title with all of a given state', ->
      @createAppAndWaitForGrid().then =>
        title = @app._determineDefectGridTitle(@priority, @state, true, false)
        expect(title).toBe('All state Defects')

    it 'constructs a title with all of a given priority', ->
      @createAppAndWaitForGrid().then =>
        title = @app._determineDefectGridTitle(@priority, @state, false, true)
        expect(title).toBe('All priority Defects')

    it 'constructs a title with all defects', ->
      @createAppAndWaitForGrid().then =>
        title = @app._determineDefectGridTitle(@priority, @state, true, true)
        expect(title).toBe('All Defects')

    it 'constructs a title with for defects with no priority in a given state', ->
      @createAppAndWaitForGrid().then =>
        @priority = 'None'
        title = @app._determineDefectGridTitle(@priority, @state, false, false)
        expect(title).toBe('state Defects Without a Priority')

    it 'constructs a title with all defects that have no priority', ->
      @createAppAndWaitForGrid().then =>
        @priority = 'None'
        title = @app._determineDefectGridTitle(@priority, @state, false, true)
        expect(title).toBe('All Defects Without a Priority')