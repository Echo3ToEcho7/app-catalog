(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define("ProjectCFDCalculator", {
        extend: "Rally.data.lookback.calculator.TimeSeriesCalculator",

        getMetrics: function() {
            var stateFieldName = this.stateFieldName;
            var stateFieldValues = this.stateFieldValues.split(',');

            var metrics = [
            ];

            for (var i = 0; i < stateFieldValues.length; ++i) {
                metrics.push(
                    {as: stateFieldValues[i], groupByField: stateFieldName, allowedValues: [stateFieldValues[i]], f: 'groupByCount', display: 'area'}
                );
            }
            return metrics;
        }

    });

    Ext.define("Rally.apps.charts.cfd.project.ProjectCFDApp", {
        name: 'chartapp',
        extend: "Rally.app.App",
        settingsScope: "workspace",
        componentCls: 'cfd-app',
        cls: 'chart-app',

        requires: [
            'Rally.ui.chart.Chart',
            'Rally.apps.charts.cfd.project.ProjectCFDSettings',
            'Rally.util.Help',
            'Rally.util.Test'
        ],

        config: {
            defaultSettings: {
                stateFieldName: 'ScheduleState',
                stateFieldValues: 'Idea,Defined,In-Progress,Completed,Accepted,Released',
                timeFrameQuantity: 90,
                timeFrameUnit: 'day'
            }
        },

        chartSettings: undefined, // ProjectCFDChartSettings object

        items: [
            {
                xtype: 'container',
                itemId: 'header',
                cls: 'header'
            }
        ],

        help: {
            // TODO: Need a help id for this topic
            id: 0
        },

        getSettingsFields: function () {
            if (!this.chartSettings) {
                this.chartSettings = Ext.create('Rally.apps.charts.cfd.project.ProjectCFDSettings', {
                    app: this
                });
            }
            return this.chartSettings.getFields();
        },

        launch: function () {
            this.callParent(arguments);
            var projectSetting = this.getSetting("project");

            this.down('#header').add(this._buildHelpComponent());

            if (Ext.isEmpty(projectSetting)) {
                var context = this.getContext();
                this.projectScopeDown = context.getProjectScopeDown();
                this.project = context.getProject();
                this.workspace = context.getWorkspace();
                this.loadChart();
            } else {
                this.projectScopeDown = this.getSetting("projectScopeDown");
                this.loadModelInstanceByRefUri(projectSetting,
                    function (record) {
                        this.project = record.data;
                        this.workspace = record.data.Workspace;
                        this.loadChart();
                    },
                    function () {
                        throw new Error("Failed to load project '" + projectSetting + "' from WSAPI.");
                    }
                );
            }
        },

        _buildHelpComponent: function () {
            return Ext.create('Ext.Component', {
                renderTpl: Rally.util.Help.getIcon({
                    id: this.help.id
                })
            });
        },

        loadModelInstanceByRefUri: function (refUri, success, failure) {
            var ref = Rally.util.Ref.getRefObject(refUri);
            Rally.data.ModelFactory.getModel({
                type: ref.getType(),
                scope: this,
                success: function (model) {
                    model.load(ref.getOid(), {
                        scope: this,
                        fetch: ['Name', 'ObjectID', 'Workspace'],
                        success: success,
                        failure: failure
                    });
                }
            });
        },

        loadChart: function() {
            this.add(this._buildChartAppConfig());
            this._publishComponentReady();
        },

        _buildChartAppConfig: function() {
            return {
                xtype: 'rallychart',
                storeConfig: this._buildChartStoreConfig(),
                calculatorType: 'ProjectCFDCalculator',
                calculatorConfig: this._buildChartCalculatorConfig(),

                chartColors: [  // RGB values obtained from here: http://ux-blog.rallydev.com/?cat=23
                    "#C0C0C0",  // $grey4
                    "#FF8200",  // $orange
                    "#F6A900",  // $gold
                    "#FAD200",  // $yellow
                    "#8DC63F",  // $lime
                    "#1E7C00",  // $green_dk
                    "#337EC6",  // $blue_link
                    "#005EB8",  // $blue
                    "#7832A5",  // $purple
                    "#DA1884"   // $pink
                ],

                listeners: {
                    chartRendered: this._publishComponentReady,
                    scope: this
                },

                chartConfig: {
                    chart: {
                        zoomType: 'xy'
                    },
                    title: {
                        text: this.project.Name + " Cumulative Flow Diagram"
                    },
                    xAxis: {
                        tickmarkPlacement: 'on',
                        tickInterval: 20,
                        title: {
                            text: 'Days'
                        }
                    },
                    yAxis: [
                        {
                            title: {
                                text: 'Count'
                            }
                        }
                    ],
                    plotOptions: {
                        series: {
                            marker: {
                                enabled: false
                            }
                        },
                        area: {
                            stacking: 'normal'
                        }
                    }
                }
            };
        },

        _buildChartStoreConfig: function() {
            return {
                context: { workspace: this.workspace._ref },
                find: this._buildChartStoreConfigFind(),
                fetch: this._buildChartStoreConfigFetch(),
                hydrate: this._buildChartStoreConfigHydrate()
            };
        },

        _buildChartStoreConfigFind: function() {
            var find = {
                '_TypeHierarchy': 'HierarchicalRequirement',
                'Children': null,
                "$or" :
			        [
                		{ '_ValidFrom': { "$gt": this._buildChartStoreConfigValidFrom() } },
                		{
                		  '_ValidTo'  : { "$gt" : this._buildChartStoreConfigValidFrom() },
                		  '_ValidFrom': { "$lt": this._buildChartStoreConfigValidFrom() }
                		}
			        ]
            };
            var stateField = this.getSetting('stateFieldName');
            if(stateField === 'ScheduleState') {
                find['$or'][1][stateField] = { "$lt": "Accepted" } ;
            } else {
                find['$or'][1][stateField] = { "$ne": this.getSetting('stateFieldValues').split(',').pop() } ;
            }

            if (this.projectScopeDown) {
                find._ProjectHierarchy = this.project.ObjectID;
            } else {
                find.Project = this.project.ObjectID;
            }

            return find;
        },

        _buildChartStoreConfigValidFrom: function() {
            var today = this._getNow();
            var timeFrameUnit = this.getSetting("timeFrameUnit");
            var timeFrameQuantity = this.getSetting("timeFrameQuantity");
            var validFromDate = Rally.util.DateTime.add(today, timeFrameUnit, -timeFrameQuantity);
            return validFromDate.toISOString();
        },

        _getNow: function() {
            return new Date();
        },

        _buildChartStoreConfigFetch: function() {
            var stateFieldName = this.getSetting('stateFieldName');
            return [stateFieldName, 'PlanEstimate'];
        },

        _buildChartStoreConfigHydrate: function() {
            var stateFieldName = this.getSetting('stateFieldName');
            return [stateFieldName];
        },

        _buildChartCalculatorConfig: function() {
            var stateFieldName = this.getSetting('stateFieldName');
            var stateFieldValues = this.getSetting('stateFieldValues');
            var startDate = this._buildChartStoreConfigValidFrom();
            return {
                stateFieldName: stateFieldName,
                stateFieldValues: stateFieldValues,
                startDate: startDate
            };
        },

        _publishComponentReady: function() {
            if (Rally.BrowserTest) {
                Rally.BrowserTest.publishComponentReady(this);
            }
        }

    });

}());
