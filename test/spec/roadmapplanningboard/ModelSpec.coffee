Ext = window.Ext4 || window.Ext

Ext.require [
  'Rally.data.Field'
  'Rally.apps.roadmapplanningboard.Model'
]

describe 'Rally.apps.roadmapplanningboard.Model', ->

  beforeEach ->
    @field = Ext.create 'Rally.data.Field',
      name: 'myField'
      type: 'collection'
    @Model = Ext.define Rally.test.generateName(),
      extend: 'Rally.apps.roadmapplanningboard.Model'
      fields: [ @field,
        name: 'ref'
        type: 'string'
      ]
    @record = new @Model
      ref: 'myRef'
      myField: [{id: 1}]

  describe 'class extension', ->

    it 'should have the uriKey set', ->
      expect(@record.uriKey).toBe 'ref'

  describe '#getCollectionFields()', ->

    it 'should return correct number of collection fields', ->
      expect(@record.getCollectionFields().length).toBe 1

    it 'should return correct fields', ->
      expect(@record.getCollectionFields()).toContain(@field)

  describe '#getDirtyCollectionFields()', ->

    beforeEach ->
      @record.set('myField', [{id: 2}])
      @record.set('ref', 'anotherRef')

    it 'should return correct number of dirty collection fields', ->
      expect(@record.getDirtyCollectionFields().length).toBe 1

    it 'should return the correct dirty collection fields', ->
      expect(@record.getDirtyCollectionFields()).toContain @field
