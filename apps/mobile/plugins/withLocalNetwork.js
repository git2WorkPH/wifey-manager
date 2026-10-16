const { withAndroidManifest } = require("expo/config-plugins");
// Local LAN servers use HTTP during development. Production should use HTTPS.
module.exports = (config) =>
  withAndroidManifest(config, (modConfig) => {
    const application = modConfig.modResults.manifest.application?.[0];
    if (application) application.$["android:usesCleartextTraffic"] = "true";
    return modConfig;
  });
