'use strict';

const RequestSending = require('./RequestSending.js');
const requestJson = require('./RequestJson.js');
const database = require('./Database.js');
const User = require('./User.js');

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

  handleQuickReply (cb) {
    const payload = this.webhookMessaging.message.quick_reply.payload;

    if (payload.includes('purchase_yes')) {
      // send form
    } else if (payload.includes('purchase_info')) {
      const infoType = payload.substring(14, 16);
      const product = payload.substring(17);
      const response = [];
      database.getInfo(product, infoType, (info) => {
        for (const infoObj of info) {
          response.push(requestJson.makeTextRequest(this.psid, infoObj.text));
          response.push(requestJson.makeImageAttachment(this.psid, infoObj.url));
        }
        response.push(this.learnMoreResponse(this.psid, product));
        cb(response);
      });
    }
  }

  handleAttachment (cb) {
    const payload = this.webhookMessaging.message.quick_reply.payload;
    if (payload.includes('purchase_BT_')) {
      const buyingType = payload.substring(12);
      console.log('INFO:', this.psid + ' chooses ' + buyingType);
      RequestSending.getReplyFromDialog(buyingType, this.psid, function (botResponses) {
        cb(botResponses);
      });
    }
  }

  handleTextMessage (cb) {
    const text = this.webhookMessaging.message.text;
    console.log('INFO:', this.psid + ': ' + text);
    return RequestSending.getReplyFromDialog(text, this.psid, function (response) {
      cb(response);
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
          delay += 1500;
        }
      }
    } else {
      RequestSending.sendTyping(this.psid);
      setTimeout(() => RequestSending.callSendAPI(responses), 1200);
    }
  }

  formCollectionResponse (psid, product) {
    const quickReplies = [
      {
        content_type: 'text',
        title: '貨到付款',
        payload: 'purchase_hd_' + product
      },
      {
        content_type: 'text',
        title: '711超市取貨',
        payload: 'purchase_711_' + product
      },
      {
        content_type: 'text',
        title: '全家取貨',
        payload: 'purchase_fm_' + product
      }
    ];
    const text = '請選擇您的付款方式哦';
    const data = requestJson.makeQuickReply(psid, text, quickReplies);
    return data;
  }

  buyingTypeResponse (psid, productName, cb) {
    const buttons = [];
    database.getBuyingType(productName, function (result) {
      for (const buyingType of result) {
        const data = {
          type: 'postback',
          title: buyingType,
          payload: 'purchase_BT_' + buyingType
        };
        buttons.push(data);
      }
      const text = 'Please choose from the following options for your purchase';
      cb(requestJson.makeButtons(psid, text, buttons));
    });
  }

  learnMoreResponse (psid, productName, evenMore) {
    let text = 'What information do you want to find out about the product?';
    if (evenMore) {
      text = 'Like what you see? Hit Order Now to buy today!';
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
        url: `https://09269c0c.ngrok.io/product/${productName}/${fullName}`,
        title: 'Order Now',
        webview_height_ratio: 'tall',
        messenger_extensions: true
      }
    ];
    return requestJson.makeButtons(psid, text, buttons);
  }
};
