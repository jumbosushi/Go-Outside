// Cloned from https://github.com/cassidoo/clarifai-javascript-starter
module.exports = function (imgurl) {
  console.log("INSIDE clarifai.js!");
  console.log(imgurl);
  var $ = require('jQuery');
  //tags to be returned
  var result_tags;

  $(function () {
    console.log( 'jQuery loaded');
  });

  var LocalStorage = require('node-localstorage').LocalStorage,
  localStorage = new LocalStorage('./scratch');

  function getCredentials(cb) {
    console.log("getCredentials() is running!");
    var data = {
      grant_type: "client_credentials",
      client_id: "LPOXuuwXLHA2yZ7fBrN_DAHTsu26s2mR9h4DVmMa",
      client_secret: "VMEOyjHqQqIRRdpNL-o8wmfEpnsObF9ksIaPJ2Yt"
    };

    console.log("about to start ajax!");
    $.ajax({
      type: "POST",
      url: "https://api.clarifai.com/v1/token",
      data: data,
      timeout: 5000,
      success: function(data, textStatus ){
         console.log('Auth request successful');
      },
      error: function(xhr, textStatus, errorThrown){
         console.log(textStatus);
         console.log(errorThrown);
      }
    })
    .then(function(r) {
      localStorage.setItem('accessToken', r.access_token);
      localStorage.setItem('tokenTimestamp', Math.floor(Date.now() / 1000));
      console.log(("ajax in getCredentials ran!"));
      cb();
    });
  }

  function postImage(imgurl) {
    var data = {
      url: imgurl
    };
    var accessToken = localStorage.getItem('accessToken');
    console.log(accessToken);

    $.ajax({ // TODO This ajax is not running. Once it runs, everything should work
      type: "POST",
      url: "https://api.clarifai.com/v1/tag",
      headers: {
        Authorization: "Bearer " + accessToken
      },
      data: data
    }).then(function(r){
      console.log("ajax in postImage ran!");
      result_tags = parseResponse(r);
    });
  }

  function parseResponse(resp) {
    var tags = [];
    if (resp.status_code === 'OK') {
      var results = resp.results;
      tags = results[0].result.tag.classes;
      console.log("clarifai.js is parsing tags!");
    } else {
      console.log('Sorry, something is wrong.');
    }

    $('#tags').text(tags.toString().replace(/,/g, ', '));
    console.log("clarifai.js tags is about to be returned!");
    console.log(tags);
    result_tags = tags;
    return tags;
  }

  if (localStorage.getItem('tokenTimeStamp') - Math.floor(Date.now() / 1000) > 86400
      || localStorage.getItem('accessToken') === null) {
    getCredentials(function() {
      console.log("getCredentials callback is being called!");
      postImage(imgurl); // IMPLTMENT HIS !
    });
  } else {
    postImage(imgurl);
  }
  console.log("everything ran!");
  return result_tags;
}
