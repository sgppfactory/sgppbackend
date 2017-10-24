const config = require('./config');


function ProposalProject() {
}

ProposalProject.prototype.addProposal = function() {
	var _this = this 
	return new Promise(function(resolve, reject){
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

    });
}

ProposalProject.prototype.getProposal = function(toSign) {
}

module.exports = ProposalProject
