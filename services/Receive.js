'use strict';

const RequestSending = require('./RequestSending.js');
const requestJson = require('./RequestJson.js');
const database = require('./Database.js');
const User = require('./User.js');
var config = require('../services/Config.js');

module.exports = class Receive {
  constructor (psid, webhookMessaging) {
    this.psid = psid;
    this.user = new User();
    RequestSending.getUserProfile(psid, (profile) => {
      this.user.setProfile(profile);
    });
    this.webhookMessaging = webhookMessaging;
  }

  handleMessage () {
    try {
      const message = this.webhookMessaging.message;
      const postback = this.webhookMessaging.postback;

      if (postback) {
        console.log('INFO:', 'Received post back');
        this.handlePostback(postback);
      } else {
        if (message.quick_reply) {
          console.log('INFO:', 'Received quick reply');
          this.handleQuickReply((responses) => {
            this.sendMessage(responses);
          });
        } else if (message.attachment) {
          console.log('INFO:', 'Received attachment');
          this.handleAttachment((responses) => {
            this.sendMessage(responses);
          });
        } else {
          console.log('INFO:', 'Received message');
          this.handleTextMessage((responses) => {
            this.sendMessage(responses);
          });
        }
      }
    } catch (error) {
      console.error('ERROR:', error);
      const responses = {
        text: `An error has occured: '${error}'. We have been notified and \
              will fix the issue shortly!`
      };
      this.sendMessage(responses);
    }
  }

  handlePostback (postback) {
    const payload = postback.payload;
    if (payload.includes('purchase_learn_more')) {
      const productName = postback.payload.substring(20);
      console.log('INFO:', this.psid + ' enquiring about ' + productName);
      this.sendMessage(this.learnMoreResponse(this.psid, productName, false));
    } else if (payload.includes('purchase_yes_')) {
      const productDescript = postback.payload.substring(13).split('_');
      console.log(`INFO: Buying package ${productDescript[1]} of ${productDescript[0]}`);
      this.sendMessage(this.choosePackageForm(productDescript[0], productDescript[1]));
    } else if (payload.includes('purchase_info_')) {
      const infoType = payload.substring(14, 16);
      const product = payload.substring(17);
      const response = [];
      database.getInfo(product, infoType, (info) => {
        for (const infoObj of info) {
          response.push(requestJson.makeTextRequest(this.psid, infoObj.text));
          if (infoObj.url) {
            response.push(requestJson.makeImageAttachment(this.psid, infoObj.url));
          }
        }
        response.push(this.learnMoreResponse(this.psid, product, true));
        this.sendMessage(response);
      });
    }
  }

  handleTextMessage (cb) {
    const text = this.webhookMessaging.message.text;
    console.log('INFO:', this.psid + ': ' + text);
    return RequestSending.getReplyFromDialog(text, this.psid, function (psid, response) {
      if (response === 'Something has gone wrong. Please wait while we handover to our live agents') {
        RequestSending.handOver(psid);
      } else {
        cb(response);
      }
    });
  }

  sendMessage (responses) {
    if (Array.isArray(responses)) {
      let delay = 0;
      for (const response of responses) {
        if (response.message.attachment && response.message.attachment.type === 'image') {
          setTimeout(() => RequestSending.callSendAPI(response), delay);
          delay += 3000;
        } else {
          setTimeout(() => RequestSending.sendTyping(this.psid), delay);
          delay += 1500;
          setTimeout(() => RequestSending.callSendAPI(response), delay);
          delay += 3000;
        }
      }
    } else {
      RequestSending.sendTyping(this.psid);
      setTimeout(() => RequestSending.callSendAPI(responses), 1200);
    }
  }

  learnMoreResponse (psid, productName, evenMore) {
    let text = 'What information do you want to find out about the product?';
    if (evenMore) {
      text = 'Like what you see? Hit Buy Now to buy today!';
    }
    const fullName = this.user.fullName;
    const buttons = [
      {
        type: 'postback',
        title: 'How to use',
        payload: 'purchase_info_UI_' + productName
      },
      {
        type: 'postback',
        title: 'Delivery Information',
        payload: 'purchase_info_DI_' + productName
      },
      {
        type: 'web_url',
        url: `${config.appUrl}/product/${productName}/${this.psid}/${fullName}`,
        title: 'Buy Now',
        webview_height_ratio: 'tall',
        messenger_extensions: true
      }
    ];
    return requestJson.makeButtons(psid, text, buttons);
  }

  choosePackageForm (product, num) {
    const text = 'Excellent. Fill up this form so that we can process your order!';
    const fullName = this.user.fullName;
    const buttons = [
      {
        type: 'web_url',
        url: `${config.appUrl}/product/${product}/${this.psid}/${fullName}/${num}`,
        title: 'Buy Now',
        webview_height_ratio: 'tall',
        messenger_extensions: true
      }
    ];
    return requestJson.makeButtons(this.psid, text, buttons);
  }
};
