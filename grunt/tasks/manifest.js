module.exports = function(grunt) {
    grunt.registerTask('manifest', 'Create a manifest for all the apps in the catalog', function() {
        var path = require('path');
        var options = grunt.config.get('manifest').options;
        var manifest = {};

        var legacyApps = grunt.file.expand(options.legacy.files) || [];
        legacyApps.forEach(function(legacyApp) {
            var appSlug = path.basename(path.dirname(legacyApp));
            var appConfig = grunt.file.readJSON(legacyApp);
            appConfig.src = path.join(path.join(options.legacy.srcRoot, appSlug), appConfig.src);
            appConfig.screenshot = path.join(path.join(options.legacy.srcRoot, appSlug), appConfig.screenshot);
            manifest[appSlug] = appConfig;
        });

        var apps = grunt.file.expand(options.apps.files) || [];
        apps.forEach(function(app) {
            var appSlug = path.basename(path.dirname(app));
            var appConfig = grunt.file.readJSON(app);
            var manifestConfig = {
                name: appConfig.name
            };
            manifestConfig.src = path.join(path.join(options.apps.srcRoot, appSlug), 'App-uncompressed.html');
            manifest[appSlug] = manifestConfig;
        });

        var destinationFile = options.dest;
        grunt.file.write(destinationFile, JSON.stringify(manifest, null, 4));
    });
};

