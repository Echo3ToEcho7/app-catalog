var express = require('express');
var path = require('path');
var app = express();

function getAppSdkPath() {
    if(process.env.APPSDK_PATH) {
        return path.join(process.env.APPSDK_PATH, 'rui');
    }
    return 'lib/sdk';
}

app.get('/', function(req, res) {
    res.sendfile(path.resolve(__dirname + '/..') + '/_SpecRunner.html');
});
app.get('/appsdk_path/*', function(req, res) {
    var sdkPath = path.resolve(req.url.replace('/appsdk_path', getAppSdkPath()));
    res.sendfile(path.resolve(sdkPath));
});

module.exports = app;