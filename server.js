// var socket      = require('socket.io');
// var fs          = require('fs');
// var express     = require('express');
// var app         = express();
// var redis       = require('redis');
// var request     = require('request');
// require('dotenv').config()

// // var io              = socket.listen( server );
// // const port          = process.env.PORT || 3000;
// // var verify_token    = 'ajuisdhasdbhasbdhasbdhasbasd';
// // var url             = "<url>";
// // var urlTotal        = "<url>";
// // var client          = redis.createClient("8082", "127.0.0.1");
// // // require('events').EventEmitter.prototype._maxListeners =0;

// // server.listen(port, function () {
// //     console.log('server' , port);
    
// // });


// var server = require("http").Server(app);
// var io = require("socket.io")(server);
// const port          = process.env.PORT;
// server.listen(port);
// console.log('Get connet' + port);


var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var redis = require('redis');
 require('dotenv').config()
 
const port          = process.env.PORT;
server.listen(port);
console.log('Get connet' + port);
io.on('connection', function (socket) {
 
  console.log("new client connected");
  var redisClient = redis.createClient();
  redisClient.subscribe('message');
 
  redisClient.on("message", function(channel, message) {
    console.log("mew message in queue "+ message + "channel");
    socket.emit(channel, message);
  });
 
  socket.on('disconnect', function() {
    redisClient.quit();
  });
 
});