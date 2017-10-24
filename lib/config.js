const fs = require('fs'); //filesystem

var node_env = process.env.NODE_ENV || 'development';

var config_generic = {
	TOKEN_SECRET: fs.readFileSync('/var/certs/private.pem')
,	TTL : 600000 //10 minutos
}

var config_specific = {
	development : {
		mysql_connect: {host: 'localhost',user: 'root',password : 'root',database : 'sgpp'}
	,	redis_connect: {host: "localhost",port: 6379}
	}
,	production : {
		mysql_connect: {host: 'localhost',user: 'root',password : 'root',database : 'sgpp'}
	,	redis_connect: {host: "localhost",port: 6379}
	}
}

module.exports = Object.assign(config_generic,config_specific[node_env])