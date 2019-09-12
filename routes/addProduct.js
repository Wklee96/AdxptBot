var express = require('express');
var router = express.Router();
var database = require('../services/Database');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.render('addProduct');
});

router.post('/', function (req, res, next) {
  var num = ['One', 'Two', 'Three', 'Four', 'Five', 'Six'];
  var product = req.body;
  console.log(product);
  for (var i = 0; i < product.productTypes.length; i++) {
    var obj = product.productTypes[i];
    obj.value = product.productName + '_' + obj.text;
    obj.inputId = 'combo' + num[i];
  }
  database.addProduct(product, (result) => {
    res.send(product);
  });
});

module.exports = router;
