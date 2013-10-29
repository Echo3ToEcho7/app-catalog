Ext = window.Ext4 || window.Ext

describe 'Rally.apps.releasesummary.ReleaseSummaryApp', ->

  beforeEach ->
    @releases = [
      {
        _ref: '/release/1',
        Name: 'Release 1',
        Notes: 'Release 1 Note',
        ReleaseStartDate: '2013-09-01',
        ReleaseDate: '2013-09-02'
      },
      {
        _ref: '/release/2',
        Name: 'Release 2',
        Notes: 'Release 2 Note',
        ReleaseStartDate: '2013-09-03',
        ReleaseDate: '2013-09-04'
      }
    ]

    @ajax.whenQuerying('release').respondWith @releases
    _.each @releases, (release) ->
      @ajax.whenReading('release', Rally.util.Ref.getOidFromRef(release)).respondWith release

    @storyCountR1 = 2
    # @storyCountR2 = 1
    @ajax.whenQuerying('userstory').respondWith([
      {
        FormattedID: 'S1'
        Name: '1st Story in Release 1'
        ScheduleState:"Completed"
        Release: '/release/1'
      },
      {
        FormattedID: 'S2'
        Name: '2nd Story in Release 1'
        ScheduleState: "Accepted"
        Release: '/release/1'
      }# ,
      # {
      #   FormattedID: 'S3'
      #   Name: '1st Story in Release 2'
      #   ScheduleState: "Accepted"
      #   Release: '/release/2'
      # }
    ])

    @defectCountR1 = 2
    @defectCountR2 = 1
    @ajax.whenQuerying('defect').respondWith([
      {
        FormattedID: 'D1'
        Name: '1st Defect in Release 1'
        ScheduleState:'Completed'
        Release: '/release/1'
      },
      {
        FormattedID: 'D2'
        Name: '2nd Defect in Release 1'
        ScheduleState: 'Accepted'
        Release: '/release/1'
      }#,
      # {
      #   FormattedID: 'D3'
      #   Name: '1st Defect in Release 2'
      #   ScheduleState: 'Accepted'
      #   Release: '/release/2'
      # }
    ])

  afterEach ->
    Rally.test.destroyComponentsOfQuery 'releasesummaryapp'

  it 'should display About This Release', ->
    @createApp().then =>
      expect(@app.down('#releaseInfo').getEl().dom.innerHTML).toContain "About this release"

  it 'should display the release notes', ->
    @createApp().then =>
      scope = @app.getContext().getTimeboxScope().getRecord()
      expect(@app.down('#releaseInfo').getEl().dom.innerHTML).toContain scope.get('Notes')

  it 'should create link for additional release information', ->
    @createApp().then =>
      project = @getProjectIDFromRecordID()

      link = 'href="#/'+project+'d/detail'+@app.getContext().getTimeboxScope().getRecord().get('_ref')

      expect(@app.down('#releaseInfo').getEl().dom.innerHTML).toContain link

  it 'should get correct store filters', ->
    storeConfigSpy = @spy(Rally.apps.releasesummary.ReleaseSummaryApp.prototype, '_getStoreConfig')
    @createApp().then =>
      expect(storeConfigSpy.callCount).toBe 2
      # expect(storeConfigSpy.returnValues[0].filters[0].value).toBe @releases[0]._ref
      # expect(storeConfigSpy.returnValues[1].filters[0].value).toBe @releases[0]._ref
      expect(storeConfigSpy.returnValues[0].filters[0].property.property.value).toBe @releases[0].Name
      expect(storeConfigSpy.returnValues[1].filters[0].property.property.value).toBe @releases[0].Name

  it 'should refilter grids every time scope is changed', ->
    # CHEATED BY ADDING RETURN TO _REFRESHGRIDS FUNCTION!
    onScopeChangeSpy = @spy(Rally.apps.releasesummary.ReleaseSummaryApp.prototype, '_getStoreConfig')
    refreshGridsSpy = @spy(Rally.apps.releasesummary.ReleaseSummaryApp.prototype, '_refreshGrids')

    @createApp().then =>
      previousFilterName = onScopeChangeSpy.returnValues[0].filters[0].property.property.value
      # previousFilterRef = onScopeChangeSpy.returnValues[0].filters[0].value
      expect(previousFilterName).toBe @releases[0].Name
      # expect(previousFilterRef).toBe @releases[0]._ref

      @clickLeftReleaseButton() # change comboboxbox to release 2
      newFilterName = refreshGridsSpy.returnValues[0][0].property.property.value
      expect(newFilterName).toBe @releases[1].Name
      expect(newFilterName).not.toBe previousFilterName

  it 'should show correct # stories', ->
    @createApp().then =>
      expect(@app.down('#story-title').html).toBe "Stories: " + @storyCountR1.toString()

  it 'should show corredt # defects', ->
    @createApp().then =>
      expect(@app.down('#defect-title').html).toBe "Defects: " + @defectCountR1.toString()

  it 'should show 0 stories properly', ->
    @ajax.whenQuerying('userstory').respondWith([])

    @createApp().then =>
      expect(@app.down('#story-title').html).toBe "Stories: 0"

  it 'should show 0 defects properly', ->
    @ajax.whenQuerying('defect').respondWith([])

    @createApp().then =>
      expect(@app.down('#defect-title').html).toBe "Defects: 0"


  # Test to ensure filtering works properly.  This may not be necessary as the
  #  WSAPI filters & others should be tested in other code, so this test may not be useful.
  #  Additionally, the other tests above may cover this functionality decently.

  # it 'should display correct grid titles - only will work when filtering by release works', ->
  #   onStoriesDataLoadedSpy = @spy(Rally.apps.releasesummary.ReleaseSummaryApp.prototype, '_onStoriesDataLoaded')
  #   debugger
  #   @createApp().then =>

  #     expect(@app.down('#story-title').html).toBe "Stories: " + @storyCountR1.toString()
  #     expect(@app.down('#defect-title').html).toBe "Defects: " + @defectCountR1.toString()

  #     @clickLeftReleaseButton()

  #     expect(@app.down('#story-title').html).toBe "Stories: " + @storyCountR2.toString()
  #     expect(@app.down('#defect-title').html).toBe "Defects: " + @defectCountR2.toString()

  # ideas for more tests:
  # - show 0 defects correctly
  # - have 3 columns per grid - maybe 2 separate tests
  # 

  helpers
    createApp: ->
      @app = Ext.create 'Rally.apps.releasesummary.ReleaseSummaryApp',
        renderTo: 'testDiv'
        context: @getContext()

      @waitForComponentReady @app

    getLeftArrowInCombobox: ->
      @app.down('#box').getEl().down('table td:nth-child(1)')

    getRightArrowInCombobox: ->
      @app.down('#box').getEl().down('table td:nth-child(4)')

    getProjectIDFromRecordID: ->
      @app.getContext().getTimeboxScope().getRecord().id.split('.')[5]

    clickLeftReleaseButton: ->
      @getLeftArrowInCombobox().dom.click()

    clickRightReleaseButton: ->
      @getRightArrowInCombobox().dom.click()

    getContext: ->
      globalContext = Rally.environment.getContext()

      Ext.create('Rally.app.Context', {
        initialValues:Ext.merge({
          project:globalContext.getProject()
          workspace:globalContext.getWorkspace()
          user:globalContext.getUser()
          subscription:globalContext.getSubscription()
        })
      })