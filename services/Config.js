'use strict';

require('dotenv').config();

// Required environment variables
const ENV_VARS = [
  'PAGE_ID',
  'APP_ID',
  'PAGE_ACCESS_TOKEN',
  'APP_SECRET',
  'VERIFY_TOKEN',
  'APP_URL'
];

module.exports = {
  // Messenger Platform API
  mPlatformDomain: 'https://graph.facebook.com',
  mPlatformVersion: 'v4.0',

  // Page and Application information
  pageId: process.env.PAGE_ID,
  appId: process.env.APP_ID,
  pageAccesToken: process.env.PAGE_ACCESS_TOKEN,
  appSecret: process.env.APP_SECRET,
  verifyToken: process.env.VERIFY_TOKEN,
  appUrl: process.env.APP_URL,

  // Dialogflow agent bearers
  adrienBearer: process.env.ADRIEN,

  // Preferred port (default to 8080)
  port: process.env.PORT || 8080,

  get mPlatfom () {
    return this.mPlatformDomain + '/' + this.mPlatformVersion;
  },

  checkEnvVariables: function () {
    ENV_VARS.forEach(function (key) {
      if (!process.env[key]) {
        console.log('WARNING: Missing the environment variable ' + key);
      }
    });
  }
};
