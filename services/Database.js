var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb+srv://lweikang96:S9605967a@cluster0-f52b9.mongodb.net/test?retryWrites=true&w=majority';

module.exports = class Database {
  static insertPurchase (product, body, cb) {
    console.log('INFO:', 'Inserting purchase with data');
    let note = null;
    if (body.note !== undefined) {
      note = body.note.split(',').join('、');
    }
    var data = {
      productName: product,
      combo: body.howmany,
      name: body.name.split(',').join(' '),
      phone: body.phonenumber,
      state: body.inputState.split(',').join(' '),
      city: body.inputCity.split(',').join(' '),
      zip: body.inputZip.split(',').join(' '),
      address: body.inputAddress.split(',').join(' '),
      preference: body.week,
      time: body.time,
      note: note
    };
    MongoClient.connect(url, function (err, client) {
      var db = client.db('purchaseOrder');
      if (err) {
        console.error('ERROR:', 'Unable to connect to database');
      } else {
        var collection = db.collection('purchase');
        collection.insertOne(data, function (err, result) {
          console.log(result.ops[0]._id);
          if (err) {
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

  static getSizeImageUrl (product, cb) {
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
            cb(result.sizeImageUrl);
          }
        });
      }
      client.close();
    });
  }

  static getLearnMoreUrls (product, cb) {
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

  static getBuyingType (product, cb) {
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
            console.log('INFO:', 'Success retrieval of data', result.buyingType);
            cb(result.buyingType);
          }
        });
      }
      client.close();
    });
  }

  static getInfo (productName, type, cb) {
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
        collection.findOne({ productName: productName }, (err, result) => {
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
};
