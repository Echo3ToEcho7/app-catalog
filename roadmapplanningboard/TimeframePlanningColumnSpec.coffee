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

    it 'should allow click to edit and blur to save changes on column Title', ->
      @createColumn()
      @stub @timeframeRecord, 'save', (options) ->
        options.success.call(options.scope)

      titleContainer = @column.getColumnHeader().getHeaderTitle().query('rallydetailfieldcontainer')[0]
      newName = 'QNew'

      expect(titleContainer.getEditMode()).toBe false
      titleContainer.goToEditMode()
      expect(titleContainer.getEditMode()).toBe true

      textField = titleContainer.editor
      textField.setValue newName
      textField.blur()

      @once(
        condition: ->
          titleContainer.getEditMode() is false
      ).then =>
        expect(@timeframeRecord.get('name')).toBe newName
        expect(@timeframeRecord.save.callCount).toEqual 1

  describe 'when rendered not destroyed', ->
    it 'should click to edit', ->
      @createPlanRecord()
      @createTimeframeRecord()
      @createColumn()

      @planRecord.save = sinon.stub()
      themeContainer = @column.getColumnHeader()
        .query('roadmapthemeheader')[0]
        .query('rallydetailfieldcontainer')[0]
      newTheme = 'Krendick'

      expect(themeContainer.getEditMode()).toBe false
      themeContainer.goToEditMode()
      expect(themeContainer.getEditMode()).toBe true

      textField = themeContainer.down('textareafield')
      textField.value = newTheme
      textField.blur()

      @once(
        condition: ->
          themeContainer.getEditMode() is false
      ).then =>
        expect(@planRecord.get('theme')).toBe newTheme
        expect(@planRecord.save.callCount).toEqual 1
