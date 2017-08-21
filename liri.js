var request = require('request');
var keys = require('./keys.js');
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var fs = require('fs');
var inquirer = require('inquirer');
var moment = require('moment');
var command = process.argv[2];
var query = process.argv[3];

if (command) {
  doStuff(command, query);
} else {
  whatToDo();
}

// User Interface
function whatToDo() {
  inquirer
    .prompt([{
      type: 'list',
      message: 'What would you like to do?',
      choices: ['Exit', 'my-tweets', 'spotify-this-song', 'movie-this', 'do-what-it-says'],
      name: 'command'
    }]).then(function(inquirerResponse) {
      switch (inquirerResponse.command) {
        case 'my-tweets':
        case 'do-what-it-says':
          doStuff(inquirerResponse.command);
          break;
        case 'spotify-this-song':
          defineQuery(inquirerResponse.command, 'song');
          break;
        case 'movie-this':
          defineQuery(inquirerResponse.command, 'movie');
          break;
        case 'Exit':
          endPoint()
          break;
      }
    });
}

function defineQuery(command, question) {
  inquirer
    .prompt([{
      type: 'input',
      message: 'What is the title of the ' + question + '?',
      name: 'query'
    }])
    .then(function(inquirerResponse) {
      doStuff(command, inquirerResponse.query);
    });
}

function doStuff(command, query) {
  switch (command) {
    case 'my-tweets':
      logger('my-tweets');
      getTweets();
      break;
    case 'spotify-this-song':
      logger('spotify-this-song ' + query);
      getSpotify(query);
      break;
    case 'movie-this':
      logger('movie-this ' + query);
      getOMDB(query);
      break;
    case 'do-what-it-says':
      logger('do-what-it-says');
      getRandom();
      break;
    default:
      logger(command + ' is not a valid command!');
      whatToDo();
  }
}

function getRandom() {
  fs.readFile('random.txt', 'utf8', function(error, data) {
    if (error) {
      return console.log(error);
    }
    var dataArr = data.split(',');
    command = dataArr[0];
    query = dataArr[1];
    doStuff(command, query);
  });
}

// Twitter API
function getTweets() {
  var client = new Twitter(keys.twitterKeys);
  client.get('statuses/user_timeline.json?screen_name=johnasmith451&count=20', function(error, tweets, response) {
    if (error) throw error;
    displayTweets(tweets);
  });
}

function displayTweets(tweets) {
  logger('');
  logger('**********TWEETS**********')
  logger('');
  for (i = 0; i < tweets.length; i++) {
    var dateTime = new Date(tweets[i].created_at);
    logger('Time: ' + moment(dateTime).local().format('YYYY-MM-DD hh:mm:ss A'));
    logger('Text: ' + tweets[i].text);
    logger('');
  }
  whatToDo();
}

//spotify
function getSpotify(query) {
  //if query truthy,query=query,else The Sign
  query = query ? query = query : query = 'The Sign';
  query = query.replace(/["']+/g, '');
  var spotify = new Spotify(keys.spotifyKeys);
  spotify.search({ type: 'track', query: query }, function(err, data) {
    if (err) {
      return console.log('Error occurred: ' + err);
    }
    if ((data.tracks.items).length === 0) {
      logger('Your song was not found.');
      whatToDo();
    } else {
      displaySpotify(data, query);
    }
  });
}

function displaySpotify(data, query) {
  var found = false;
  for (i = 0; i < (data.tracks.items).length; i++) {
    if (query.toUpperCase() === (data.tracks.items[i].name).toUpperCase()) {
      logger('Found your song: ' + data.tracks.items[i].name);
      logger('The artist: ' + data.tracks.items[i].artists[0].name);
      data.tracks.items[i].preview_url ? logger('Sample link: ' + data.tracks.items[i].preview_url) : logger('No sample available.');
      logger('Album: ' + data.tracks.items[i].album.name + ' Track: ' + data.tracks.items[i].track_number);
      found = true;
      break;
    }
  }
  found ? whatToDo() : songNotFound(data.tracks.items[0].name);
}

function songNotFound(firstLookup) {
  inquirer
    .prompt([{
      type: 'confirm',
      message: 'Could not find your song. Did you mean ' + firstLookup + '?',
      name: 'confirm',
      default: true
    }])
    .then(function(inquirerResponse) {
      if (inquirerResponse.confirm) {
        doStuff('spotify-this-song', firstLookup);
      } else {
        logger('Your song was not found.');
        whatToDo();
      }
    });
}

// OMDB API
function getOMDB() {
  query = query ? query = query : query = 'Mr. Nobody';
  query = query.replace(/["']+/g, '');
  var queryString = query.replace(/ /g, '+');
  request('http://www.omdbapi.com/?t=' + queryString + '&y=&plot=short&apikey=' + keys.omdbapiKey, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      displayOMDB(body)
    }
  });
}

function displayOMDB(body) {
  var data = JSON.parse(body);
  if (data.Title) {
    logger('Title: ' + data.Title);
    logger('Year: ' + data.Year);
    logger('IMDB rating: ' + data.Ratings[0].Value);
    data.Ratings[1]?logger('Rotten Tomatoes: ' + data.Ratings[1].Value):logger('Rotten Tomatoes has not rated this film');
    logger('Country: ' + data.Country);
    logger('Language: ' + data.Language);
    logger('Plot: ' + data.Plot);
    logger('Actors: ' + data.Actors);
  } else {
    logger('No movie with that title was found');
  }
  whatToDo();
}

function logger(message) {
  console.log(message);
  var logdate = new Date();
  logdate = moment(logdate).format('YYYYMMDD HH:mm:ss');
  // using appendFileSync to make sure logs are created in order
  fs.appendFileSync('log.txt', '[' + logdate + ']' + message + '\n', 'utf8',function(err) {
    if (err) {
      return console.log(err);
    }
  });
}

function endPoint() {
  console.log('Goodbye!');
}