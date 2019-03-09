const express = require('express');
var router = express.Router();
var mongoose = require("mongoose");


const url =  "mongodb://admin:Miliflox9209@ds155815.mlab.com:55815/talkative-inc";
router.get('/history', function(req, res, next) {
    mongoose.connect(url,{ useNewUrlParser: true }, function(err, db) {
      if(err) {  console.log(err); throw err;  }
      data = '';
      db.collection('messages').find().toArray(function(err, docs){
        if(err) throw err;
        res.json(docs);
        db.close();
      });
    });
  });

  router.get('/eventlog', function(req, res, next) {
    mongoose.connect(url,{ useNewUrlParser: true }, function(err, db) {
      if(err) {  console.log(err); throw err;  }
      data = '';
      db.collection('eventLog').find().toArray(function(err, docs){
        if(err) throw err;
        res.json(docs);
        db.close();
      });
    });
  }); 

  router.get('/roomhistory', function(req, res, next) {
    mongoose.connect(url,{ useNewUrlParser: true }, function(err, db) {
      if(err) {  console.log(err); throw err;  }
      data = '';
      db.collection('rooms').find().toArray(function(err, docs){
        if(err) throw err;
        res.json(docs);
        db.close();
      });
    });
  });


module.exports = router;