const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
var port = process.env.PORT || 3000
var usernames = [];

server.listen(port);

app.get('/', function(req, res){
  console.log(`Listening on port: ${port}`);
  res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
  console.log('Socket connected');

  socket.on('new user', function(data, callback){
    // check username doesn't already exist
    if(usernames.indexOf(data) != -1){
      callback(false);
    }else {
      callback(true);
      socket.username = data;
      usernames.push(socket.username);
      updateUsernames();
    }
  });

  // update usernames
  function updateUsernames() {
    io.sockets.emit('usernames', usernames);
  }

  // Send message
  socket.on('send message', function(data) {
    io.sockets.emit('new message', {msg: data, user: socket.username});
  });


  //disconnect and update usernames
  socket.on('disconnect', function(data){
    if(!socket.username) {
      return;
    }
    usernames.splice(usernames.indexOf(socket.username), 1);
    updateUsernames();
  });
});
