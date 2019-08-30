var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var createError = require('http-errors');
var config = require('./services/Config.js');
var Receive = require('./services/Receive.js');
var app = express();

// Page routers
var productRouter = require('./routes/products');

app.use(express.static('public'));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/product', productRouter);

// Set port
app.set('port', config.port);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Endpoint of webhook
app.post('/webhook', function (req, res) {
  const body = req.body;

  // Checks if it is an event from a page subscription
  if (body.object === 'page') {
    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');

    // Check is bot is on Standby else, handle message
    if (body.entry[0].standby) {
      console.log('INFO:', 'BOT ON STANDBY');
    } else {
      const messaging = body.entry[0].messaging[0];
      const senderPsid = messaging.sender.id;

      // if have message
      if (messaging.message || messaging.postback) {
        const receiveMessage = new Receive(senderPsid, messaging);
        return receiveMessage.handleMessage();
      }
    }
  } else {
    res.sendStatus(404);
  }
});

// Receive get requests for verification
app.get('/webhook', function (req, res) {
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (token && token === config.verifyToken) {
    // Responds with the challenge token from the request
    console.log('INFO:', 'WEBHOOK_VERIFIED');
    res.status(200).send(challenge);
  } else {
    // Responds with '403 Forbidden' if verify tokens do not match
    res.sendStatus(403);
  }
});

// create a health check endpoint
app.get('/health', function (req, res) {
  res.send('okay');
});

// Check if all env variables are set
config.checkEnvVariables();

http.createServer(app).listen(app.get('port'), function () {
  console.log('INFO:', 'Express server listening on port ' + app.get('port'));
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
