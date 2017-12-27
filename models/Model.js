const config = require("../lib/config"); //Config
// const mysql = require("../lib/mysql");
const Sequelize = require('sequelize');
var msconf = config.mysql_connect

// Para realizar validaciones de notNull... parche
Sequelize.Validator.notNull = function (item) {
    return !this.isNull(item);
};

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