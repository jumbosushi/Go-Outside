// Cloned from https://github.com/cassidoo/clarifai-javascript-starter
var $ = require('jQuery');
var LocalStorage = require('node-localstorage').LocalStorage,
localStorage = new LocalStorage('./scratch');

function getCredentials(cb) {
  var data = {
    'grant_type': 'client_credentials',
    'client_id': "YOUR_ID",
    'client_secret': "YOUR_SECRET"
  };

  return $.ajax({
    'url': 'https://api.clarifai.com/v1/token',
    'data': data,
    'type': 'POST'
  })
  .then(function(r) {
    localStorage.setItem('accessToken', r.access_token);
    localStorage.setItem('tokenTimestamp', Math.floor(Date.now() / 1000));
    cb();
  });
}

function postImage(imgurl) {
  var data = {
    'url': imgurl
  };
  var accessToken = localStorage.getItem('accessToken');

  return $.ajax({
    'url': 'https://api.clarifai.com/v1/tag',
    'headers': {
      'Authorization': 'Bearer ' + accessToken
    },
    'data': data,
    'type': 'POST'
  }).then(function(r){
    parseResponse(r);
  });
}

function parseResponse(resp) {
  var tags = [];
  if (resp.status_code === 'OK') {
    var results = resp.results;
    tags = results[0].result.tag.classes;
  } else {
    console.log('Sorry, something is wrong.');
  }

  $('#tags').text(tags.toString().replace(/,/g, ', '));
  return tags;
}


module.exports = {
    run: function run(imgurl) {
          if (localStorage.getItem('tokenTimeStamp') - Math.floor(Date.now() / 1000) > 86400
            || localStorage.getItem('accessToken') === null) {
            getCredentials(function() {
              postImage(imgurl);
            });
          } else {
            postImage(imgurl);
          }
        }
}
