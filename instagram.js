var http = require('http');
var $ = require('jQuery');
var ig = require('instagram-node').instagram({});
var Slack = require('node-slack');
var slack = new Slack("https://hooks.slack.com/services/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");

// for Instagram API
var redirect_uri = "https://lit-journey-12058.herokuapp.com/handleauth";

// overide instagram authentification
ig.use({
    client_id: "bd09eab6bd9b4c9daf691a550faf04a9",
    client_secret: "95b76f3db7314eaea2bfefd9569a33ec"
});

var access_token; // hold the access Token of a user
var users = {}; // key = user's subscription id,  val = access_token
var user_name;
var user_id;

// All Instagram Modules should be moved her
module.exports = {


    // authorize the user by redirecting user to sign in page
    authorize_user: function (req, res) {
                        res.redirect(ig.get_authorization_url(redirect_uri))
                    },

    // send message on #general that the user is signed in
    handleauth: function (req, res) {
                    ig.authorize_user(req.query.code, redirect_uri, function (err, result) {
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
                                text: "Log in Successful!\n Welcome to Go Outside homie!" +
                                      "\n Wait a moment till your Instagram is subscribed to the game"
                            });
                        };
                     });
                        // Instagram subscription
                        // initializes the user profile
                        ig.add_user_subscription('https://lit-journey-12058.herokuapp.com/user',
                            function (err, result, remaining, limit) {
                                users[result.id] = {
                                    "access": access_token,
                                    "name": user_name,
                                    "score": 0
                                };
                                console.log(users);
                        });
                        res.end('Joey is proud of ya');
                    }
}
