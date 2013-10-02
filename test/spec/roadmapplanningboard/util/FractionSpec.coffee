Ext = window.Ext4 || window.Ext;

describe 'Rally.apps.roadmapplanningboard.util.Fraction', ->
  it 'should be creatable', ->
    template = Ext.create('Rally.apps.roadmapplanningboard.util.Fraction')
    expect(template).toBeTruthy()

  it 'should return correct percent with default summation formula', ->
    fraction = Ext.create 'Rally.apps.roadmapplanningboard.util.Fraction',
      numeratorItems: [2, 2]
      denominator: 8
    expect(fraction.getPercent()).toEqual 0.5

  it 'should return formatted percent with default summation formula', ->
    fraction = Ext.create 'Rally.apps.roadmapplanningboard.util.Fraction',
      numeratorItems: [2, 2, 3]
      denominator: 10
    expect(fraction.getFormattedPercent()).toEqual '70%'

  it 'should return correct denominator', ->
    fraction = Ext.create 'Rally.apps.roadmapplanningboard.util.Fraction',
      numeratorItems: [2, 2, 2]
      denominator: 24
    expect(fraction.getNumerator()).toEqual 6

  it 'should return correct percent with custom denominatorItemValueFunction', ->
    fraction = Ext.create 'Rally.apps.roadmapplanningboard.util.Fraction',
      numeratorItems: [
        {val: 4}
      ,
        {val: 4}
      ]
      denominator: 2
      numeratorItemValueFunction: (item)->
        item.val

    expect(fraction.getPercent()).toEqual 4

  it 'should return 0 when sending in 0 denominator and 0 numerator instead of divide by 0 error', ->
    fraction = Ext.create 'Rally.apps.roadmapplanningboard.util.Fraction',
      numeratorItems: [0]
      denominator: 0
    expect(fraction.getPercent()).toEqual 0

  it 'should return 0 when sending in 0 denominator and 1 numerator instead of divide by 0 error', ->
    fraction = Ext.create 'Rally.apps.roadmapplanningboard.util.Fraction',
      numeratorItems: [1]
      denominator: 0
    expect(fraction.getPercent()).toEqual 0

