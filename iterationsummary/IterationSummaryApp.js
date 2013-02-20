(function() {
    var Ext = window.Ext4 || window.Ext;

    /**
     * Iteration Summary App
     * This app helps you understand how an iteration is going. Based on the status of work, defects, and test cases,
     * you'll see colored indicators that help your team address problems as they happen.
     */
    Ext.define('Rally.apps.iterationsummary.IterationSummaryApp', {
        extend: 'Rally.app.TimeboxScopedApp',
        requires: [
            'Ext.XTemplate',
            'Rally.util.DateTime',
            'Rally.data.ModelFactory',
            'Rally.nav.Manager',
            'Rally.data.WsapiDataStore',
            'Rally.util.Timebox'
        ],
        appName: 'Iteration Summary',
        cls: 'iteration-summary-app',
        scopeType: 'iteration',

        clientMetrics: [
            {
                method: '_onEditLinkClick',
                defaultUserAction: 'iteration summary app - edit iteration link clicked'
            }
        ],

        statics: {
            PAST_WITH_SOME_UNACCEPTED_WORK: "Try to accept work well before the end of the Iteration.",
            PAST_WITH_ACCEPTED_WORK_AFTER_END_DATE: "Some work accepted after the end of the Iteration.",
            CURRENT_WITH_SOME_UNACCEPTED_WORK: "Try to accept work well before the end of the Iteration.",
            CURRENT_WITH_NO_ACCEPTED_WORK: "You still have time, but try to accept your first story today or tomorrow.",
            PAST_WITH_DEFECTS: "Defects were not closed before the end of the Iteration.",
            CURRENT_WITH_DEFECTS: "We recommend addressing defects before considering a story \"done\".",
            CURRENT_TESTS_FAILING_TITLE: "{PERCENT}% Tests Passing",
            CURRENT_TESTS_FAILING_MESSAGE: "All tests should be passing before the iteration ends.",
            CURRENT_TESTS_PASSING: "All Tests Passing.",
            WORK_NOT_ESTIMATED: " work items have no estimate.",
            DEFINED_STATE: "Defined"
        },

        initComponent: function() {
            this.callParent(arguments);
            this.subscribe(this, Rally.Message.objectDestroy, this._refreshApp, this);
            this.subscribe(this, Rally.Message.objectCreate, this._refreshApp, this);
            this.subscribe(this, Rally.Message.objectUpdate, this._refreshApp, this);
        },

        addContent: function(scope) {
            if (!Ext.isDefined(this.getTzOffset())) {
                Rally.environment.getIoProvider().httpGet({
                    url: Rally.environment.getServer().getWsapiUrl() + '/iteration.js?includeSchema=true&pagesize=1',
                    success: function(results) {
                        if (results.Schema.properties.EndDate.format.tzOffset !== undefined) {
                            this._tzOffset = results.Schema.properties.EndDate.format.tzOffset / 60;
                        } else {
                            this._tzOffset = 0;
                        }
                        this._asyncStepComplete();
                    },
                    scope: this
                });
            }

            if (!Ext.isDefined(this.getScheduleStates())) {
                Rally.data.ModelFactory.getModel({
                    type: 'UserStory',
                    context: this.getContext().getDataContext(),
                    success: function(model) {
                        this._scheduleStates = Ext.Array.pluck(model.getField('ScheduleState').allowedValues, 'StringValue');
                        this._asyncStepComplete();
                    },
                    scope: this
                });
            }

            this._asyncStepComplete();
        },

        _refreshApp: function(record) {
            var types = ['defect', 'hierarchicalrequirement', 'testset', 'defectsuite', 'testcase'];

            if (Ext.Array.contains(types, record.get('_type').toLowerCase())) {
                this.addContent();
            }
        },

        onScopeChange: function(scope) {
            this._buildFromIteration();
        },

        _asyncStepComplete: function() {
            if (this.getScheduleStates() && Ext.isDefined(this.getTzOffset())) {
                this._buildFromIteration();
            }
        },

        _isHsOrTeamEdition: function() {
            return Rally.environment.getContext().getSubscription().isAnyOfTheseTypes(['HS', 'Express_Edition']);
        },

        getIteration: function() {
            return this.getContext().getTimeboxScope().getRecord();
        },

        getStartDate: function() {
            return this.getIteration().get('StartDate');
        },

        getEndDate: function() {
            return this.getIteration().get('EndDate');
        },

        getTzOffset: function() {
            return this._tzOffset;
        },

        getScheduleStates: function() {
            return this._scheduleStates;
        },

        _buildFromIteration: function() {
            var iteration = this.getIteration();

            this._calculateTimeInfo();

            if (this.down('#dataContainer')) {
                this.down('#dataContainer').destroy();
            }

            this.add({
                xtype: 'container',
                itemId: 'dataContainer',
                cls: 'message',
                defaults: {
                    xtype: 'component'
                },
                items: [
                    {
                        html: this._buildDaysRemainingMessage()
                    },
                    {
                        cls: 'dates',
                        html: Rally.util.DateTime.formatWithDefault(this.getStartDate(), this.getContext()) + ' - ' +
                                Rally.util.DateTime.formatWithDefault(this.getEndDate(), this.getContext())
                    },
                    {
                        cls: 'state',
                        html: iteration.get('State')
                    },
                    {
                        xtype: 'container',
                        itemId: 'stats'
                    },
                    {
                        xtype: 'container',
                        cls: 'edit',
                        renderTpl: new Ext.XTemplate('<a class="editLink" href="#">Edit iteration...</a>'),
                        renderSelectors: { editLink: '.editLink' },
                        listeners: {
                            editLink: {
                                click: this._onEditLinkClick,
                                stopEvent: true,
                                scope: this
                            }
                        }
                    }
                ]
            });

            this._getStatusRowData();
        },

        _onEditLinkClick: function() {
            Rally.nav.Manager.edit(this.getIteration().get('_ref'));
        },

        _buildDaysRemainingMessage: function() {
            var message = '';

            if (this.daysRemaining > 0) {
                var remainingText = this.daysRemaining === 1 ? ' Day Remaining' : ' Days Remaining';
                message = '<span class="daysRemaining">' + this.daysRemaining + remainingText + '</span> in a ';
            }

            message += this.timeboxLength + ' day Iteration';
            return message;
        },

        _calculateTimeInfo: function() {
            var timeboxCounts = Rally.util.Timebox.getCounts(this.getStartDate(), this.getEndDate(),
                    this.getContext().getWorkspace().WorkspaceConfiguration.WorkDays, this.getTzOffset());

            this.timeOrientation = Rally.util.Timebox.getOrientation(this.getStartDate(), this.getEndDate(), this.getTzOffset());
            this.timeboxLength = timeboxCounts.workdays;
            this.daysRemaining = timeboxCounts.remaining;
        },

        _aggregateQueryResults: function(store, data) {
            this.results[store.model.prettyTypeName] = data;
            if (--this._outstandingQueries === 0) {
                this._displayStatusRows();
            }
        },

        _checkIfModelExists: function(modelName, callback, scope) {
            Rally.data.ModelFactory.getModel({
                type: modelName,
                success: function(model) {
                    if (model) {
                        callback.call(scope);
                    }
                },
                scope: scope
            });
        },

        _getStatusRowData: function() {
            this.results = {};
            var queryObjects = {
                hierarchicalrequirement: 'Defects,ClosedDate,State,TestCases,LastVerdict,PlanEstimate,AcceptedDate,ScheduleState',
                defect: 'TestCases,LastVerdict,PlanEstimate,AcceptedDate,ScheduleState'
            };

            if (!this._isHsOrTeamEdition()) {
                Ext.apply(queryObjects, {
                    defectsuite: 'Defects,ClosedDate,State,PlanEstimate,AcceptedDate,ScheduleState',
                    testset: 'TestCases,LastVerdict,PlanEstimate,AcceptedDate,ScheduleState'
                });
            }

            this._outstandingQueries = Ext.Object.getSize(queryObjects);
            Ext.Object.each(queryObjects, function(key, value) {
                this._checkIfModelExists(key, function() {
                    Ext.create('Rally.data.WsapiDataStore', {
                        model: key,
                        fetch: value,
                        context: this.getContext().getDataContext(),
                        filters: [this.getContext().getTimeboxScope().getQueryFilter()],
                        limit: Infinity,
                        autoLoad: true,
                        listeners: {
                            load: this._aggregateQueryResults,
                            scope: this
                        }
                    });
                }, this);
            }, this);
        },

        _getPostAcceptedState: function() {
            if (this.getScheduleStates().length <= 4) {
                return null;
            } else if (this.getScheduleStates().length === 5) {
                return this.getScheduleStates()[0] === this.self.DEFINED_STATE ? this.getScheduleStates()[4] : null;
            } else {
                return this.getScheduleStates()[5];
            }
        },

        //only show statuses if we are 1/2 through the timebox or 5 days into a timebox
        _showStatuses: function() {
            return ((this.timeboxLength - this.daysRemaining) >= 5 || (this.timeboxLength - this.daysRemaining) > this.daysRemaining);
        },

        _aggregateAcceptance: function(items, postAcceptedState) {
            var acceptanceData = {
                totalPlanEstimate: 0,
                totalAcceptedPoints: 0,
                totalItems: 0,
                totalAcceptedItems: 0,
                acceptedLate: false,
                workNotEstimated: 0};

            Ext.each(items, function(item) {
                acceptanceData.totalItems++;
                if (item.get('PlanEstimate')) {
                    acceptanceData.totalPlanEstimate += item.get('PlanEstimate');
                }
                if (item.get('ScheduleState') === "Accepted" ||
                        (postAcceptedState !== null && item.get('ScheduleState') === postAcceptedState)) {
                    acceptanceData.totalAcceptedPoints += item.get('PlanEstimate');
                    acceptanceData.totalAcceptedItems++;

                    if (item.get('AcceptedDate') && item.get('AcceptedDate') > this.getEndDate()) {
                        acceptanceData.acceptedLate = true;
                    }
                } else if (!item.get('PlanEstimate')) {
                    acceptanceData.workNotEstimated++;
                }
            }, this);

            return acceptanceData;
        },

        _getAcceptanceConfigObject: function() {
            var postAcceptedState = this._getPostAcceptedState();
            var totalPlanEstimate = 0;
            var totalAcceptedPoints = 0;
            var totalItems = 0;
            var totalAcceptedItems = 0;
            var acceptedLate = false;
            var workNotEstimated = 0;

            Ext.Object.each(this.results, function(key, item) {
                var itemAcceptanceData = this._aggregateAcceptance(item, postAcceptedState);
                totalPlanEstimate += itemAcceptanceData.totalPlanEstimate;
                totalAcceptedPoints += itemAcceptanceData.totalAcceptedPoints;
                totalItems += itemAcceptanceData.totalItems;
                totalAcceptedItems += itemAcceptanceData.totalAcceptedItems;
                if (!acceptedLate) {
                    acceptedLate = itemAcceptanceData.acceptedLate;
                }
                workNotEstimated += itemAcceptanceData.workNotEstimated;
            }, this);

            //Calculate the acceptance percentage.
            // ||1 - Handle NaN resulting from divide by 0
            var percentAccepted = Math.floor((totalAcceptedPoints / (totalPlanEstimate || 1)) * 100);
            var config = {};

            if (this.timeOrientation !== "future") {

                // days remaining   : percent accepted      : status
                // ----------------------------------------------
                // 0                : 100                   : success
                // 0                : <100                  : error
                // beyond half      : 0                     : warn
                // beyond half      : >0                    : pending

                config.title = percentAccepted + "% Accepted";
                config.subtitle = "(" + Ext.util.Format.round(totalAcceptedPoints, 2) + " of " + Ext.util.Format.round(totalPlanEstimate, 2) + " " +
                        this.getContext().getWorkspace().WorkspaceConfiguration.IterationEstimateUnitName + ")";
                config.message = "";
                if (this.daysRemaining === 0) {
                    if (percentAccepted < 100) {
                        config.status = "error";
                        config.message = this.self.PAST_WITH_SOME_UNACCEPTED_WORK;
                        config.learnMore = "stories";
                    } else if (acceptedLate) {
                        config.message = this.self.PAST_WITH_ACCEPTED_WORK_AFTER_END_DATE;
                        config.status = "success";
                        config.learnMore = "stories";
                    } else {
                        config.status = "success";
                    }
                } else if (this._showStatuses()) {
                    if (percentAccepted === 0) {
                        config.status = "warn";
                    } else if (percentAccepted === 100) {
                        if (workNotEstimated === 0) {
                            config.status = "success";
                        } else {
                            config.status = "pending";
                            config.message = workNotEstimated + this.self.WORK_NOT_ESTIMATED;
                        }
                    } else {
                        config.status = "pending";
                    }
                    if (percentAccepted < 100) {
                        config.message = this.self.CURRENT_WITH_SOME_UNACCEPTED_WORK;
                        config.learnMore = "stories";
                    }
                } else {
                    config.status = "pending";
                    if (percentAccepted === 0) {
                        config.message = this.self.CURRENT_WITH_NO_ACCEPTED_WORK;
                        config.learnMore = "stories";
                    }
                }
            }

            return config;
        },

        _getActiveDefects: function(items) {
            var totalDefects = 0;
            Ext.each(items, function(item) {
                Ext.each(item.get('Defects'), function(defect) {
                    if (defect.State !== 'Closed') {
                        totalDefects++;
                    }
                });
            });

            return totalDefects;
        },

        _getDefectsConfigObject: function() {
            var totalDefects = 0;
            var config = {};

            totalDefects += this._getActiveDefects(this.results.userstory);
            if (this.results.defectsuite) {
                totalDefects += this._getActiveDefects(this.results.defectsuite);
            }
            if (totalDefects > 0 && this.timeOrientation !== "future") {
                config.title = totalDefects + " Active Defects";
                config.subtitle = "";
                config.learnMore = "defects";

                if (this.timeOrientation === "past") {
                    config.status = "error";
                    config.message = this.self.PAST_WITH_DEFECTS;
                } else if (this.timeOrientation === "current") {
                    config.status = "warn";
                    config.message = this.self.CURRENT_WITH_DEFECTS;
                }
            }

            return config;
        },

        _getPassingTestCases: function(items) {
            var testCounts = {passingTests: 0, totalTests: 0};

            Ext.each(items, function(item) {
                Ext.each(item.get('TestCases'), function(testCase) {
                    if (testCase.LastVerdict === 'Pass') {
                        testCounts.passingTests++;
                    }
                    testCounts.totalTests++;
                });
            });

            return testCounts;
        },

        _getTestsConfigObject: function() {
            var config = {};
            var tmpTestCnt = {};
            var testCounts = {passingTests: 0, totalTests: 0};
            var testTypes = ["userstory", "defect", "testset"];

            Ext.each(testTypes, function(testType) {
                tmpTestCnt = this._getPassingTestCases(this.results[testType]);
                testCounts.totalTests += tmpTestCnt.totalTests;
                testCounts.passingTests += tmpTestCnt.passingTests;
            }, this);

            if (testCounts.totalTests !== 0 && this.timeOrientation !== "future") {

                // days remaining   : number passing        : status
                // -------------------------------------------------
                // *                : all                   : success
                // in the past      : <all                  : error
                // beyond half      : 0                     : warning
                // beyond half      : >0                    : pending

                var percentPassing = Math.floor((testCounts.passingTests / testCounts.totalTests) * 100);

                config.title = this.self.CURRENT_TESTS_FAILING_TITLE.replace("{PERCENT}", percentPassing);
                config.subtitle = "(" + testCounts.passingTests + " of " + testCounts.totalTests + ")";

                if (testCounts.passingTests === testCounts.totalTests) {
                    config.message = this.self.CURRENT_TESTS_PASSING;
                    config.status = "success";
                } else {
                    config.message = this.self.CURRENT_TESTS_FAILING_MESSAGE;
                    config.learnMore = "tests";
                    if (this.timeOrientation === "past") {
                        config.status = "error";
                    } else if (this._showStatuses()) {
                        config.status = testCounts.passingTests === 0 ? 'warn' : 'pending';
                    } else {
                        config.status = "pending";
                    }
                }
            }

            return config;
        },

        _displayStatusRows: function() {
            this._displayStatusRow(this._getAcceptanceConfigObject());
            this._displayStatusRow(this._getDefectsConfigObject());
            if (!this._isHsOrTeamEdition()) {
                this._displayStatusRow(this._getTestsConfigObject());
            }
        },

        _displayStatusRow: function(rowConfig) {
            if (rowConfig.title) {
                var items = [
                    {
                        cls: 'header',
                        html: rowConfig.title + '<span class="subtitle">' + rowConfig.subtitle + '</span>'
                    }
                ];

                if (rowConfig.message) {
                    var message = rowConfig.message;
                    if (rowConfig.learnMore) {
                        message += ' <a href="http://www.rallydev.com/help/iteration-summary#' + rowConfig.learnMore +
                                '" title="Learn More" target="_blank" class="learnMore">Learn More</a>';
                    }
                    items.push({
                        cls: 'details',
                        html: message
                    });
                }

                this.down('#stats').add({
                    xtype: 'container',
                    cls: rowConfig.status ? 'timeboxStatusRow ' + rowConfig.status : 'timeboxStatusRow',
                    items: [
                        {
                            xtype: 'container',
                            cls: 'timeboxStatusDetails',
                            defaults: { xtype: 'component' },
                            items: items
                        }
                    ]
                });
            }
        }
    });
})();