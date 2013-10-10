Ext = window.Ext4 || window.Ext

describe 'Rally.apps.blockedwork.BlockedWorkView', ->

  helpers
    assertShowMoreLinkShown: (isShown, view) ->
      length = view.getEl().query(".#{view.showMoreCtClass}").length
      if isShown
        expect(length).toEqual 1
      else
        expect(length).toEqual 0

    getBlockedWorkProductData: (options = {}) ->
      options.createImmediateSubObjects = true
      options.depth = 1
      @mom.getData('Blocker', options)

    createBlockedWorkProducts: (num, data, options = {}) ->
      options.createImmediateSubObjects = true
      workProducts = data
      if !workProducts?
        workProducts = @getBlockedWorkProductData(count: num)
      @ajax.whenQuerying('blocker').respondWith workProducts, options

    createView: (config) ->
      view = Ext.create 'Rally.apps.blockedwork.BlockedWorkView',
        Ext.apply(
          renderTo: 'testDiv'
        , config)

      @waitForComponentReady view

  beforeEach ->
    @BlockerModel = Rally.test.mock.data.WsapiModelFactory.getBlockerModel()

  afterEach ->
    Rally.test.destroyComponentsOfQuery 'rallyblockedworkview'
    delete window.activateEl

  it 'should have show more link if there are more records than currently shown', ->
    @createBlockedWorkProducts(10, null, {totalResultCount: 20})
    @createView().then (view) =>
      @assertShowMoreLinkShown true, view

  it 'should not have show more link if all records are currently shown', ->
    @createBlockedWorkProducts(10, null, {totalResultCount: 10})
    @createView().then (view) =>
      @assertShowMoreLinkShown(false, view)

  it 'should not have show more link if web services max limit reached', ->
    limit = 20
    Rally.apps.blockedwork.BlockedWorkView.maxWsapiCount = limit
    @createBlockedWorkProducts(limit + 1, null, {totalResultCount: limit + 1})
    @createView().then (view) =>
      @assertShowMoreLinkShown(false, view)

  it 'uses profileImageSize config in template', ->
    @createBlockedWorkProducts(1)
    @createView(
      profileImageSize: 100
    ).then =>
      imageEl = Ext.query('img.profile')[0]
      expect(imageEl.style.width).toEqual '100px'
      expect(imageEl.style.height).toEqual '100px'
      expectedImageUrlSize = if window.devicePixelRatio > 1 then 200 else 100
      expect(imageEl.src).toEndWith "#{expectedImageUrlSize}.sp"

  it 'displays artifact link by default', ->
    window.activateEl = Ext.emptyFn
    data = @getBlockedWorkProductData()
    @createBlockedWorkProducts(1, data)
    @createView().then (view) =>
      detailEls = Ext.query "#hov#{data[0].WorkProduct.ObjectID}"
      expect(detailEls.length).toEqual 1

  it 'renders blocked reason', ->
    data = @getBlockedWorkProductData()
    blockedReason = 'MFRL'
    data[0].WorkProduct.BlockedReason = blockedReason
    @createBlockedWorkProducts(1, data)
    @createView().then (view) =>
      detailEls = Ext.query ".detail-text"
      expect(detailEls.length).toEqual 1
      expect(detailEls[0].innerHTML.trim()).toBe(blockedReason)

  it 'renders a non breaking space if no blocked reason', ->
    data = @getBlockedWorkProductData()
    data[0].WorkProduct.BlockedReason = null
    @createBlockedWorkProducts(1, data)
    @createView().then (view) =>
      detailEls = Ext.query ".detail-text"
      expect(detailEls.length).toEqual 1
      expect(detailEls[0].innerHTML.trim()).toBe('&nbsp;')

  it 'renders disabled users using a special class', ->
    data = @getBlockedWorkProductData()
    data[0].BlockedBy.diabled = true
    @createBlockedWorkProducts(1, data)
    @createView().then (view) =>
      detailEls = Ext.query ".profileLink .inactive"
      expect(detailEls.length).toEqual 1

  it 'includes a special class for the first item in the list', ->
    @createBlockedWorkProducts(10, null, {totalResultCount: 10})
    @createView().then (view) =>
      detailEls = Ext.query ".list .first"
      expect(detailEls.length).toEqual 1