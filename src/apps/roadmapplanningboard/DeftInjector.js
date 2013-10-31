(function() {

    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.roadmapplanningboard.DeftInjector', {
        requires: [
            'Rally.apps.roadmapplanningboard.AppModelFactory'
        ]
    }, function () {
        Deft.Injector.configure({
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
            }
        });
    });
})();
