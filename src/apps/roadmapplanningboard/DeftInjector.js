(function() {

    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.roadmapplanningboard.DeftInjector', {
        singleton: true,
        requires: [
            'Rally.apps.roadmapplanningboard.AppModelFactory',
            'Rally.apps.roadmapplanningboard.UuidMapper'
        ],
        loaded: false,

        init: function () {
            if (!this.loaded) {
                Deft.Injector.configure({
                    timelineStore: {
                        className: 'Ext.data.Store',
                        parameters: [{
                            model: Rally.apps.roadmapplanningboard.AppModelFactory.getTimelineModel()
                        }]
                    },
                    timeframeStore: {
                        className: 'Ext.data.Store',
                        parameters: [{
                            model: Rally.apps.roadmapplanningboard.AppModelFactory.getTimeframeModel()
                        }]
                    },
                    planStore: {
                        className: 'Ext.data.Store',
                        parameters: [{
                            model: Rally.apps.roadmapplanningboard.AppModelFactory.getPlanModel()
                        }]
                    },
                    roadmapStore: {
                        className: 'Ext.data.Store',
                        parameters: [{
                            model: Rally.apps.roadmapplanningboard.AppModelFactory.getRoadmapModel()
                        }]
                    },
                    uuidMapper: {
                        className: 'Rally.apps.roadmapplanningboard.UuidMapper'
                    }
                });
            }
            this.loaded = true;
        }
    });
})();
