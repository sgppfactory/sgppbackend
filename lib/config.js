const fs = require('fs'); //filesystem

var node_env = process.env.NODE_ENV || 'development';

var config_generic = {
	TOKEN_SECRET: fs.readFileSync('/var/certs/private.pem')
,	TTL : 7200 //2 horas
}

var mailConfig = fs.readFileSync('/var/certs/mailcert')
try {
	mailConfig = JSON.parse(mailConfig);
} catch (e) {
	mailConfig = ''
}

var redisconn = fs.readFileSync('/var/certs/rediscert')
try {
	redisconn = JSON.parse(redisconn);
} catch (e) {
	redisconn = ''
}

var sqlconn = fs.readFileSync('/var/certs/sqlcert')
try {
	sqlconn = JSON.parse(sqlconn);
} catch (e) {
	sqlconn = ''
}

var config_specific = {
	development : {
		mysql_connect: 	sqlconn
	,	redis_connect: 	redisconn
	,	mail_connect: 	mailConfig
	}
,	production : {
		mysql_connect: 	sqlconn
	,	redis_connect:  redisconn
	,	mail_connect: 	mailConfig
	}
}

module.exports = Object.assign(config_generic,config_specific[node_env])
