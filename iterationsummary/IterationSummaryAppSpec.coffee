Ext = window.Ext4 || window.Ext

Ext.require [
  'Rally.apps.iterationsummary.IterationSummaryApp'
]

describe 'Rally.apps.iterationsummary.IterationSummaryApp', ->

  beforeEach ->
    @ajax.whenQuerying('iteration').respondWith([{
        _refObjectName:"Iteration 3", Name:"Iteration 3", ObjectID:3,
        StartDate:"2010-07-11T00:00:00.000Z", EndDate:"2010-07-15T23:59:59.000Z"
      }
    ], {
      schema:
        properties:
          EndDate:
            format:
              tzOffset:0
    })
    # @stubDefer()

  afterEach ->
    @container?.destroy()

  helpers
    _createApp: (initialValues) ->
      @container = Ext.create('Ext.Container', {
        renderTo:'testDiv'
      })

      globalContext = Rally.environment.getContext()
      context = Ext.create('Rally.app.Context', {
        initialValues:Ext.merge({
          project:globalContext.getProject()
          workspace:globalContext.getWorkspace()
          user:globalContext.getUser()
          subscription:globalContext.getSubscription()
        }, initialValues)
      })

      app = Ext.create('Rally.apps.iterationsummary.IterationSummaryApp', {
        context:context
      })

      @container.add(app)
      @waitForComponentReady(app)

    _stubApp: (config) ->
      @stub(Rally.apps.iterationsummary.IterationSummaryApp.prototype, 'getScheduleStates')
        .returns(config.scheduleStates || ["Defined", "In-Progress", "Completed", "Accepted"])
      @stub(Rally.apps.iterationsummary.IterationSummaryApp.prototype, 'getStartDate').returns(config.startDate || new Date())
      @stub(Rally.apps.iterationsummary.IterationSummaryApp.prototype, 'getEndDate').returns(config.endDate || new Date())
      @stub(Rally.apps.iterationsummary.IterationSummaryApp.prototype, 'getTzOffset').returns(config.tzOffset || 0)
      @stub(Rally.util.Timebox, 'getToday').returns(config.today || new Date())

    _prepareNoneAcceptedData: ->
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

    _prepareFiveDefectsData: ->
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

    _prepareNoActiveDefectsData: ->
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

    _prepareSomeAcceptedData: ->
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

    _prepareAllAcceptedData: ->
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

    _prepareSomeFailingTestsData: ->
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

  it "does not call wsapidatastore if models are unavailable", ->
    @stub(Rally.data.ModelFactory, 'getModels', (options) ->
      results = {}
      switch options.types[0]
        when 'Iteration'
          results.Iteration = Rally.test.mock.data.ModelFactory.getModel('Iteration')
        when 'UserStory'
          results.UserStory = Rally.test.mock.data.ModelFactory.getModel('UserStory')

      options.success.call(options.scope, results)
    )
    aggregateQueryResultsSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_aggregateQueryResults')

    @_createApp({}).then (app) =>

      expect(aggregateQueryResultsSpy.callCount).toBe 0

  it "calls wsapidatastore if models are available", ->
    aggregateQueryResultsSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_aggregateQueryResults')

    @_createApp({}).then (app) =>

      @waitForCallback(aggregateQueryResultsSpy, 4)

  it "calculates # of days for past timebox", ->
    @_stubApp({
      startDate:new Date(2011, 4, 22),
      endDate:new Date(2011, 4, 27, 23, 59, 59),
      tzOffset:10
    })
    @_createApp({
      workspace:{
        WorkspaceConfiguration:{
          WorkDays:['monday', 'tuesday', 'thursday', 'friday'].join(',')
        }
      }
    }).then (app) =>

      expect(app.timeboxLength).toBe 4
      expect(app.daysRemaining).toBe 0

  it "calculates # of days for future timebox", ->

    @_stubApp({
      startDate:new Date(2021, 5, 1),
      endDate:new Date(2021, 5, 7, 23, 59, 59),
      tzOffset:-5
    })

    @_createApp({
      workspace:{
        WorkspaceConfiguration:{
          WorkDays:['sunday', 'monday', 'tuesday', 'thursday', 'friday'].join(',')
        }
      }
    }).then (app) =>

      expect(app.timeboxLength).toBe 5
      expect(app.daysRemaining).toBe 0

  it "calculates # of days for current timebox", ->

    @_stubApp({
      startDate:new Date(2011, 5, 10),
      endDate:new Date(2011, 5, 17, 23, 59, 59),
      tzOffset:-5,
      today:new Date(2011, 5, 11, 22)
    })

    @_createApp({
      workspace:{
        WorkspaceConfiguration:{
          WorkDays:['sunday', 'monday', 'tuesday', 'wednesday',
            'thursday', 'friday', 'saturday'].join(',')
        }
      }
    }).then (app) =>

      expect(app.timeboxLength).toBe 8
      expect(app.daysRemaining).toBe 7

  it "calculates # of days remaining when start date is today", ->

    @_stubApp({
      startDate:new Date(2011, 5, 10),
      endDate:new Date(2011, 5, 17, 23, 59, 59),
      tzOffset:-5,
      today:new Date(2011, 5, 10, 22)
    })

    @_createApp({
      workspace:{
        WorkspaceConfiguration:{
          WorkDays:['sunday', 'monday', 'tuesday', 'wednesday',
            'thursday', 'friday', 'saturday'].join(',')
        }
      }
    }).then (app) =>

      expect(app.timeboxLength).toBe 8
      expect(app.daysRemaining).toBe 8

  it "calculates # of days remaining when end date is today", ->

    @_stubApp({
      startDate:new Date(2011, 5, 10),
      endDate:new Date(2011, 5, 17, 23, 59, 59),
      tzOffset:-5,
      today:new Date(2011, 5, 17, 17, 59)
    })

    @_createApp({
      workspace:{
        WorkspaceConfiguration:{
          WorkDays:['sunday', 'monday', 'tuesday', 'wednesday',
            'thursday', 'friday', 'saturday'].join(',')
        }
      }
    }).then (app) =>

      expect(app.timeboxLength).toBe 8
      expect(app.daysRemaining).toBe 1

  it "+10 timezone offset", ->

    @_stubApp({
      startDate:new Date(2011, 5, 15),
      endDate:new Date(2011, 5, 20, 23, 59, 59),
      tzOffset:10,
      today:new Date(2011, 5, 18, 9, 25)
    })

    @_createApp({
      workspace:{
        WorkspaceConfiguration:{
          WorkDays:['sunday', 'monday', 'tuesday', 'wednesday',
            'thursday', 'friday', 'saturday'].join(',')
        }
      }
    }).then (app) =>

      expect(app.timeboxLength).toBe 6
      expect(app.daysRemaining).toBe 3

  it "-12 timezone offset", ->

    @_stubApp({
      startDate:new Date(2011, 5, 15),
      endDate:new Date(2011, 5, 20, 23, 59, 59),
      tzOffset:-12,
      today:new Date(2011, 5, 17, 5, 25)
    })

    @_createApp({
      workspace:{
        WorkspaceConfiguration:{
          WorkDays:['sunday', 'monday', 'tuesday', 'wednesday',
            'thursday', 'friday', 'saturday'].join(',')
        }
      }
    }).then (app) =>

      expect(app.timeboxLength).toBe 6
      expect(app.daysRemaining).toBe 4

  it "-12 timezone offset end of day", ->

    @_stubApp({
      startDate:new Date(2011, 5, 15),
      endDate:new Date(2011, 5, 20, 23, 59, 59),
      tzOffset:-12,
      today:new Date(2011, 5, 17, 23, 59, 59, 999)
    })

    @_createApp({
      workspace:{
        WorkspaceConfiguration:{
          WorkDays:['sunday', 'monday', 'tuesday', 'wednesday',
            'thursday', 'friday', 'saturday'].join(',')
        }
      }
    }).then (app) =>

      expect(app.timeboxLength).toBe 6
      expect(app.daysRemaining).toBe 4

  it "getPostAcceptedState with no before or after state", ->

    @_stubApp({
      scheduleStates:["Defined", "In-Progress", "Completed", "Accepted"]
    })

    @_createApp({}).then (app) =>

      expect(app._getPostAcceptedState()).toBeNull()

  it "getPostAcceptedState with only a before state", ->

    @_stubApp({
      scheduleStates:["Idea", "Defined", "In-Progress", "Completed", "Accepted"]
    })

    @_createApp({}).then (app) =>

      expect(app._getPostAcceptedState()).toBeNull()

  it "getPostAcceptedState with only an after state", ->

    @_stubApp({
      scheduleStates:["Defined", "In-Progress", "Completed", "Accepted", "Released"]
    })

    @_createApp({}).then (app) =>

      expect(app._getPostAcceptedState()).toBe "Released"

  it "getPostAcceptedState with a before and after state", ->

    @_stubApp({
      scheduleStates:["Idea", "Defined", "In-Progress", "Completed", "Accepted", "Really Really Done"]
    })

    @_createApp({}).then (app) =>

      expect(app._getPostAcceptedState()).toBe "Really Really Done"

  it "does not aggregate testset and defectsuite data for HS subscriptions", ->

    @_prepareFiveDefectsData()

    @_stubApp(
      startDate:new Date(2011, 4, 6)
      endDate:new Date(2011, 4, 20, 23, 59, 59)
      today:new Date(2011, 5, 16)
    )

    @stub(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_isHsOrTeamEdition').returns true
    testsSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getTestsConfigObject')
    defectSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getDefectsConfigObject')

    @_createApp({}).then (app) =>

      configDefects = defectSpy.getCall(0).returnValue
      # only the 2 defects from user story - should exclude the 3 from defect suite
      expect(configDefects.title).toBe "2 Active Defects"
      expect(configDefects.status).toBe "error"
      expect(configDefects.message).toBe app.self.PAST_WITH_DEFECTS

      expect(testsSpy.called).toBeFalsy()

  it "refreshes app on objectUpdate of artifacts", ->
    @_createApp({}).then (app) =>
      addContentStub = @stub(app, 'addContent')

      messageBus = Rally.environment.getMessageBus()
      for type in ['Defect', 'HierarchicalRequirement', 'DefectSuite', 'TestSet', 'TestCase']
        messageBus.publish(Rally.Message.objectUpdate, Rally.test.mock.ModelObjectMother.getRecord(type))

      expect(addContentStub.callCount).toBe 5

  it "does not refresh app on objectUpdate of non-artifacts", ->
    @_createApp({}).then (app) =>
      addContentSpy = @spy(app, 'addContent')

      Rally.environment.getMessageBus().publish(Rally.Message.objectUpdate, Rally.test.mock.ModelObjectMother.getRecord('Release'))

      expect(addContentSpy.callCount).toBe 0

  it "only gets tzOffset and scheduleStates once", ->
    httpGetSpy = @spy(Rally.env.IoProvider.prototype, 'httpGet')
    @_createApp({}).then (app) =>

      addContentSpy = @spy(app, 'addContent')
      componentReadyListenter = @stub()

      expect(httpGetSpy.callCount).toBe 1

      modelsSpy = @spy(Rally.data.ModelFactory, 'getModels')
      modelSpy = @spy(Rally.data.ModelFactory, 'getModel')

      messageBus = Rally.environment.getMessageBus()
      messageBus.subscribe(Rally.BrowserTest.getComponentReadyMessageName(app), componentReadyListenter)
      messageBus.publish(Rally.Message.objectUpdate, Rally.test.mock.ModelObjectMother.getRecord('HierarchicalRequirement'))
      @waitForCallback(componentReadyListenter).then =>

        expect(httpGetSpy.callCount).toBe 1
        expect(addContentSpy.callCount).toBe 1

        # 8 because there are four artifact types getting loaded, and each
        # one calls getModel twice, if more than 8, then the getModel call
        # to get schedule states happened again, meaning the test failed
        expect(modelsSpy).toHaveBeenCalledOnce()
        expect(modelSpy).not.toHaveBeenCalled()

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

    @_stubApp({
      startDate:new Date(2011, 4, 13),
      endDate:new Date(2011, 4, 20, 23, 59, 59),
      today:new Date(2011, 4, 14)
    })

    acceptanceSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getAcceptanceConfigObject')

    @_createApp({}).then (app) =>

      summedPlanEstimate = 0
      Ext.Array.forEach(app.results.userstory, (s) ->
        summedPlanEstimate += s.get('PlanEstimate')
      )

      expect(summedPlanEstimate.toString().length).toBeGreaterThan 5

      configAcceptance = acceptanceSpy.getCall(0).returnValue
      expectedSubtitle = Ext.String.format("(0 of {0} Points)", Math.round(summedPlanEstimate * 100) / 100)
      expect(configAcceptance.subtitle).toBe expectedSubtitle

  describe 'status row', ->

    it "displays no stats for future timebox", ->

      @_prepareNoneAcceptedData()

      @_stubApp({
        startDate:new Date(2051, 5, 15),
        endDate:new Date(2051, 5, 16, 23, 59, 59)
      })

      acceptanceSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getAcceptanceConfigObject')
      defectSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getDefectsConfigObject')
      testSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getTestsConfigObject')

      @_createApp({}).then (app) =>

        configAcceptance = acceptanceSpy.getCall(0).returnValue
        expect(!!configAcceptance.title).toBeFalsy()
        expect(!!configAcceptance.status).toBeFalsy()
        expect(!!configAcceptance.message).toBeFalsy()

        configDefects = defectSpy.getCall(0).returnValue
        expect(!!configDefects.title).toBeFalsy()
        expect(!!configDefects.status).toBeFalsy()
        expect(!!configDefects.message).toBeFalsy()

        configTests = testSpy.getCall(0).returnValue
        expect(!!configTests.title).toBeFalsy()
        expect(!!configTests.status).toBeFalsy()
        expect(!!configTests.message).toBeFalsy()

    it "displays no alarming acceptance stats when timebox has just started", ->

      @_prepareNoneAcceptedData()

      @_stubApp(
        startDate:new Date(2011, 4, 13)
        endDate:new Date(2011, 4, 20, 23, 59, 59)
        today:new Date(2011, 4, 14)
      )

      acceptanceSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getAcceptanceConfigObject')

      @_createApp({}).then (app) =>

        configAcceptance = acceptanceSpy.getCall(0).returnValue
        expect(configAcceptance.title).toBe "0% Accepted"
        expect(configAcceptance.subtitle).toBe "(0 of 27 Points)"
        expect(configAcceptance.status).toBe "pending"
        expect(configAcceptance.message).toBe app.self.CURRENT_WITH_NO_ACCEPTED_WORK

    it "does not display defect stats when no active defects for current timebox", ->

      @_prepareNoActiveDefectsData()

      @_stubApp(
        startDate:new Date(2011, 4, 13)
        endDate:new Date(2011, 4, 20, 23, 59, 59)
        today:new Date(2011, 4, 14)
      )

      defectSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getDefectsConfigObject')

      @_createApp({}).then (app) =>

        configDefects = defectSpy.getCall(0).returnValue
        expect(!!configDefects.title).toBeFalsy()
        expect(!!configDefects.status).toBeFalsy()
        expect(!!configDefects.message).toBeFalsy()

    it "displays defect stats for current timebox", ->

      @_prepareFiveDefectsData()

      @_stubApp(
        startDate:new Date(2011, 4, 13)
        endDate:new Date(2011, 4, 20, 23, 59, 59)
        today:new Date(2011, 4, 14)
      )

      defectSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getDefectsConfigObject')

      @_createApp({}).then (app) =>

        configDefects = defectSpy.getCall(0).returnValue
        expect(configDefects.title).toBe "5 Active Defects"
        expect(configDefects.status).toBe "warn"
        expect(configDefects.message).toBe app.self.CURRENT_WITH_DEFECTS

    it "displays acceptance warning 5 days into a long timebox", ->

      @_prepareNoneAcceptedData()

      @_stubApp(
        startDate:new Date(2011, 4, 1)
        endDate:new Date(2011, 4, 28, 23, 59, 59)
        today:new Date(2011, 4, 20)
      )

      acceptanceSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getAcceptanceConfigObject')

      @_createApp({}).then (app) =>

        configAcceptance = acceptanceSpy.getCall(0).returnValue
        expect(configAcceptance.title).toBe "0% Accepted"
        expect(configAcceptance.subtitle).toBe "(0 of 27 Points)"
        expect(configAcceptance.status).toBe "warn"
        expect(configAcceptance.message).toBe app.self.CURRENT_WITH_SOME_UNACCEPTED_WORK

    it "displays acceptance pending 5 days into a long timebox", ->

      @_prepareSomeAcceptedData()

      @_stubApp(
        startDate:new Date(2011, 4, 1)
        endDate:new Date(2011, 4, 28, 23, 59, 59)
        today:new Date(2011, 4, 20)
      )

      acceptanceSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getAcceptanceConfigObject')

      @_createApp({}).then (app) =>

        configAcceptance = acceptanceSpy.getCall(0).returnValue
        expect(configAcceptance.title).toBe "48% Accepted"
        expect(configAcceptance.subtitle).toBe "(13 of 27 Points)"
        expect(configAcceptance.status).toBe "pending"
        expect(configAcceptance.message).toBe app.self.CURRENT_WITH_SOME_UNACCEPTED_WORK

    it "displays acceptance pending halfway through a short timebox", ->

      @_prepareSomeAcceptedData()

      @_stubApp(
        startDate:new Date(2011, 4, 2)
        endDate:new Date(2011, 4, 6, 23, 59, 59)
        today:new Date(2011, 4, 5)
      )

      acceptanceSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getAcceptanceConfigObject')

      @_createApp({}).then (app) =>

        configAcceptance = acceptanceSpy.getCall(0).returnValue
        expect(configAcceptance.title).toBe "48% Accepted"
        expect(configAcceptance.subtitle).toBe "(13 of 27 Points)"
        expect(configAcceptance.status).toBe "pending"
        expect(configAcceptance.message).toBe app.self.CURRENT_WITH_SOME_UNACCEPTED_WORK

    it "displays acceptance error when all work not accepted from past timebox", ->

      @_prepareSomeAcceptedData()

      @_stubApp(
        startDate:new Date(2011, 4, 2)
        endDate:new Date(2011, 4, 20, 23, 59, 59)
        today:new Date(2011, 5, 5)
      )

      acceptanceSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getAcceptanceConfigObject')

      @_createApp({}).then (app) =>

        configAcceptance = acceptanceSpy.getCall(0).returnValue
        expect(configAcceptance.title).toBe "48% Accepted"
        expect(configAcceptance.subtitle).toBe "(13 of 27 Points)"
        expect(configAcceptance.status).toBe "error"
        expect(configAcceptance.message).toBe app.self.PAST_WITH_SOME_UNACCEPTED_WORK

    it "displays defect error when active defects remain from past timebox", ->

      @_prepareFiveDefectsData()

      @_stubApp(
        startDate:new Date(2011, 4, 13)
        endDate:new Date(2011, 4, 20, 23, 59, 59)
        today:new Date(2011, 5, 14)
      )

      defectSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getDefectsConfigObject')

      @_createApp({}).then (app) =>

        configDefects = defectSpy.getCall(0).returnValue
        expect(configDefects.title).toBe "5 Active Defects"
        expect(configDefects.status).toBe "error"
        expect(configDefects.message).toBe app.self.PAST_WITH_DEFECTS

    it "does not display defect stats when no active defects for past timebox", ->

      @_prepareNoActiveDefectsData()

      @_stubApp(
        startDate:new Date(2011, 4, 13)
        endDate:new Date(2011, 4, 20, 23, 59, 59)
        today:new Date(2011, 5, 14)
      )

      defectSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getDefectsConfigObject')

      @_createApp({}).then (app) =>

        configDefects = defectSpy.getCall(0).returnValue
        expect(!!configDefects.title).toBeFalsy()
        expect(!!configDefects.status).toBeFalsy()
        expect(!!configDefects.message).toBeFalsy()

    it "displays positive acceptance stats when all work accepted for past timebox", ->
      @_prepareAllAcceptedData()

      @_stubApp(
        startDate:new Date(2011, 4, 2)
        endDate:new Date(2011, 4, 20, 23, 59, 59)
        today:new Date(2011, 5, 5)
      )

      acceptanceSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getAcceptanceConfigObject')

      @_createApp({}).then (app) =>

        configAcceptance = acceptanceSpy.getCall(0).returnValue
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

      @_stubApp({
        scheduleStates:["Defined", "In-Progress", "Completed", "Accepted", "Released"],
        startDate:new Date(2011, 4, 2),
        endDate:new Date(2011, 4, 20, 23, 59, 59),
        today:new Date(2011, 5, 5)
      })

      acceptanceSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getAcceptanceConfigObject')

      @_createApp({}).then (app) =>

        configAcceptance = acceptanceSpy.getCall(0).returnValue
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

      @_stubApp(
        startDate:new Date(2011, 4, 2)
        endDate:new Date(2011, 4, 6, 23, 59, 59)
        today:new Date(2011, 4, 5)
      )

      acceptanceSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getAcceptanceConfigObject')

      @_createApp({}).then (app) =>

        configAcceptance = acceptanceSpy.getCall(0).returnValue
        expect(configAcceptance.title).toBe "100% Accepted"
        expect(configAcceptance.subtitle).toBe "(18 of 18 Points)"
        expect(configAcceptance.status).toBe "pending"
        expect(configAcceptance.message).toBe "3 work items have no estimate."

    it "displays gently scolding for past timebox with work accepted late", ->

      @_prepareAllAcceptedData()

      @_stubApp(
        startDate:new Date(2011, 3, 2)
        endDate:new Date(2011, 3, 20, 23, 59, 59)
        today:new Date(2011, 4, 20)
      )

      acceptanceSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getAcceptanceConfigObject')

      @_createApp({}).then (app) =>

        configAcceptance = acceptanceSpy.getCall(0).returnValue
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

      @_stubApp(
        startDate:new Date(2011, 4, 2)
        endDate:new Date(2011, 4, 20, 23, 59, 59)
        today:new Date(2011, 5, 5)
      )

      testsSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getTestsConfigObject')

      @_createApp({}).then (app) =>

        configTests = testsSpy.getCall(0).returnValue
        expect(!!configTests.title).toBeFalsy()
        expect(!!configTests.status).toBeFalsy()
        expect(!!configTests.message).toBeFalsy()

    it "displays pending when less than halfway or 5 days", ->

      @_prepareSomeFailingTestsData()

      @_stubApp(
        startDate:new Date(2011, 4, 6)
        endDate:new Date(2011, 4, 20, 23, 59, 59)
        today:new Date(2011, 4, 8)
      )

      testsSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getTestsConfigObject')

      @_createApp({}).then (app) =>

        configTests = testsSpy.getCall(0).returnValue
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

      @_stubApp(
        startDate:new Date(2011, 4, 6)
        endDate:new Date(2011, 4, 20, 23, 59, 59)
        today:new Date(2011, 4, 16)
      )

      testsSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getTestsConfigObject')

      @_createApp({}).then (app) =>

        configTests = testsSpy.getCall(0).returnValue
        expect(configTests.title).toBe "0% Tests Passing"
        expect(configTests.subtitle).toBe "(0 of 9)"
        expect(configTests.status).toBe "warn"
        expect(configTests.message).toBe app.self.CURRENT_TESTS_FAILING_MESSAGE

    it "displays pending if some failing tests during current timebox", ->

      @_prepareSomeFailingTestsData()

      @_stubApp(
        startDate:new Date(2011, 4, 6)
        endDate:new Date(2011, 4, 20, 23, 59, 59)
        today:new Date(2011, 4, 16)
      )

      testsSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getTestsConfigObject')

      @_createApp({}).then (app) =>

        configTests = testsSpy.getCall(0).returnValue
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

      @_stubApp(
        startDate:new Date(2011, 4, 6)
        endDate:new Date(2011, 4, 20, 23, 59, 59)
        today:new Date(2011, 4, 16)
      )

      testsSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getTestsConfigObject')

      @_createApp({}).then (app) =>

        configTests = testsSpy.getCall(0).returnValue
        expect(configTests.title).toBe "100% Tests Passing"
        expect(configTests.subtitle).toBe "(9 of 9)"
        expect(configTests.status).toBe "success"
        expect(configTests.message).toBe app.self.CURRENT_TESTS_PASSING

    it "displays error if any failing tests during past timeboxes", ->

      @_prepareSomeFailingTestsData()

      @_stubApp(
        startDate:new Date(2011, 4, 6)
        endDate:new Date(2011, 4, 20, 23, 59, 59)
        today:new Date(2011, 5, 16)
      )

      testsSpy = @spy(Rally.apps.iterationsummary.IterationSummaryApp.prototype, '_getTestsConfigObject')

      @_createApp({}).then (app) =>

        configTests = testsSpy.getCall(0).returnValue
        expect(configTests.title).toBe "33% Tests Passing"
        expect(configTests.subtitle).toBe "(3 of 9)"
        expect(configTests.status).toBe "error"
        expect(configTests.message).toBe app.self.CURRENT_TESTS_FAILING_MESSAGE
