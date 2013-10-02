module.exports = function(grunt) {
    grunt.registerTask('sencha', 'Compile app code into one file', function() {
        var done = this.async();
        var cmd = grunt.config.get('sencha').cmd;
        var args = grunt.config.get('sencha').args;
        if (!args || !args.length) {
            grunt.fail.warn('sencha task needs `args` defined');
        }
        return grunt.util.spawn({
            cmd: cmd,
            args: args.join(' ').split(' '),
            opts: {
                stdio: 'inherit'
            }
        }, function(err, stdout, stderr) {
            if (err) {
                grunt.fail.warn(err);
            }
            return done();
        });
    });
};

