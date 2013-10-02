Ext = window.Ext4 || window.Ext

Ext.require [
  'Rally.apps.teamboard.TeamBoardProjectRecordsLoader'
]

describe 'Rally.apps.teamboard.TeamBoardProjectRecordsLoader', ->
  beforeEach ->
    @ajax.whenQuerying('project').respondWith []

  it 'should fetch the records specified', ->
    store = Rally.apps.teamboard.TeamBoardProjectRecordsLoader.load '1,2,3'

    @assertQuery '(((ObjectID = "1") OR (ObjectID = "2")) OR (ObjectID = "3"))', store

  it 'should fetch the first 25 records if none are specified', ->
    store = Rally.apps.teamboard.TeamBoardProjectRecordsLoader.load()

    expect(store.filters.length).toBe 0
    expect(store.pageSize).toBe 25

  it 'should be able to fetch one record if oid specified as a number', ->
    store = Rally.apps.teamboard.TeamBoardProjectRecordsLoader.load 2

    @assertQuery '(ObjectID = "2")', store

  it 'should call the callback when loaded', ->
    callback = @spy()
    Rally.apps.teamboard.TeamBoardProjectRecordsLoader.load '1,2,3', callback

    @waitForCallback callback

  helpers
    assertQuery: (queryString, store) ->
      expect(store.filters.length).toBe 1
      expect(store.filters.getAt(0).toString()).toBe queryString