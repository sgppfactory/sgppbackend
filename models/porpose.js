const _ = require('underscore'); //Sólamente para tener algunas herramientas más para desarrollar
const config = require("../lib/config"); //Config
const mysql = require("../lib/mysql");

PorposalProject =  {
	add: function(params) {
		var mysqlDB = new mysql(config.mysql_connect);
		// params = JSON.parse(params)
		return mysqlDB.request(
			'INSERT INTO porpose_project WHERE username = "' 
			+ 	userParams.username 
			+ 	'" AND password = md5(' 
			+ 	userParams.password + ')'
		)
	}
}

// ProposalProject.prototype.addProposal = function() {
	// return new Promise(function(resolve, reject){
		// _this.mysqlserver.connect();
		// if(_.isString(userParams.username) && _.isString(userParams.password)) {
		// 	_this.mysqlserver.query(
		// 		'INSERT INTO * FROM usuarios WHERE username = "' + userParams.username + '" AND password = md5(' + userParams.password + ')'
		// 	, 	function(err, rows, fields) {

		// 			if(err) 
		// 				reject(array());
		// 			else 
		// 				resolve(rows);
		// 		}
		// 	);
			
		// 	_this.mysqlserver.end();
		// }
		// else {
		// 	_this.mysqlserver.end();
		// 	reject("Parámetros no válidos");
		// } 

    // });
// }

module.exports = PorposalProject
