module.exports = function(grunt) {

    var getSdkVersion = function() {
        var js_dependencies = grunt.file.readJSON('js_dependencies.json'),
            i, sdkVersion;

        for (i = 0; i < js_dependencies.length; i++) {
            var dep = js_dependencies[i];
            if (dep.id.match(/appsdk-src/)) {
                sdkVersion = dep.id.replace(/^.+:/, '');
                break;
            }
        }

        return sdkVersion;
    };

    var getBuildVersion = function(revision) {
        var counter = process.env.PIPELINE_COUNTER || process.env.BUILD_NUMBER || 'dev';
        return "" + counter + "-" + (revision.substr(0, 7)) + '-sdk-' + getSdkVersion();
    };

    grunt.registerTask('version', 'Compute the build version for rally builds', function() {
        var done = this.async(), setVersion = function (revision) {
            grunt.config(['buildVersion'], getBuildVersion(revision));
            done();
        };
        if (process.env.GIT_COMMIT) {
            setVersion(process.env.GIT_COMMIT);
        } else {
            grunt.util.spawn({
                cmd: 'git',
                args: "log -n 1 --pretty=format:%h".split(' ')
            }, function(err, stdout, stderr) {
                if (err) {
                    grunt.fail.warn(err);
                }
                setVersion(stdout.toString());
            });
        }
    });
};
