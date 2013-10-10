# App Catalog

## Tasks
The App Catalog builds with Node and Grunt. To install them and the App Catalog NPM modules, enter:

```
brew update && brew install node
npm install -g grunt-cli
npm install
```

For a list of tasks enter:
```
grunt --help
```

If you get the error "zsh: command not found: grunt", you may need to add the following line to your .zshrc:
```
PATH=/usr/local/share/npm/bin:$PATH
```

Make sure `NODE_PATH` is set up correctly. You can find the base path by doing `npm list -g`. It should be something like `/usr/local/share/npm/lib`. The `NODE_PATH` will be this base path + `/node_modules`. Add this line to your `~/.zshrc` file:
```
export NODE_PATH=`npm config get prefix`/lib/node_modules
```

## Common Tasks
```
grunt jshint
```
This task will check all app source files for js errors.

```
grunt check
```
This task will run the convention tests for all app source files.

```
grunt watch
```
This task will watch for any css and/or spec file changes and automatically recompile them.

```
grunt build
```
This task will generate a build of the app catalog.

## Running Tests

### Start up Selenium
To run App Catalog tests, the Selenium server environment must be started up:
```
sel
```

This will also make sure webdriver is running.

### Running Tests
App Catalog JavaScript tests can be run by the following command:
```
grunt test
```
This task will run all the Tests/Specs it can find in the `test` directory. If you only want to run a specific test you can enter:
```
grunt test --spec={FileNameSpec}
```
If you would like to run tests or a single test in a dedicated browser with the debug console you'll have to make sure selenium is running and jasmine is running.

### Installing ChromeDriver
If you do not have ChromeDriver installed, your test runs will fail with the error:
```
The path to the driver executable must be set by the webdriver.chrome.driver system property; for more information, see http://code.google.com/p/selenium/wiki/ChromeDriver
```
If this happens, you will need to run:
```
brew install chromedriver
```

### Running Tests Faster
By starting up a Jasmine file server once, tests can run without as much overhead for setting up the tests.

To start Jasmine server:
```
grunt test:server
```
Jasmine defaults to port 8890.

To pick tests to run enter:
```
grunt test:conf --spec={FileNameSpec}
```

### Running Tests Against Local App SDK Changes
Generate the jasmine test config pointing at local files:
```
APPSDK_PATH=~/projects/appsdk grunt test:conf [--spec={FileNameSpec}]
```
Start the server:
```
APPSDK_PATH=~/projects/appsdk grunt test:server
```

Now that you have all these services running you can go to [http://localhost:5445/wd/hub/](http://localhost:5445/wd/hub/). You will be presented with a list of browser sessions. You can create a new session - once loaded click on the `Load Script` button and type in `localhost:8890/`. This should point the browser instance to the Jasmine test suite you previously set up. You can now debug and refresh.

## Developing for ALM
The App Catalog is now a dependency in ALM and is defined in `build/js_dependencies.rb` as a nexus artifact. The artifact is named `app-catalog`. This is how the build servers pull in the App Catalog. If you need real-time updates of App Catalog files in ALM, you'll have to start Jetty using the environment variable `APP_CATALOG_PATH`. The default location for this path is `~/projects/app-catalog`. For example:
```
APP_CATALOG_PATH=~/projects/app-catalog buildr jetty:run
```
This will start up Jetty and tell it to use the files directly from the App Catalog for development, including CSS generation.

If you have made modifications to the ALM Java files, you may need to run
```
APP_CATALOG_PATH=~/projects/app-catalog buildr clean jetty:run
```

### Running on-demand-guitests without a push to either repository
Before the App Catalog was in a separate repository, you could change ALM and the App Catalog, do a local commit and push to ondemand. Now that the App Catalog is in a separate repository the process changes slightly, but doesn't need to require a push.

The App Catalog is pulled in from nexus and requires you to run the following command to push a locally-built App Catalog to nexus:
```
grunt nexus:deploy
```
**NOTE: This task requires gnutar since Darwin tar command is broken**

**NOTE: This task pushes a version based on your commit hash. If you don't commit a local version, you could get collisions in nexus. Also, setting the BUILD_NUMER ENV variable sets a prefix which can help avoid collisions and later identify deploys made from your machine.**

This task allows you to push a dev version of the `app-catalog` artifact to nexus to reference later. The task will give you the nexus artifact ID string. The last part is the nexus version. You will use this later.

Make your changes to ALM and when you're ready to do a push to the on-demand-guitest job, do a local ALM commit. When you go into the Jenkins job and click `Build Now`, paste the version into the `APP_CATALOG_SRC_VERSION` environment variable. This will tell the job to run with your version of the App SDK source.

When everything is good, follow the steps to push to master like normal.

### Getting changes into master
Once all tests pass and you want to push to get your code into master, make sure you run `grunt test` in the App Catalog and submit a pull request. Once the pull request is accepted, the Jenkins job `master-app-catalog-continuous` will pick up the commit, run tests and deploy the `app-catalog` artifact to nexus. You can find the list of artifact versions [in nexus](http://alm-build.f4tech.com:8080/nexus/content/repositories/thirdparty/com/rallydev/js/app-catalog/). The version style is `{continuous-master-build-number}-{short-git-hash}` - you can use these to find out which artifact version is yours.

Once the `master-app-catalog-continuous` job is done and you know the artifact version that was built, update `build/js_dependencies.rb` and change the version number of the `app-catalog` artifact. When you commit and push your change in ALM, the build server will pick up your version of the App Catalog and do its thing. Also, everyone pulling from ALM in normal mode (not doing real-time App Catalog development) will pull your version the next time they run.

Most ALM tasks depend of the `buildr js:thirdparty:dependencies` and should not need to be used directly, but if you run into an issue and your version of a dependency isn't correct, you can safely run this task. You can find the version of a dependency in the `.version` file in the base path of each dependency in `js-lib`
