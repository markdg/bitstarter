var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

ItineraryProvider = function(host, port) {
  this.db = new Db('node-itinerary', new Server(host, port, {safe: false}, {auto_reconnect: true}, {}));
  this.db.open(function(){});
};

ItineraryProvider.prototype.getCollection = function (callback) {
  this.db.collection('itineraries', function(error, itinerary_collection) {
    if (error) callback(error);
    else callback(null, itinerary_collection);
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
