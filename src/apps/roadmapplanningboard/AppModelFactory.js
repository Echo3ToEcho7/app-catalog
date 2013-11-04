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
            'Rally.apps.roadmapplanningboard.Model',
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

        getPlanModel: function () {
            if (this.planModel) {
                return this.planModel;
            }
            this.planModel = Ext.define('Rally.apps.roadmapplanningboard.PlanModel', {
                extend: 'Rally.apps.roadmapplanningboard.Model',
                fields: [
                    {
                        name: 'id',
                        type: 'string',
                        persist: false
                    },
                    {
                        name: 'ref',
                        type: 'string',
                        persist: false
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
                        name: 'features',
                        type: 'collection'
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
                    url: Rally.environment.getContext().context.services.planning_service_url + '/api/plan'
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
                        type: 'string',
                        persist: false
                    },
                    {
                        name: 'ref',
                        type: 'string',
                        persist: false
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
                    url: Rally.environment.getContext().context.services.planning_service_url + '/api/roadmap'
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
            var date = Ext.Date.parse(value, 'c');
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
                        type: 'string',
                        persist: false
                    },
                    {
                        name: 'ref',
                        type: 'string',
                        persist: false
                    },
                    {
                        name: 'name',
                        type: 'string'
                    },
                    {
                        name: 'start',
                        type: 'date',
                        dateFormat: 'Y-m-d\\TH:i:s\\Z',
                        convert: this._normalizeDate
                    },
                    {
                        name: 'end',
                        type: 'date',
                        dateFormat: 'Y-m-d\\TH:i:s\\Z',
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
                    url: Rally.environment.getContext().context.services.timeline_service_url + '/api/timeframe'
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
