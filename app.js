'use strict';

// const redis = require("redis");
// const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer(); // for parsing multipart/form-data
const app = express();
const redis = require("./lib/redis");
const redisDB = new redis({"host": "localhost","port": 6379});


app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/user', (req, res) => {
  res.send('Hello World!');
});


app.get('/user/:id', function(req, res, next) {
	console.log('Request URL: user/', req.params.id);
	redisDB.get(req.params.id).then(function(result) {
		console.log(result); // "Stuff worked!"
	}, function(err) {
		console.log(err); // Error: "It broke"
	})
	next();
}, function (req, res) {
	console.log('Request Type:', req.method);
});

app.post('/user',upload.array(), function(req, res, next) {
	console.log(req.body)
	// redisDB.set()
	console.log('Request URL:', req.originalUrl);
	res.json(req.body);	
	next()
}, function (req, res) {
	console.log('Request Type:', req.method);
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});

// RedisServer.prototype.redisClientPrueba = function () {
// 	var self = this;
// 	console.log("redisClient");

//     // Implementar hashes
// 	try {
// 		// self.redis = redis.createClient(self.redisConf);
// 	    self.redis.on('connect',function() {
// 			console.log("Redis to "+redisConf.host);
// 		    for(var x=0; x < cervezasNombre.length; x++) {
// 				self.redis.set('cervezas:'+x,JSON.stringify(cervezasNombre[x]),(err,res) => {
// 					console.log("cerveza loaded: "+res)
// 				});

// 			    self.redis.set('cervezas:'+x+':likes','0',(err,res) => {
// 					console.log("cerveza like param loaded: "+res)
// 				})
// 			}
// 	    })

// 	} catch(e) {
// 		console.log(e)
// 	}
// }

// RedisServer.prototype.redisClientHash = function () {
// 	var self = this;
// 	console.log("hash data examples load data");

// 	try {
// 		//conecto a redis
// 		// self.redis = redis.createClient(self.redisConf);
// 	    self.redis.on('connect',function() {
// 			// console.log("Redis to "+redisConf.host);
// 		    for(var x=0; x < cervezasNombre.length; x++) {
// 				self.redis.hset('hcervezas:'+x,'nombre',cervezasNombre[x].nombre,(err,res) => {
// 					console.log("nombre hash data in cerveza loaded: "+res)
// 				});

// 				self.redis.hset('hcervezas:'+x,'pais',cervezasNombre[x].pais,(err,res) => {
// 					console.log("pais hash data in cerveza : "+res)
// 				});

// 			    self.redis.hset('hcervezas:'+x,'likes','0',(err,res) => {
// 					console.log("cerveza like param loaded by hash  example: "+res)
// 				})
// 			}
// 	    })

// 	} catch(e) {
// 		console.log(e)
// 	}
// }
//Ejecuto app para cargar los datos
// new RedisServer()

// const server = http.createServer();

// server.on('request',(req,res)=>{
// 	var urlSplit = req.url.split('/')
// 	if(req.method === 'GET') {
// 		new Request(res,req,urlSplit)
// 	} else {
// 		res.end("Only response GET petitions")
// 	}
// })

// function Request(res,req,urlSplit) {
// 	console.log("init request")

// 	var redisServer = redis.createClient(redisConf);
// 	var verb = urlSplit[1]
// 	var key = parseInt(urlSplit[2])
	
// 	if(verb === 'getData') {
// 		this.getOne(key,req,res,redisServer)
// 	} else if(verb === 'likeUp') {
// 		this.likeUp(key,req,res,redisServer)
// 	} else{
// 		res.end('error en request')
// 	}
// }

// Request.prototype.getOne = (key,res,redisServer) => {
// 	var self = this

// 	redisServer.get('cervezas:'+key,(error,val) => {
// 		if(error) res.end(error)

// 		res.end(val)
// 	})
// }

// Request.prototype.likeUp = (key,res,redisServer) => {
// 	var self = this

// 	redisServer.incr('cervezas:'+key+':likes',(error,val) => {
// 		if(error) res.end(error)

// 		res.end(val)
// 	})
// }

// Request.prototype.getOneByHash = (key) => {
// 	req.on('end',() => {
// 		redisServer.incr('cervezas:'+key,(error,val) => {
// 			if(error) res.end(error)

// 			res.end(val)
// 		})
// 	})	
// }

// server.listen(8000);
