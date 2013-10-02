module.exports = function(grunt) {
    grunt.registerTask('assemble', 'Assemble app sources into customizable html files', function() {
        var rab = require('rally-app-builder');
        var path = require('path');
        var async = require('async');
        var options = grunt.config.get('assemble').options;

        var done = this.async();
        var apps = grunt.file.expand(options.apps);
        async.each(apps, function(app, callback) {
            var appPath = path.dirname(app);
            grunt.log.writeln('Building app ' + appPath + '...');
            //todo: rab quiet mode
            rab.build({ path: appPath }, function(error) {
                callback();
            });
        }, done);
    });
};

