var http = require('http');
var clarifai = require('clarifai');
var hellobot = require('./hellobot');
var express = require('express');
var bodyParser = require('body-parser');
var $ = require('jQuery');
var ig = require('instagram-node').instagram({});
var Slack = require('node-slack');
var xml = require('xmlhttprequest');
var slack = new Slack("https://hooks.slack.com/services/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");

var app = express();
var port = process.env.PORT || 3000;

// hold access Token
var access_token;

// will contain user information
// key = user's subscription id | val = access_token
var users = {};
var user_name;
var user_id;

// for Instagram API
var redirect_uri = "https://lit-journey-12058.herokuapp.com/handleauth"; //TODO
// http://localhost:3000/
// https://lit-journey-12058.herokuapp.com/handleauth

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
    var slash_text = req.body.text;
    if (slash_text == "login") {
        user_name = req.body.user_name; // store the username temporally
        user_id = req.body.user_id; // store the user_id temporally
        slack.send({
            text: "<https://lit-journey-12058.herokuapp.com/authorize_user|Sign in from here!>" //TODO
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
      ig.add_user_subscription('https://lit-journey-12058.herokuapp.com/user', //TODO
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
// Instagram subscrription API

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
        console.log(users[sub_id]["access"]);
        getImgUrl(users[sub_id]["access"]);
    };
    res.send("New activity from the subcription detected");
    }
);

function getImgUrl(access) {

    var url_param = $.param({access_token: access})
    $.get('https://api.instagram.com/v1/users/self/media/recent/' + '?' + url_param,
         function(result) {
             var temp_url = result.data[0].images.standard_resolution.url;
             console.log(temp_url);
             var img_url = temp_url.split("?")[0];
             console.log(img_url);
             var result = clarifai.run(img_url);
            console.log(result);
         });
};

// -------------------------------------

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
