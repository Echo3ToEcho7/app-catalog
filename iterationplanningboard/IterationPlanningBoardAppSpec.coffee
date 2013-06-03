Ext = window.Ext4 || window.Ext

Ext.require [
  'Rally.ui.gridboard.plugin.GridBoardArtifactTypeChooser',
  'Rally.alm.FeatureToggle',
  'Rally.util.Array',
  'Rally.util.DateTime'
]

describe 'Rally.apps.iterationplanningboard.IterationPlanningBoardApp', ->

  helpers
    cardSelector: '.rui-card'

    createApp: (options = {}) ->
      @iterationData = options.iterationData || Helpers.IterationDataCreatorHelper.createIterationData(options)

      @ajax.whenQuerying('iteration').respondWith(@iterationData)

      @app = Ext.create('Rally.apps.iterationplanningboard.IterationPlanningBoardApp', Ext.apply(
        context: Ext.create('Rally.app.Context',
          initialValues:
            project:
              _ref: '/project/1'
            featureToggles: Rally.alm.FeatureToggle
            subscription: Rally.environment.getContext().getSubscription()
            workspace: Rally.environment.getContext().getWorkspace()
        ),
        renderTo: 'testDiv'
      , options.appConfig))

      @waitForComponentReady @app

    createAppWithBacklogData: ->
      userStoryRecord = @createUserStoryRecord
        Name: 'A User Story'
        Iteration: null
      @ajax.whenQuerying('userstory').respondWith([userStoryRecord.data])

      defectRecord = @createDefectRecord
        Name: 'A Defect'
        Iteration: null
      @ajax.whenQuerying('defect').respondWith([defectRecord.data])

      @createApp()

    getIteration1: ->
      _ref: '/iteration/1'
      _refObjectName: 'Iteration 1'
      Name: 'Iteration 1'
      ObjectID: 1
      Project:
        _ref: '/project/1'

    cardboard: ->
      @app.cardboard

    createUserStoryRecord: (options = {}) ->
      Model = Rally.test.mock.data.ModelFactory.getUserStoryModel()
      options._type = 'hierarchicalrequirement'
      new Model(Ext.merge({ObjectID: Ext.Number.randomInt(1, 10000)}, options))

    createDefectRecord: (options = {}) ->
      Model = Rally.test.mock.data.ModelFactory.getDefectModel()
      options._type = 'defect'
      new Model(Ext.merge({ObjectID: Ext.Number.randomInt(1, 10000)}, options))

    getVisibleCards: (type) ->
      additionalClass = if type? then ".#{type}" else ''
      cards = Ext.query "#{@cardSelector}#{additionalClass}"

      card for card in cards when Ext.fly(card).isVisible()

    getVisibleCardNames: ->
      Ext.query "#{@cardSelector} .rui-card-content .field-content.Name"

    filterByType: (type, expectedVisibleCards = 0) ->
      @click(css: ".#{type}-type-checkbox input").then =>
        once(
          condition: => @getVisibleCards(type).length is expectedVisibleCards
          description: 'filter to be applied'
        )

    filterByBacklogCustomSearchQuery: (query) ->
      @click(css: '.search-text input').then (el) =>
        el.sendKeys(query).then =>
          @click(className: 'search-button')

    getProgressBar: (columnIndex) ->
      @getColumns()[columnIndex].getProgressBar().down('.progress-bar')

    getProgressBarHtml: (columnIndex) ->
      @getColumns()[columnIndex].getProgressBar().getEl().select('.progress-bar-label').item(0).getHTML()

    # could not get actionsequence mouseMove to work in FF
    simulateMouseEnterFormattedID: () ->
      Rally.test.fireEvent(Ext.query("#{@cardSelector} .id")[0], 'mouseenter')
      once(
        condition: => Ext.query('.description-popover .description').length is 1
        description: 'description popover to show'
      )

    # could not get actionsequence mouseMove to work in FF
    simulateMouseLeaveFormattedID: () ->
      Rally.test.fireEvent(Ext.query("#{@cardSelector} .id")[0], 'mouseleave')
      once(
        condition: => Ext.query('.description-popover').length is 0
        description: 'description popover to hide'
      )

    getColumns: ->
      @app.gridboard.getGridOrBoard().getColumns()

    getTimeboxColumns: ->
      @getColumns()[1..] # exclude backlog column

    assertThreeTimeboxColumnsShown: (firstIterationIndex = 0) ->
      timeboxColumns = @getTimeboxColumns()
      expect(timeboxColumns.length).toBe 3
      for i in [0...timeboxColumns.length]
        @assertColumnIsFor @iterationData[i + firstIterationIndex], timeboxColumns[i]

    assertColumnIsFor: (iterationJson, column) ->
      expect(iterationJson._ref).toEqual column.getValue()

  beforeEach ->
    @ajax.whenQuerying('userstory').respondWith()
    @ajax.whenQuerying('defect').respondWith()
    @ajax.whenQuerying('preference').respondWith({})
    @stub(Rally.ui.gridboard.plugin.GridBoardArtifactTypeChooser.prototype, '_saveArtifactTypePreference')

  afterEach ->
    @app?.destroy()

  it 'should show Parent field on Card', ->
    @createApp().then =>
      Assert.arrayContains @app.down('.rallycardboard').cardConfig.fields, 'Parent'

  it 'should render a maximum of 3 columns', ->
    @createApp(
      iterationCount: 5
    ).then =>
      columns = @getColumns()
      expect(columns.length).toEqual 4 #1 extra column for the backlog column

  it 'should render columns ordered by end date', ->
    iterationCount = 2
    @createApp(
      iterationCount: iterationCount
    ).then =>
      columns = @getColumns()
      expect(columns[0].getValue()).toBeNull()
      for i in [0...iterationCount]
        expect(@iterationData[i]._ref).toEqual columns[i + 1].getValue()

  it 'should render the current and two future iterations', ->
    now = new Date
    @createApp(
      iterationCount: 5
      startingAt: Ext.Date.add(now, Ext.Date.DAY, -3)
    ).then =>
      timeboxColumns = @getTimeboxColumns()
      expect(timeboxColumns[0].timeboxRecords[0].get('StartDate')).toBeLessThan now
      expect(timeboxColumns[0].timeboxRecords[0].get('EndDate')).toBeGreaterThan now

      expect(timeboxColumns[1].timeboxRecords[0].get('StartDate')).toBeGreaterThan now
      expect(timeboxColumns[2].timeboxRecords[0].get('StartDate')).toBeGreaterThan now

  it 'should render the three iteration closest to now when there are no future iterations', ->
    now = new Date
    @createApp(
      iterationCount: 5
      startingAt: Ext.Date.add(now, Ext.Date.DAY, -100)
    ).then =>
      @assertThreeTimeboxColumnsShown 2

  it 'should render all iterations when there are only three iterations', ->
    now = new Date
    @createApp(
      iterationCount: 3
      iterationLength: 2
      startingAt: Ext.Date.add(now, Ext.Date.DAY, -3)
    ).then =>
      @assertThreeTimeboxColumnsShown()

  it 'should render all past iterations when there are only three iterations', ->
    now = new Date
    @createApp(
      iterationCount: 3
      startingAt: Ext.Date.add(now, Ext.Date.DAY, -100)
    ).then =>
      @assertThreeTimeboxColumnsShown()

  it 'should render all future iterations when there are only three iterations', ->
    now = new Date
    @createApp(
      iterationCount: 3
      startingAt: Ext.Date.add(now, Ext.Date.DAY, 100)
    ).then =>
      @assertThreeTimeboxColumnsShown()

  it 'should not render iterations not within current project', ->
    iterationCount = 1
    iterationData = Helpers.IterationDataCreatorHelper.createIterationData
      iterationCount: iterationCount

    now = new Date
    iterationData.push
      _ref: "/iteration/2"
      _refObjectName: "Iteration 2"
      Name: "Iteration 2"
      ObjectID: 2,
      Project:
        _ref: "/project/12345"
      StartDate: Rally.util.DateTime.toIsoString(Ext.Date.add(now, Ext.Date.DAY, 5))
      EndDate: Rally.util.DateTime.toIsoString(Ext.Date.add(now, Ext.Date.DAY, 7))

    @createApp(
      iterationData: iterationData
    ).then =>
      columns = @getColumns()
      expect(columns.length).toEqual iterationCount + 1 # backlog + 1 iteration
      expect(columns[1].getValue()).toEqual(iterationData[0]._ref)

  it 'should update the project of a card when dropping in a non-like iteration', ->
    iterationCount = 1
    iterationData = Helpers.IterationDataCreatorHelper.createIterationData
      iterationCount: iterationCount

    userStory = @createUserStoryRecord
      Project:
        _ref: '/project/2'

    @createApp(
      iterationData: iterationData
    ).then =>
      iterationColumn = @getColumns()[1]
      iterationColumn.fireEvent 'beforecarddroppedsave', iterationColumn,
        getRecord: -> userStory

      expect(Rally.util.Ref.getRelativeUri(userStory.get('Project'))).toEqual(Rally.util.Ref.getRelativeUri(@app.getContext().getProject()))

  it 'should hide only user stories when user story type checkbox is unchecked', ->
    userStoryRecord = @createUserStoryRecord Iteration: null
    @ajax.whenQuerying('userstory').respondWith([userStoryRecord.data])

    defectRecord = @createDefectRecord Iteration: null
    @ajax.whenQuerying('defect').respondWith([defectRecord.data])

    @createApp().then =>
      expect(@getVisibleCards('defect').length).toBe 1
      expect(@getVisibleCards('hierarchicalrequirement').length).toBe 1

      @filterByType('hierarchicalrequirement').then =>
        expect(@getVisibleCards('defect').length).toBe 1

  it 'should hide only defects when defect type checkbox is unchecked', ->
    userStoryRecord = @createUserStoryRecord Iteration: null
    @ajax.whenQuerying('userstory').respondWith([userStoryRecord.data])

    defectRecord = @createDefectRecord Iteration: null
    @ajax.whenQuerying('defect').respondWith([defectRecord.data])

    @createApp().then =>

      expect(@getVisibleCards('defect').length).toBe 1
      expect(@getVisibleCards('hierarchicalrequirement').length).toBe 1

      @filterByType('defect').then =>
        expect(@getVisibleCards('hierarchicalrequirement').length).toBe 1

  it 'should apply local filter if artifacts type pref exists', ->
    addLocalFilterStub = @stub(Rally.ui.cardboard.CardBoard.prototype, 'addLocalFilter')
    artifactsPref = ['defect']
    artifactsPrefStub = @stub(Rally.ui.gridboard.plugin.GridBoardArtifactTypeChooser.prototype, 'artifactsPref', artifactsPref)

    @createApp().then =>

      expect(addLocalFilterStub).toHaveBeenCalledOnce()
      expect(addLocalFilterStub.getCall(0).args[1]).toBe artifactsPref

  it 'should not apply local filter if artifacts type pref exists and it shows all types', ->
    addLocalFilterStub = @stub(Rally.ui.cardboard.CardBoard.prototype, 'addLocalFilter')
    artifactsPref = ['defect', 'hierarchicalrequirement']
    artifactsPrefStub = @stub(Rally.ui.gridboard.plugin.GridBoardArtifactTypeChooser.prototype, 'artifactsPref', artifactsPref)

    @createApp().then =>

      expect(addLocalFilterStub).not.toHaveBeenCalled()

  it 'should not apply local filter if artifacts type pref does not exist', ->
    addLocalFilterStub = @stub(Rally.ui.cardboard.CardBoard.prototype, 'addLocalFilter')
    artifactsPrefStub = @stub(Rally.ui.gridboard.plugin.GridBoardArtifactTypeChooser.prototype, 'artifactsPref', undefined)

    expect(addLocalFilterStub).not.toHaveBeenCalled()

  it 'does not show add new or manage iterations when user is not a project editor', ->
    @stub(Rally.auth.UserPermissions.prototype, 'isProjectEditor').returns false

    @createApp().then =>

      expect(@app.down('#header').down 'rallyaddnew').toBeNull()
      expect(@app.down('#header').down 'rallybutton[text=Manage Iterations]').toBeNull()

  it 'shows add new for user who is a project editor', ->
    @stub(Rally.auth.UserPermissions.prototype, 'isProjectEditor').returns true
    @createApp().then =>

      expect(@app.down('#header').down 'rallyaddnew').not.toBeNull()

  it 'should allow managing iterations when user is a project editor and is hs sub', ->
    Rally.test.mock.env.Global.setupEnvironment
      subscription:
        SubscriptionType: 'HS_1'

    @stub(Rally.auth.UserPermissions.prototype, 'isProjectEditor').returns true
    manageIterationsStub = @stub(Rally.nav.Manager, 'manageIterations')

    @createApp().then =>

      manageButton = @app.down('#header').down 'rallybutton[text=Manage Iterations]'
      expect(manageButton).not.toBeNull()
      Rally.test.fireEvent(manageButton, 'click')
      expect(manageIterationsStub.callCount).toBe 1
      expect(manageIterationsStub.getCall(0).args[0]).toEqual @app.getContext()

  it 'should bucket like iterations into a single column', ->
    likeCount = 3
    @createApp(likeCount: likeCount).then =>

      for column in @getTimeboxColumns()
        timeboxRecords = column.getTimeboxRecords()
        expect(timeboxRecords.length).toEqual likeCount
        for timeboxRecord in timeboxRecords[1..]
          expect(timeboxRecord.get('Name')).toEqual timeboxRecords[0].get('Name')
          expect(timeboxRecord.get('StartDate')).toEqual timeboxRecords[0].get('StartDate')
          expect(timeboxRecord.get('EndDate')).toEqual timeboxRecords[0].get('EndDate')

  it 'should add a new story', ->
    @stub(Rally.auth.UserPermissions.prototype, 'isProjectEditor').returns true
    @createApp().then =>

      storyData =
        Iteration: @getIteration1(),
        _ref: '/hierarchicalrequirement/3'
        _refObjectName: 'Story 3'
        Name: 'Story 3'
        ObjectID: 3

      @ajax.whenCreating('userstory').respondWith(storyData)
      @ajax.whenQuerying('userstory').respondWith([storyData])

      addNewHelper = new Helpers.AddNewHelper '.planning-board'
      addNewHelper.inlineAdd('Story 3').then =>
        expect(@getVisibleCardNames()[0].innerHTML).toContain 'Story 3'

  it 'should open the editor when adding a story with details', ->
    @stub(Rally.auth.UserPermissions.prototype, 'isProjectEditor').returns true
    @createApp().then =>

      @stub(Rally, 'getScope').returns
        projectOid: 431439,
        scopeUp: false
        scopeDown: true
      editorOpenedStub = @stub(Rally.nav.Manager, 'create')

      addNewHelper = new Helpers.AddNewHelper '.planning-board'
      addNewHelper.addWithDetails('foo').then ->
        expect(editorOpenedStub).toHaveBeenCalledOnce()

  it 'should display story ranked at the bottom of the column', ->
    storyRank = 1000
    firstStoryName = 'Story 1'
    userStory1 =
      Iteration: @getIteration1(),
      _ref: '/hierarchicalrequirement/1'
      _refObjectName: firstStoryName
      Name: firstStoryName
      ObjectID: 1,
      Rank: storyRank
    @ajax.whenQuerying('userstory').respondWith(userStory1)
    @createApp().then =>

      secondStoryName = 'Story ranked lower than 1'
      userStory2 =
        Iteration: @getIteration1(),
        _ref: '/hierarchicalrequirement/2'
        _refObjectName: secondStoryName
        Name: secondStoryName
        ObjectID: 2,
        Rank: storyRank + 1

      records = [
        @createUserStoryRecord userStory2
      ]
      @ajax.whenQuerying('userstory').respondWith(userStory2)

      Rally.environment.getMessageBus().publish Rally.Message.objectCreate, records

      cards = @getVisibleCardNames()
      expect(cards[0].innerHTML).toContain firstStoryName
      expect(cards[1].innerHTML).toContain secondStoryName

  it 'fires contentupdated event after board load', ->
    contentUpdatedHandlerStub = @stub()

    @createApp().then =>
      @app.on('contentupdated', contentUpdatedHandlerStub)
      @app.gridboard.fireEvent('load')

      expect(contentUpdatedHandlerStub).toHaveBeenCalledOnce()

  it 'should exclude filtered artifact types when filtering by custom search query on the backlog column', ->
    @createAppWithBacklogData().then =>
      columns = @getColumns()

      @filterByBacklogCustomSearchQuery('A').then =>
        expect(columns[0].getCards().length).toBe 2
        @filterByType('hierarchicalrequirement').then =>
          expect(columns[0].getCards().length).toBe 1

  it 'should filter by artifact type and still filter by custom search query on the backlog column', ->
    @createAppWithBacklogData().then =>
      columns = @getColumns()

      @filterByType('hierarchicalrequirement').then =>
        @filterByType('defect').then =>
          @filterByBacklogCustomSearchQuery('A').then =>
            expect(columns[0].getCards().length).toBe 0

  it 'should remove all cards (including deactivated cards) when submitting a search in the backlog column', ->
    @createAppWithBacklogData().then =>
      columns = @getColumns()
      backlogColumn = columns[0]
      clearCardsSpy = @spy(backlogColumn, 'clearCards')

      @filterByType('hierarchicalrequirement').then =>
        @filterByType('defect').then =>
          @filterByBacklogCustomSearchQuery('A').then =>
            expect(clearCardsSpy).toHaveBeenCalledOnce()
            expect(backlogColumn.getCards(true).length).toBe 2
            expect(backlogColumn.getCards().length).toBe 0

  it 'should correctly clean up deactivated cards', ->
    @createAppWithBacklogData().then =>
      @ajax.whenQuerying('defect').respondWith([])
      columns = @getColumns()

      @filterByType('defect').then =>
        @filterByBacklogCustomSearchQuery('Story').then =>
          @filterByType('defect').then =>
            expect(columns[0].getCards().length).toBe 1

  it 'should include filtered cards when calculating fullness of the iteration', ->
    options =
     values:
       Iteration: @getIteration1()
       PlanEstimate: 2
    @ajax.whenQuerying('userstory').respondWith(@mom.getData('userstory', options))
    @ajax.whenQuerying('defect').respondWith(@mom.getData('defect', options))

    @createApp(plannedVelocity: 10).then =>
      expect(@getProgressBarHtml(1)).toBe '4 of 10'

      @filterByType('defect').then =>
        expect(@getProgressBarHtml(1)).toBe '4 of 10'
        @filterByType('hierarchicalrequirement').then =>
          expect(@getProgressBarHtml(1)).toBe '4 of 10'
          @filterByType('defect', 1).then =>
            expect(@getProgressBarHtml(1)).toBe '4 of 10'
            @filterByType('hierarchicalrequirement', 1).then =>
              expect(@getProgressBarHtml(1)).toBe '4 of 10'

  it 'should show and hide description popover', ->
    userStoryRecord = @createUserStoryRecord
      Iteration: @getIteration1()
      FormattedID: 'S12345'
      Name: 'Hello Kitty Story'
      Description: 'foo bunny'
    @ajax.whenQuerying('userstory').respondWith([userStoryRecord.data])
    @createApp().then =>
      cardFormattedID = Ext.query("#{@cardSelector} .id")[0]

      @simulateMouseEnterFormattedID().then =>
        expect(Ext.get(Ext.query('.description-popover .description')[0]).dom.innerHTML).toBe userStoryRecord.get('Description')

  it 'should be able to scroll backwards', ->
    @createApp(
      iterationCount: 4
      iterationLength: 2
      startingAt: Ext.Date.add(new Date, Ext.Date.DAY, -3)
    ).then =>
      @click(className: 'scroll-backwards').then =>
        @assertColumnIsFor @iterationData[0], @getTimeboxColumns()[0]

  it 'should be able to scroll forwards', ->
    @createApp(
      iterationCount: 4
      iterationLength: 2
      startingAt: new Date
    ).then =>
      @click(className: 'scroll-forwards').then =>
        @assertColumnIsFor Rally.util.Array.last(@iterationData), Rally.util.Array.last(@getTimeboxColumns())
