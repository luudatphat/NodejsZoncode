
var socket  = require( 'socket.io' );
var  fs = require('fs');
var express = require('express');
var app     = express();

var data = fs.readFileSync('./config/config.json');

var server_key = '';
var server_crt = '';
var host_redis = '127.0.0.1';
var port_redis = '6379';
var pass_redis = '';
try {
	myObj = JSON.parse(data);
	server_key = myObj.server_key;
	server_crt = myObj.server_crt;
	port_redis = myObj.port_redis;
	host_redis = myObj.host_redis;
	pass_redis = myObj.pass_redis;
}
catch (err) {
	console.log('There has been an error parsing your JSON.')
	console.log(err);
}

var server  = require('https').createServer({
	key: fs.readFileSync(server_key),
	cert: fs.readFileSync(server_crt)
},app);
var io      = socket.listen( server );
var port    = process.env.PORT || 3000;
var verify_token = 'zXkRE3w4i1b7AERiFkgyCCg7UQaV4ReT';
var url =  "http://test-auc-smart-auctions.tk/api/demosocket/";
var urlTotal =  "http://153.126.142.76/raxus_auction_api/";
var redis = require('redis');
var client = redis.createClient(port_redis, host_redis);
// client.auth(pass_redis, function (err) {
// 	if (err) console.log(err); ;
// });
var request = require("request");
require('events').EventEmitter.prototype._maxListeners = 0;


server.listen(port, function () {
	console.log('Server listening at port %d', port); 
});



// Connection 

