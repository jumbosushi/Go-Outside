var http = require('http');
var hellobot = require('./hellobot');
var express = require('express');
var bodyParser = require('body-parser');
var $ = require('jquery')(require("jsdom").jsdom().defaultView);
var ig = require('instagram-node').instagram({});
var Slack = require('node-slack');
var slack = new Slack("https://hooks.slack.com/services/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");

var app = express();
var port = process.env.PORT || 3000;

// hold access Token
var access_token;

// will contain user information
// key = user's subscription id | val = access_token
var users = {};
var user_name;

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
    console.log("DOES THIS PLACE HAVE USER ID???")
    console.log(req.body);
    var slash_text = req.body.text;
    if (slash_text == "login") {
        user_name = req.body.user_name; // store the username temporally
        slack.send({
            text: "<https://lit-journey-12058.herokuapp.com/authorize_user|Sign in from here!>"
        });
    } else if (slash_text == "stats") {
        for (id in users) {
            slack.send({
                text: users[id]["name"] + " has " + users[id]["score"] + " points!"
            });
        };
    } else {
        slack.send({
            text: "Can't recognize the tag. Try something else plz."
        });
        res.send("Slash tag can't be recognized");
    }
});

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
      access_token = result.access_token;
      slack.send({
            text: "Log in Successful!\n Welcome to Go Outside Challenge!"
      });
      // Instagram subscription
      // initializes the user profile
      ig.add_user_subscription('https://lit-journey-12058.herokuapp.com/user',
                               function(err, result, remaining, limit){
                                    users[result.id] = {"access": access_token,
                                                        "name": user_name,
                                                        "score": 0};
                                    console.log(users);
                               });
    }
  });
};


// This is where api initially send users to authorize
app.get('/authorize_user', exports.authorize_user);
// This is redirecting URI
app.get('/handleauth', exports.handleauth);


// ---------------------------------
// Instagram subscrription

// Subscribe the user when the user loggs in
app.get('/user', function(req, res) {
    slack.send({
            text: "Subcription Complete!"
    });
    // Instagram API completes subscription when 'hub.challenge' is send back
    res.send(req.query['hub.challenge']);
});

// Fired when any of the user uploads a new file.
// Check if the file uploaded counts as a point.
app.post('/user', function(req, res) {
    var sub_id = req.body[0]['subscription_id'];
    if (users[sub_id]) {
        slack.send({
            text: users[sub_id]["name"] + " submitted a new picture"
        });
    }
    //console.log("MEDIA ID");
    //console.log(req.body[0]['data']['media_id']);
    res.send("New activity from the subcription detected");
} );

// ----------------------------------

// Instagram recent API
// get the most url of the most recent picture

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
