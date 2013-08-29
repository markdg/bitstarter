/* Module dependencies */

var express = require('express'),
    jade = require('jade');
    stylus = require('stylus');
    nib = require('nib');
    path = require('path'),
    http = require('http'),
    ItineraryProvider = require('./ItineraryProvider').ItineraryProvider;

var app = express();

function compile(str, path) {
    return stylus(str) .set('filename', path) .use(nib());
}

app.set('view engine', 'jade');
app.use(stylus.middleware({
    src: __dirname + '/public',
    compile: compile
}));
app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser());
app.use(express.methodOverride());


//===db stuff===

//markdg-bitstarter-s-mooc Config Vars from heroku cli inquiry
//MONGOHQ_URL: mongodb://heroku:366acce9fd196a673584b13acb417573@dharma.mongohq.com:10091/app17007481
//MONGOLAB_URI: mongodb://heroku_app17007481:ibp5bs8on9kgn8e6j07q8l4e86@ds037478.mongolab.com:37478/heroku_app17007481
//PATH:        bin:node_modules/.bin:/usr/local/bin:/usr/bin:/bin

//all of these have been tried and don't work
//var MONGOHQ_URL = ' mongodb://heroku:5953c7c83dcadf88b07ecf0605a5f71d@dharma.mongohq.com:10091/app17007481';
//var itineraryProvider = new ItineraryProvider(MONGOHQ_URL, 10091);
//var itineraryProvider = new ItineraryProvider(process.env.MONGOHQ_URL, 27017);
//var MONGOLAB_URI = 'mongodb://heroku_app17007481:ibp5bs8on9kgn8e6j07q8l4e86@ds037478.mongolab.com:37478/heroku_app17007481';
//var MONGOLAB_HOST = 'ds037478.mongolab.com';
//var itineraryProvider = new ItineraryProvider(MONGOLAB_HOST, 37478);

//the following works both on my local machine and my EC2 instance but not heroku
var itineraryProvider = new ItineraryProvider('localhost', 27017);

//=== end db stuff

//db test page
app.get('/db', function(req, res){
  res.render('db');
});
//db test connection just outputs a message
app.get('/dbconnect', function(req, res){
  console.log('test db connection');
  res.redirect('db');
});
//invoke the getCollection method
app.get('/getCollection', function(req, res){
  itineraryProvider.getCollection();
  res.redirect('db');
});
//invoke the findAll method
app.get('/findAll', function(req, res){
  itineraryProvider.findAll();
  res.redirect('db');
});
//===


//render the bitstarter page
app.get('/', function(req, res){
  res.render('bitstarter', {title: 'Bitstarter Home'});
});

//render the prototype home page with saved itineraries in listModal
app.get('/protohome', function(req, res){
  itineraryProvider.findAll(function(error, itins) {
    res.render('protohome', {
      title: 'Your Saved Itineraries',
      itineraries:itins
    });
  });
});

//add a new itinerary
app.get('/itinerary/new', function(req, res) {
  res.render('itinerary_new', {
    title: 'New Itinerary'
  });
});

//list saved itineraries
app.get('/protolist', function(req, res){
  itineraryProvider.findAll(function(error, itins) {
    res.render('index', {
      title: 'Your Saved Itineraries',
      itineraries:itins
    });
  });
});

//save new itinerary
app.post('/protohome', function(req, res) {
  itineraryProvider.save( {
    name: req.param('name'),
    location: req.param('location'),
    sites: req.param('sites')
  }, function(error, docs) {
    res.redirect('/protohome')
  });
});

//update an itinerary
app.get('/itinerary/:id/edit', function(req, res) {
  itineraryProvider.findById(req.param('_id'), function(error, itin) {
    res.render('itinerary_edit', {
      //title: 'Edit Itinerary',
      //name: 'name',
      itinerary: itin
    });
  });
});

//save an updated itinerary
app.post('/itinerary/:id/edit', function(req, res) {
  itineraryProvider.update(req.param('_id'), {
    name: req.param('name'),
    location: req.param('location'),
    sites: req.param('sites')
  }, function(error, docs) {
    res.redirect('/protohome')
  });
});

//delete an intinerary
app.post('/itinerary/:id/delete', function(req, res) {
  itineraryProvider.delete(req.param('_id'), function(error, docs) {
    res.redirect('/protohome')
  });
});


var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("proto.js listening on port " + port);
});
