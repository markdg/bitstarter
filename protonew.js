/* Module dependencies */

var express = require('express'),
    jade = require('jade');
    stylus = require('stylus');
    nib = require('nib');
    path = require('path'),
    http = require('http'),
    ItineraryProvider = require('./ItineraryProvider2').ItineraryProvider,
    MongoClient = require('mongodb').MongoClient;

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

//mongodb://heroku:366acce9fd196a673584b13acb417573@dharma.mongohq.com:10091
//var itineraryProvider = new ItineraryProvider();

var itineraryProvider = new ItineraryProvider('localhost', 27017);

//render the bitstarter page
app.get('/', function(req, res){
  res.render('bitstarter', {title: 'Bitstarter Home'});
});

//invoke the getTest method - check console for output
app.get('/getTest', function(req, res) {
  itineraryProvider.getTest(function(error, result) {
    if (error) throw error;
    res.render('bitstarter');
  });
});

//render the prototype home page with saved itineraries in listModal
app.get('/protohome', function(req, res){
  itineraryProvider.findAll(function(error, itins) {
    res.render('protonew', {
      title: 'Your Saved Itineraries',
      itineraries:itins,
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
  it_obj = req.param('it_obj');
  console.log('it_obj ' + it_obj + ' from protonew.js');
  var itjson = JSON.parse(it_obj);
  console.log('itjson.name ' + itjson.name);
  console.log('itjson.days ' + JSON.stringify(itjson.days));

  itineraryProvider.save({
    name: itjson.name,
    days: itjson.days
    }, function(error, docs) {
  });
  res.redirect('/protohome');
});

//update an itinerary
app.get('/itinerary/:id/edit', function(req, res) {
  itineraryProvider.findById(req.param('_id'), function(error, itin) {
    res.render('itinerary_edit', {
      name: req.param('name'),
      itinerary: itin
    });
  });
});

//save an updated itinerary
app.post('/itinerary/:id/edit', function(req, res) {
  it_obj = req.param('it_obj');
  var itjson = JSON.parse(it_obj);
  console.log('Will update ' + itjson.name + 'with ' + itjson.days);
  itineraryProvider.update(req.param('_id'), {
    name: itjson.name,
    days: itjson.days
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
