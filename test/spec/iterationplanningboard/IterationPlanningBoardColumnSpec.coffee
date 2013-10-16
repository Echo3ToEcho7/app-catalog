Ext = window.Ext4 || window.Ext

Ext.require [
  'Rally.ui.renderer.template.progressbar.TimeboxProgressBarTemplate'
]

describe 'Rally.apps.iterationplanningboard.IterationPlanningBoardColumn', ->
  beforeEach ->
    queryStub = @ajax.whenQuerying('artifact').respondWith()
    @colors = Rally.ui.renderer.template.progressbar.TimeboxProgressBarTemplate.percentFullColors

  afterEach ->
    @column?.destroy()

  it 'should render the iteration name', ->
    iterationName = 'talking bout my iteration'
    @createColumn
      name: iterationName

    expect(@column.getColumnHeaderCell().down('.columnTitle').dom.textContent).toEqual(iterationName)

  it 'should render the current iteration column', ->
    iterationName = 'talking bout my iteration'
    @createColumn
      name: iterationName
      endDate: Rally.util.DateTime.add(new Date(), 'day', 1)
      startDate: Rally.util.DateTime.add(new Date(), 'day', -1)

    expect(@column.getColumnHeaderCell().hasCls('current-timebox')).toBe true
    expect(@column.getContentCell().hasCls('current-timebox')).toBe true

  it 'should defaultly render a noncurrent iteration column', ->
    iterationName = 'talking bout my iteration'
    @createColumn
      name: iterationName

    expect(@column.getColumnHeaderCell().hasCls('current-timebox')).toBe false
    expect(@column.getContentCell().hasCls('current-timebox')).toBe false

  it 'should render the iteration dates', ->
    startDate = Ext.Date.parse('2012-11-06', 'Y-m-d')
    endDate = Ext.Date.parse('2012-11-07', 'Y-m-d')
    @createColumn
      startDate: startDate
      endDate: endDate

    expectedResult = Ext.String.format '{0} - {1}',
      Rally.util.DateTime.formatWithNoYearWithDefault(startDate),
      Rally.util.DateTime.formatWithNoYearWithDefault(endDate)

    expect(@column.getColumnHeaderCell().down('.timeboxDates').getHTML()).toEqual(expectedResult)

  it 'should include the correct timebox filters when querying for data', ->
    @createColumn
      iterationCount: 2

    timebox = @column.getTimeboxRecords()[0]
    filter = @column.getStoreFilter()
    expect(filter.length).toBe 3
    expect(filter[0].property).toEqual('Iteration.Name')
    expect(filter[0].value).toEqual(timebox.get('Name'))
    expect(filter[1].property).toEqual('Iteration.StartDate')
    expect(filter[1].value).toEqual(Rally.util.DateTime.toIsoString(timebox.get('StartDate')))
    expect(filter[2].property).toEqual('Iteration.EndDate')
    expect(filter[2].value).toEqual(Rally.util.DateTime.toIsoString(timebox.get('EndDate')))


  it 'should match a record whose iteration is any of the column timeboxes', ->
    @createColumn
      iterationCount: 2

    for timebox in @column.getTimeboxRecords()
      record = @createUserStoryRecord
        Iteration:
          _ref: timebox.get('_ref')

      expect(@column.isMatchingRecord record).toBe true

  it 'should not match a record whose iteration is not one of the column timeboxes', ->
    @createColumn
      iterationCount: 2

    record = @createUserStoryRecord
      Iteration:
        _ref: '/iteration/12345'

    expect(@column.isMatchingRecord record).toBe false

  it 'should not match a record with no iteration', ->
    @createColumn
      iterationCount: 2

    record = @createUserStoryRecord
      Iteration: null

    expect(@column.isMatchingRecord record).toBe false

  it 'should not show percent bar when planned velocity is 0', ->
    @createColumn
      iterationCount: 2
      plannedVelocity: 0

    expect(@getProgressBarContainer()).toBeNull()

  it 'should not show percent bar when planned velocity is 0 and column has card with plan estimate', ->
    @createColumn
      iterationCount: 2
      plannedVelocity: 0

    @column.createAndAddCard @createUserStoryRecord {
      Iteration: @column.getTimeboxRecords()[0].get('_ref')
      PlanEstimate: 2
    }

    expect(@getProgressBarContainer()).toBeNull()

  it 'should show 0 out of planned velocity when column has no cards', ->
    @createColumn
      iterationCount: 2
      plannedVelocity: 10

    expect(@getProgressBarLabel().getHTML()).toEqual '0 of 20'

  it 'should show 0 out of planned velocity when column has card without plan estimate', ->
    @createColumn
      iterationCount: 2
      plannedVelocity: 10

    @column.createAndAddCard @createUserStoryRecord {
      Iteration: @column.getTimeboxRecords()[0].get('_ref')
    }
    expect(@getProgressBarLabel().getHTML()).toEqual '0 of 20'

  it 'should show the fullness of the iteration using PlanEstimates out of Planned Velocity', ->
    @createColumn
      iterationCount: 2
      plannedVelocity: 10

    @column.createAndAddCard @createUserStoryRecord {
      Iteration: @column.getTimeboxRecords()[0].get('_ref')
      PlanEstimate: 2
    }
    expect(@getProgressBarLabel().getHTML()).toEqual '2 of 20'


  it 'should update the progress bar after a card is removed', ->
    @createColumn
      iterationCount: 2
      plannedVelocity: 10

    card = @column.createAndAddCard @createUserStoryRecord {
      Iteration: @column.getTimeboxRecords()[0].get('_ref')
      PlanEstimate: 2
    }
    @column.removeCard card

    expect(@getProgressBarLabel().getHTML()).toEqual '0 of 20'

  it 'should show a blue bar when iteration capacity is less than 80% full', ->
    @createColumn
      iterationCount: 2
      plannedVelocity: 10

    @column.createAndAddCard @createUserStoryRecord {
      Iteration: @column.getTimeboxRecords()[0].get('_ref')
      PlanEstimate: 8
    }
    expect(@getProgressBarBar().getColor 'background-color').toEqual @colors.blue

  it 'should show a green bar when iteration capacity is 80% full', ->
    @createColumn
      iterationCount: 2
      plannedVelocity: 5

    @column.createAndAddCard @createUserStoryRecord {
      Iteration: @column.getTimeboxRecords()[0].get('_ref')
      PlanEstimate: 8
    }
    expect(@getProgressBarBar().getColor 'background-color').toEqual @colors.green

  it 'should show a green bar when iteration capacity is 100% full', ->
    @createColumn
      iterationCount: 2
      plannedVelocity: 5

    @column.createAndAddCard @createUserStoryRecord {
      Iteration: @column.getTimeboxRecords()[0].get('_ref')
      PlanEstimate: 10
    }
    expect(@getProgressBarBar().getColor 'background-color').toEqual @colors.green

  it 'should show a red bar when iteration capacity is greater than 100% full', ->
    @createColumn
      iterationCount: 2
      plannedVelocity: 5

    @column.createAndAddCard @createUserStoryRecord {
      Iteration: @column.getTimeboxRecords()[0].get('_ref')
      PlanEstimate: 20
    }
    expect(@getProgressBarBar().getColor 'background-color').toEqual @colors.red


  it 'should put a background color behind the progress bar', ->
    @createColumn
      plannedVelocity: 5
    expect(@getProgressBarContainer()).not.toBeNull()

  it 'should not put a progress bar background color when there is no progress bar', ->
    @createColumn
      plannedVelocity: 0
    expect(@getProgressBarContainer()).toBeNull()

  it 'should round plan estimate total to two decimal places', ->
    @createColumn
      iterationCount: 5
      plannedVelocity: 20

    @column.createAndAddCard @createUserStoryRecord {
      Iteration: @column.getTimeboxRecords()[0].get('_ref')
      PlanEstimate: 1.32 * 10 # 13.2000000001
    }
    expect(@getProgressBarLabel().getHTML()).toEqual '13.2 of 100'

  it 'should round planned velocity to two decimal places', ->
    @createColumn # Total: 13.2000000001
      iterationCount: 10
      plannedVelocity: 1.32

    @column.createAndAddCard @createUserStoryRecord {
      Iteration: @column.getTimeboxRecords()[0].get('_ref')
      PlanEstimate: 10
    }
    expect(@getProgressBarLabel().getHTML()).toEqual '10 of 13.2'

  it 'should refresh progress bar when addcard event is fired by column', ->

    @createColumn # Total: 13.2000000001
      iterationCount: 10
      plannedVelocity: 1.32

    progressBarUpdateSpy = @stub(@column.columnStatus, 'update')

    @column.fireEvent 'addcard'

    expect(progressBarUpdateSpy.callCount).toBe(1)

  it 'should refresh progress bar when load event is fired by column', ->

    @createColumn # Total: 13.2000000001
      iterationCount: 10
      plannedVelocity: 1.32

    progressBarUpdateSpy = @stub(@column.columnStatus, 'update')

    @column.fireEvent 'load'

    expect(progressBarUpdateSpy.callCount).toBe(1)


  it 'should refresh progress bar when removecard event is fired by column', ->

    @createColumn # Total: 13.2000000001
      iterationCount: 10
      plannedVelocity: 1.32

    progressBarUpdateSpy = @stub(@column.columnStatus, 'update')

    @column.fireEvent 'removecard'

    expect(progressBarUpdateSpy.callCount).toBe(1)

  it 'should refresh progress bar when cardupdated event is fired by column', ->

    @createColumn # Total: 13.2000000001
      iterationCount: 10
      plannedVelocity: 1.32

    progressBarUpdateSpy = @stub(@column.columnStatus, 'update')

    @column.fireEvent 'cardupdated'

    expect(progressBarUpdateSpy.callCount).toBe(1)

  it 'should add columnHeaderConfig to the column', ->
    Model = Rally.test.mock.data.WsapiModelFactory.getIterationModel()
    timeboxRecords = []

    for i in [1 .. 4]
      timeboxRecords.push new Model(
        _ref: "/iteration/#{i}"
        _refObjectName: 'my iteration'
        ObjectID: i
        Name: 'my iteration'
        StartDate: new Date()
        EndDate: new Date()
        PlannedVelocity: 0
      )
    @column = Ext.create 'Rally.apps.iterationplanningboard.IterationPlanningBoardColumn',
      model: Rally.test.mock.data.WsapiModelFactory.getUserStoryModel()
      renderTo: 'testDiv'
      headerCell: Ext.get 'testDiv'
      statusCell: Ext.get 'testDiv'
      contentCell: Ext.get 'testDiv'
      attribute: 'Iteration'
      timeboxRecords: timeboxRecords
      ,
      context: Ext.create('Rally.app.Context',
        initialValues: {}
      )

    expect(@column.config.columnHeaderConfig).toBeDefined()
    expect(@column.config.columnHeaderConfig.record).toBeDefined()
    expect(@column.config.columnHeaderConfig.fieldToDisplay).toBeDefined()

  helpers
    createColumn: (options) ->
      Model = Rally.test.mock.data.WsapiModelFactory.getIterationModel()
      timeboxRecords = []

      timeboxRecords = for i in [1 .. options.iterationCount ? 1]
        new Model(
          _ref: "/iteration/#{i}"
          _refObjectName: options.name || 'my iteration'
          ObjectID: i
          Name: options.name || 'my iteration'
          StartDate: options.startDate || new Date()
          EndDate: options.endDate || new Date()
          PlannedVelocity: options.plannedVelocity
        )

      @column = Ext.create 'Rally.apps.iterationplanningboard.IterationPlanningBoardColumn',
        model: Rally.test.mock.data.WsapiModelFactory.getUserStoryModel()
        renderTo: 'testDiv'
        headerCell: Ext.get('testDiv').createChild()
        statusCell: Ext.get('testDiv').createChild()
        contentCell: Ext.get('testDiv').createChild()
        attribute: 'Iteration'
        timeboxRecords: timeboxRecords
        columnHeaderConfig:
          record: timeboxRecords[0]
          fieldToDisplay: 'Name'
          editable: true
        ,
        context: Ext.create('Rally.app.Context',
          initialValues: {}
        )

      @column.getProgressBar()?.update()

    createUserStoryRecord: (options) ->
      Model = Rally.test.mock.data.WsapiModelFactory.getUserStoryModel()
      new Model(Ext.merge({ObjectID: Ext.Number.randomInt(1, 1000)}, options))

    getProgressBar: -> @column.getProgressBar()

    getProgressBarEl: -> @getProgressBar().getEl()

    getProgressBarBar: -> @getProgressBar().getEl().select('.progress-bar').item 0

    getProgressBarContainer: -> @getProgressBarEl().select('.progress-bar-background').item 0

    getProgressBarLabel: -> @getProgressBarEl().select('.progress-bar-label').item 0
