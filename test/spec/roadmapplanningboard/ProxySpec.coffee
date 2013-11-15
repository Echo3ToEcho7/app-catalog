Ext = window.Ext4 || window.Ext

Ext.require [
  'Rally.test.apps.roadmapplanningboard.helper.TestDependencyHelper'
  'Rally.apps.roadmapplanningboard.Proxy'
  'Rally.apps.roadmapplanningboard.Model'
]

describe 'Rally.apps.roadmapplanningboard.Proxy', ->

  beforeEach ->

    Rally.test.apps.roadmapplanningboard.helper.TestDependencyHelper.loadDependencies()

    @Model = Ext.define Rally.test.generateName(),
      extend: 'Rally.apps.roadmapplanningboard.Model'
      fields: [
        name: 'ref'
        type: 'string'
        persist: false
      ,
        name: 'somefield'
        type: 'string'
      ]
      proxy:
        type: 'roadmap'
        url: ''
    @record = new @Model
      id: 1
      ref: 'myRef'
      somefield: 'somevalue'

    @ajax.whenUpdating('myRef', 1, false).respondWith({})

  afterEach ->
    Deft.Injector.reset()


  describe '#constructor', ->

    it 'should set the correct writer', ->
      expect(@record.proxy.$className).toBe 'Rally.apps.roadmapplanningboard.Proxy'

  describe '#doRequest', ->

    beforeEach ->
      @doRequestSpy = @spy @record.proxy, 'doRequest'

      @record.set('somefield', 'othervalue')
      @record.save()

    it 'should add workspace uuid to request', ->
      expect(@doRequestSpy.lastCall.args[0].params.workspace).toBe '12345678-1234-1234-1234-12345678'

  describe '#buildRequest', ->

    beforeEach ->
      @buildRequestSpy = @spy @record.proxy, 'buildRequest'
      @record.set('somefield', 'othervalue')
      @record.save()

    it 'should add withCredentials to the request', ->
      expect(@buildRequestSpy.lastCall.returnValue.withCredentials).toBe true
