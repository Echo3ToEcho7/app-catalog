Ext = window.Ext4 || window.Ext

describe 'Rally.apps.roadmapplanningboard.plugin.OrcaColumnDropController', ->
  beforeEach ->
    Deft.Injector.configure
      appModelFactory:
        className: 'Rally.apps.roadmapplanningboard.AppModelFactory'

    target = Ext.getBody()
    @storeFixtureFactory = Ext.create 'Rally.test.apps.roadmapplanningboard.mocks.StoreFixtureFactory'
    planningStore = @storeFixtureFactory.getPlanningStoreFixture()
    timeframeStore = @storeFixtureFactory.getTimeframeStoreFixture()
    featureStore = @storeFixtureFactory.getFeatureStoreFixture()
    secondFeatureStore = @storeFixtureFactory.getSecondFeatureStoreFixture()

    @leftColumnPlan = planningStore.getById('513617ecef8623df1391fefc')
    leftColumnTimeframe = timeframeStore.getById(@leftColumnPlan.get('timeframe').id)

    @leftColumn = Ext.create 'Rally.apps.roadmapplanningboard.TimeframePlanningColumn',
      stores: [featureStore]
      planRecord: @leftColumnPlan
      timeboxRecord: leftColumnTimeframe
      renderTo: target
      contentCell: target
      headerCell: target

    @rightColumnPlan = planningStore.getById('513617f7ef8623df1391fefd')
    rightColumnTimeframe = timeframeStore.getById(@rightColumnPlan.get('timeframe').id)

    @rightColumn = Ext.create 'Rally.apps.roadmapplanningboard.TimeframePlanningColumn',
      stores: [secondFeatureStore]
      planRecord: @rightColumnPlan
      timeboxRecord: rightColumnTimeframe
      renderTo: target
      contentCell: target
      headerCell: target

    @backlogColumn = Ext.create 'Rally.apps.roadmapplanningboard.BacklogBoardColumn',
      stores: [secondFeatureStore]
      featureStore: secondFeatureStore
      renderTo: target
      contentCell: target
      headerCell: target

    @leftColumnDropController = Ext.create 'Rally.apps.roadmapplanningboard.plugin.OrcaColumnDropController'
    @leftColumnDropController.init(@leftColumn)
    @rightColumnDropController = Ext.create 'Rally.apps.roadmapplanningboard.plugin.OrcaColumnDropController'
    @rightColumnDropController.init(@rightColumn)
    @backlogColumnDropController = Ext.create 'Rally.apps.roadmapplanningboard.plugin.OrcaColumnDropController'
    @backlogColumnDropController.init(@backlogColumn)

  afterEach ->
    @leftColumnDropController?.destroy()
    @rightColumnDropController?.destroy()
    @backlogColumnDropController?.destroy()
    @leftColumn?.destroy()
    @rightColumn?.destroy()
    @backlogColumn?.destroy()

  it 'should be creatable', ->
    expect(@leftColumnDropController).toBeTruthy()

  it 'should allow a card to be dropped in the same column and reorder the cards', ->
    ajaxRequest = @stub Ext.Ajax, 'request', (options) ->
      options.success()

    cardCountBefore = @leftColumn.getCards().length
    card = @leftColumn.getCards()[2]

    dragData = { card: card, column: @leftColumn }
    @leftColumnDropController.onCardDropped(dragData, 5)

    targetCard = @leftColumn.getCards()[4]
    cardName = card.getRecord().get('name')
    targetCardName = targetCard.getRecord().get('name')

    expect(targetCardName).toBe(cardName)
    expect(cardCountBefore).toBe(@leftColumn.getCards().length)

  it 'should allow a card to be dropped into another column', ->
    ajaxRequest = @stub Ext.Ajax, 'request', (options) ->
      options.success()

    leftColumnCardCountBefore = @leftColumn.getCards().length
    rightColumnCardCountBefore = @rightColumn.getCards().length
    card = @leftColumn.getCards()[2]

    dragData = { card: card, column: @leftColumn }
    @rightColumnDropController.onCardDropped(dragData, 0)

    targetCard = @rightColumn.getCards()[0]
    cardName = card.getRecord().get('name')
    targetCardName = targetCard.getRecord().get('name')

    expect(targetCardName).toBe(cardName)
    expect(leftColumnCardCountBefore - 1).toBe(@leftColumn.getCards().length)
    expect(rightColumnCardCountBefore + 1).toBe(@rightColumn.getCards().length)

  it 'should allow a card to be dropped into a backlog column and persist', ->
    saveStub = @stub @leftColumn.planRecord, 'save', (options) ->
      options.success()

    leftColumnCardCountBefore = @leftColumn.getCards().length
    card = @leftColumn.getCards()[2]

    expect(_.any(@leftColumn.planRecord.get('features'), (feature) ->
      feature.id == '51300182ef868cfedc980a39')).toBe true

    dragData = { card: card, column: @leftColumn }
    @backlogColumnDropController.onCardDropped(dragData, 0)

    expect(_.any(@leftColumn.planRecord.get('features'), (feature) ->
      feature.id == '51300182ef868cfedc980a39')).toBe false
    expect(saveStub.callCount).toBe 1
    expect(@leftColumn.getCards().length).toBe leftColumnCardCountBefore - 1

  it 'should allow a card to be moved out of a backlog column and persist', ->
    saveStub = @stub @leftColumn.planRecord, 'save', (options) ->
      options.success()

    leftColumnCardCountBefore = @leftColumn.getCards().length
    card = @backlogColumn.getCards()[0]

    expect(_.any(@leftColumn.planRecord.get('features'), (feature) ->
      feature.id == '51300181ef868cfedc980a80')).toBe false
    dragData = { card: card, column: @backlogColumn }
    @leftColumnDropController.onCardDropped(dragData, 0)

    expect(_.any(@leftColumn.planRecord.get('features'), (feature) ->
      feature.id == '51300181ef868cfedc980a80')).toBe true
    expect(saveStub.callCount).toBe 1
    expect(@leftColumn.getCards().length).toBe leftColumnCardCountBefore + 1

  it 'should allow a card to be dropped into another column and persist feature to plan relationship', ->
    ajaxRequest = @stub Ext.Ajax, 'request', (options) ->
      options.success()

    leftColumnCardCountBefore = @leftColumn.getCards().length
    rightColumnCardCountBefore = @rightColumn.getCards().length
    card = @leftColumn.getCards()[2]

    expect(_.any(@leftColumn.planRecord.get('features'), (feature) ->
      feature.id == '51300182ef868cfedc980a39')).toBe true
    expect(_.any(@rightColumn.planRecord.get('features'), (feature) ->
      feature.id == '51300182ef868cfedc980a39')).toBe false

    dragData = { card: card, column: @leftColumn }
    @rightColumnDropController.onCardDropped(dragData, 0)

    expect(_.any(@leftColumn.planRecord.get('features'), (feature) ->
      feature.id == '51300182ef868cfedc980a39')).toBe false
    expect(_.any(@rightColumn.planRecord.get('features'), (feature) ->
      feature.id == '51300182ef868cfedc980a39')).toBe true

    expect(ajaxRequest.callCount).toBe 1
#    expect(ajaxRequest.getCall(0).args[0].url).toBe Deft.Injector.resolve('orcaEnvironment').getPlanningServiceBaseUrl() + '/plan/' + @leftColumn.planRecord.get('id') + '/features/to/' + @rightColumn.planRecord.get('id')

    expect(@leftColumn.getCards().length).toBe leftColumnCardCountBefore - 1
    expect(@rightColumn.getCards().length).toBe rightColumnCardCountBefore + 1
