const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
var port = process.env.PORT || 3000;
var mongoose = require("mongoose");

var history = require('./history');

const url =  "mongodb://admin:Miliflox9209@ds155815.mlab.com:55815/talkative-inc"; 
//database connection
mongoose.connect( url  ,
  { useNewUrlParser: true },
  (err, db) => {
    if (!err) {
      console.log("Connection Good");
    } else {
      console.log("Error in Connection: " + JSON.stringify(err, undefined, 2));
    }

    // socket.io api
    io.on("connection", socket => {
      //collections
      let eventLog = db.collection("eventLog");
      let rooms = db.collection("rooms");
      let messages = db.collection("messages");

      socket.on("change username", name => (socket.username = name));

      socket.on("message", msg =>
        io.emit("message", { user: socket.username, message: msg },
        messages.insertOne({sender: socket.username, receiver: 'room', msg: msg, timeStamp: Date()})
        )
      );

      socket.on("join", username => {
        if (username != null) {
          socket.username = username;
        }
        //echo to client that they have connected to the room
        socket.emit("message", {
          user: "Server",
          message: "You have joined!"
        }),
          //emitting to the group about new user
          socket.broadcast.emit(
            "message",
            {
              user: "Server",
              message: socket.username + " has joined!"
            },

            //logging in mongoDB that new connection has been made
            eventLog.insertOne(
              {
                typeOfEvent: "Connection",
                username: socket.username,
                socketID: socket.id,
                timeStamp: Date()
              },
              function() {
                console.log("user registered in mongo");
              },

              //saving room and username joined
              rooms.insertOne(
                {typeOfEvent: "JOIN", roomID: 1, username: socket.username },
                function() {
                  console.log("user saved to room 1");
                }
              )
            )
          );
      });

      //listen on typing
    socket.on('typing', (username) => {
      socket.broadcast.emit('typing', 
      {user: "Server",
      message: socket.username + ' is typing'})
    })

    socket.on('disconnect', function(username){
      socket.broadcast.emit(
        "message",
        {
          user: "Server",
          message: socket.username + " has left the room!"
        },
        eventLog.insertOne({typeOfEvent: "DISCONNECT",
        username: socket.username,
        socketID: socket.id,
        timeStamp: Date()}, function(){
          console.log('user left the room')         
        })
        )
    })
    });
  }
);

app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));
app.get("*", (req, res) => res.sendFile(__dirname + "/index.html"));
//running the server
http.listen(port, () => {
  console.log(`Server listening at port ${port}`);
});

//history
app.use("/api", history)

