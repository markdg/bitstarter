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

console.log(process.env.MONGOHQ_URL);
var MONGOHQ_URL = 'mongodb://markdg:testpwd1@dharma.mongohq.com:10091/app17007481'
console.log(process.env.MONGOHQ_URL);

var itineraryProvider = new ItineraryProvider(MONGOHQ_URL, 27017);
//var itineraryProvider = new ItineraryProvider(process.env.MONGOHQ_URL, 27017);
//var itineraryProvider = new ItineraryProvider('localhost', 27017);

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
