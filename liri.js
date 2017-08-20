// Twitter API
var Twitter = require('twitter');
var keys = require("./keys.js");

function getTweets() {
  // console.log(keys.twitterKeys);
  var client = new Twitter(keys.twitterKeys);

  client.get('statuses/user_timeline.json?screen_name=johnasmith451&count=2', function(error, tweets, response) {
    if (error) throw error;
    console.log("**********TWEETS**********")

    for (i = 0; i < tweets.length; i++) {
      console.log('Time: ' + tweets[i].created_at);
      console.log('Text: ' + tweets[i].text);
      console.log('');
    }
  });
}
//spotify
// keys.spotifyKeys
var Spotify = require('node-spotify-api');

var spotify = new Spotify(keys.spotifyKeys);
var query = "The Sign";

spotify.search({ type: 'track', query: query }, function(err, data) {
  if (err) {
    return console.log('Error occurred: ' + err);
  }

  // console.log(data.tracks.items[0]);
  for (i = 0; i < (data.tracks.items).length; i++) {
    if (query.toUpperCase() === (data.tracks.items[i].name).toUpperCase()) {
      console.log("Found your song: " + data.tracks.items[i].name);
      console.log('The artist: ' + data.tracks.items[i].artists[0].name);
      console.log('Sample link: ' + data.tracks.items[i].preview_url);
      console.log('Album: ' + data.tracks.items[i].album.name + ' Track: ' + data.tracks.items[i].track_number);
      var found = true;
      break;
    }
  }
  found ? found = false : console.log("Could not find your song. Did you mean " + data.tracks.items[0].name + "?");
});