(function() {
    var Ext = window.Ext4 || window.Ext;

    Ext.Loader.setConfig({
        enabled: true,
        disableCaching: false,
        paths: {
            'Rally.test': 'appsdk_path/test/javascripts/support',
            'Rally.test.mock.data.types': 'appsdk_path/test/support/data/types',
            'Rally.apps': 'src/apps',
            'Rally.test.apps.roadmapplanningboard.helper': 'test/gen/roadmapplanningboard/helper',
            'Rally.test.apps.roadmapplanningboard.mocks': 'test/gen/roadmapplanningboard/mocks',
            'Rally': 'appsdk_path/src'
        }
    });
})();
