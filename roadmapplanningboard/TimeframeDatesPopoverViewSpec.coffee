Ext = window.Ext4 || window.Ext


describe 'Rally.apps.roadmapplanningboard.TimeframeDatesPopoverView', ->
  helpers
    getDateGreaterThan: (date, incr = 1) ->
      Ext.Date.format(Ext.Date.add(date, Ext.Date.DAY, incr), 'm-d-Y')

    writeTo: (dateField, data) ->
      dateField.setValue('')
      @sendKeys(dateField.getEl().down('input').dom, data)

    clickTrigger: (dateField)->
      @click(dateField.getEl().down(extClsSelector('form-trigger')).dom)

    validDates: ->
      expect(@endDate.validate()).toBe true
      expect(@startDate.validate()).toBe true

    validPicker: (dateField) ->
      picker = @view.getController().getDatesPopoverLayout().down('#datePicker')
      expect(picker.isVisible()).toBe(true)
      expect(picker.value.getTime()).toEqual(dateField.value.getTime())

  beforeEach ->
    model = Deft.Injector.resolve('appModelFactory').getTimeframeModel()
    model.setProxy 'memory'

    @record = Ext.create model,
      start: new Date()
      end: new Date()

    @view = Ext.create 'Rally.apps.roadmapplanningboard.TimeframeDatesPopoverView',
      target: Ext.getBody()
      waitTimeForDateFieldValidation: 0
      controllerConfig:
        model: @record

    @startDate = @view.getController().getStartDate()
    @endDate = @view.getController().getEndDate()

  afterEach ->
    @view?.destroy()

  it 'should error when start date > end date', ->
    @writeTo(@startDate, @getDateGreaterThan(@endDate.value)).then =>
      expect(@startDate.validate()).toBe false

  it 'should clear errors when start date > end date by changing end date',  ->
    @writeTo(@startDate, @getDateGreaterThan(@endDate.value)).then =>
      expect(@startDate.validate()).toBe false

      @writeTo(@endDate, @getDateGreaterThan(@startDate.value)).then =>
        @validDates()

  it 'should error on invalid dates and should not save when popover is destroyed', ->
    saveStub = @stub(@record, 'save')
    @writeTo(@startDate, 'junk date').then =>
      expect(@startDate.validate()).toBe false
      @view.destroy()
      expect(saveStub).not.toHaveBeenCalled()

  it 'should not save data when dates are unchanged and popover is destroyed', ->
    saveStub = @stub(@record, 'save')
    @view.destroy()
    expect(saveStub).not.toHaveBeenCalled()

  it 'should save data when dates are changed and popover is destroyed', ->
    saveStub = @stub(@record, 'save')
    @writeTo(@startDate, @getDateGreaterThan(@startDate.value)).then =>
      @writeTo(@endDate, @getDateGreaterThan(@startDate.value, 5)).then =>
        @validDates()
        @view.destroy()
        expect(saveStub).toHaveBeenCalledOnce()

  it 'should NOT create picker when field is focused',  ->
    @click(@endDate.getEl().down('input').dom).then =>
      expect(@view.getController().getDatesPopoverLayout().down('#datePicker')).toBeNull()

  it 'should create picker when trigger is clicked', ->
    @clickTrigger(@startDate).then =>
      @validPicker @startDate

  it 'should reflect dates in picker based on whichever field has current focus', ->
    @clickTrigger(@startDate).then =>
      @validPicker @startDate

      @click(@endDate.getEl().down('input').dom).then =>
        @validPicker @endDate

  xit 'should record dates changed client metrics message when the dates are changed', ->
    startDate = '01-01-2001'
    endDate = '01-02-2001'
    @startDate.setValue(Ext.Date.parse(startDate, @startDate.format))
    @endDate.setValue(Ext.Date.parse(endDate, @endDate.format))
    @view.destroy()
    expectedMessage = "Timeframe dates changed -  start: [#{startDate}], end: [#{endDate}]"

    expect(@clientMetricsRecorder.eventDescription).toBe expectedMessage