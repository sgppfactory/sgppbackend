const config = require("../lib/config"); //Config
// const mysql = require("../lib/mysql");
const Sequelize = require('sequelize');
var msconf = config.mysql_connect
const sequelize = new Sequelize(
	msconf.database
, 	msconf.user
, 	msconf.password
, 	{host: msconf.host,dialect: 'mysql'}
);

module.exports = {
	dbsql: 	sequelize
,	config: config
,	cte: 	Sequelize
};