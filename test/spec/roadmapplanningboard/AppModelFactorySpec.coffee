Ext = window.Ext4 || window.Ext

Ext.require [
  'Rally.apps.roadmapplanningboard.AppModelFactory'
]
describe 'Rally.apps.roadmapplanningboard.AppModelFactory', ->

  describe '#normalizeDate', ->
    it 'should set the date correct local day', ->
      date = Rally.apps.roadmapplanningboard.AppModelFactory._normalizeDate('2013-10-01T06:00:00Z')
      expect(Ext.Date.format(date, 'd')).toBe '01'
