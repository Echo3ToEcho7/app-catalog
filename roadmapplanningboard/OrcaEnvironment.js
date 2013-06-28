(function () {
    var Ext = window.Ext4 || window.Ext;
    Ext.define('Rally.apps.roadmapplanningboard.OrcaEnvironment', {
        config: {
            navBaseUrl: '',
            portfolioServiceBaseUrl: '',
            planningServiceBaseUrl: '',
            timelineServiceBaseUrl: ''
        },
        constructor: function (config) {
            this.initConfig(config);
            if (window.orcaEnvironment) {
                this.setNavBaseUrl(window.orcaEnvironment.navBaseUrl);
                this.setPortfolioServiceBaseUrl(window.orcaEnvironment.portfolioServiceBaseUrl);
                this.setPlanningServiceBaseUrl(window.orcaEnvironment.planningServiceBaseUrl);
                this.setTimelineServiceBaseUrl(window.orcaEnvironment.timelineServiceBaseUrl);
            }
            this.callParent(arguments);
        },
        setEnvironment: function (env) {
            this.navBaseUrl = env.navBaseUrl;
            this.dashboardBaseUrl = env.dashboardBaseUrl;
            this.catalogBaseUrl = env.catalogBaseUrl;
            this.portfolioServiceBaseUrl = env.portfolioServiceBaseUrl;
            this.planningServiceBaseUrl = env.planningServiceBaseUrl;
            this.timelineServiceBaseUrl = env.timelineServiceBaseUrl;
            this.almWsapiBaseUrl = env.almWsapiBaseUrl;
            return this.almWsapiBaseUrl;
        },
        getEnvironment: function () {
            return {
                navBaseUrl: this.navBaseUrl,
                dashboardBaseUrl: this.dashboardBaseUrl,
                catalogBaseUrl: this.catalogBaseUrl,
                portfolioServiceBaseUrl: this.portfolioServiceBaseUrl,
                planningServiceBaseUrl: this.planningServiceBaseUrl,
                timelineServiceBaseUrl: this.timelineServiceBaseUrl,
                almWsapiBaseUrl: this.almWsapiBaseUrl
            };
        }
    });

}).call(this);
