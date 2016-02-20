// Express dependencies
var http = require('http');
var clarifai = require('./clarifai');
var insta = require('./instagram');
var sm = require('./slack_message')
var express = require('express');
var bodyParser = require('body-parser');
var $ = require('jQuery');
var ig = require('instagram-node').instagram({});
var Slack = require('node-slack');
var xml = require('xmlhttprequest');
var slack = new Slack("https://hooks.slack.com/services/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");

var app = express();
var port = process.env.PORT || 3000;

var access_token; // hold the access Token of a user
var users = {}; // key = user's subscription id,  val = access_token
var user_name;
var user_id;


// Joey's random talks
var shit_joey_say = {
    // found on http://iandolij.tumblr.com/post/50120585724/shit-hikers-say
    0: "Hike your own hike, man",
    1: "What’s your base weight",
    2: "How do you purify",
    3: "It’s smiles not miles",
    4: "No rain no pain no Maine",
    5: "How’s the water source look?",
    6: "How many miles you doing today",
    7: "Dang It smells like hiker in here",
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

// body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Slash commands
app.post('/slash',

// -------------------------------------------

// Instagram Authentification
// overide instagram authentification
ig.use({
    client_id: "bd09eab6bd9b4c9daf691a550faf04a9",
    client_secret: "95b76f3db7314eaea2bfefd9569a33ec"
});

// api initially send users to authorize
app.get('/authorize_user', insta.authorize_user);
// redirecting URI is handled here
app.get('/handleauth', insta.handleauth);


// ---------------------------------
// Instagram subscrription API

// Subscribe the user when the user loggs in
app.get('/user', function (req, res) {
    slack.send({
        text: "You're part of the club! \n Remember, " +
              "the first rule of Go Outside Club is to always talk about Go Outside Club" +
              "I will let yall know if anyone put up an outdoor picture." +
              "Hope to see your's first!"
    });
    // Instagram API completes subscription when 'hub.challenge' is send back
    res.send(req.query['hub.challenge']);
});

// Fired when any of the registered user uploads a new file.
// Check if the file uploaded counts as a point.
app.post('/user', function (req, res) {
    var sub_id = req.body[0]['subscription_id'];
    if (users[sub_id]) {
        slack.send({
            text: "Looks like " + users[sub_id]["name"] + " submitted a new picture"
        });
        console.log(users[sub_id]["access"]);
        var temp_result = getImgUrl(users[sub_id]["access"]);
        check_outdoor(temp_result, users[sub_id]["name"], users[sub_id]);
    };
    res.send("New activity from the subcription detected");
});

function getImgUrl(access) {
    var url_param = $.param({
        access_token: access
    })
    $.get('https://api.instagram.com/v1/users/self/media/recent/' + '?' + url_param,
        function (result) {
            var temp_url = result.data[0].images.standard_resolution.url;
            console.log(temp_url);
            var img_url = temp_url.split("?")[0];
            console.log(img_url);
            var result = clarifai.run(img_url);
            console.log(result);
            return result;
        });
};

// check if the picture was take outside
// if so, the user get a point
function check_outdoor(result, name, user) {
    result = result.split(", ");
    for (var tag in result) {
        if (tag == "outside" || tag == "street") {
            slack.send({
                text: name + " did it! Way to go for being outside! (wait wut?)" + "You get 1 points."
            });
            user["score"] += 1;
            return;
        }
    };
};

// -------------------------------------

// test route
app.get('/', function (req, res) {
    res.status(200).send('Hello World!')
});

// error handler
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(400).send(err.message);
});

app.listen(port, function () {
    console.log('Slack bot listening on port ' + port);
})
