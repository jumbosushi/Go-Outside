var http = require('http');
var hellobot = require('./hellobot');
var express = require('express');
var bodyParser = require('body-parser');
//var $ = require('jQuery');
var ig = require('instagram-node').instagram();
var Slack = require('node-slack');
var slack = new Slack(hook_url,options);

var app = express();
var port = process.env.PORT || 3000;

// --------------------------------
// Instagram Authentification
// Overide instagram authentification
ig.use({
  client_id: "bd09eab6bd9b4c9daf691a550faf04a9",
  client_secret: "e37f5afad6e74ac5906380de076da0d4"
});

var redirect_uri = "https://lit-journey-12058.herokuapp.com/handleauth";

exports.authorize_user = function(req, res) {
  res.redirect(ig.get_authorization_url(redirect_uri, { scope: ['likes'], state: 'a state' }));
};

exports.handleauth = function(req, res) {
  ig.authorize_user(req.query.code, redirect_uri, function(err, result) {
    if (err) {
      console.log(err.body);
      res.send("Didn't work");
    } else {
      console.log('Yay! Access token is ' + result.access_token);
      res.send('You made it!!');
    }
  });
};


// This is where you would initially send users to authorize
app.get('/authorize_user', exports.authorize_user);
// This is redirect URI
app.get('/handleauth', exports.handleauth);

// ---------------------------------



// body parser middleware
app.use(bodyParser.urlencoded({ extended: true}));

// test route
app.get('/', function (req, res) { res.status(200).send('Hello World!') });

// error handler
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(400).send(err.message);
});

app.listen(port, function () {
    console.log('Slack bot listening on port ' + port);
})

// handle the "hello" api call
app.post('/hello', hellobot);
