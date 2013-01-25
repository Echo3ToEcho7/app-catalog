Ext = window.Ext4 || window.Ext
startDate = new Date '1/01/2012'
endDate = new Date '1/01/2013'
endOfEndDate = new Date(+endDate + 86400000)
infinitySymbol = '&#8734;'

describe 'Rally.apps.roadmapplanningboard.RoadmapPlanningBoardColumn', ->

  beforeEach ->

    @ajax.whenQuerying('portfolioitem/feature').respondWith [
      {ObjectID: 1, Name: 'test', FormattedID: 'F1', PlannedEndDate: new Date(+startDate + 1)}
    ]

  afterEach ->
    Rally.test.destroyComponentsOfQuery('roadmapplanningboardcolumn')

  it 'should filter unscheduled features for display in a column with no end date', ->

    column = Ext.create 'Rally.apps.roadmapplanningboard.RoadmapPlanningBoardColumn',
      renderTo: 'testDiv'
    
    filter = column.getStoreFilter()
    expect(filter).toEqual [{
      property: 'PlannedEndDate',
      operator: "=",
      value: 'null'
    }]


  it 'should filter scheduled features for display in the correct timeframe column', ->
    column = Ext.create 'Rally.apps.roadmapplanningboard.RoadmapPlanningBoardColumn', {
      startDate: startDate
      endDate: endDate
      capacity: 50
      renderTo: 'testDiv'
    }

    filter = column.getStoreFilter()
    expect(filter).toEqual [{
      property: 'PlannedEndDate',
      operator: ">=",
      value: Ext.Date.format(startDate, 'c')
    },
    {
      property: 'PlannedEndDate',
      operator: '<=',
      value: Ext.Date.format(endOfEndDate, 'c')
    }]

  it 'should set the date range on a card when it is dropped', ->
    column = Ext.create 'Rally.apps.roadmapplanningboard.RoadmapPlanningBoardColumn', {
      startDate: null
      endDate: endDate
      capacity: 50
      renderTo: 'testDiv'
    }

    record = Ext.create Rally.mock.data.ModelFactory.getUserStoryModel(), {
      Name: 'test'
    }
    card = {
      record
    }

    column.fireEvent "beforecarddroppedsave", column, card

    expect(record.get('PlannedStartDate')).toBe 'null'
    expect(record.get('PlannedEndDate')).toEqual endDate

  it 'should create a header template and the data to populate it', ->
    onLoad = @stub()
    column = Ext.create 'Rally.apps.roadmapplanningboard.RoadmapPlanningBoardColumn', {
      startDate: startDate
      endDate: endDate
      capacity: 50
      displayValue: 'foo'
      types: 'portfolioitem/feature'
      renderTo: 'testDiv'
      listeners:
        load: onLoad
    }

    @waitForCallback(onLoad).then =>
      data = column.getHeaderTplData()

      html = column.getHeaderTpl().apply(data)

      expect(html).toContain 'foo'
      expect(html).toContain '1 of 50'

  it 'should correctly place cards in the right column using isMatchingRecord', ->
    
    column = Ext.create 'Rally.apps.roadmapplanningboard.RoadmapPlanningBoardColumn', {
      startDate: startDate
      endDate: endDate
      capacity: 50
      displayValue: 'foo'
      types: 'portfolioitem/feature'
    }
    
    record = Ext.create Rally.mock.data.ModelFactory.getPortfolioItemFeatureModel(), {
      PlannedEndDate: new Date(+startDate + 1)
    }
    
    record2 = Ext.create Rally.mock.data.ModelFactory.getPortfolioItemFeatureModel(), {
      PlannedEndDate: new Date(+startDate - 1)
    }
    
    expect(column.isMatchingRecord(record)).toBeTruthy()
    expect(column.isMatchingRecord(record2)).toBeFalsy()
