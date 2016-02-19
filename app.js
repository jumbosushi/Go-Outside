var http = require('http');
var clarifai = require('./clarifai');
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

// Joey's random words
var shit_hikers_say = {
    // found on http://iandolij.tumblr.com/post/50120585724/shit-hikers-say
    0: "Hike your own hike, man",
    1: "What’s your base weight",
    2: "How do you purify",
    3: "It’s smiles not miles",
    4: "No rain no pain no Maine",
    5: "How’s the water source look?",
    6: "How many miles you doing today",
    7: "Dang It smells like hiker in here" ,
    8: "How’s the privy look",
    9: "No bear cables?",
    10: "Duck the smokeys",
    11: "When’s the next resupply",
    12: "What day is it",
    13: "Tent or shelter",
    14: "Yo let's dig a hole",
    15: "What’s the weather look like today?",
    16: "Man I’m craving a burger",
    17: "First world problem",
    18: "COCONUT OIL. nuff said",
    19: "Skinny white guy with the beard",
    20: "You got a lighter",
    21: "Is that ultra light",
    22: "Fire drill",
    23: "How much weight you loose",
    24: "That’s an unsolicited pro-tip",
    25: "Who makes that",
    26: "White gas or alcohol",
    27: "Where’s the closest place I can get butter chicken",
    28: "We could hitch?",
    29: "I'm a professional zombie hunter \n Have you seen zombie recently? Yeah, you're welcome"
}

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
  client_secret: "95b76f3db7314eaea2bfefd9569a33ec"
});

// Slash commands
app.post('/slash', function (req, res) {

    var slash_text = req.body.text;
    console.log(slash_text);
    // "login" - let the user log in
    if (slash_text == "login") {
        user_name = req.body.user_name; // store the username temporally
        user_id = req.body.user_id; // store the user_id temporally
        slack.send({
            text: "<https://lit-journey-12058.herokuapp.com/authorize_user|Join the party!>" +
                  "\n You'll need your insagram account."//TODO
        });

    // "stats" - show the current standing of people in the game
    } else if (slash_text == "stats") {
        for (id in users) {
            slack.send({
                text: users[id]["name"] + " has " + users[id]["score"] + " points!"
            });
        };

    // coconut oil
    } else if (slash_text == "coconut oil") {
        for (id in users) {
            slack.send({
                text: "Now you're speaking my language"
            });
        };

    // Joey also talks with no tag as well
    } else if (slash_text == "")  {
        slack.send({
                text: shit_hikers_say[(Math.random() * 30 )]
        });

       // else return something else
    } else {
        slack.send({
            text: "Hmm not sure what tag that is. You mean Bacon?"
        });
    }
    res.end();
});


// Authorize the user by redirecting user to sign in page
exports.authorize_user = function(req, res) {
    res.redirect(ig.get_authorization_url(redirect_uri))
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
            text: "Log in Successful!\n Welcome to Go Outside homie!"
      });
    }
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
  res.end('It worked!');
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
            text: "You're part of the club! \n Remember, the first rule of Go Outside Club is to always talk about Go Outside Club"
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
