Ext = window.Ext4 || window.Ext

Ext.require [
  'Rally.apps.roadmapplanningboard.BaseModel'
]

describe 'Rally.apps.roadmapplanningboard.BaseModel', ->
  beforeEach ->
    @model = Ext.create 'Rally.apps.roadmapplanningboard.BaseModel'

  it 'should return false from hasValue when model does not have field', ->
    expect(@model.hasValue 'not real').toBe(false)

  it 'should return true from isFieldVisible', ->
    expect(@model.isFieldVisible()).toBe(true)

  it 'should return false from isCustomField', ->
    expect(@model.isCustomField()).toBe(false)

  it 'should return false from hasValue iff value undefined, null, or empty string', ->
    testModelDefintion = Ext.define 'ModelTestForBaseHasValue',
      extend: 'Rally.apps.roadmapplanningboard.BaseModel'

      fields: [
        name: 'someField', type: 'string'
      ,
        name: 'someBool', type: 'boolean'
      ,
        name: 'someNum', type: 'int'
      ]
    testModel = Ext.create testModelDefintion

    stringFieldDefinition = testModelDefintion.getFields()[1]
    expect(stringFieldDefinition.name).toBe('someField')

    testModel.set('someField', undefined)
    expect(testModel.hasValue stringFieldDefinition).toBe(false)

    testModel.set('someField', null)
    expect(testModel.hasValue stringFieldDefinition).toBe(false)

    testModel.set('someField', '')
    expect(testModel.hasValue stringFieldDefinition).toBe(false)

    testModel.set('someField', 'hello')
    expect(testModel.hasValue stringFieldDefinition).toBe(true)

    boolFieldDefinition = testModelDefintion.getFields()[2]
    expect(boolFieldDefinition.name).toBe('someBool')

    testModel.set('someBool', false)
    expect(testModel.hasValue boolFieldDefinition).toBe(true)

    numFieldDefinition = testModelDefintion.getFields()[3]
    expect(numFieldDefinition.name).toBe('someNum')

    testModel.set('someNum', 5)
    expect(testModel.hasValue numFieldDefinition).toBe(true)

    testModel.set('someNum', 0)
    expect(testModel.hasValue numFieldDefinition).toBe(true)

  it 'should return enhanced getField which includes readonly, required, and updatable to mimic wsapi model', ->
    testModelDefintion = Ext.define 'ModelTestForBaseGetField',
      extend: 'Rally.apps.roadmapplanningboard.BaseModel'

      fields: [
        name: 'someField', type: 'string'
      ]
    testModel = Ext.create testModelDefintion

    field = testModel.getField('someField')
    expect(field.name).toBe('someField')
    expect(field.readOnly).toBe(false)
    expect(field.required).toBe(true)
    expect(field.updatable).toBe(true)
