Ext = window.Ext4 || window.Ext
Ext.require [
  'Rally.apps.roadmapplanningboard.PlanCapacityProgressBar'
]

describe 'Rally.apps.roadmapplanningboard.PlanCapacityProgressBar', ->
  beforeEach ->
    @template = Ext.create 'Rally.apps.roadmapplanningboard.PlanCapacityProgressBar'

  it 'should be creatable', ->
    expect(@template).toBeTruthy()

  it 'should use red when over capacity', ->
    expect(@template.calculateColorFn({low: 10, high: 50, total: 55})).toEqual @template.percentFullColors.red

  it 'should use green within capacity', ->
    expect(@template.calculateColorFn({low: 10, high: 50, total: 20})).toEqual @template.percentFullColors.green

  it 'should use blue when under capacity', ->
    expect(@template.calculateColorFn({low: 10, high: 50, total: 5})).toEqual @template.percentFullColors.blue

  it 'should use green when at capacity', ->
    expect(@template.calculateColorFn({low: 10, high: 50, total: 50})).toEqual @template.percentFullColors.green

  it 'should use green when at low capacity threshold', ->
    expect(@template.calculateColorFn({low: 10, high: 50, total: 10})).toEqual @template.percentFullColors.green

  it 'should have appropriate text label for values given', ->
    expect(@template.generateLabelTextFn({low: 10, high: 50, total: 25})).toEqual '25 of 50'

  it 'should allow for 0 capacities', ->
    expect(@template.generateLabelTextFn({low: 0, high: 0, total: 0})).toEqual '0 of 0'

  it 'should allow for positive total out of 0 capacity', ->
    expect(@template.generateLabelTextFn({low: 1, high: 0, total: 25})).toEqual '25 of 0'

  it 'should display correct text for over capacity', ->
    expect(@template.generateLabelTextFn({low: 0, high: 1, total: 25})).toEqual '25 of 1'