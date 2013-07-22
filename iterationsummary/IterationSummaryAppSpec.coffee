Ext = window.Ext4 || window.Ext

Ext.require [
  'Rally.apps.iterationsummary.IterationSummaryApp'
]

describe 'Rally.apps.iterationsummary.IterationSummaryApp', ->
  helpers
    getContext: (initialValues) ->
      globalContext = Rally.environment.getContext()

      Ext.create('Rally.app.Context', {
        initialValues:Ext.merge({
          project:globalContext.getProject()
          workspace:globalContext.getWorkspace()
          user:globalContext.getUser()
          subscription:globalContext.getSubscription()
        }, initialValues)
      })

    createApp: (initialValues) ->
      @container = Ext.create('Ext.Container', {
        renderTo:'testDiv'
      })

      app = Ext.create('Rally.apps.iterationsummary.IterationSummaryApp', {
        context: @getContext(initialValues)
      })

      @container.add(app)
      @waitForComponentReady(app)

    stubApp: (config) ->
      @stubPromiseFunction(Rally.apps.iterationsummary.IterationSummaryApp.prototype, 'getScheduleStates',
        (config.scheduleStates || ["Defined", "In-Progress", "Completed", "Accepted"]))
      @stub(Rally.apps.iterationsummary.IterationSummaryApp.prototype, 'getStartDate').returns(config.startDate || new Date())
      @stub(Rally.apps.iterationsummary.IterationSummaryApp.prototype, 'getEndDate').returns(config.endDate || new Date())
      @_stubIterationQuery(config.tzOffset || 0)
      @stub(Rally.util.Timebox, 'getToday').returns(config.today || new Date())

    stubTimeBoxInfo: (orientation) ->
      timeOrientation: orientation
      timeboxLength: 4
      daysRemaining: 0

    _stubIterationQuery: (tzOffset = 0) ->
      @ajax.whenQuerying('iteration').respondWith([{
          _refObjectName:"Iteration 3", Name:"Iteration 3", ObjectID:3,
          StartDate:"2010-07-11T00:00:00.000Z", EndDate:"2010-07-15T23:59:59.000Z"
        }
      ], {
        schema:
          properties:
            EndDate:
              format:
                tzOffset: tzOffset * 60
      })

    prepareNoneAcceptedData: ->
      @ajax.whenQuerying('userstory').respondWith([{
          PlanEstimate:1.0
          ScheduleState:"Backlog"
          AcceptedDate:null
          Summary:
            Defects:
              State:
                Closed: 2
                Open: 2
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        },
        {
          PlanEstimate:2.0
          ScheduleState:"Completed"
          AcceptedDate:null
          Summary:
            Defects:
              State:
                Closed: 0
                Open: 0
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        },
        {
          PlanEstimate:3.0
          ScheduleState:"In-Progress"
          AcceptedDate:null
          Summary:
            Defects:
              State:
                Closed: 0
                Open: 0
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
          },
        {
          PlanEstimate:4.0
          ScheduleState:"In-Progress"
          AcceptedDate:null
          Summary:
            Defects:
              State:
                Closed: 0
                Open: 0
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
          },
        {
          PlanEstimate:5.0
          ScheduleState:"In-Progress"
          AcceptedDate:null
          Summary:
            Defects:
              State:
                Closed: 0
                Open: 0
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
          }
      ])

      @ajax.whenQuerying('defectsuite').respondWith([
        {
          Summary:
            Defects:
              State:
                Closed: 2
                Open: 1
          PlanEstimate:2.0,
          ScheduleState:"In-Progress",
          AcceptedDate:null
        },
        {
          Summary:
            Defects:
              State:
                Closed: 2
                Open: 2
          PlanEstimate:2.0,
          ScheduleState:"In-Progress",
          AcceptedDate:null
        }
      ])

      @ajax.whenQuerying('defect').respondWith([
        {
          PlanEstimate:2.0
          ScheduleState:"In-Progress"
          AcceptedDate:null
          Summary:
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
          },
        {
          PlanEstimate:2.0
          ScheduleState:"In-Progress"
          AcceptedDate:null
          Summary:
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
          }
      ])

      @ajax.whenQuerying('testset').respondWith([
        {
          PlanEstimate:2.0
          ScheduleState:"In-Progress"
          Summary:
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        },
        {
          PlanEstimate:2.0
          ScheduleState:"In-Progress"
          Summary:
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        }
      ])

    prepareFiveDefectsData: ->
      @ajax.whenQuerying('userstory').respondWith([
        {
          Summary:
            Defects:
              State:
                Closed: 2
                Open: 2
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
          PlanEstimate:1.0
          ScheduleState:"Backlog"
          AcceptedDate:null
        },
        {
          Summary:
            Defects:
              State:
                Closed: 1
                Open: 0
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
          PlanEstimate:2.0
          ScheduleState:"Completed"
          AcceptedDate:null
        },
        {
          Summary:
            Defects:
              State:
                Closed: 1
                Open: 0
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
          PlanEstimate:3.0
          ScheduleState:"In-Progress"
          AcceptedDate:null
        }
      ])

      @ajax.whenQuerying('defectsuite').respondWith([
        {
          Summary:
            Defects:
              State:
                Closed: 2
                Open: 1
        },
        {
          Summary:
            Defects:
              State:
                Closed: 2
                Open: 2
        },
        {
          Summary:
            Defects:
              State:
                Closed: 2
                Open: 0
        }
      ])

    prepareNoActiveDefectsData: ->
      @ajax.whenQuerying('userstory').respondWith([
        {
          PlanEstimate:1.0
          ScheduleState:"Backlog"
          AcceptedDate:null,
          Summary:
            Defects:
              State:
                Closed: 0
                Open: 0
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        },
        {
          PlanEstimate:2.0
          ScheduleState:"Completed"
          AcceptedDate:null
          Summary:
            Defects:
              State:
                Closed: 1
                Open: 0
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        },
        {
          PlanEstimate:3.0
          ScheduleState:"In-Progress"
          AcceptedDate:null
          Summary:
            Defects:
              State:
                Closed: 1
                Open: 0
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        }
      ])

      @ajax.whenQuerying('defectsuite').respondWith([
        {
          Summary:
            Defects:
              State:
                Closed: 0
                Open: 0
        },
        {
          Summary:
            Defects:
              State:
                Closed: 2
                Open: 0
        },
        {
          Summary:
            Defects:
              State:
                Closed: 1
                Open: 0
        }
      ])

    prepareSomeAcceptedData: ->
      @ajax.whenQuerying('userstory').respondWith([
        {
          PlanEstimate:1.0
          ScheduleState:"Accepted"
          AcceptedDate:"2011-05-14T16:45:05Z"
          Summary:
            Defects:
              State:
                Closed: 0
                Open: 0
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        },
        {
          PlanEstimate:2.0
          ScheduleState:"Accepted"
          AcceptedDate:"2011-05-13T16:45:05Z"
          Summary:
            Defects:
              State:
                Closed: 0
                Open: 0
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        },
        {
          PlanEstimate:3.0
          ScheduleState:"Completed"
          AcceptedDate:null
          Summary:
            Defects:
              State:
                Closed: 0
                Open: 0
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        },
        {
          PlanEstimate:4.0
          ScheduleState:"Accepted"
          AcceptedDate:"2011-05-11T16:45:05Z"
          Summary:
            Defects:
              State:
                Closed: 0
                Open: 0
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        },
        {
          PlanEstimate:5.0
          ScheduleState:"In-Progress"
          AcceptedDate:null
          Summary:
            Defects:
              State:
                Closed: 0
                Open: 0
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
          }
      ])

      @ajax.whenQuerying('defectsuite').respondWith([
        {
          Summary:
            Defects:
              State:
                Closed: 2
                Open: 1
          PlanEstimate:2.0
          ScheduleState:"In-Progress"
          AcceptedDate:null
        },
        {
          Summary:
            Defects:
              State:
                Closed: 2
                Open: 2
          PlanEstimate:2.0
          ScheduleState:"Accepted"
          AcceptedDate:"2011-05-11T16:45:05Z"
        }
      ])

      @ajax.whenQuerying('defect').respondWith([
        {
          PlanEstimate:2.0
          ScheduleState:"In-Progress"
          AcceptedDate:null
          Summary:
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
          },
        {
          PlanEstimate:2.0
          ScheduleState:"Accepted"
          AcceptedDate:"2011-05-11T16:45:05Z"
          Summary:
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        }
      ])

      @ajax.whenQuerying('testset').respondWith([
        {
          PlanEstimate:2.0
          ScheduleState:"Accepted"
          Summary:
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        },
        {
          PlanEstimate:2.0
          ScheduleState:"In-Progress"
          Summary:
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        }
      ])

    prepareAllAcceptedData: ->
      @ajax.whenQuerying('userstory').respondWith([
        {
          PlanEstimate:1.0
          ScheduleState:"Accepted"
          AcceptedDate:"2011-05-14T16:45:05Z"
          Summary:
            Defects:
              State:
                Closed: 0
                Open: 0
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        },
        {
          PlanEstimate:2.0
          ScheduleState:"Accepted"
          AcceptedDate:"2011-05-13T16:45:05Z"
          Summary:
            Defects:
              State:
                Closed: 0
                Open: 0
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        },
        {
          PlanEstimate:3.0
          ScheduleState:"Accepted"
          AcceptedDate:"2011-05-12T16:45:05Z"
          Summary:
            Defects:
              State:
                Closed: 0
                Open: 0
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        },
        {
          PlanEstimate:4.0
          ScheduleState:"Accepted"
          AcceptedDate:"2011-05-11T16:45:05Z"
          Summary:
            Defects:
              State:
                Closed: 0
                Open: 0
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        },
        {
          PlanEstimate:5.0
          ScheduleState:"Accepted"
          AcceptedDate:"2011-05-10T16:45:05Z"
          Summary:
            Defects:
              State:
                Closed: 0
                Open: 0
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        }
      ])

      @ajax.whenQuerying('defectsuite').respondWith([
        {
          Summary:
            Defects:
              State:
                Closed: 2
                Open: 1
          PlanEstimate:2.0
          ScheduleState:"Accepted"
          AcceptedDate:"2011-05-11T16:45:05Z"
        },
        {
          Summary:
            Defects:
              State:
                Closed: 2
                Open: 1
          PlanEstimate:2.0
          ScheduleState:"Accepted"
          AcceptedDate:"2011-05-11T16:45:05Z"
        }
      ])

      @ajax.whenQuerying('defect').respondWith([
        {
          PlanEstimate:2.0
          ScheduleState:"Accepted"
          AcceptedDate:"2011-05-11T16:45:05Z"
          Summary:
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        },
        {
          PlanEstimate:null
          ScheduleState:"Accepted"
          AcceptedDate:"2011-05-11T16:45:05Z"
          Summary:
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        },
        {
          PlanEstimate:2.0
          ScheduleState:"Accepted"
          AcceptedDate:"2011-05-11T16:45:05Z"
          Summary:
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        }
      ])

      @ajax.whenQuerying('testset').respondWith([
        {
          PlanEstimate:2.0
          ScheduleState:"Accepted"
          Summary:
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        },
        {
          PlanEstimate:null
          ScheduleState:"Accepted"
          Summary:
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        },
        {
          PlanEstimate:2.0
          ScheduleState:"Accepted"
          Summary:
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        }
      ])

    prepareSomeFailingTestsData: ->
      @ajax.whenQuerying('userstory').respondWith([
        {
          Summary:
            Defects:
              State:
                Closed: 0
                Open: 0
            TestCases:
              LastVerdict:
                Pass: 1
                Fail: 1
                "Hello Kitty": 1
        }
      ])

      @ajax.whenQuerying('defectsuite').respondWith()

      @ajax.whenQuerying('defect').respondWith([
        {
          Summary:
            TestCases:
              LastVerdict:
                Pass: 1
                Fail: 1
                "Hello Kitty": 1
        }
      ])

      @ajax.whenQuerying('testset').respondWith([
        {
          Summary:
            TestCases:
              LastVerdict:
                Pass: 1
                Fail: 1
                "Hello Kitty": 1
        }
      ])

    prepareTestSetData: (testSetSummaryVerdicts) ->
      @ajax.whenQuerying('userstory').respondWith()
      @ajax.whenQuerying('defectsuite').respondWith()
      @ajax.whenQuerying('defect').respondWith()

      @ajax.whenQuerying('testset').respondWith([
        {
          Summary:
            TestCases:
              LastVerdict: testSetSummaryVerdicts
        }
      ])

  beforeEach ->
    @_stubIterationQuery()

  afterEach ->
    @container?.destroy()

  it "does not call wsapidatastore if models are unavailable", ->
    @stub(Rally.data.ModelFactory, 'getModels', (options) ->
      results = {}
      switch options.types[0]
        when 'Iteration'
          results.Iteration = Rally.test.mock.data.WsapiModelFactory.getModel('Iteration')
        when 'UserStory'
          results.UserStoRally.test.mock.data.WsapiModelFactoryctory.getModel('UserStory')
        when 'AllowedAttributeValue'
          results.AllowedAttribuRally.test.mock.data.WsapiModelFactorydelFactory.getModel('AllowedAttributeValue')

      options.success.call(options.scope, results)
    )
    displayStatusRowsSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_displayStatusRows')

    @createApp({}).then (app) =>

      expect(displayStatusRowsSpy).not.toHaveBeenCalled()

  it "calls wsapidatastore if models are available", ->
    displayStatusRowsSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_displayStatusRows')

    @createApp({}).then (app) =>

      @waitForCallback(displayStatusRowsSpy)

  it "getPostAcceptedState with no before or after state", ->
    @ajax.whenQueryingAllowedValues('userstory', 'ScheduleState').respondWith ["Defined", "In-Progress", "Completed", "Accepted"]
    @createApp({}).then (app) =>
      app._getPostAcceptedState().always (postAcceptedState) ->
        expect(postAcceptedState).toBeNull()

  it "getPostAcceptedState with only a before state", ->
    @ajax.whenQueryingAllowedValues('userstory', 'ScheduleState').respondWith ["Idea", "Defined", "In-Progress", "Completed", "Accepted"]
    @createApp({}).then (app) =>
      app._getPostAcceptedState().always (postAcceptedState) ->
        expect(postAcceptedState).toBeNull()

  it "getPostAcceptedState with only an after state", ->
    @ajax.whenQueryingAllowedValues('userstory', 'ScheduleState').respondWith ["Defined", "In-Progress", "Completed", "Accepted", "Released"]
    @createApp({}).then (app) =>
      app._getPostAcceptedState().always (postAcceptedState) ->
        expect(postAcceptedState).toBe "Released"

  it "getPostAcceptedState with a before and after state", ->
    @ajax.whenQueryingAllowedValues('userstory', 'ScheduleState').respondWith ["Idea", "Defined", "In-Progress", "Completed", "Accepted", "Really Really Done"]
    @createApp({}).then (app) =>
      app._getPostAcceptedState().always (postAcceptedState) ->
        expect(postAcceptedState).toBe "Really Really Done"

  it "does not aggregate testset and defectsuite data for HS subscriptions", ->

    @prepareFiveDefectsData()

    @stub(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_isHsOrTeamEdition').returns true
    testsSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getTestsConfigObject')
    defectSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getDefectsConfigObject')

    app = Ext.create('Rally.apps.iterationsummary.IterationSummaryApp',
      context: @getContext()
    )
    @waitForComponentReady(app).then ->

      configDefects = defectSpy.firstCall.returnValue
      # only the 2 defects from user story - should exclude the 3 from defect suite
      expect(configDefects.title).toBe "2 Active Defects"
      expect(configDefects.status).toBe "error"
      expect(configDefects.message).toBe app.self.PAST_WITH_DEFECTS

      expect(testsSpy).not.toHaveBeenCalled()

  it "does aggregate testset data for UE or EE subscriptions", ->
    @prepareTestSetData(Pass: 2, Fail: 1, Inconclusive: 1)
    @createApp({}).then (app) =>
      @waitForVisible(
        css: '.x4-component.header.testsPassing'
        text: "50% Tests Passing"
      )

  it "sets timeBoxInfo every time iteraton scope is changed", ->
    @prepareTestSetData(Pass: 2, Fail: 1, Inconclusive: 1)
    timeBoxInfoStub = @stub(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_determineTimeBoxInfo')
    timeBoxInfoStub.returns(@stubTimeBoxInfo('past'))

    @createApp({}).then (app) =>
      @waitForVisible(
        css: '.timeboxStatusRow'
        text: "50% Tests Passing"
      ).then =>
        expect(timeBoxInfoStub.callCount).toBe 1

        timeBoxInfoStub.returns(@stubTimeBoxInfo('future'))
        app.onScopeChange()
        @waitForComponentReady(app).then =>
          @waitForNotVisible(
            css: '.timeboxStatusRow'
            text: "50% Tests Passing"
          ).then =>
            expect(timeBoxInfoStub.callCount).toBe 2


  it "refreshes app on objectUpdate of artifacts", ->
    @createApp({}).then (app) =>
      addStub = @stub(app, 'add')

      messageBus = Rally.environment.getMessageBus()
      for type in ['Defect', 'HierarchicalRequirement', 'DefectSuite', 'TestSet', 'TestCase']
        messageBus.publish(Rally.Message.objectUpdate, @mom.getRecord(type))

      expect(addStub.callCount).toBe 5

  it "does not refresh app on objectUpdate of non-artifacts", ->
    @createApp({}).then (app) =>
      addSpy = @spy(app, 'add')

      Rally.environment.getMessageBus().publish(Rally.Message.objectUpdate, @mom.getRecord('Release'))

      expect(addSpy).not.toHaveBeenCalled()

  it "only fetches iteration schema once", ->
    httpGetSpy = @spy(Rally.env.IoProvider.prototype, 'httpGet')
    @createApp({}).then (app) =>
      expect(httpGetSpy).toHaveBeenCalledOnce()

      app.calculateTimeboxInfo().then ->
        expect(httpGetSpy).toHaveBeenCalledOnce()

  it "only gets scheduleStates once", ->
    scheduleStates = ['Defined', 'In-Progress', 'Completed']
    ajaxRequest = @ajax.whenQueryingAllowedValues('userstory', 'ScheduleState').respondWith scheduleStates
    @createApp({}).then (app) =>
      expect(ajaxRequest).toHaveBeenCalledOnce()

      ajaxRequest = @ajax.whenQueryingAllowedValues('userstory', 'ScheduleState').respondWith ['Defined', 'In-Progress', 'Accepted']
      app.getScheduleStates().then (scheduleStates2) ->
        expect(scheduleStates2).toEqual scheduleStates
        expect(ajaxRequest).not.toHaveBeenCalled()

  it "rounds estimates to two decimal places", ->
    @ajax.whenQuerying('defectsuite').respondWith()
    @ajax.whenQuerying('defect').respondWith()
    @ajax.whenQuerying('testset').respondWith()

    # the PEs in here add up to 14.829999999999998, which is needed for the rounding test above
    @ajax.whenQuerying('userstory').respondWith([
      {
        PlanEstimate:2.23
        ScheduleState:"Completed"
        AcceptedDate:null
        Summary:
          Defects:
            State:
              Closed: 0
              Open: 0
          TestCases:
            LastVerdict:
              Pass: 0
              Fail: 0
      },
      {
        PlanEstimate:3.13
        ScheduleState:"In-Progress"
        AcceptedDate:null
        Summary:
          Defects:
            State:
              Closed: 0
              Open: 0
          TestCases:
            LastVerdict:
              Pass: 0
              Fail: 0
      },
      {
        PlanEstimate:4.43
        ScheduleState:"In-Progress"
        AcceptedDate:null
        Summary:
          Defects:
            State:
              Closed: 0
              Open: 0
          TestCases:
            LastVerdict:
              Pass: 0
              Fail: 0
      },
      {
        PlanEstimate:5.04
        ScheduleState:"In-Progress"
        AcceptedDate:null
        Summary:
          Defects:
            State:
              Closed: 0
              Open: 0
          TestCases:
            LastVerdict:
              Pass: 0
              Fail: 0
      }
    ])

    @stubApp({
      startDate:new Date(2011, 4, 13),
      endDate:new Date(2011, 4, 20, 23, 59, 59),
      today:new Date(2011, 4, 14)
    })

    acceptanceSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getAcceptanceConfigObject')

    @createApp({}).then (app) =>

      summedPlanEstimate = 0
      Ext.Array.forEach(app.results.userstory, (s) ->
        summedPlanEstimate += s.get('PlanEstimate')
      )

      expect(summedPlanEstimate.toString().length).toBeGreaterThan 5

      acceptanceSpy.firstCall.returnValue.always (configAcceptance) ->
        expectedSubtitle = Ext.String.format("(0 of {0} Points)", Math.round(summedPlanEstimate * 100) / 100)
        expect(configAcceptance.subtitle).toBe expectedSubtitle

  describe 'status row', ->

    it "displays no stats for future timebox", ->

      @prepareNoneAcceptedData()

      @stubApp({
        startDate:new Date(2051, 5, 15),
        endDate:new Date(2051, 5, 16, 23, 59, 59)
      })

      acceptanceSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getAcceptanceConfigObject')
      defectSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getDefectsConfigObject')
      testSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getTestsConfigObject')

      @createApp({}).then (app) =>

        acceptanceSpy.firstCall.returnValue.then (configAcceptance) ->
          expect(!!configAcceptance.title).toBeFalsy()
          expect(!!configAcceptance.status).toBeFalsy()
          expect(!!configAcceptance.message).toBeFalsy()

          configDefects = defectSpy.firstCall.returnValue
          expect(!!configDefects.title).toBeFalsy()
          expect(!!configDefects.status).toBeFalsy()
          expect(!!configDefects.message).toBeFalsy()

          configTests = testSpy.firstCall.returnValue
          expect(!!configTests.title).toBeFalsy()
          expect(!!configTests.status).toBeFalsy()
          expect(!!configTests.message).toBeFalsy()

    it "displays no alarming acceptance stats when timebox has just started", ->

      @prepareNoneAcceptedData()

      @stubApp(
        startDate:new Date(2011, 4, 13)
        endDate:new Date(2011, 4, 20, 23, 59, 59)
        today:new Date(2011, 4, 14)
      )

      acceptanceSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getAcceptanceConfigObject')

      @createApp({}).then (app) =>

        acceptanceSpy.firstCall.returnValue.always (configAcceptance) ->
          expect(configAcceptance.title).toBe "0% Accepted"
          expect(configAcceptance.subtitle).toBe "(0 of 27 Points)"
          expect(configAcceptance.status).toBe "pending"
          expect(configAcceptance.message).toBe app.self.CURRENT_WITH_NO_ACCEPTED_WORK

    it "does not display defect stats when no active defects for current timebox", ->

      @prepareNoActiveDefectsData()

      @stubApp(
        startDate:new Date(2011, 4, 13)
        endDate:new Date(2011, 4, 20, 23, 59, 59)
        today:new Date(2011, 4, 14)
      )

      defectSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getDefectsConfigObject')

      @createApp({}).then (app) =>

        configDefects = defectSpy.firstCall.returnValue
        expect(!!configDefects.title).toBeFalsy()
        expect(!!configDefects.status).toBeFalsy()
        expect(!!configDefects.message).toBeFalsy()

    it "displays defect stats for current timebox", ->

      @prepareFiveDefectsData()

      @stubApp(
        startDate:new Date(2011, 4, 13)
        endDate:new Date(2011, 4, 20, 23, 59, 59)
        today:new Date(2011, 4, 14)
      )

      defectSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getDefectsConfigObject')

      @createApp({}).then (app) =>

        configDefects = defectSpy.firstCall.returnValue
        expect(configDefects.title).toBe "5 Active Defects"
        expect(configDefects.status).toBe "warn"
        expect(configDefects.message).toBe app.self.CURRENT_WITH_DEFECTS

    it "displays acceptance warning 5 days into a long timebox", ->

      @prepareNoneAcceptedData()

      @stubApp(
        startDate:new Date(2011, 4, 1)
        endDate:new Date(2011, 4, 28, 23, 59, 59)
        today:new Date(2011, 4, 20)
      )

      acceptanceSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getAcceptanceConfigObject')

      @createApp({}).then (app) =>

        acceptanceSpy.firstCall.returnValue.always (configAcceptance) ->
          expect(configAcceptance.title).toBe "0% Accepted"
          expect(configAcceptance.subtitle).toBe "(0 of 27 Points)"
          expect(configAcceptance.status).toBe "warn"
          expect(configAcceptance.message).toBe app.self.CURRENT_WITH_SOME_UNACCEPTED_WORK

    it "displays acceptance pending 5 days into a long timebox", ->

      @prepareSomeAcceptedData()

      @stubApp(
        startDate:new Date(2011, 4, 1)
        endDate:new Date(2011, 4, 28, 23, 59, 59)
        today:new Date(2011, 4, 20)
      )

      acceptanceSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getAcceptanceConfigObject')

      @createApp({}).then (app) =>

        acceptanceSpy.firstCall.returnValue.always (configAcceptance) ->
          expect(configAcceptance.title).toBe "48% Accepted"
          expect(configAcceptance.subtitle).toBe "(13 of 27 Points)"
          expect(configAcceptance.status).toBe "pending"
          expect(configAcceptance.message).toBe app.self.CURRENT_WITH_SOME_UNACCEPTED_WORK

    it "displays acceptance pending halfway through a short timebox", ->

      @prepareSomeAcceptedData()

      @stubApp(
        startDate:new Date(2011, 4, 2)
        endDate:new Date(2011, 4, 6, 23, 59, 59)
        today:new Date(2011, 4, 5)
      )

      acceptanceSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getAcceptanceConfigObject')

      @createApp({}).then (app) =>

        acceptanceSpy.firstCall.returnValue.always (configAcceptance) ->
          expect(configAcceptance.title).toBe "48% Accepted"
          expect(configAcceptance.subtitle).toBe "(13 of 27 Points)"
          expect(configAcceptance.status).toBe "pending"
          expect(configAcceptance.message).toBe app.self.CURRENT_WITH_SOME_UNACCEPTED_WORK

    it "displays acceptance error when all work not accepted from past timebox", ->

      @prepareSomeAcceptedData()

      @stubApp(
        startDate:new Date(2011, 4, 2)
        endDate:new Date(2011, 4, 20, 23, 59, 59)
        today:new Date(2011, 5, 5)
      )

      acceptanceSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getAcceptanceConfigObject')

      @createApp({}).then (app) =>

        acceptanceSpy.firstCall.returnValue.always (configAcceptance) ->
          expect(configAcceptance.title).toBe "48% Accepted"
          expect(configAcceptance.subtitle).toBe "(13 of 27 Points)"
          expect(configAcceptance.status).toBe "error"
          expect(configAcceptance.message).toBe app.self.PAST_WITH_SOME_UNACCEPTED_WORK

    it "displays defect error when active defects remain from past timebox", ->

      @prepareFiveDefectsData()

      @stubApp(
        startDate:new Date(2011, 4, 13)
        endDate:new Date(2011, 4, 20, 23, 59, 59)
        today:new Date(2011, 5, 14)
      )

      defectSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getDefectsConfigObject')

      @createApp({}).then (app) =>

        configDefects = defectSpy.firstCall.returnValue
        expect(configDefects.title).toBe "5 Active Defects"
        expect(configDefects.status).toBe "error"
        expect(configDefects.message).toBe app.self.PAST_WITH_DEFECTS

    it "does not display defect stats when no active defects for past timebox", ->

      @prepareNoActiveDefectsData()

      @stubApp(
        startDate:new Date(2011, 4, 13)
        endDate:new Date(2011, 4, 20, 23, 59, 59)
        today:new Date(2011, 5, 14)
      )

      defectSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getDefectsConfigObject')

      @createApp({}).then (app) =>

        configDefects = defectSpy.firstCall.returnValue
        expect(!!configDefects.title).toBeFalsy()
        expect(!!configDefects.status).toBeFalsy()
        expect(!!configDefects.message).toBeFalsy()

    it "displays positive acceptance stats when all work accepted for past timebox", ->
      @prepareAllAcceptedData()

      @stubApp(
        startDate:new Date(2011, 4, 2)
        endDate:new Date(2011, 4, 20, 23, 59, 59)
        today:new Date(2011, 5, 5)
      )

      acceptanceSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getAcceptanceConfigObject')

      @createApp({}).then (app) =>

        acceptanceSpy.firstCall.returnValue.always (configAcceptance) ->
          expect(configAcceptance.title).toBe "100% Accepted"
          expect(configAcceptance.subtitle).toBe "(27 of 27 Points)"
          expect(configAcceptance.status).toBe "success"
          expect(configAcceptance.message).toBe ""

    it "displays positive acceptance stats when all work accepted or released for past timebox", ->

      @ajax.whenQuerying('userstory').respondWith([
        {
          PlanEstimate:1.0
          ScheduleState:"Accepted"
          AcceptedDate:"2011-05-14T16:45:05Z"
          Summary:
            Defects:
              State:
                Closed: 0
                Open: 0
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        },
        {
          PlanEstimate:2.0
          ScheduleState:"Accepted"
          AcceptedDate:"2011-05-13T16:45:05Z"
          Summary:
            Defects:
              State:
                Closed: 0
                Open: 0
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        },
        {
          PlanEstimate:3.0
          ScheduleState:"Released"
          AcceptedDate:"2011-05-12T16:45:05Z"
          Summary:
            Defects:
              State:
                Closed: 0
                Open: 0
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        },
        {
          PlanEstimate:4.0
          ScheduleState:"Accepted"
          AcceptedDate:"2011-05-11T16:45:05Z"
          Summary:
            Defects:
              State:
                Closed: 0
                Open: 0
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        },
        {
          PlanEstimate:5.0
          ScheduleState:"Released"
          AcceptedDate:"2011-05-10T16:45:05Z"
          Summary:
            Defects:
              State:
                Closed: 0
                Open: 0
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        }
      ])

      @ajax.whenQuerying('defectsuite').respondWith([
        {
          Summary:
            Defects:
              State:
                Closed: 2
                Open: 1
          PlanEstimate:2.0
          ScheduleState:"Accepted"
          AcceptedDate:"2011-05-11T16:45:05Z"
        },
        {
          Summary:
            Defects:
              State:
                Closed: 2
                Open: 2
          PlanEstimate:2.0
          ScheduleState:"Released"
          AcceptedDate:"2011-05-11T16:45:05Z"
        }
      ])

      @ajax.whenQuerying('defect').respondWith([
        {
          PlanEstimate:2.0
          ScheduleState:"Released"
          AcceptedDate:"2011-05-11T16:45:05Z"
          Summary:
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        },
        {
          PlanEstimate:null
          ScheduleState:"Accepted"
          AcceptedDate:"2011-05-11T16:45:05Z"
          Summary:
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        },
        {
          PlanEstimate:2.0
          ScheduleState:"Accepted"
          AcceptedDate:"2011-05-11T16:45:05Z"
          Summary:
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        }
      ])

      @ajax.whenQuerying('testset').respondWith([
        {
          PlanEstimate:2.0
          ScheduleState:"Accepted"
          Summary:
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        },
        {
          PlanEstimate:null
          ScheduleState:"Accepted"
          Summary:
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        },
        {
          PlanEstimate:2.0
          ScheduleState:"Released"
          Summary:
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        }
      ])

      @stubApp({
        scheduleStates:["Defined", "In-Progress", "Completed", "Accepted", "Released"],
        startDate:new Date(2011, 4, 2),
        endDate:new Date(2011, 4, 20, 23, 59, 59),
        today:new Date(2011, 5, 5)
      })

      acceptanceSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getAcceptanceConfigObject')

      @createApp({}).then (app) =>

        acceptanceSpy.firstCall.returnValue.always (configAcceptance) ->
          expect(configAcceptance.title).toBe "100% Accepted"
          expect(configAcceptance.subtitle).toBe "(27 of 27 Points)"
          expect(configAcceptance.status).toBe "success"
          expect(configAcceptance.message).toBe ""

    it "displays success acceptance stats with work items without estimates but all accepted", ->

      @ajax.whenQuerying('userstory').respondWith([
        {
          PlanEstimate:null
          ScheduleState:"In-Progress"
          AcceptedDate:"2011-05-14T16:45:05Z"
          Summary:
            Defects:
              State:
                Closed: 0
                Open: 0
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        },
        {
          PlanEstimate:null
          ScheduleState:"Accepted"
          AcceptedDate:"2011-05-13T16:45:05Z"
          Summary:
            Defects:
              State:
                Closed: 0
                Open: 0
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        },
        {
          PlanEstimate:3.0
          ScheduleState:"Accepted"
          AcceptedDate:"2011-05-12T16:45:05Z"
          Summary:
            Defects:
              State:
                Closed: 0
                Open: 0
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        },
        {
          PlanEstimate:4.0
          ScheduleState:"Accepted"
          AcceptedDate:"2011-05-11T16:45:05Z"
          Summary:
            Defects:
              State:
                Closed: 0
                Open: 0
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        },
        {
          PlanEstimate:5.0
          ScheduleState:"Accepted"
          AcceptedDate:"2011-05-10T16:45:05Z"
          Summary:
            Defects:
              State:
                Closed: 0
                Open: 0
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        }
      ])

      @ajax.whenQuerying('defectsuite').respondWith([
        {
          Summary:
            Defects:
              State:
                Closed: 2
                Open: 1
          PlanEstimate:null
          ScheduleState:"In-Progress"
          AcceptedDate:"2011-05-11T16:45:05Z"
        },
        {
          Summary:
            Defects:
              State:
                Closed: 2
                Open: 2
          PlanEstimate:2.0
          ScheduleState:"Accepted"
          AcceptedDate:"2011-05-11T16:45:05Z"
        }
      ])

      @ajax.whenQuerying('defect').respondWith([
        {
          PlanEstimate:null
          ScheduleState:"In-Progress"
          AcceptedDate:"2011-05-11T16:45:05Z"
          Summary:
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        },
        {
          PlanEstimate:2.0
          ScheduleState:"Accepted"
          AcceptedDate:"2011-05-11T16:45:05Z"
          Summary:
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        }
      ])

      @ajax.whenQuerying('testset').respondWith([
        {
          PlanEstimate:null
          ScheduleState:"Accepted"
          Summary:
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        },
        {
          PlanEstimate:2.0
          ScheduleState:"Accepted"
          Summary:
            TestCases:
              LastVerdict:
                Pass: 0
                Fail: 0
        }
      ])

      @stubApp(
        startDate:new Date(2011, 4, 2)
        endDate:new Date(2011, 4, 6, 23, 59, 59)
        today:new Date(2011, 4, 5)
      )

      acceptanceSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getAcceptanceConfigObject')

      @createApp({}).then (app) =>

        acceptanceSpy.firstCall.returnValue.always (configAcceptance) ->
          expect(configAcceptance.title).toBe "100% Accepted"
          expect(configAcceptance.subtitle).toBe "(18 of 18 Points)"
          expect(configAcceptance.status).toBe "pending"
          expect(configAcceptance.message).toBe "3 work items have no estimate."

    it "displays gently scolding for past timebox with work accepted late", ->

      @prepareAllAcceptedData()

      @stubApp(
        startDate:new Date(2011, 3, 2)
        endDate:new Date(2011, 3, 20, 23, 59, 59)
        today:new Date(2011, 4, 20)
      )

      acceptanceSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getAcceptanceConfigObject')

      @createApp({}).then (app) =>

        acceptanceSpy.firstCall.returnValue.always (configAcceptance) ->
          expect(configAcceptance.title).toBe "100% Accepted"
          expect(configAcceptance.subtitle).toBe "(27 of 27 Points)"
          expect(configAcceptance.status).toBe "success"
          expect(configAcceptance.message).toBe app.self.PAST_WITH_ACCEPTED_WORK_AFTER_END_DATE

    it "does not display stats when there are no tests", ->

      @ajax.whenQuerying('userstory').respondWith([
        Summary:
          Defects:
            State:
              Closed: 0
              Open: 0
          TestCases:
            LastVerdict:
              Pass: 0
              Fail: 0
      ])

      @ajax.whenQuerying('defectsuite').respondWith([
        Summary:
          Defects:
            State:
              Closed: 0
              Open: 0
          TestCases:
            LastVerdict:
              Pass: 0
              Fail: 0
      ])

      @ajax.whenQuerying('defect').respondWith()

      @ajax.whenQuerying('testset').respondWith([
        Summary:
          TestCases:
            LastVerdict:
              Pass: 0
              Fail: 0
      ])

      @stubApp(
        startDate:new Date(2011, 4, 2)
        endDate:new Date(2011, 4, 20, 23, 59, 59)
        today:new Date(2011, 5, 5)
      )

      testsSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getTestsConfigObject')

      @createApp({}).then (app) =>

        configTests = testsSpy.firstCall.returnValue
        expect(!!configTests.title).toBeFalsy()
        expect(!!configTests.status).toBeFalsy()
        expect(!!configTests.message).toBeFalsy()

    it "displays pending when less than halfway or 5 days", ->

      @prepareSomeFailingTestsData()

      @stubApp(
        startDate:new Date(2011, 4, 6)
        endDate:new Date(2011, 4, 20, 23, 59, 59)
        today:new Date(2011, 4, 8)
      )

      testsSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getTestsConfigObject')

      @createApp({}).then (app) =>

        configTests = testsSpy.firstCall.returnValue
        expect(configTests.title).toBe "33% Tests Passing"
        expect(configTests.subtitle).toBe "(3 of 9)"
        expect(configTests.status).toBe "pending"
        expect(configTests.message).toBe app.self.CURRENT_TESTS_FAILING_MESSAGE

    it "displays warning if all failing tests during current timebox", ->

      @ajax.whenQuerying('userstory').respondWith([
        Summary:
          Defects:
            State:
              Closed: 0
              Open: 0
          TestCases:
            LastVerdict:
              Pass: 0
              Fail: 3
      ])

      @ajax.whenQuerying('defectsuite').respondWith()

      @ajax.whenQuerying('defect').respondWith([
        Summary:
          TestCases:
            LastVerdict:
              Pass: 0
              Fail: 3
      ])

      @ajax.whenQuerying('testset').respondWith([
        Summary:
          TestCases:
            LastVerdict:
              Pass: 0
              Fail: 3
      ])

      @stubApp(
        startDate:new Date(2011, 4, 6)
        endDate:new Date(2011, 4, 20, 23, 59, 59)
        today:new Date(2011, 4, 16)
      )

      testsSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getTestsConfigObject')

      @createApp({}).then (app) =>

        configTests = testsSpy.firstCall.returnValue
        expect(configTests.title).toBe "0% Tests Passing"
        expect(configTests.subtitle).toBe "(0 of 9)"
        expect(configTests.status).toBe "warn"
        expect(configTests.message).toBe app.self.CURRENT_TESTS_FAILING_MESSAGE

    it "displays pending if some failing tests during current timebox", ->

      @prepareSomeFailingTestsData()

      @stubApp(
        startDate:new Date(2011, 4, 6)
        endDate:new Date(2011, 4, 20, 23, 59, 59)
        today:new Date(2011, 4, 16)
      )

      testsSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getTestsConfigObject')

      @createApp({}).then (app) =>

        configTests = testsSpy.firstCall.returnValue
        expect(configTests.title).toBe "33% Tests Passing"
        expect(configTests.subtitle).toBe "(3 of 9)"
        expect(configTests.status).toBe "pending"
        expect(configTests.message).toBe app.self.CURRENT_TESTS_FAILING_MESSAGE

    it "displays success if no failing tests during past, current, past timeboxes", ->

      @ajax.whenQuerying('userstory').respondWith([
        Summary:
          Defects:
            State:
              Closed: 0
              Open: 0
          TestCases:
            LastVerdict:
              Pass: 3
              Fail: 0
      ])

      @ajax.whenQuerying('defectsuite').respondWith()

      @ajax.whenQuerying('defect').respondWith([
        Summary:
          TestCases:
            LastVerdict:
              Pass: 3
              Fail: 0
      ])

      @ajax.whenQuerying('testset').respondWith([
        Summary:
          TestCases:
            LastVerdict:
              Pass: 3
              Fail: 0
      ])

      @stubApp(
        startDate:new Date(2011, 4, 6)
        endDate:new Date(2011, 4, 20, 23, 59, 59)
        today:new Date(2011, 4, 16)
      )

      testsSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getTestsConfigObject')

      @createApp({}).then (app) =>

        configTests = testsSpy.firstCall.returnValue
        expect(configTests.title).toBe "100% Tests Passing"
        expect(configTests.subtitle).toBe "(9 of 9)"
        expect(configTests.status).toBe "success"
        expect(configTests.message).toBe app.self.CURRENT_TESTS_PASSING

    it "displays error if any failing tests during past timeboxes", ->

      @prepareSomeFailingTestsData()

      @stubApp(
        startDate:new Date(2011, 4, 6)
        endDate:new Date(2011, 4, 20, 23, 59, 59)
        today:new Date(2011, 5, 16)
      )

      testsSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getTestsConfigObject')

      @createApp({}).then (app) =>

        configTests = testsSpy.firstCall.returnValue
        expect(configTests.title).toBe "33% Tests Passing"
        expect(configTests.subtitle).toBe "(3 of 9)"
        expect(configTests.status).toBe "error"
        expect(configTests.message).toBe app.self.CURRENT_TESTS_FAILING_MESSAGE
