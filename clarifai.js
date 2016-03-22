// Cloned from https://github.com/cassidoo/clarifai-javascript-starter
module.exports = function (imgurl) {
  console.log("INSIDE clarifai.js!");
  console.log(imgurl);

  var $ = require('jQuery');

  var LocalStorage = require('node-localstorage').LocalStorage,
  localStorage = new LocalStorage('./scratch');

  function getCredentials(cb) {
    console.log("getCredentials() is running!");
    var data = {
      'grant_type': 'client_credentials',
      'client_id': "LPOXuuwXLHA2yZ7fBrN_DAHTsu26s2mR9h4DVmMa",
      'client_secret': "VMEOyjHqQqIRRdpNL-o8wmfEpnsObF9ksIaPJ2Yt"
    };

    return $.ajax({
      'url': 'https://api.clarifai.com/v1/token',
      'data': data,
      'type': 'POST'
    })
    .then(function(r) {
      localStorage.setItem('accessToken', r.access_token);
      localStorage.setItem('tokenTimestamp', Math.floor(Date.now() / 1000));
      console.log(("ajax in getCredentials ran!"));
      cb();
    });
  }

  function postImage(imgurl) {
    console.log("postImage is running!!");
    var data = {
      'url': imgurl
    };
    var accessToken = localStorage.getItem('accessToken');
    console.log(accessToken);

    return $.ajax({
      'type': 'POST'.
      'url': 'https://api.clarifai.com/v1/tag',
      'headers': {
        'Authorization': 'Bearer ' + accessToken
      },
      'data': data
    }).then(function(r){
      console.log(r);
      parseResponse(r);
    });
  }

  function parseResponse(resp) {
    var tags = [];
    if (resp.status_code === 'OK') {
      var results = resp.results;
      tags = results[0].result.tag.classes;
      console.log("clarifai.js working ok!");
    } else {
      console.log('Sorry, something is wrong.');
    }

    $('#tags').text(tags.toString().replace(/,/g, ', '));
    console.log("clarifai.js tags is about to be returned!");
    return tags;
  }

  if (localStorage.getItem('tokenTimeStamp') - Math.floor(Date.now() / 1000) > 86400
      || localStorage.getItem('accessToken') === null) {
    getCredentials(function() {
      return postImage(imgurl);
    });
  } else {
    return postImage(imgurl);
  }
}
