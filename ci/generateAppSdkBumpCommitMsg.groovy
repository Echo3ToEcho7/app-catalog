def appSdkSrcVersion = build.buildVariables.APPSDK_SRC_VERSION
def env = build.characteristicEnvVars

def jsDep = new hudson.FilePath(build.workspace, 'js_dependencies.json').readToString()
def prevSdkVersionMatcher = jsDep =~ /appsdk-src:tgz:(\d+)/
def prevSdkBuildNumber = prevSdkVersionMatcher[0][1] as int

def upstreamProject = build.parent.upstreamProjects.first()
def newBuildNumber = appSdkSrcVersion.split('-')[0] as int

StringBuilder commitMsg = new StringBuilder() << "${env.JOB_NAME} ${env.BUILD_NUMBER} bumping sdk to ${appSdkSrcVersion}" << "\n\n"

if(prevSdkBuildNumber < newBuildNumber){
    (prevSdkBuildNumber + 1..newBuildNumber).each { buildNumber ->
 	def build = upstreamProject.getBuildByNumber(buildNumber) ?: build.getCause(hudson.model.Cause.UpstreamCause).upstreamRun
       	build.changeSet.each { change ->
            commitMsg << "sdk commit: ${change.commitId}\n"
            commitMsg << "author: ${change.authorName}\n"
            commitMsg << "message: ${change.msg}\n\n"
        }
    }
}

def appsdkBump = new hudson.FilePath(build.workspace, 'appsdk.bump')
appsdkBump.write(commitMsg as String, null)
