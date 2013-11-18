Ext = window.Ext4 || window.Ext

Ext.require [
  'Rally.test.apps.roadmapplanningboard.helper.TestDependencyHelper'
  'Rally.apps.roadmapplanningboard.Proxy'
  'Rally.apps.roadmapplanningboard.Model'
]

describe 'Rally.apps.roadmapplanningboard.Proxy', ->

  describe '#buildRequest', ->

    beforeEach ->
      @proxy = Ext.create 'Rally.apps.roadmapplanningboard.Proxy',
        url: ''
      @operation = { params: {} }

    it 'should add withCredentials to the request', ->
      expect(@proxy.buildRequest(@operation).withCredentials).toBe true

  describe '#buildUrl', ->

    beforeEach ->
      @proxy = Ext.create 'Rally.apps.roadmapplanningboard.Proxy',
        url: 'foo/{fooId}/bar'
      @request = { url: '', operation: params: fooId: '123' }

    it 'should build the url and replace template items with operation parameters', ->
      expect(@proxy.buildUrl(@request)).toBe 'foo/123/bar'
