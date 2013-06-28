Ext = window.Ext4 || window.Ext
describe 'Rally.apps.roadmapplanningboard.AppModelFactory', ->
  beforeEach ->
    @appModelFactory = Ext.create 'Rally.apps.roadmapplanningboard.AppModelFactory'

  describe 'PlanningModel', ->
    it 'should have type of PlanningModel', ->
      planningModel = @appModelFactory.getPlanningModel()

      record = Ext.create planningModel
      expect(record.$className).toEqual 'Rally.apps.roadmapplanningboard.PlanningModel'

  describe 'RoadmapModel', ->
    it 'should have type of RoadmapModel', ->
      roadmapModel = @appModelFactory.getRoadmapModel()

      record = Ext.create roadmapModel
      expect(record.$className).toEqual 'Rally.apps.roadmapplanningboard.RoadmapModel'

    it 'should have type of RoadmapModel', ->
      roadmapModel = @appModelFactory.getRoadmapModel()

      record = Ext.create roadmapModel
      expect(record.plans().model.$className).toEqual 'Rally.apps.roadmapplanningboard.PlanningModel'

  describe 'FeatureModel', ->
    beforeEach ->
      @featureModel = @appModelFactory.getFeatureModel()

    it 'should be a Ext.model.Model', ->
      expect(Ext.create(@featureModel) instanceof Ext.data.Model).toBeTruthy()

    it 'should have basic feature fields', ->
      record = Ext.create @featureModel,
        id: 'ID1'
        name: 'hello'
        refinedEstimate: 5

      expect(record.get('name')).toEqual('hello')
      expect(record.get('id')).toEqual('ID1')
      expect(record.get('refinedEstimate')).toEqual(5)

    it 'has a getId() returning property value', ->
      record = Ext.create @featureModel,
        id: 'ID1'
        name: 'hello'
        refinedEstimate: 5

      expect(record.getId).toBeDefined()
      expect(record.idProperty).toEqual 'id'
      expect(record.getId()).toEqual 'ID1'

  describe 'TimeframeModel', ->
    it 'is defined', ->
      timeframeModel = @appModelFactory.getTimeframeModel()
      record = Ext.create timeframeModel
      expect(record).toBeDefined()
