Ext = window.Ext4 || window.Ext

describe 'Rally.apps.roadmapplanningboard.PlanningCapacityPopoverView', ->
  beforeEach ->
    @addMatchers
      toInheritFromXType: (expected) ->
        _.contains @actual.getXTypes().split('/'), expected

    @fakeModel =
      get: ->
        0

    @view = Ext.create 'Rally.apps.roadmapplanningboard.PlanningCapacityPopoverView',
      target: Ext.getBody()
      controllerConfig:
        model: @fakeModel

  afterEach ->
    @view.destroy()

  it 'is a popover', ->
    expect(@view).toInheritFromXType('rallypopover')

  it 'contains a low and high number field', ->
    expect(@view.getLowCapacityField()).toInheritFromXType('numberfield')
    expect(@view.getHighCapacityField()).toInheritFromXType('numberfield')

  xit 'bubbles blur events up from child components', ->
    blurStub = @stub()
    @view.on 'blur', blurStub, @

    @click(@view.getLowCapacityField().getEl().dom).then =>
      @click(@view.getHighCapacityField().getEl().dom).then =>
        @once(
          condition: =>
            blurStub.called
        ).then =>
          expect(blurStub).toHaveBeenCalledOnce()

  it 'bubbles validitychange events up from child components',  ->
    validitychangeStub = @stub()
    @view.on 'validitychange', validitychangeStub, @

    @sendKeys(@view.getLowCapacityField().getEl().down('input').dom, '4').then =>
      done = false

      # The setTimeout is required to account for the validation delay introduced by the checkChangeBuffer property
      window.setTimeout(=>
        done = true
      , 1000)

      @once(
        condition: =>
          done

      ).then =>
        expect(validitychangeStub).toHaveBeenCalledOnce()
