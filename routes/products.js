var express = require('express');
var router = express.Router();
var database = require('../services/Database');
var requestSending = require('../services/RequestSending');
var requestJson = require('../services/RequestJson');

/* GET home page. */
router.get('/:product/:name', (req, res) => {
  const referer = req.get('Referer');
  if (referer) {
    if (referer.indexOf('www.messenger.com') >= 0) {
      res.setHeader('X-Frame-Options', 'ALLOW-FROM https://www.messenger.com/');
    } else if (referer.indexOf('www.facebook.com') >= 0) {
      res.setHeader('X-Frame-Options', 'ALLOW-FROM https://www.facebook.com/');
    }
    res.render(`${req.params.product}`, { name: `${req.params.name}` });
  }
});

/* GET home page. */
router.get('/:product', (req, res) => {
  const referer = req.get('Referer');
  if (referer) {
    if (referer.indexOf('www.messenger.com') >= 0) {
      res.setHeader('X-Frame-Options', 'ALLOW-FROM https://www.messenger.com/');
    } else if (referer.indexOf('www.facebook.com') >= 0) {
      res.setHeader('X-Frame-Options', 'ALLOW-FROM https://www.facebook.com/');
    }
    res.render(`${req.params.product}`, { name: '' });
  }
});

router.post('/:product/:psid', (req, res) => {
  const body = req.body;
  database.insertPurchase(req.params.product, body, (success, result) => {
    let text = '';
    if (success) {
      text = 'Thank you so much for shopping with us!! We will confirm the delivery and send you a message in a few days!';
      const payload = {
        template_type: 'receipt',
        receipient_name: body.name,
        order_number: result._id,
        currency: 'MYR',
        payment_method: 'Cash on delivery',
        timestamp: Date.now(),
        address: {
          street_1: body.inputAddress,
          city: body.inputCity,
          postal: body.inputZip,
          state: body.inputState,
          country: 'MY'
        },
        summary: {
          total_cost: 135
        },
        elements: [
          {
            title: body.howmany,
            price: 135
          }
        ]
      };

      const receiptJson = requestJson.makeReceipt(req.params.psid, payload);
      console.log(JSON.stringify(receiptJson));
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