io.on('connection', function (socket) {
	socket.auth = false;
	socket.on('authenticate', function(data){
		if(verify_token == data.token) {
			socket.auth = true;
		}
	});
	client.on("error", function (err) {
		console.log("Error " + err);
	});


	var redisLogin = redis.createClient();
	// redisLogin.auth(pass_redis, function (err) {
	// 	if (err) console.log(err); ;
	// });
	redisLogin.subscribe('checkLogin', function(error) {
		console.log("mew checkLogin in queue "+ error + " channel");
	});
	redisLogin.on("message", function(channel, message) {
		let json = JSON.parse(message);
		io.emit("checkLoginClient",json.idUser);
	});

	var redisQuestion = redis.createClient();
	// redisQuestion.auth(pass_redis, function (err) {
	// 	if (err) console.log(err); ;
	// });
	redisQuestion.subscribe('addquestion', function(error) {
		console.log("mew checkLogin in queue "+ error + " channel");
	});
	redisQuestion.on("message", function(channel, message) {
		let json = JSON.parse(message);
		io.emit("addquestionresponse",json);
	});

	var redisQuestionAdmin = redis.createClient();
	// redisQuestionAdmin.auth(pass_redis, function (err) {
	// 	if (err) console.log(err); ;
	// });
	redisQuestionAdmin.subscribe('addquestionadmin', function(error) {
		console.log("mew checkLogin in queue "+ error + " channel");
	});
	redisQuestionAdmin.on("message", function(channel, message) {
		let json = JSON.parse(message);
		io.emit("addquestionadminresponse",json);
	});


	var redisClient = redis.createClient();
	// redisClient.auth(pass_redis, function (err) {
	// 	if (err) console.log(err); ;
	// });
	redisClient.subscribe('bidding', function(error) {
		console.log("mew message in queue "+ error + " channel");
		//socket.emit(channel, message);
	});
	redisClient.on("message", function(channel, message) {

		let json = JSON.parse(message);
		var dataValue = {
			data : json.data,
			result : json.result,
			traderID: json.traderId,
			priceBid: json.priceBid
		}
		io.emit('getitemdetailbyid', dataValue);
		var dataValueBidder = {
			data : json.data,
			result : json.resultBidder
		}

		io.emit('getBiddersByID', dataValueBidder);
		var dataValueBidderSeller = {
			data : json.data,
			result : json.resultBidderSeller
		}

		io.emit('getBiddersSellerByID', dataValueBidderSeller);

		var dataValueAdmin = {
			data : json.data,
			result : json.resultAdmin
		}
		if(json.flag == '0'){
			io.emit('getValueOrderOffice', dataValueAdmin);
		}
		
	});
  setTimeout(function(){
  	if (!socket.auth) {
  		console.log("Disconnecting socket ", socket.id);
  		socket.disconnect('unauthorized');
  	}
  }, 1000);

  socket.on('checktoken', function(msg){
  	getValue(msg);
  });
  socket.on('insertValue', function(msg){
  	insertValue(msg);
  });
  socket.on('getlistuser', function(msg){
  	getlistuser(msg);
  });
  socket.on('defineChannels', function(msg){
  	registerChannel(msg);

  });
  socket.on('chatMethod', function(msg){
  	client.get(msg.key, function(err, reply) {
  		if (reply != ''){
  			io.emit(msg.channels, msg.valueChat);
  		}	
  	});
  });
  socket.on('disconnect', function() {
  	redisClient.quit();
  	console.log("Disconnect Server");
  });
});
function registerChannel(msg){
	client.get(msg.key, function(err, reply) {
		if (reply != ''&&reply != null){
			var param = "?userid="+msg.userId+"&userchat="+msg.userChat;
			request.get(url+msg.url+param, (error, response, body) => {
				io.emit('defineChannels_'+msg.userId, body);
				io.emit('defineChannels_'+msg.userChat, body);
			});	
		}	
	});
}
function getValue(msg){
	client.get(msg.key, function(err, reply) {
		console.log(msg.key);
		console.log(reply);
		if (reply != ''&&reply != null){
			request.get(url+msg.url, (error, response, body) => {
				let json = JSON.parse(body);
				io.emit('checktoken', json);
			});				
		}
		else {
			io.emit('checktoken', 'null');
		}
	});
}
function insertValue(msg){
	console.log(msg.key);
	client.get(msg.key, function(err, reply) {
		console.log(reply);
		if (reply != ''&&reply != null){
			var options = {
				uri: url+msg.url,
				method: 'POST',
				json: msg.data
			};

			request(options, function (error, response, body) {
				console.log(body.code);
				if (body.code==200){
					getValue(msg);
				}
				//io.emit('checktoken', json);
			});		
		}
		else {
			io.emit('checktoken', 'null');
		}
	});
}
function getlistuser (msg){
	client.get(msg.key, function(err, reply) {
		if (reply != ''&&reply != null){
			request.get(url+msg.url, (error, response, body) => {
				let json = JSON.parse(body);
				io.emit('getlistuser', json);
			});				
		}
		else {
			io.emit('getlistuser', 'null');
		}
	});
}
function getValueItemDetailByID(msg){
	client.get(msg.key, function(err, reply) {
		console.log(msg.key);
		console.log("thaibinhnhien => "+err);
		if (reply != ''&&reply != null){
			console.log("check");
			var options = {
				headers:{
					'token': reply
				},
				uri: urlTotal+msg.url+msg.data+msg.user_id,
				method: 'GET'
			};

			console.log(urlTotal+msg.url+msg.data+msg.user_id);
			request(options, function (error, response, body) {
				//console.log(body);
				var dataValue = {
					id : msg.data,
					value : body
				}
				io.emit('getitemdetailbyid', dataValue);
			});	
		}
		else {
			io.emit('getitemdetailbyid', 'null');
		}
	});			
}

function getBiddersByID(msg){
	client.get(msg.key, function(err, reply) {
		console.log(msg.key);
		console.log(err);
		if (reply != ''&&reply != null){
			var options = {
				uri: urlTotal+msg.url+msg.data,
				method: 'GET'
			};
			console.log(urlTotal+msg.url+msg.data);
			request(options, function (error, response, body) {
				io.emit('getBiddersByID', body);
			});	
		}
		else {
			io.emit('getitemdetailbyid', 'null');
		}
	});					
}
function getBiddersSellerByID(msg){
	client.get(msg.key, function(err, reply) {
		console.log(msg.key);
		console.log(reply);
		if (reply != ''&&reply != null){
			var options = {
				uri: urlTotal+msg.url+msg.data,
				method: 'GET'
			};
			console.log(urlTotal+msg.url+msg.data);
			request(options, function (error, response, body) {
				io.emit('getBiddersSellerByID', body);
			});
		}
		else {
			io.emit('getitemdetailbyid', 'null');
		}
	});						
}