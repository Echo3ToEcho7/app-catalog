Ext = window.Ext4 || window.Ext

Ext.require [
  'Rally.test.apps.roadmapplanningboard.helper.TestDependencyHelper'
  'Rally.apps.roadmapplanningboard.TimeframePlanningColumn'
]

describe 'Rally.apps.roadmapplanningboard.TimeframePlanningColumn', ->

  helpers
    createColumn: (config) ->
      @column = Ext.create 'Rally.apps.roadmapplanningboard.TimeframePlanningColumn',
        _.extend
          contentCell: 'testDiv'
          headerCell: 'testDiv'
          displayValue: 'My column'
          headerTemplate: Ext.create 'Ext.XTemplate'
          timeframeRecord: @timeframeRecord
          stores: [@featureStoreFixture]
          getStores: -> @stores
          planRecord: @planRecord
          ownerCardboard:
            showTheme: true
          columnHeaderConfig:
            editable: true
            record: @timeframeRecord
            fieldToDisplay: 'name'
          renderTo: 'testDiv'
        , config

    createPlanRecord: (config) ->
      @planRecord = Ext.create Rally.apps.roadmapplanningboard.AppModelFactory.getPlanModel(),
        _.extend
          id: 'Foo',
          name: 'Q1',
          theme: 'Take over the world!'
          lowCapacity: 0
          highCapacity: 0
        , config

    createTimeframeRecord: (config) ->
      @timeframeRecord = Ext.create Rally.apps.roadmapplanningboard.AppModelFactory.getTimeframeModel(),
        _.extend
          name: 'Q1'
          start: new Date('04/01/2013')
          end: new Date('06/30/2013')
        , config

  beforeEach ->
    Rally.test.apps.roadmapplanningboard.helper.TestDependencyHelper.loadDependencies()
    @featureStoreFixture = Deft.Injector.resolve 'featureStore'
    @title = "Bogus Title for Test"

  afterEach ->
    Deft.Injector.reset()

  describe 'timeframe column', ->
    beforeEach ->

      @createTimeframeRecord()
      @createPlanRecord
        lowCapacity: 22
        highCapacity: 42

    afterEach ->
      @column.destroy()

    it 'should have a timeframe added to the header template', ->
      @createColumn()
      headerTplData = @column.getDateHeaderTplData()

      expect(headerTplData['formattedDate']).toEqual 'Apr 1 - Jun 30'

    it 'should render a thermometer in the header template (unfiltered data)', ->
      @createColumn()
      @column.isMatchingRecord = ->
        true

      @column.refresh()

      headerTplData = @column.getHeaderTplData()

      expect(headerTplData['progressBarHtml']).toContain '72 of 42'

    it 'should render a thermometer in the header template (filtered data)', ->
      @createColumn()
      @column.isMatchingRecord = (record) ->
        record.data.Name.indexOf('Android') > -1 || record.data.Name.indexOf('iOS') > -1

      @column.refresh()

      headerTplData = @column.getHeaderTplData()

      expect(headerTplData['progressBarHtml']).toContain '6 of 42'

    it 'should handle empty values as spaces', ->
      @createTimeframeRecord
        start: null
        end: null
      @createPlanRecord
        lowCapacity: 0
        highCapacity: 0

      @createColumn()

      @column.refresh()

      headerTplData = @column.getHeaderTplData()

      expect(headerTplData['formattedStartDate']).toEqual(undefined)
      expect(headerTplData['formattedEndDate']).toEqual(undefined)
      expect(headerTplData['formattedPercent']).toEqual("0%")
      expect(headerTplData['progressBarHtml']).toBeTruthy()

  describe 'when rendered', ->
    beforeEach ->
      @createTimeframeRecord()
      @createPlanRecord()

    afterEach ->
      @column.destroy()

    it 'should have a themeHeader', ->
      @createColumn()
      expect(@column.getColumnHeader().query('roadmapthemeheader').length).toBe 1
