(function() {
    var Ext = window.Ext4 || window.Ext;

    Ext.Loader.setConfig({
        enabled: true,
        disableCaching: false,
        paths: {
            'Rally.test': 'lib/sdk/test/javascripts/support',
            'Rally.test.mock.data.types' : 'lib/sdk/test/support/data/types',
            'Rally.apps' : 'src/apps',
            'Rally.test.apps.roadmapplanningboard.helper': 'test/gen/roadmapplanningboard/helper',
            'Rally.test.apps.roadmapplanningboard.mocks': 'test/gen/roadmapplanningboard/mocks'
        }
    });
})();
