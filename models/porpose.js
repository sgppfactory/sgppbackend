// const _ = require('underscore'); //Sólamente para tener algunas herramientas más para desarrollar
// const helper = require("../lib/validations");
model = require('Model');

const PorposalProject =  model.define('porpose_project',{
		id: { type: model.cte.INTEGER, primaryKey: true, autoIncrement: true },
	,	title : {type: model.cte.STRING}
	,	id_node : {type: model.cte.INTEGER
		// ,	references: {
		// 		// This is a reference to another model
		// 		model: Node,
		// 		// This is the column name of the referenced model
		// 		key: 'id',
		// 		// This declares when to check the foreign key constraint. PostgreSQL only.
		// 		deferrable: model.cte.Deferrable.INITIALLY_IMMEDIATE
		// 	}
		}
	,	details : {type: model.cte.TEXT}
	,	location : {type: model.cte.STRING}
	,	amount : {type: model.cte.STRING, allowNull: true}
	,	id_stage : {type: model.cte.STRING}
	,	id_cicle : {type: model.cte.STRING}
	,	type: {type: model.cte.STRING}
	}
	// attr: {
	// 	title : {require: true, validation: 'isString'}
	// ,	id_node : {require: true, validation: 'isNumber'}
	// ,	details : {require: true, validation: 'isString'}
	// ,	location : {require: true, validation: 'isString'}
	// ,	amount : {require: false, validation: 'isNumber'}
	// ,	id_stage : {require: true, validation: 'isNumber'}
	// ,	id_cicle : {require: true, validation: 'isNumber'}
	// ,	type: {require: false}
	// },
	// create: function(params) {
	// 	validations = helper.validations(this.attr,params)
	// 	if(!validations) {
	// 		return new Promise((resolve, reject)=>{
	// 			var mysqlDB = new mysql(config.mysql_connect);
	// 			return mysqlDB.request(helper.buildInsertQuery('porpose_project', this.attr, values))
	// 		})
	// 	} 

	// 	return new Promise((resolve,reject) => {
	// 		reject(validations);
	// 	})
	// },
	// get: function(params) {
	// 	return new Promise(function(resolve, reject){
	// 		// _this.mysqlserver.connect();
	// 		if(_.isNumber(userParams.id)) {
	// 			var mysqlDB = new mysql(config.mysql_connect);
	// 			// _this.mysqlserver
	// 			mysqlDB.query(
	// 				'SELECT * FROM porpose_project WHERE id = "' + userParams.id + '"'
	// 			, 	function(err, rows, fields) {
	// 					if(err) {
	// 						reject(array());
	// 					} else {
	// 						resolve(rows);
	// 					}
	// 				}
	// 			);
				
	// 			// _this.mysqlserver.end();
	// 			mysqlDB.end()
	// 		}
	// 		else {
	// 			// _this.mysqlserver.end();
	// 			reject("Parámetros no válidos");
	// 		} 
	// 	});
	// },
	// search: function() {
		
	// }
}

module.exports = PorposalProject
