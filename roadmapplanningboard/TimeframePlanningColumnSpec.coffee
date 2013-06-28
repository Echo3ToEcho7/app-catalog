Ext = window.Ext4 || window.Ext

describe 'Rally.apps.roadmapplanningboard.TimeframePlanningColumn', ->

  helpers
    getDefaultColumn: (timeboxRecord, planRecord, isRightmostColumn = false) ->
      Ext.create 'Rally.apps.roadmapplanningboard.TimeframePlanningColumn',
        renderTo: Ext.getBody()
        contentCell: Ext.getBody()
        headerCell: Ext.getBody()
        displayValue: 'My column'
        headerTemplate: Ext.create 'Ext.XTemplate'
        timeboxRecord: timeboxRecord
        stores: [@featureStoreFixture]
        planRecord: planRecord
        isRightmostColumn: isRightmostColumn
        columnHeaderConfig:
          editable: true
          record: timeboxRecord
          fieldToDisplay: 'name'

    getDefaultPlanRecord: ->
      Ext.create @appModelFactory.getPlanningModel(),
        id: 'Foo',
        name: 'Q1',
        theme: 'Take over the world!'
        lowCapacity: 0
        highCapacity: 0

  beforeEach ->
    deps = Ext.create 'Rally.test.apps.roadmapplanningboard.helper.TestDependencyHelper'
    deps.loadDependencies()

    @appModelFactory = Deft.Injector.resolve 'appModelFactory'
    @featureStoreFixture = Deft.Injector.resolve 'featureStore'

    @title = "Bogus Title for Test"
    @timeboxRecord = Ext.create @appModelFactory.getTimeframeModel(),
      name: 'Q1'
      start: new Date('04/01/2013')
      end: new Date('06/30/2013')
    planRecord = Ext.create @appModelFactory.getPlanningModel(),
      lowCapacity: 22
      highCapacity: 42
    @column = Ext.create 'Rally.apps.roadmapplanningboard.TimeframePlanningColumn',
      renderTo: Ext.getBody()
      contentCell: Ext.getBody()
      headerCell: Ext.getBody()
      timeboxRecord: @timeboxRecord
      stores: [@featureStoreFixture]
      planRecord: planRecord

  afterEach ->
    Deft.Injector.reset()
    @column.destroy()

  it 'should have a timeframe added to the header template', ->
    headerTplData = @column.getDateHeaderTplData()

    expect(headerTplData['formattedDate']).toEqual 'Apr 1 - Jun 30'

  it 'should render a thermometer in the header template (unfiltered data)', ->
    @column.isMatchingRecord = ->
      true

    @column.refresh()

    headerTplData = @column.getHeaderTplData()

    expect(headerTplData['progressBarHtml']).toContain '72 of 42'

  it 'should render a thermometer in the header template (filtered data)', ->
    @column.isMatchingRecord = (record) ->
      record.data.name.indexOf('Android') > -1 || record.data.name.indexOf('iOS') > -1

    @column.refresh()

    headerTplData = @column.getHeaderTplData()

    expect(headerTplData['progressBarHtml']).toContain '6 of 42'

  it 'should handle empty values as spaces', ->
    @timeboxRecord = Ext.create @appModelFactory.getTimeframeModel(),
      start: null
      end: null
    column = Ext.create 'Rally.apps.roadmapplanningboard.TimeframePlanningColumn',
      timeboxRecord: @timeboxRecord
      stores: [@featureStoreFixture]
      planRecord: Ext.create @appModelFactory.getPlanningModel(),
        lowCapacity: 0
        highCapacity: 0

    column.isMatchingRecord = ->
      true

    column.refresh()

    headerTplData = column.getHeaderTplData()

    expect(headerTplData['formattedStartDate']).toEqual(undefined)
    expect(headerTplData['formattedEndDate']).toEqual(undefined)
    expect(headerTplData['formattedPercent']).toEqual("0%")
    expect(headerTplData['progressBarHtml']).toBeTruthy()

    column.destroy()

  describe 'Rally.apps.roadmapplanningboard.TimeframePlanningColumn rendered', ->
    beforeEach ->
      @renderedColumn = @getDefaultColumn(@timeboxRecord, @getDefaultPlanRecord())

    afterEach ->
      @renderedColumn.destroy()

    it 'should have a themeHeader', ->
      expect(@renderedColumn.getColumnHeader().query('roadmapthemeheader').length).toBe 1

    it "should set themeheader's showToggle true when isRightmost true", ->
      customColumn = @getDefaultColumn(@timeboxRecord, @getDefaultPlanRecord(), true)
      expect(customColumn.getColumnHeader().query('roadmapthemeheader')[0].showToggle).toBeTruthy()
      customColumn.destroy()

    it "should set themeheader's showToggle false when isRightmost false", ->
      expect(@renderedColumn.getColumnHeader().query('roadmapthemeheader')[0].showToggle).toBeFalsy()

    it "should display a toggle when showToggle is true", ->
      customColumn = @getDefaultColumn(@timeboxRecord, @getDefaultPlanRecord(), true)
      themeHeader = customColumn.getColumnHeader().query('roadmapthemeheader')[0]
      expect(themeHeader.query('roadmapthemetogglebuttonview').length).toBe 1
      customColumn.destroy()

    it 'should allow click to edit and blur to save changes on column Title', ->
      @stub @timeboxRecord, 'save', (options) ->
        options.success.call(options.scope)

      titleContainer = @renderedColumn.getColumnHeader().getHeaderTitle().query('rallydetailfieldcontainer')[0]
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
        expect(@timeboxRecord.get('name')).toBe newName
        expect(@timeboxRecord.save.callCount).toEqual 1

  describe 'Rally.apps.roadmapplanningboard.TimeframePlanningColumn rendered not destroyed', ->
    it 'should click to edit', ->
      @planRecord = @getDefaultPlanRecord()
      @renderedColumn = @getDefaultColumn(@timeboxRecord, @planRecord)

      @planRecord.save = sinon.stub()
      themeContainer = @renderedColumn.getColumnHeader()
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
        @renderedColumn.destroy()

