var express = require('express');
var router = express.Router();
var database = require('../services/Database');
var requestSending = require('../services/RequestSending');
var requestJson = require('../services/RequestJson');
var config = require('../services/Config.js');

/* GET home page. */
router.get('/:product/:psid/:name/:package', (req, res) => {
  const referer = req.get('Referer');
  if (referer) {
    if (referer.indexOf('www.messenger.com') >= 0) {
      res.setHeader('X-Frame-Options', 'ALLOW-FROM https://www.messenger.com/');
    } else if (referer.indexOf('www.facebook.com') >= 0) {
      res.setHeader('X-Frame-Options', 'ALLOW-FROM https://www.facebook.com/');
    }
    res.render(`${req.params.product}`, { product: req.params.product, psid: req.params.psid, name: `${req.params.name}`, package: req.params.package });
  }});

/* GET home page. */
router.get('/:product/:psid/:name', (req, res) => {
  const referer = req.get('Referer');
  if (referer) {
    if (referer.indexOf('www.messenger.com') >= 0) {
      res.setHeader('X-Frame-Options', 'ALLOW-FROM https://www.messenger.com/');
    } else if (referer.indexOf('www.facebook.com') >= 0) {
      res.setHeader('X-Frame-Options', 'ALLOW-FROM https://www.facebook.com/');
    }
    res.render(`${req.params.product}`, { product: req.params.product, psid: req.params.psid, name: `${req.params.name}`, package: 1 });
  }});

/* GET home page. */
router.get('/:product/:psid', (req, res) => {
  const referer = req.get('Referer');
  if (referer) {
    if (referer.indexOf('www.messenger.com') >= 0) {
      res.setHeader('X-Frame-Options', 'ALLOW-FROM https://www.messenger.com/');
    } else if (referer.indexOf('www.facebook.com') >= 0) {
      res.setHeader('X-Frame-Options', 'ALLOW-FROM https://www.facebook.com/');
    }
    res.render(`${req.params.product}`, { product: req.params.product, psid: req.params.psid, name: '', package: 1 });
  }});

router.post('/:product/:psid', (req, res) => {
  const body = req.body;
  database.insertPurchase(req.params.product, body, (success, result) => {
    let text = '';
    const itemDescript = body.howmany.split('-');
    if (success) {
      text = 'Thank you so much for shopping with us!! We will confirm the delivery and send you a message in a few days!';
      const payload = {
        template_type: 'receipt',
        sharable: true,
        recipient_name: body.name,
        order_number: result._id,
        currency: 'MYR',
        payment_method: 'Cash on delivery',
        address: {
          street_1: body.inputAddress,
          city: body.inputCity,
          postal_code: body.inputZip,
          state: body.inputState,
          country: 'MY'
        },
        summary: {
          total_cost: itemDescript[1].trim().substring(2)
        },
        elements: [
          {
            title: itemDescript[0].split('_').join(' '),
            subtitle: 'Preferences: ' + body.week + ' ' + body.time + '. ' +
                      'Note: ' + body.inputNote,
            price: itemDescript[1].trim().substring(2),
            currency: 'MYR',
            image_url: `${config.appUrl}/images/${req.params.product}.png`
          }
        ]
      };

      const receiptJson = requestJson.makeReceipt(req.params.psid, payload);
      requestSending.callSendAPI(requestJson.makeTextRequest(req.params.psid, text));
      requestSending.callSendAPI(receiptJson);
    } else {
      text = 'Oops! Looks like something has gone wrong.. Please click on order now to submit the form again.';
      res.status(200).send('Something has gone wrong. Please check and re-submit your form.');
      requestSending.callSendAPI(requestJson.makeTextRequest(req.params.psid, text));
    }
  });
});

module.exports = router;
