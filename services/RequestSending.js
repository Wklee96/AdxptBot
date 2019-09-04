/* eslint-disable standard/no-callback-literal */
// Imports dependencies
const request = require('request');
const config = require('./Config.js');
const requestJson = require('./RequestJson.js');

module.exports = class GraphAPI {
  // Method to send request to Messenger Platform
  static callSendAPI (requestBody) {
    var requestObject = {
      uri: `${config.mPlatfom}/me/messages`,
      qs: {
        access_token: config.pageAccesToken
      },
      method: 'POST',
      json: requestBody
    };
    request(requestObject, err => {
      if (err) {
        console.error('ERROR', 'Unable to send message', err);
      }
    });
  };

  // Send request to Messenger Profile
  static getUserProfile (id, cb) {
    var requestObject = {
      uri: `${config.mPlatfom}/${id}`,
      qs: {
        access_token: config.pageAccesToken,
        fields: 'first_name, last_name'
      },
      method: 'GET'
    };
    request(requestObject, (err, res, body) => {
      if (err) {
        console.error('ERROR', 'Unable to send message', err);
      } else {
        cb(JSON.parse(body));
      }
    });
  }

  // Send typing action
  static sendTyping (id) {
    var typingObject = {
      recipient: {
        id: id
      },
      sender_action: 'typing_on'
    };
    this.callSendAPI(typingObject);
  }

  // Send text to dialog flow to get bot's reply
  static getReplyFromDialog (text, psid, callback) {
    var reqObj = {
      url: 'https://api.api.ai/v1/query?v=20150910',
      headers: {
        'Content-Type': 'application/json',
        Authorization: config.adrienBearer
      },
      method: 'POST',
      json: {
        query: text,
        lang: 'en',
        sessionId: psid
      }
    };
    request(reqObj, function (error, response, body) {
      if (error) {
        console.error('ERROR:', 'Unable to get a response from DialogFlow', JSON.stringify(error));
        callback(psid, 'Something has gone wrong. Please wait while we handover to our live agents');
      } else if (body.result.metadata.isFallbackIntent === 'true') {
        console.log('INFO:', 'Fallback intent detected, handover protocol');
        callback(psid, 'Something has gone wrong. Please wait while we handover to our live agents');
      } else {
        console.log('INFO:', 'Bot has replied');
        const text = body.result.fulfillment.speech;
        var reply = [];
        reply.push(requestJson.makeTextRequest(psid, text));
        callback(psid, reply);
      }
    });
  }

  static handOver (psid) {
    var requestObject = {
      uri: `${config.mPlatfom}/me/pass_thread_control`,
      qs: {
        access_token: config.pageAccesToken
      },
      method: 'POST',
      json: {
        recipient: {
          id: psid
        },
        target_app_id: 263902037430900
      }
    };
    request(requestObject, err => {
      if (err) {
        console.error('ERROR', 'Unable to send message', err);
      }
    });
  }
};
