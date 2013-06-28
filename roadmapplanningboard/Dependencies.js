(function () {
    var Ext;

    Ext = window.Ext4 || window.Ext;
    Ext.define('Rally.apps.roadmapplanningboard.Dependencies', {}, function() {
        Deft.Injector.configure({
            appModelFactory: {
                className: 'Rally.apps.roadmapplanningboard.AppModelFactory'
            },
            featureStore: {
                className: 'Rally.apps.roadmapplanningboard.FeatureStore'
            },
            timeframeStore: {
                className: 'Rally.apps.roadmapplanningboard.TimeframeStore'
            },
            planningStore: {
                className: 'Rally.apps.roadmapplanningboard.PlanningStore'
            },
            roadmapStore: {
                className: 'Rally.apps.roadmapplanningboard.RoadmapStore'
            }
        });
    });

}).call(this);
