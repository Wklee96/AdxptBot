var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb+srv://lweikang96:S9605967a@cluster0-f52b9.mongodb.net/test?retryWrites=true&w=majority';

module.exports = class Database {
  static insertPurchase(body, cb) {
    console.log('INFO:', 'Inserting purchase with data');
    let note = null;
    if (body.inputNote !== undefined) {
      note = body.inputNote.split(',').join('、');
    }
    var date = new Date();
    var dd = date.getDate();
    var hours = date.getHours() + 8;
    if (hours >= 0 && hours < 8) {
      dd++;
    }
    dd = String(dd).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0');
    var yyyy = date.getFullYear();

    var today = dd + '/' + mm + '/' + yyyy;
    var productDescript = body.howmany.split('_');
    var productName = productDescript[0];
    var quantity = productDescript[1].substring(0, 1);
    var data = {
      dateOrdered: today,
      timeOrdered: String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0') + ':' + String(date.getSeconds()).padStart(2, '0'),
      productName: productName,
      quantity: quantity,
      combo: productDescript.join(' '),
      name: body.name,
      phone: body.phonenumber,
      state: body.inputState,
      city: body.inputCity,
      zip: body.inputZip,
      address: body.inputAddress,
      preference: body.week,
      preferredTime: body.time,
      note: note,
      exportToGS: false
    };
    MongoClient.connect(url, function (err, client) {
      var db = client.db('purchaseOrder');
      if (err) {
        console.error('ERROR:', 'Unable to connect to database');
      } else {
        var collection = db.collection('purchase');
        collection.insertOne(data, function (err2, result) {
          console.log(result.ops[0]._id);
          if (err2) {
            console.error('ERROR:', 'Unable to insert data to database');
          } else {
            console.log('INFO:', 'Success insert into database');
            cb(true, result.ops[0]);
          }
          client.close();
        });
      }
    });
  }

  static getLearnMoreUrls(product, cb) {
    MongoClient.connect(url, function (err, client) {
      var db = client.db('purchaseOrder');
      if (err) {
        console.error('ERROR:', 'Unable to connect to database');
      } else {
        var collection = db.collection('products');
        collection.findOne({ productName: product }, (err, result) => {
          if (err || !result) {
            console.error('ERROR:', 'Unable to retrieve data from database');
          } else {
            console.log('INFO:', 'Success retrieval of data', result);
            cb(result.learnMoreImageUrls);
          }
        });
      }
      client.close();
    });
  }

  static getInfo(productName, type, cb) {
    let info;
    switch (type) {
      case 'UI':
        info = 'usageInstructions';
        break;
      case 'DI':
        info = 'deliveryInformation';
        break;
      case 'CR':
        info = 'customerReviews';
        break;
    }
    MongoClient.connect(url, function (err, client) {
      var db = client.db('purchaseOrder');
      if (err) {
        console.error('ERROR:', 'Unable to connect to database');
      } else {
        var collection = db.collection('products');
        collection.findOne({ productTag: productName }, (err, result) => {
          if (err || !result) {
            console.error('ERROR:', 'Unable to retrieve data from database');
          } else {
            console.log('INFO:', 'Success retrieval of data', result[info]);
            cb(result[info]);
          }
        });
      }
      client.close();
    });
  };

  static getProduct (productTag, cb) {
    MongoClient.connect(url, function (err, client) {
      var db = client.db('purchaseOrder');
      if (err) {
        console.error('ERROR:', 'Unable to connect to database');
      } else {
        var collection = db.collection('products');
        collection.findOne({ productTag: productTag }, (err, result) => {
          if (err || !result) {
            console.error('ERROR:', 'Unable to retrieve data from database');
          } else {
            console.log('INFO:', 'Success retrieval of data', result);
            cb(result);
          }
        });
      }
      client.close();
    });
  };

  static addProduct (product, cb) {
    MongoClient.connect(url, function (err, client) {
      var db = client.db('purchaseOrder');
      if (err) {
        console.error('ERROR:', 'Unable to connect to database');
      } else {
        console.log(product);
        var collection = db.collection('products');
        collection.insertOne(product);
        cb();
      }
      client.close();
    });
  }
};
