var http = require('http');
var hellobot = require('./hellobot');
var express = require('express');
var bodyParser = require('body-parser');
//var $ = require('jQuery');
var ig = require('instagram-node').instagram();
var Slack = require('node-slack');
var slack = new Slack("https://hooks.slack.com/services/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");

var app = express();
var port = process.env.PORT || 3000;

// body parser middleware
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());


// --------------------------------
// Instagram Authentification
// Overide instagram authentification
ig.use({
  client_id: "bd09eab6bd9b4c9daf691a550faf04a9",
  client_secret: "e37f5afad6e74ac5906380de076da0d4"
});

// Slash command login
app.post('/slash', function (req, res) {
    if (req.query.text == "login") {
        slack.send({
            text: "<https://lit-journey-12058.herokuapp.com/authorize_user|Sign in from here!>"
        });
        res.send("Login slash tag detected")
    } else {
        slack.send({
            text: "Can't recognize the tag. Try something else plz."
        });
        res.send("Slash tag can't be recognized");
    }
});

// Below links kept here for testing purposes
//https://lit-journey-12058.herokuapp.com/handleauth
//http://localhost:3000/handleauth
var redirect_uri = "https://lit-journey-12058.herokuapp.com/handleauth";

// Authorize the user by redirecting user to sign in page
exports.authorize_user = function(req, res) {
  res.redirect(ig.get_authorization_url(redirect_uri,
                                        { scope: ['likes'],
                                          state: 'a state' }));
};

// Send message on #general that the user is signed in
exports.handleauth = function(req, res) {
  ig.authorize_user(req.query.code, redirect_uri, function(err, result) {
    if (err) {
      console.log(err.body);
      res.send("Didn't work");
      slack.send({
            text: "Login Unseccessful :("
      });
    } else {
      console.log('Yay! Access token is ' + result.access_token);
      slack.send({
            text: "Log in Successful!\n Welcome to Go Outside Challenge!"
      });
      // Instagram subscription
      ig.add_user_subscription('https://lit-journey-12058.herokuapp.com/user',
                               function(err, result, remaining, limit){});
    }
  });
};


// This is where pi initially send users to authorize
app.get('/authorize_user', exports.authorize_user);
// This is redirect URI
app.get('/handleauth', exports.handleauth);

// ---------------------------------

// Instagram subscrription API endpoints

app.get('/user', function(req, res) {
    slack.send({
            text: "I subscribed to the feed!"
    });
    ig.subscriptions(function(err, subscriptions, remaining, limit){
    console.log(subscriptions);
});
});

app.post('/user', function(req, res) {
    slack.send({
            text: "There's a new picture!"
    });
} );

// ----------------------------------

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

// handle the "hello" api call (test case)
app.post('/hello', hellobot);
