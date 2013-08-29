(function () {
    var Ext = window.Ext4 || window.Ext;

    /**
     * @private
     * This should never be called directly, but only through the {@link Rally.data.ModelFactory}
     */
    Ext.define('Rally.apps.roadmapplanningboard.AppModelFactory', {
        
        singleton: true,
        
        requires: [
            'Rally.data.Model',
            'Rally.apps.roadmapplanningboard.Proxy'
        ],

        /**
         * @property
         * {String[]} modelTypes An array of types this factory knows how to handle. These
         */
        modelTypes: [
            'plan',
            'roadmap',
            'timeframe'
        ],
        
        getModel: function (options) {
            var model = {},
                type;
            
            if (!Ext.isObject(options)) {
                type = options;
            } else {
                type = options.type;
            }
            
            model = this[this._getModelTypeName(type)]();
            
            return model;
        },
        
        getModels: function (options) {
            var models = {};
            
            _.each(options.types, function (type) {
                Ext.apply(models, this.getModel(options, type));
            });
            
            return models;
        },
        
        _getModelTypeName: function (type) {
            return 'get' + type.charAt(0).toUpperCase() + type.slice(1) + 'Model';
        },
        
        getPlanModel: function () {
            if (this.planModel) {
                return this.planModel;
            }
            this.planModel = Ext.define('Rally.apps.roadmapplanningboard.PlanModel', {
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
                proxy: {
                    type: 'roadmap',
                    url: 'https://bld-orcafe-01.f4tech.com/planning-service/api/plan'
                }
            });
            return this.planModel;
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
                    model: this.getPlanModel().$className
                },
                proxy: {
                    type: 'roadmap',
                    url: 'https://bld-orcafe-01.f4tech.com/planning-service/api/roadmap'
                }
            });
            return this.roadmapModel;
        },
        /**
         * The server will give us Zulu time. We need to make sure we're normalizing for our timezone
         * and stripping the time since we only care about the date
         * @param value The value from the server
         * @returns {Ext.Date}
         * @private
         */
        _normalizeDate: function (value) {
            var date = new Date(value);
            if (date.getTime()) {
                return Ext.Date.clearTime(Ext.Date.add(date, Ext.Date.MINUTE, date.getTimezoneOffset()));
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
                        convert: this._normalizeDate
                    },
                    {
                        name: 'end',
                        type: 'date',
                        convert: this._normalizeDate
                    },
                    {
                        name: 'updatable',
                        type: 'boolean',
                        defaultValue: true
                    }
                ],
                proxy: {
                    type: 'roadmap',
                    url: 'https://bld-orcafe-01.f4tech.com/timeline-service/api/timeframe'
                },
                belongsTo: {
                    model: 'Rally.apps.roadmapplanningboard.TimelineModel',
                    foreignKey: 'timelineId'
                }
            });
            return this.timeframeModel;
        }
    }, function () {
        Rally.data.ModelFactory.registerTypes(this.modelTypes, this);
    });

})();
