module.exports = class RequestJson {
  static makeTextRequest (psid, text) {
    return {
      recipient: {
        id: psid
      },
      message: {
        text: text
      }
    };
  }

  static makeImageAttachment (psid, url) {
    return {
      recipient: {
        id: psid
      },
      message: {
        attachment: {
          type: 'image',
          payload: {
            url: url
          }
        }
      }
    };
  }

  static makeQuickReply (psid, text, quickReplies) {
    return {
      recipient: {
        id: psid
      },
      message: {
        text: text,
        quick_replies: quickReplies
      }
    };
  }

  static makeButtons (psid, text, buttons) {
    return {
      recipient: {
        id: psid
      },
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'button',
            text: text,
            buttons: buttons
          }
        }
      }
    };
  }

  static makeReceipt (psid, payload) {
    return {
      recipient: {
        id: psid
      },
      message: {
        attachment: {
          type: 'template',
          payload: payload
        }
      }
    };
  }
};
