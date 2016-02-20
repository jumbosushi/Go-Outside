
var $ = require('jQuery');
var ig = require('instagram-node').instagram({});

// All Instagram Modules should be moved her
module.exports = {

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
                    },

    // authorize the user by redirecting user to sign in page
    authorize_user = function (req, res) {
                        res.redirect(ig.get_authorization_url(redirect_uri))
                    }
}
