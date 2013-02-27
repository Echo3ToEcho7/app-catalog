Ext = window.Ext4 || window.Ext

Ext.require [
  'Rally.ui.renderer.template.progressbar.TimeboxProgressBarTemplate'
], ->

  describe 'Rally.apps.iterationplanningboard.IterationPlanningBoardColumn', ->
      beforeEach ->
          queryStub = @ajax.whenQuerying('HierarchicalRequirement').respondWith()
          @colors = Rally.ui.renderer.template.progressbar.TimeboxProgressBarTemplate.percentFullColors
  
      afterEach ->
          @column?.destroy()
  
      it 'should render the iteration name', ->
          iterationName = 'talking bout my iteration'
          @createColumn
              name: iterationName
  
          expect(@column.getEl().down('.columnTitle').getHTML()).toEqual(iterationName)
  
      it 'should render the current iteration column', ->
          iterationName = 'talking bout my iteration'
          @createColumn
              name: iterationName
              currentTimebox: true
  
          expect(@column.hasCls('current-timebox')).toBe true
  
      it 'should defaultly render a noncurrent iteration column', ->
          iterationName = 'talking bout my iteration'
          @createColumn
              name: iterationName
  
          expect(@column.hasCls('current-timebox')).toBe false
  
      it 'should render the iteration dates', ->
          startDate = Ext.Date.parse('2012-11-06', 'Y-m-d')
          endDate = Ext.Date.parse('2012-11-07', 'Y-m-d')
          @createColumn
              startDate: startDate
              endDate: endDate
  
          expectedResult = Ext.String.format '{0} - {1}',
              Rally.util.DateTime.formatWithNoYearWithDefault(startDate),
              Rally.util.DateTime.formatWithNoYearWithDefault(endDate)
  
          expect(@column.getEl().down('.timeboxDates').getHTML()).toEqual(expectedResult)
  
      it 'should include the correct timebox filters when querying for data', ->
          @createColumn
              iterationCount: 2
  
          timebox = @column.getTimeboxRecords()[0]
          filter = @column.getStoreFilter()
          expect(filter.length).toBe 3
          expect(filter[0].property).toEqual('Iteration.Name')
          expect(filter[0].value).toEqual(timebox.get('Name'))
          expect(filter[1].property).toEqual('Iteration.StartDate')
          expect(filter[1].value).toEqual(Rally.util.DateTime.toIsoString(timebox.get('StartDate')))
          expect(filter[2].property).toEqual('Iteration.EndDate')
          expect(filter[2].value).toEqual(Rally.util.DateTime.toIsoString(timebox.get('EndDate')))
  
  
      it 'should match a record whose iteration is any of the column timeboxes', ->
          @createColumn
              iterationCount: 2
  
          for timebox in @column.getTimeboxRecords()
              record = @createUserStoryRecord
                  Iteration:
                      _ref: timebox.get('_ref')
  
              expect(@column.isMatchingRecord record).toBe true
  
      it 'should not match a record whose iteration is not one of the column timeboxes', ->
          @createColumn
              iterationCount: 2
  
          record = @createUserStoryRecord
              Iteration:
                  _ref: '/iteration/12345'
  
          expect(@column.isMatchingRecord record).toBe false
  
      it 'should not match a record with no iteration', ->
          @createColumn
              iterationCount: 2
  
          record = @createUserStoryRecord
              Iteration: null
  
          expect(@column.isMatchingRecord record).toBe false
  
      it 'should not show percent bar when planned velocity is 0', ->
          @createColumn
              iterationCount: 2
              plannedVelocity: 0
  
          expect(@getProgressBarLabel()).toBeNull()
  
      it 'should not show percent bar when planned velocity is 0 and column has card with plan estimate', ->
          @createColumn
              iterationCount: 2
              plannedVelocity: 0
  
          @column.createAndAddCard @createUserStoryRecord
              Iteration: @column.getTimeboxRecords()[0].get('_ref')
              PlanEstimate: 2
  
          expect(@getProgressBarLabel()).toBeNull()
  
      it 'should show 0 out of planned velocity when column has no cards', ->
          @createColumn
              iterationCount: 2
              plannedVelocity: 10
  
          expect(@getProgressBarLabel().getHTML()).toEqual '0 of 20'
  
      it 'should show 0 out of planned velocity when column has card without plan estimate', ->
          @createColumn
              iterationCount: 2
              plannedVelocity: 10
  
          @column.createAndAddCard @createUserStoryRecord
              Iteration: @column.getTimeboxRecords()[0].get('_ref')
  
          expect(@getProgressBarLabel().getHTML()).toEqual '0 of 20'
  
      it 'should show the fullness of the iteration using PlanEstimates out of Planned Velocity', ->
          @createColumn
              iterationCount: 2
              plannedVelocity: 10
  
          @column.createAndAddCard @createUserStoryRecord
              Iteration: @column.getTimeboxRecords()[0].get('_ref')
              PlanEstimate: 2
  
          expect(@getProgressBarLabel().getHTML()).toEqual '2 of 20'
  
  
      it 'should update the progress bar after a card is removed', ->
          @createColumn
              iterationCount: 2
              plannedVelocity: 10
  
          card = @column.createAndAddCard @createUserStoryRecord
              Iteration: @column.getTimeboxRecords()[0].get('_ref')
              PlanEstimate: 2
  
          @column.removeCard card
  
          expect(@getProgressBarLabel().getHTML()).toEqual '0 of 20'
  
      it 'should show a blue bar when iteration capacity is less than 80% full', ->
          @createColumn
              iterationCount: 2
              plannedVelocity: 10
  
          @column.createAndAddCard @createUserStoryRecord
              Iteration: @column.getTimeboxRecords()[0].get('_ref')
              PlanEstimate: 8
  
          expect(@getProgressBar().getColor 'background-color').toEqual @colors.blue
  
      it 'should show a green bar when iteration capacity is 80% full', ->
          @createColumn
              iterationCount: 2
              plannedVelocity: 5
  
          @column.createAndAddCard @createUserStoryRecord
              Iteration: @column.getTimeboxRecords()[0].get('_ref')
              PlanEstimate: 8
  
          expect(@getProgressBar().getColor 'background-color').toEqual @colors.green
  
      it 'should show a green bar when iteration capacity is 100% full', ->
          @createColumn
              iterationCount: 2
              plannedVelocity: 5
  
          @column.createAndAddCard @createUserStoryRecord
              Iteration: @column.getTimeboxRecords()[0].get('_ref')
              PlanEstimate: 10
  
          expect(@getProgressBar().getColor 'background-color').toEqual @colors.green
  
      it 'should show a red bar when iteration capacity is greater than 100% full', ->
          @createColumn
              iterationCount: 2
              plannedVelocity: 5
  
          @column.createAndAddCard @createUserStoryRecord
              Iteration: @column.getTimeboxRecords()[0].get('_ref')
              PlanEstimate: 20
  
          expect(@getProgressBar().getColor 'background-color').toEqual @colors.red
  
  
      it 'should put a background color behind the progress bar', ->
          @createColumn
              plannedVelocity: 5
          expect(@getProgressBarBackgroundContainer()).not.toBeNull()
  
      it 'should not put a progress bar background color when there is no progress bar', ->
          @createColumn
              plannedVelocity: 0
          expect(@getProgressBarBackgroundContainer()).toBeNull()
  
      it 'should round plan estimate total to two decimal places', ->
          @createColumn
              iterationCount: 5
              plannedVelocity: 20
  
          @column.createAndAddCard @createUserStoryRecord
              Iteration: @column.getTimeboxRecords()[0].get('_ref')
              PlanEstimate: 1.32 * 10 # 13.2000000001
  
          expect(@getProgressBarLabel().getHTML()).toEqual '13.2 of 100'
  
      it 'should round planned velocity to two decimal places', ->
          @createColumn # Total: 13.2000000001
              iterationCount: 10
              plannedVelocity: 1.32
  
          @column.createAndAddCard @createUserStoryRecord
              Iteration: @column.getTimeboxRecords()[0].get('_ref')
              PlanEstimate: 10
  
          expect(@getProgressBarLabel().getHTML()).toEqual '10 of 13.2'
  
      helpers
          createColumn: (options) ->
              Model = Rally.mock.data.ModelFactory.getIterationModel()
              timeboxRecords = []
  
              for i in [1 .. options.iterationCount ? 1]
                  timeboxRecords.push new Model
                      _ref: "/iteration/#{i}"
                      _refObjectName: options.name || 'my iteration'
                      ObjectID: i
                      Name: options.name || 'my iteration'
                      StartDate: options.startDate || new Date()
                      EndDate: options.endDate || new Date()
                      PlannedVelocity: options.plannedVelocity
  
              @column = Ext.create 'Rally.apps.iterationplanningboard.IterationPlanningBoardColumn',
                  types: ['HierarchicalRequirement']
                  renderTo: 'testDiv'
                  attribute: 'Iteration'
                  timeboxRecords: timeboxRecords,
                  currentTimebox: options.currentTimebox || false,
                  context: Ext.create('Rally.app.Context',
                      initialValues:
                          featureToggles: Rally.alm.FeatureToggle
                  )
  
          createUserStoryRecord: (options) ->
              Model = Rally.mock.data.ModelFactory.getUserStoryModel()
              new Model(options)
  
          getProgressBarLabel: -> @column.getEl().down('.progress-bar-label')
  
          getProgressBar: -> @column.getEl().down('.progress-bar')
  
          getProgressBarBackgroundContainer: -> @column.getEl().down('.progress-bar-background')