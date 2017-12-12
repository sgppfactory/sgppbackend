const _ = require('underscore'); //Sólamente para tener algunas herramientas más para desarrollar
const config = require("../lib/config"); //Config
const mysql = require("../lib/mysql");
const helper = require("../lib/validations");

PorposalProject =  {
	attr: {
		title : {require: true, validation: 'isString'}
	,	details : {require: true, validation: 'isString'}
	,	id_node : {require: true, validation: 'isNumber'}
	,	location : {require: true, validation: 'isString'}
	,	amount : {require: false, validation: 'isNumber'}
	,	id_stage : {require: true, validation: 'isNumber'}
	,	id_cicle : {require: true, validation: 'isNumber'}
	,	type: {require: false}
	},
	create: function(params) {
		validations = helper.validations(this.attr,params)
		if(!validations) {
			return new Promise((resolve, reject)=>{
				var mysqlDB = new mysql(config.mysql_connect);
				return mysqlDB.request(helper.buildInsertQuery('porpose_project', this.attr, values))
			})
		} 

		return new Promise((resolve,reject) => {
			reject(validations);
		})
	},
	get: function(params) {
		return new Promise(function(resolve, reject){
			// _this.mysqlserver.connect();
			if(_.isNumber(userParams.id)) {
				var mysqlDB = new mysql(config.mysql_connect);
				// _this.mysqlserver
				mysqlDB.query(
					'SELECT * FROM porpose_project WHERE id = "' + userParams.id + '"'
				, 	function(err, rows, fields) {
						if(err) {
							reject(array());
						} else {
							resolve(rows);
						}
					}
				);
				
				// _this.mysqlserver.end();
				mysqlDB.end()
			}
			else {
				// _this.mysqlserver.end();
				reject("Parámetros no válidos");
			} 
		});
	},
	search: function() {
		
	}
}

module.exports = PorposalProject
