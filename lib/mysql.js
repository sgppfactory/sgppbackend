const mysql = require("mysql");
// const _ = require('underscore');

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

    this.mysqlserver = mysql.createConnection(config);
}

MySQL.prototype.request = function(query) {
	if(_.isString(query)) {
		this.mysqlserver.connect();
		this.mysqlserver.query(query
		, 	function(err, rows, fields) {
				if(err) {
					reject(array());
				}
				else {
					resolve(rows);
				}
			}
		);
		
		this.mysqlserver.end();
	}
}

module.exports = MySQL;