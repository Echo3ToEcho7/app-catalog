Ext = window.Ext4 || window.Ext
describe 'Rally.apps.roadmapplanningboard.PlanningCapacityPopoverController', ->
  helpers
    fakeView: (low, high, dirty, valid, setLowCapacityValueFunction, setHighCapacityValueFunction) ->
      @controller.setView
        getLowCapacityField: ->
          getValue: ->
            low
          isDirty: ->
            !!dirty
          resetOriginalValue: ->
          validate: ->
            !!valid
          setValue: setLowCapacityValueFunction or false
        getHighCapacityField: ->
          getValue: ->
            high
          isDirty: ->
            !!dirty
          resetOriginalValue: ->
          validate: ->
            !!valid
          setValue: setHighCapacityValueFunction or false

    expectRangeValidation: (low, high) ->
      @fakeView low, high
      expect(@controller.validateRange())

  beforeEach ->
    @controller = Ext.create 'Rally.apps.roadmapplanningboard.PlanningCapacityPopoverController'

  afterEach ->
    delete @controller

  it 'validates that the value in the low field is lower than the value in the high field', ->
    @expectRangeValidation(3, 4).toBe(true)
    @expectRangeValidation(6, 5).not.toBe(true)
    @expectRangeValidation(null, 5).toBe(true)
    @expectRangeValidation(5, 0).not.toBe(true)

  it 'does not persist if validation fails', ->
    persistStub = @stub @controller, 'persistIfStoreAvailable'
    @fakeView 6, 5, true, false

    @controller.persistIfChangedAndValid()

    expect(persistStub).not.toHaveBeenCalled()

  it 'does not persist if there are no dirty fields', ->
    persistStub = @stub @controller, 'persistIfStoreAvailable'
    @fakeView 4, 5, false, true

    @controller.persistIfChangedAndValid()

    expect(persistStub).not.toHaveBeenCalled()

  it 'persists if any field is dirty and both fields are valid', ->
    persistStub = @stub @controller, 'persistIfStoreAvailable'

    @fakeView 4, 5, true, true

    @controller.persistIfChangedAndValid()

    expect(persistStub).toHaveBeenCalledOnce()

  it 'updates the data model on persist', ->
    setStub = @stub()

    @controller.model =
      beginEdit: ->
      endEdit: ->
      set: setStub

    @controller.persistIfStoreAvailable 4, 5
    expect(setStub).toHaveBeenCalledTwice()
    expect(setStub).toHaveBeenCalledWith 'lowCapacity', 4
    expect(setStub).toHaveBeenCalledWith 'highCapacity', 5

  it 'does persist if low and high value are 0', ->
    persistStub = @stub @controller, 'persistIfStoreAvailable'

    @fakeView 0, 0, true, true

    @controller.persistIfChangedAndValid()

    expect(persistStub).toHaveBeenCalledOnce()

  it 'on load defaults to 0 if the model low and high capacity are blank', ->
    lowValueFunction = ->
      resetOriginalValue: ->
    highValueFunction = ->
      resetOriginalValue: ->

    lowValueSpy = @spy lowValueFunction
    highValueSpy = @spy highValueFunction

    @controller.model =
      get: ->
        ''

    @fakeView '', '', true, true, lowValueSpy, highValueSpy

    # Calling this explicitly since it is normally called on the controller by the view during view creation
    @controller.init()

    expect(lowValueSpy).toHaveBeenCalledWith 0
    expect(highValueSpy).toHaveBeenCalledWith 0

  it 'on load defaults to 0 if the model low and high capacity are null', ->
    lowValueFunction = ->
      resetOriginalValue: ->
    highValueFunction = ->
      resetOriginalValue: ->

    lowValueSpy = @spy lowValueFunction
    highValueSpy = @spy highValueFunction

    @controller.model =
      get: ->
        ''

    @fakeView null, null, true, true, lowValueSpy, highValueSpy

    # Calling this explicitly since it is normally called on the controller by the view during view creation
    @controller.init()

    expect(lowValueSpy).toHaveBeenCalledWith 0
    expect(highValueSpy).toHaveBeenCalledWith 0

  it 'should default to 0 when blank is entered into validation', ->
    persistStub = @stub @controller, 'persistIfStoreAvailable'

    @fakeView '', 0, true, true

    @controller.persistIfChangedAndValid()

    expect(persistStub).toHaveBeenCalledOnce()
    expect(persistStub).toHaveBeenCalledWith 0, 0

