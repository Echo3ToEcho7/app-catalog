Ext = window.Ext4 || window.Ext

Ext.require [
  'Rally.apps.roadmapplanningboard.UuidMapper'
  'Rally.test.mock.env.Global'
]

describe 'Rally.apps.roadmapplanningboard.UuidMapper', ->

  beforeEach ->
    @uuidMapper = Ext.create('Rally.apps.roadmapplanningboard.UuidMapper')

    # Can't do '@ajax.whenReading' since it will wrap in an array
    @getUuidFromWsapiStub = @stub @uuidMapper, '_getUuidFromWsapi', () ->
      deferred = Ext.create('Deft.promise.Deferred')
      deferred.resolve('12345678-1234-1234-1234-12345678')
      deferred.promise

    @mockObject = Rally.environment.getContext().getWorkspace()

  describe '#getUuid', ->

    it 'should return a promise', ->
      expect(@uuidMapper.getUuid(@mockObject).then).toBeDefined()

    it 'should resolve with the uuid of the domainObject', ->
      @uuidMapper.getUuid(@mockObject).then (uuid) =>
        expect(uuid).toBe '12345678-1234-1234-1234-12345678'

    it 'should not make a request for the same uuid more than once', ->
      @uuidMapper.getUuid(@mockObject).then (uuid) =>
        @uuidMapper.getUuid(@mockObject).then (uuid) =>
          expect(@getUuidFromWsapiStub).toHaveBeenCalledOnce()
