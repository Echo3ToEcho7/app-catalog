Ext = window.Ext4 || window.Ext

Ext.require [
  'Rally.apps.roadmapplanningboard.Writer'
  'Rally.apps.roadmapplanningboard.Proxy'
  'Rally.apps.roadmapplanningboard.Model'
  'Rally.data.Field'
  'Rally.apps.roadmapplanningboard.AppModelFactory'
]

describe 'Rally.apps.roadmapplanningboard.Writer', ->

  beforeEach ->
    @field = Ext.create 'Rally.data.Field',
        name: 'collectionField'
        type: 'collection'
    @Model = Ext.define Rally.test.generateName(),
      extend: 'Rally.apps.roadmapplanningboard.Model'
      fields: [ @field,
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
      ref: 'myRef'
      collectionField: [{id: 1}, {id :2}]
    @record.phantom = false # pretend the record is persisted

    @writeSpy = @spy @record.proxy.writer, 'write'
    @ajax.whenCreating('collectionField', false).respondWith({})
    @ajax.whenDeleting('collectionField', '1', false).respondWith({})

  it 'should throw an error if a collection and other fields are changed', ->
    @record.set('collectionField', [])
    @record.set('somefield', 'changedValue')
    save = =>
      @record.save()

    expect(save).toThrow 'Cannot update other fields on a record if a collection has changed'

  describe 'when changing data', ->

    beforeEach ->
      @record.set 'somefield', 'newValue'
      @record.save()

    it 'should set the action to update', ->
      expect(@writeSpy.lastCall.returnValue.action).toBe 'update'

    it 'should send the correct data', ->
      expect(@writeSpy.lastCall.returnValue.jsonData.data).toEqual { somefield: 'newValue' }

  describe 'when removing from collection relationship', ->

    beforeEach ->
      @record.set 'collectionField', [{id: 1}]
      @save = =>
        @record.save()

    it 'should call the write method', ->
      @save()
      expect(@writeSpy).toHaveBeenCalledOnce()

    it 'should set the action to delete', ->
      @save()
      expect(@writeSpy.lastCall.returnValue.action).toBe 'destroy'

    it 'should set the url correctly', ->
      @save()
      expect(@writeSpy.lastCall.returnValue.url).toBe 'myRef/collectionField/2'

    it 'should throw an error if more than relationship is removed', ->
      @record.set 'collectionField', []
      expect(@save).toThrow 'Cannot delete more than one relationship at a time'

  describe 'when adding to collection relationship', ->

    beforeEach ->
      @newValue = [{id: 1}, {id: 2}, {id: 3}]
      @record.set 'collectionField', @newValue
      @record.save()

    it 'should call the write method', ->
      expect(@writeSpy).toHaveBeenCalledOnce()

    it 'should set the action to create', ->
      expect(@writeSpy.lastCall.returnValue.action).toBe 'create'

    it 'should set the url correctly', ->
      expect(@writeSpy.lastCall.returnValue.url).toBe 'myRef/collectionField'

    it 'should send the correct data', ->
      expect(@writeSpy.lastCall.returnValue.jsonData.data.collectionField).toEqual [{id: 3}]
