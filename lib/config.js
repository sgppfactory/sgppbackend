const fs = require('fs'); //filesystem

var node_env = process.env.NODE_ENV || 'development';

var config_generic = {
	TOKEN_SECRET: fs.readFileSync('/var/certs/private.pem')
,	TTL : 720000 //2 horas
}

var mailConfig = fs.readFileSync('/var/certs/mailcert')
try {
	mailConfig = JSON.parse(mailConfig);
} catch (e) {
	mailConfig = ''
}

var config_specific = {
	development : {
		mysql_connect: 	{host: 'localhost',user: 'root',password : 'root',database : 'sgpp'}
	,	redis_connect: 	{host: "localhost",port: 6379}
	,	mail_connect: 	mailConfig
	}
,	production : {
		mysql_connect: {host: 'localhost',user: 'root',password : 'root',database : 'sgpp'}
	,	redis_connect: {host: "localhost",port: 6379}
	,	mail_connect: 	mailConfig
	}
}

module.exports = Object.assign(config_generic,config_specific[node_env])
