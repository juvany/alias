var sp = require('child_process');
var path = require('path');
var fs = require('fs');

var JAVA_HOME    = path.join(__dirname, 'jdk17', 'jdk-17.0.10+7');
var ANDROID_HOME = 'C:\\Users\\juvan\\alias\\myAlias-android\\android-sdk';
var DIR          = __dirname;

var env = Object.assign({}, process.env, {
  JAVA_HOME:    JAVA_HOME,
  ANDROID_HOME: ANDROID_HOME,
  PATH:         JAVA_HOME + '\\bin;' + process.env.PATH
});

// Test java first
console.log('--- Testing java ---');
var jtest = sp.spawnSync(JAVA_HOME + '\\bin\\java.exe', ['-version'], { stdio: 'inherit', env: env });
console.log('java exit:', jtest.status);

console.log('\n--- Running Gradle assembleDebug ---');
var GRADLE_BAT = DIR + '\\gradle-dist\\gradle-8.4\\bin\\gradle.bat';
var r = sp.spawnSync(
  GRADLE_BAT, ['assembleDebug'],
  { stdio: 'inherit', cwd: DIR, env: env, timeout: 300000, shell: true }
);
console.log('\nGradle exit code:', r.status);

var apk = path.join(DIR, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
if (fs.existsSync(apk)) {
  var mb = (fs.statSync(apk).size / 1024 / 1024).toFixed(1);
  console.log('\nSUCCESS! APK: ' + apk + ' (' + mb + ' MB)');
} else {
  console.log('\nAPK not found. Check errors above.');
  process.exit(1);
}
