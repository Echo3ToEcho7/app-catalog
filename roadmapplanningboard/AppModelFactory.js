(function () {
    var Ext = window.Ext4 || window.Ext;
    Ext.define('Rally.apps.roadmapplanningboard.AppModelFactory', {
        requires: ['Rally.data.Model'],
        getPlanningModel: function () {
            if (this.planningModel) {
                return this.planningModel;
            }
            this.planningModel = Ext.define('Rally.apps.roadmapplanningboard.PlanningModel', {
                extend: 'Rally.data.Model',
                fields: [
                    {
                        name: 'id',
                        type: 'string'
                    },
                    {
                        name: 'name',
                        type: 'string'
                    },
                    {
                        name: 'theme',
                        type: 'string'
                    },
                    {
                        name: 'lowCapacity',
                        type: 'int'
                    },
                    {
                        name: 'highCapacity',
                        type: 'int'
                    },
                    {
                        name: 'timeframe'
                    },
                    {
                        name: 'features'
                    },
                    {
                        name: 'updatable',
                        defaultValue: true
                    }
                ],
                hasOne: {
                    name: 'timeframe',
                    model: this.getTimeframeModel().$className
                },
                hasMany: {
                    name: 'features',
                    model: this.getFeatureModel().$className
                },
                proxy: {
                    type: 'rest',
                    url: 'https://bld-orcafe-01.f4tech.com/planning-service/api/plan',
                    reader: {
                        type: 'json',
                        root: 'data.results'
                    },
                    writer: {
                        type: 'json',
                        root: 'data'
                    }
                }
            });
            return this.planningModel;
        },
        getRoadmapModel: function () {
            if (this.roadmapModel) {
                return this.roadmapModel;
            }
            this.roadmapModel = Ext.define('Rally.apps.roadmapplanningboard.RoadmapModel', {
                extend: 'Rally.data.Model',
                fields: [
                    {
                        name: 'id',
                        type: 'string'
                    },
                    {
                        name: 'name',
                        type: 'string'
                    },
                    {
                        name: 'ref',
                        type: 'string'
                    },
                    {
                        name: 'plans'
                    }
                ],
                hasMany: {
                    name: 'plans',
                    model: this.getPlanningModel().$className
                },
                proxy: {
                    type: 'rest',
                    url: 'https://bld-orcafe-01.f4tech.com/planning-service/api/roadmap',
                    reader: {
                        type: 'json',
                        root: 'data.results'
                    },
                    writer: {
                        type: 'json',
                        root: 'data'
                    }
                }
            });
            return this.roadmapModel;
        },
        _stripTime: function (v, rec) {
            if (v) {
                return Ext.Date.clearTime(Ext.Date.parse(v, 'c'));
            }
        },
        getTimeframeModel: function () {
            if (this.timeframeModel) {
                return this.timeframeModel;
            }
            this.timeframeModel = Ext.define('Rally.apps.roadmapplanningboard.TimeframeModel', {
                extend: 'Rally.data.Model',
                fields: [
                    {
                        name: 'id',
                        type: 'string'
                    },
                    {
                        name: 'name',
                        type: 'string'
                    },
                    {
                        name: 'start',
                        type: 'date',
                        convert: this._stripTime
                    },
                    {
                        name: 'end',
                        type: 'date',
                        convert: this._stripTime
                    },
                    {
                        name: 'updatable',
                        type: 'boolean',
                        defaultValue: true
                    }
                ],
                proxy: {
                    type: 'rest',
                    url: 'https://bld-orcafe-01.f4tech.com/timeline-service/api/timeframe',
                    reader: {
                        type: 'json',
                        root: 'data.results'
                    },
                    writer: {
                        type: 'json',
                        root: 'data'
                    }
                },
                belongsTo: {
                    model: 'Rally.apps.roadmapplanningboard.TimelineModel',
                    foreignKey: 'timelineId'
                }
            });
            return this.timeframeModel;
        },
        getFeatureModel: function () {
            if (this.featureModel) {
                return this.featureModel;
            }
            this.featureModel = Ext.define('Rally.apps.roadmapplanningboard.FeatureModel', {
                extend: 'Rally.data.Model',
                fields: [
                    {
                        name: 'id',
                        type: 'string'
                    },
                    {
                        name: 'ObjectID',
                        type: 'string'
                    },
                    {
                        name: 'Name',
                        type: 'string'
                    },
                    {
                        name: 'PreliminaryEstimate',
                        type: 'int'
                    },
                    {
                        name: 'ref',
                        type: 'string'
                    },
                    {
                        name: 'blocked',
                        value: false
                    }
                ],
                proxy: {
                    type: 'rest',
                    url: "https://bld-orcafe-01.f4tech.com/portfolio-service/api/feature",
                    reader: {
                        type: 'json',
                        root: 'data.results'
                    },
                    writer: {
                        type: 'json',
                        root: 'data'
                    }
                },
                belongsTo: {
                    model: 'Rally.apps.roadmapplanningboard.PlanModel'
                }
            });
            return this.featureModel;
        }
    });

}).call(this);
