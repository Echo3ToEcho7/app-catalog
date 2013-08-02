Ext = window.Ext4 || window.Ext

describe 'Rally.apps.roadmapplanningboard.plugin.OrcaColumnDropController', ->
  beforeEach ->
    deps = Ext.create 'Rally.test.apps.roadmapplanningboard.helper.TestDependencyHelper'
    deps.loadDependencies()

    target = Ext.getBody()
    @storeFixtureFactory = Ext.create 'Rally.test.apps.roadmapplanningboard.mocks.StoreFixtureFactory'
    planStore = Deft.Injector.resolve('planStore')
    timeframeStore = Deft.Injector.resolve('timeframeStore')
    featureStore = Deft.Injector.resolve('featureStore')
    secondFeatureStore = Deft.Injector.resolve('secondFeatureStore')

    @leftColumnPlan = planStore.getById('513617ecef8623df1391fefc')
    leftColumnTimeframe = timeframeStore.getById(@leftColumnPlan.get('timeframe').id)

    @leftColumn = Ext.create 'Rally.apps.roadmapplanningboard.TimeframePlanningColumn',
      stores: [Ext.create 'Ext.data.Store',
            extend: 'Ext.data.Store'
            model: Rally.test.mock.data.WsapiModelFactory.getModel 'PortfolioItem/Feature'
            proxy:
                type: 'memory'
            data: Rally.test.mock.ModelObjectMother.getRecords('PortfolioItemFeature',
                {
                    values: [
                        {
                            "ObjectID": "1000",
                            "_ref": '/portfolioitem/feature/1000',
                            "Name": "Android Support",
                            "PreliminaryEstimate": {"Value": 4},
                            "subscriptionId": "1"
                        },
                        {
                            "ObjectID": "1001",
                            "_ref": '/portfolioitem/feature/1001',
                            "Name": "iOS Support",
                            "PreliminaryEstimate": {"Value": 2},
                            "subscriptionId": "1"
                        },
                        {
                            "ObjectID": "1002",
                            "_ref": '/portfolioitem/feature/1002',
                            "Name": "HTML 5 Webapp",
                            "PreliminaryEstimate": {"Value": 3},
                            "subscriptionId": "1"
                        }
                    ]
                }
            )]
      getStores: -> @stores
      lowestPIType: 'PortfolioItem/Feature'
      planRecord: @leftColumnPlan
      timeboxRecord: leftColumnTimeframe
      renderTo: target
      contentCell: target
      headerCell: target

    @rightColumnPlan = planStore.getById('513617f7ef8623df1391fefd')
    rightColumnTimeframe = timeframeStore.getById(@rightColumnPlan.get('timeframe').id)

    @rightColumn = Ext.create 'Rally.apps.roadmapplanningboard.TimeframePlanningColumn',
      stores: [Ext.create 'Ext.data.Store',
            extend: 'Ext.data.Store'
            model: Rally.test.mock.data.WsapiModelFactory.getModel 'PortfolioItem/Feature'
            proxy:
                type: 'memory'

            data: Rally.test.mock.ModelObjectMother.getRecords('PortfolioItemFeature',
                {
                    values: [
                        {
                            "ObjectID": "1005",
                            "_ref": '/portfolioitem/feature/1005',
                            "Name": "Ubuntu Phone Application",
                            "PreliminaryEstimate": {"Value": 4},
                            "subscriptionId": "2"
                        }
                    ]
                }
            )]
      getStores: -> @stores
      planRecord: @rightColumnPlan
      lowestPIType: 'PortfolioItem/Feature'
      timeboxRecord: rightColumnTimeframe
      renderTo: target
      contentCell: target
      headerCell: target

    @backlogColumn = Ext.create 'Rally.apps.roadmapplanningboard.BacklogBoardColumn',
      getStores: -> @stores
      stores: [secondFeatureStore]
      lowestPIType: 'PortfolioItem/Feature'
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
    Deft.Injector.reset()
    @leftColumnDropController?.destroy()
    @rightColumnDropController?.destroy()
    @backlogColumnDropController?.destroy()
    @leftColumn?.destroy()
    @rightColumn?.destroy()
    @backlogColumn?.destroy()

  it 'should allow a card to be dropped in the same column and reorder the cards', ->
    ajaxRequest = @stub Ext.Ajax, 'request', (options) ->
      options.success()

    cardCountBefore = @leftColumn.getCards().length
    card = @leftColumn.getCards()[2]

    dragData = { card: card, column: @leftColumn }
    @leftColumnDropController.onCardDropped(dragData, 3)

    targetCard = @leftColumn.getCards()[2]
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
      feature.id == '1002')).toBe true

    dragData = { card: card, column: @leftColumn }
    @backlogColumnDropController.onCardDropped(dragData, 0)

    expect(_.any(@leftColumn.planRecord.get('features'), (feature) ->
      feature.id == '1002')).toBe false
    expect(saveStub.callCount).toBe 1
    expect(@leftColumn.getCards().length).toBe leftColumnCardCountBefore - 1

  it 'should allow a card to be moved out of a backlog column and persist', ->
    saveStub = @stub @leftColumn.planRecord, 'save', (options) ->
      options.success()

    leftColumnCardCountBefore = @leftColumn.getCards().length
    card = @backlogColumn.getCards()[0]

    expect(_.any(@leftColumn.planRecord.get('features'), (feature) ->
      feature.id + '' == '1010')).toBe false
    dragData = { card: card, column: @backlogColumn }
    @leftColumnDropController.onCardDropped(dragData, 0)

    expect(_.any(@leftColumn.planRecord.get('features'), (feature) ->
      feature.id + '' == '1010')).toBe true
    expect(saveStub.callCount).toBe 1
    expect(@leftColumn.getCards().length).toBe leftColumnCardCountBefore + 1

  it 'should allow a card to be dropped into another column and persist feature to plan relationship', ->
    ajaxRequest = @stub Ext.Ajax, 'request', (options) ->
      options.success()

    leftColumnCardCountBefore = @leftColumn.getCards().length
    rightColumnCardCountBefore = @rightColumn.getCards().length
    card = @leftColumn.getCards()[2]

    expect(_.any(@leftColumn.planRecord.get('features'), (feature) ->
      feature.id+'' == '1002')).toBe true
    expect(_.any(@rightColumn.planRecord.get('features'), (feature) ->
      feature.id + '' == '1002')).toBe false

    dragData = { card: card, column: @leftColumn }
    @rightColumnDropController.onCardDropped(dragData, 0)

    expect(_.any(@leftColumn.planRecord.get('features'), (feature) ->
      feature.id + '' == '1002')).toBe false
    expect(_.any(@rightColumn.planRecord.get('features'), (feature) ->
      feature.id + '' == '1002')).toBe true

    expect(ajaxRequest.callCount).toBe 1

    expect(@leftColumn.getCards().length).toBe leftColumnCardCountBefore - 1
    expect(@rightColumn.getCards().length).toBe rightColumnCardCountBefore + 1
