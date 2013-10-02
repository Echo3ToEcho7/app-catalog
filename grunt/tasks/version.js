module.exports = function(grunt) {
    
    grunt.registerTask('version', 'Compute the build version for rally builds', function() {
        var done = this.async(), setVersion = function (revision) {
            var counter = process.env.PIPELINE_COUNTER || process.env.BUILD_NUMBER || 'dev';
            grunt.config(['buildVersion'], "" + counter + "-" + (revision.substr(0, 7)));
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
