var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;
var MongoClient = require('mongodb').MongoClient;

//ItineraryProvider = new MongoClient.connect('mongodb://heroku:366acce9fd196a673584b13acb417573@dharma.mongohq.com:10091/app17007481');

//ItineraryProvider = function(host, port) {
//  this.db = new Db('itineraries', new Server(host, port, {safe: false}, {auto_reconnect: true}, {}));
//  this.db.open(function(err, db){
//    if(err) throw err;
//    console.log('db is ' + db._state);
//  });
//};
//


ItineraryProvider = function(host, port){
  MongoClient.connect('mongodb://heroku:366acce9fd196a673584b13acb417573@dharma.mongohq.com:10091/app17007481', function(err, db){
    if (err) throw err;
    this.db = db;
    console.log('db is ' + db._state);
    db.collectionNames(function(err, colls){
      if (err) throw err;
      console.log('with collections ' + JSON.stringify(colls));

      db.collection('test').findOne({}, function(err, result){
        if (err) throw err;
        console.log('test collection: ' + JSON.stringify(result));
      });
    });


    ItineraryProvider.prototype.getCollection = function (callback) {
      db.collection('itineraries', function(error, itinerary_collection) {
        if (error) callback(error);
        else callback(null, itinerary_collection);
      });
    };
  });
};


//find all itineraries
ItineraryProvider.prototype.findAll = function(callback) {
  this.getCollection(function(error, itinerary_collection) {
    if(error) callback(error)
    else {
      itinerary_collection.find().toArray(function(error, results) {
        if(error) callback(error)
        else callback(null, results)
      });
    }
  });
};


//save new itinerary

ItineraryProvider.prototype.save = function(itineraries, callback) {
  this.getCollection(function(error, itinerary_collection) {
    if(error) callback(error)
    else {
      if(typeof(itineraries.length)=="undefined")
        itineraries = [itineraries];

      for(var i=0; i<itineraries.length; i++) {
        itinerary = itineraries[i];
        itinerary.created_at = new Date();
      }

      itinerary_collection.insert(itineraries, function() {
        callback(null, itineraries);
      });
    }
  });
};


//find an itinerary by ID

ItineraryProvider.prototype.findById = function(id, callback) {
  this.getCollection(function(error, itinerary_collection) {
    if(error) callback(error)
    else {
      itinerary_collection.findOne({_id: itinerary_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
        if(error) callback(error)
        else callback(null, result)
      });
    }
  });
};


//update an itinerary

ItineraryProvider.prototype.update = function(itineraryId, itineraries, callback) {
  this.getCollection(function(error, itinerary_collection) {
    if(error) callback(error);
    else {
      itinerary_collection.update(
        {_id: itinerary_collection.db.bson_serializer.ObjectID.createFromHexString(itineraryId)},
        itineraries,
        function(error, itineraries) {
          if(error) callback(error);
          else callback(null, itineraries)
        });
    }
  });
};


//delete itinerary

ItineraryProvider.prototype.delete = function(itineraryId, callback) {
  this.getCollection(function(error, itinerary_collection) {
    if(error) callback(error);
    else {
      itinerary_collection.remove(
        {_id: itinerary_collection.db.bson_serializer.ObjectID.createFromHexString(itineraryId)},
        function(error, itinerary) {
          if(error) callback(error);
          else callback(null, itinerary)
        });
    }
  });
};


exports.ItineraryProvider = ItineraryProvider;
