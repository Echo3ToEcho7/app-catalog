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
            'Rally.data.wsapi.Store',
            'Rally.util.Timebox',
            'Deft.Deferred'
        ],
        appName: 'Iteration Summary',
        cls: 'iteration-summary-app',
        scopeType: 'iteration',

        clientMetrics: [
            {
                method: '_onEditLinkClick',
                description: 'iteration summary app - edit iteration link clicked'
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

        _refreshApp: function(record) {
            var types = ['defect', 'hierarchicalrequirement', 'testset', 'defectsuite', 'testcase'];

            if (Ext.Array.contains(types, record.get('_type').toLowerCase())) {
                this._addContent();
            }
        },

        onScopeChange: function(scope) {
            delete this._tzOffset;
            this._addContent();
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

        calculateTimeboxInfo: function() {
            var deferred = Ext.create('Deft.Deferred');

            if (!Ext.isDefined(this._tzOffset)) {
                Rally.environment.getIoProvider().httpGet({
                    url: Rally.environment.getServer().getWsapiUrl() + '/iteration.js?includeSchema=true&pagesize=1&fetch=Name',
                    success: function(results) {
                        if (results.Schema.properties.EndDate.format.tzOffset !== undefined) {
                            this._tzOffset = results.Schema.properties.EndDate.format.tzOffset / 60;
                        } else {
                            this._tzOffset = 0;
                        }
                        this.timeBoxInfo = this._determineTimeBoxInfo(this._tzOffset);
                        deferred.resolve();
                    },
                    scope: this
                });
            } else {
                deferred.resolve(this._tzOffset);
            }
            return deferred.promise;
        },

        getScheduleStates: function() {
            var deferred = Ext.create('Deft.Deferred');

            if (!Ext.isDefined(this._scheduleStates)) {
                Rally.data.ModelFactory.getModel({
                    type: 'UserStory',
                    context: this.getContext().getDataContext(),
                    success: function(model) {
                        model.getField('ScheduleState').getAllowedValueStore().load({
                            callback: function(records, operation, success) {
                                this._scheduleStates = Ext.Array.map(records, function(record) {
                                    return record.get('StringValue');
                                });
                                deferred.resolve(this._scheduleStates);
                            },
                            scope: this
                        });
                    },
                    scope: this
                });
            } else {
                deferred.resolve(this._scheduleStates);
            }
            return deferred.promise;
        },

        _addContent: function(scope) {
            var iteration = this.getIteration();

            return this.calculateTimeboxInfo().then({
                success: function() {
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
                scope: this
            });
        },

        _onEditLinkClick: function() {
            Rally.nav.Manager.edit(this.getIteration().get('_ref'));
        },

        _buildDaysRemainingMessage: function() {
            var message = '';

            if (this.timeBoxInfo.daysRemaining > 0) {
                var remainingText = this.timeBoxInfo.daysRemaining === 1 ? ' Day Remaining' : ' Days Remaining';
                message = '<span class="daysRemaining">' + this.timeBoxInfo.daysRemaining + remainingText + '</span> in a ';
            }

            message += this.timeBoxInfo.timeboxLength + ' day Iteration';
            return message;
        },

        _determineTimeBoxInfo: function(tzOffset) {
            var timeboxCounts = Rally.util.Timebox.getCounts(this.getStartDate(), this.getEndDate(),
                                this.getContext().getWorkspace().WorkspaceConfiguration.WorkDays, tzOffset);

            return {
                timeOrientation: Rally.util.Timebox.getOrientation(this.getStartDate(), this.getEndDate(), tzOffset),
                timeboxLength: timeboxCounts.workdays,
                daysRemaining: timeboxCounts.remaining
            };
        },

        _getStatusRowData: function() {
            this.results = {};
            var queryObjects = {
                hierarchicalrequirement: 'Defects:summary[State],TestCases:summary[LastVerdict],PlanEstimate,AcceptedDate,ScheduleState',
                defect: 'TestCases:summary[LastVerdict],PlanEstimate,AcceptedDate,ScheduleState'
            };

            if (!this._isHsOrTeamEdition()) {
                Ext.apply(queryObjects, {
                    defectsuite: 'Defects:summary[State],PlanEstimate,AcceptedDate,ScheduleState',
                    testset: 'TestCases:summary[LastVerdict],PlanEstimate,AcceptedDate,ScheduleState'
                });
            }

            Rally.data.ModelFactory.getModels({
                types: Ext.Object.getKeys(queryObjects),
                success: function(models) {
                    var loadPromises = [];

                    Ext.Object.each(queryObjects, function(key, value) {
                        if (models[key]) {
                            var loadDeferred = Ext.create('Deft.Deferred');
                            Ext.create('Rally.data.wsapi.Store', {
                                model: models[key],
                                fetch: value,
                                context: this.getContext().getDataContext(),
                                filters: [this.getContext().getTimeboxScope().getQueryFilter()],
                                limit: Infinity,
                                autoLoad: true,
                                listeners: {
                                    load: function(store, data) {
                                        this.results[store.model.prettyTypeName] = data;
                                        loadDeferred.resolve();
                                    },
                                    scope: this
                                }
                            });
                            loadPromises.push(loadDeferred.promise);
                        }
                    }, this);

                    if (loadPromises.length === 0) {
                        if (Rally.BrowserTest) {
                            Rally.BrowserTest.publishComponentReady(this);
                        }
                    } else {
                        Deft.Promise.all(loadPromises).then({
                            success: function() {
                                this._displayStatusRows();
                            },
                            scope: this
                        });
                    }
                },
                scope: this
            });
        },

        _getPostAcceptedState: function() {
            return this.getScheduleStates().then({
                success: function(states) {
                    if (states.length <= 4) {
                        return null;
                    } else if (states.length === 5) {
                        return states[0] === this.self.DEFINED_STATE ? states[4] : null;
                    }
                    return states[5];
                },
                scope: this
            });
        },

        //only show statuses if we are 1/2 through the timebox or 5 days into a timebox
        _showStatuses: function() {
            return ((this.timeBoxInfo.timeboxLength - this.timeBoxInfo.daysRemaining) >= 5 || (this.timeBoxInfo.timeboxLength - this.timeBoxInfo.daysRemaining) > this.timeBoxInfo.daysRemaining);
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
            return this._getPostAcceptedState().then({
                success: function(postAcceptedState) {
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
                    var config = { rowType: 'pointAcceptance'};

                    if (this.timeBoxInfo.timeOrientation !== "future") {

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
                        if (this.timeBoxInfo.daysRemaining === 0) {
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
                scope: this
            });
        },

        _getActiveDefectCount: function(items) {
            var activeDefectsCount = 0;
            items = items || [];
            Ext.Array.forEach(items, function(item) {
                var defectSummary = item.get('Summary').Defects;
                Ext.Object.each(defectSummary.State, function(state, count) {
                    if (state !== 'Closed') {
                        activeDefectsCount += count;
                    }
                });
            });
            return activeDefectsCount;
        },

        _getDefectsConfigObject: function() {
            var totalDefectCount = this._getActiveDefectCount(this.results.userstory);

            if (this.results.defectsuite) {
                totalDefectCount += this._getActiveDefectCount(this.results.defectsuite);
            }

            var config = { rowType: 'defects'};

            if (totalDefectCount > 0 && this.timeBoxInfo.timeOrientation !== "future") {
                config.title = totalDefectCount + " Active Defect" + (totalDefectCount !== 1 ? "s" : "");
                config.subtitle = "";
                config.learnMore = "defects";

                if (this.timeBoxInfo.timeOrientation === "past") {
                    config.status = "error";
                    config.message = this.self.PAST_WITH_DEFECTS;
                } else if (this.timeBoxInfo.timeOrientation === "current") {
                    config.status = "warn";
                    config.message = this.self.CURRENT_WITH_DEFECTS;
                }
            }
            return config;
        },

        _getPassingTestCases: function(items) {
            var testCounts = {passingTests: 0, totalTests: 0};
            items = items || [];

            Ext.Array.forEach(items, function(item) {
                var testCaseSummary = item.get('Summary').TestCases;
                Ext.Object.each(testCaseSummary.LastVerdict, function(verdict, count) {
                    if (verdict === 'Pass') {
                        testCounts.passingTests += count;
                    }
                    testCounts.totalTests += count;
                });
            });
            return testCounts;
        },

        _getTestsConfigObject: function() {
            var config = { rowType: 'testsPassing' };
            var testCounts = {passingTests: 0, totalTests: 0};
            var testTypes = ["userstory", "defect", "testset"];

            Ext.Array.forEach(testTypes, function(testType) {
                var tmpTestCnt = this._getPassingTestCases(this.results[testType]);
                testCounts.totalTests += tmpTestCnt.totalTests;
                testCounts.passingTests += tmpTestCnt.passingTests;
            }, this);

            if (testCounts.totalTests !== 0 && this.timeBoxInfo.timeOrientation !== "future") {

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
                    if (this.timeBoxInfo.timeOrientation === "past") {
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
            return this._getAcceptanceConfigObject().then({
                success: function(acceptanceConfigObject) {
                    this.down('#stats').suspendLayouts();
                    this._displayStatusRow(acceptanceConfigObject);
                    this._displayStatusRow(this._getDefectsConfigObject());
                    if (!this._isHsOrTeamEdition()) {
                        this._displayStatusRow(this._getTestsConfigObject());
                    }
                    this.down('#stats').resumeLayouts(true);
                    if (Rally.BrowserTest) {
                        Rally.BrowserTest.publishComponentReady(this);
                    }
                },
                scope: this
            });
        },

        _displayStatusRow: function(rowConfig) {
            if (rowConfig.title) {
                var items = [
                    {
                        cls: 'header ' + rowConfig.rowType || '',
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