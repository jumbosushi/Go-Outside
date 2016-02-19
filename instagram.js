var redirect_uri = "https://lit-journey-12058.herokuapp.com/";

module.exports.authorize_user = function(req, res) {
  res.redirect(ig.get_authorization_url(redirect_uri, { scope: ['likes'], state: 'a state' }));
};

module.exports.handleauth = function(req, res) {
  ig.authorize_user(req.query.code, redirect_uri, function(err, result) {
    if (err) {
      console.log(err.body);
      return res.send("Didn't work");
    } else {
      console.log('Yay! Access token is ' + result.access_token);
      return res.send('You made it!!');
    }
  });
};
