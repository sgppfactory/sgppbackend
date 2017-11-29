const mysqlmod = require("mysql");
const _ = require('underscore');

function MySQL(connection){
    if(typeof connection=="undefined"){
        var config = {
			host     : 'localhost',
			user     : 'root',
			password : 'root',
			database : 'sgpp'
		}
    }else{
        var config = connection;
    }
    this.setConnection(config)
}

MySQL.prototype.setConnection = (config) => {
    this.mysqlserver = mysqlmod.createConnection(config);
}

MySQL.prototype.connect = () => {
	this.mysqlserver.connect();
}

MySQL.prototype.end = () => {
	this.mysqlserver.end();
}

MySQL.prototype.request = (query) => {
	_this = this
	if(_.isString(query)) {
		this.mysqlserver.connect();
		return new Promise((resolve, reject)=>{
			_this.mysqlserver.query(
				query
			, 	function(err, rows, fields) {
					console.log(err,rows)
					if(err) {
						return reject(err);
					}

					resolve(rows);
				}
			);
		});
		this.mysqlserver.end();
	}
}

MySQL.prototype.multiRequest = (query,resolve,reject) => {
	if(_.isString(query)) {
		this.mysqlserver.query(
			query
		, 	function(err, rows, fields) {
				console.log(err,rows)
				if(err) {
					return reject(err);
				}

				resolve(rows);
			}
		);
	}
}

module.exports = MySQL;