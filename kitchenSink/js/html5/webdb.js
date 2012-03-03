/*
 * Copyright 2011 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var db;

/*
	Note:On some BlackBerry Smartphones, a SDCard is required to run this sample.  This is due to the fact that SQLite databases depend on the file system structure provided by Flash memory.


	Rules of HTML5 Database:

		1. The transaction(), readTransaction(), and changeVersion() methods invoke callbacks with a SQLTransaction object as an argument.
		
		2. The executeSql() method invokes its callback with two arguments: SQLTransaction and SQLResultSet.
		
		3. When an error occurs within the executeSql() method, its error callback is invoked with a SQLError object as an argument.
*/

/**
 * Helper functions
 */		
function error(msg) {
	var ele = document.getElementById("output");
	if (ele) { 
		ele.innerHTML += "<div class='error'>" + msg + "</div>" ; 
	}
}
function getSQLErrorName(err) {
	if (err === null)  {
		return "";
	}
	switch(err.code) {
		case err.DATABASE_ERR:
			//The statement failed for database reasons not covered by any other error code.
			return "DATABASE";
		case err.VERSION_ERR:
			//The operation failed because the actual database version was not what it should be. 
			//	For example, a statement found that the actual database version no longer matched the 
			//	expected version of the Database or DatabaseSync object, or the Database.changeVersion() 
			//	or DatabaseSync.changeVersion() methods were passed a version that doesn't match the actual database version.
			return "DATABASE VERSION";
		case err.TOO_LARGE_ERR:
			//The statement failed because the data returned from the database was too large. The 
			//	SQL "LIMIT" modifier might be useful to reduce the size of the result set.
			return "RESULT TOO LARGE";
		case err.QUOTA_ERR:
			//The statement failed because there was not enough remaining storage space, or the storage 
			//	quota was reached and the user declined to give more space to the database.
			return "QUOTA EXCEEDED";
		case err.SYNTAX_ERR:
			//The statement failed because of a syntax error, or the number of arguments did not match 
			//	the number of ? placeholders in the statement, or the statement tried to use a statement 
			//	that is not allowed, such as BEGIN, COMMIT, or ROLLBACK, or the statement tried to use a 
			//	verb that could modify the database but the transaction was read-only.
			return "SYNTAX";
		case err.CONSTRAINT_ERR:
			//An INSERT, UPDATE, or REPLACE statement failed due to a constraint failure. For example,
			//	because a row was being inserted and the value given for the primary key column duplicated 
			//	the value of an existing row.
			return "CONSTRAINT";
		case err.TIMEOUT_ERR:
			//A lock for the transaction could not be obtained in a reasonable ti
			return "TIMEOUT";
		default:
			//The transaction failed for reasons unrelated to the database itself and not covered by any 
			//	other error code.
			return "UNKNOWN";
	}
}

//Two types of error events can occur: transaction errors and SQL statement errors.

/**
 * SQLTransactionErrorCallback - method raised by the db.transaction() or db.readTransaction() or db.changeVersion() methods when an error occurs within a transaction event.
 *      http://www.w3.org/TR/webdatabase/#sqltransactionerrorcallback
 * @param err (SQLError) has two parameters: code (unsigned short), message (string) and constants
 *      http://www.w3.org/TR/webdatabase/#sqlerror
 */
function handleTransactionError(err) {
	error("SQLTransactionError " + err.code + " [" + getSQLErrorName(err.code) + "] " + err.message);
}
/**
 * SQLStatementErrorCallback - method raised by the tx.executeSql() method when an error occurs within an SQL statement.
 *      http://www.w3.org/TR/webdatabase/#sqlstatementerrorcallback
 * @param tx (SQLTransaction) has a single method: void executeSql(string sqlStatement, optional array args, optional SQLStatementCallBack callback, optional SQLStatementErrorCallback errorCallback)
 *      http://www.w3.org/TR/webdatabase/#sqltransaction
 * @param err (SQLError) has two parameters: code (unsigned short), message (string) and constants
 *      http://www.w3.org/TR/webdatabase/#sqlerror
 */
function handleSQLError(tx, err) {
	//The tx parameter can be used to run another SQL statement (e.g. log a message to an error table)
	error("SQLStatementError " + err.code + " [" + getSQLErrorName(err.code) + "] " + err.message);
}



/**
 * The following are SQLStatementCallback methods raised after a records are inserted, updated, deleted selected from the DB.
 * @param tx (SQLTransaction) has a single method: void executeSql(string sqlStatement, optional array args, optional SQLStatementCallBack callback, optional SQLStatementErrorCallback errorCallback)
 *      http://www.w3.org/TR/webdatabase/#sqltransaction
 * @param result (SQLResultSet) contains three attributes: insertId (readonly long), rowsAffected (readonly long), rows (readonly SQLREsultSetRowList)
 *      http://www.w3.org/TR/webdatabase/#sqlresultset
 */
function insertComplete(tx, result) {
	//The insertId attribute contains the ID of the row that was inserted into the database. 
	//If a single statement inserted multiple rows, the ID of the last row is returned.
	debug.log("insertComplete", result.rowsAffected + " row(s) added (rowId =" + result.insertId + ")", debug.info);
}
function updateComplete(tx, result) {
	//The rowsAffected attribute contains number of rows that were changed by the SQL statement. 
	// SELECT statements do not modify rows, and therefore have a rowsAffected value of 0.
	debug.log("updateComplete", result.rowsAffected + " row(s) updated", debug.info);
}
function deleteComplete(tx, result) {
	debug.log("deleteComplete", result.rowsAffected + " row(s) deleted", debug.info);
}
function selectComplete(tx, result) {
	//The rows attribute is a SQLResultSetRowList object containing one paramter length (int) and one method .item(index)
	//  The same object must be returned each time. If no rows were returned, then the object will be empty (its length will be zero).
	//	http://www.w3.org/TR/webdatabase/#sqlresultsetrowlist
	var size = result.rows.length;
	debug.log("selectComplete", size + " row(s) returned", debug.info);
}




/**
 * SQLStatementCallback methods raised after a SELECT statement is called.  Display results to the page.
 * @param tx (SQLTransaction) has a single method: void executeSql(string sqlStatement, optional array args, optional SQLStatementCallBack callback, optional SQLStatementErrorCallback errorCallback)
 *			http://www.w3.org/TR/webdatabase/#sqltransaction
 * @param result (SQLResultSet) contains three attributes: insertId (readonly long), rowsAffected (readonly long), rows (readonly SQLREsultSetRowList)
 *			http://www.w3.org/TR/webdatabase/#sqlresultset
 */
function displayMessagesResults(tx, result) {
	var ele, output, size, i, item, dt;
	
	ele = document.getElementById("contents");
	output = "";
	size = result.rows.length;
	
	if (size === 0) {
		output += "<i>Empty</i>";
	} 
	else {
		output += "<table cellspacing='0' cellpadding='5' border='0' width='100%'>";
		output += "<tr><th>id</th><th>message</th><th>created</th><th></th></tr>";
		for (i = 0; i < size; i = i + 1) {
			item = result.rows.item(i);
			dt = new Date(item.created);
			output += "<tr><td>" + item.id + "</td><td>" + item.message + "</td><td>" + dt.toDateString() + " " + dt.toLocaleTimeString() + "</td><td><a href='#' onclick=\"deleteRow('" + item.id + "')\">Delete</a></td></tr>";
		}
		output += "</table>";
	}
	
	if (ele) {
		ele.innerHTML = output;
	}
}

/**
 * Make the following logic its own method, so it can be called from various sources.
 */
function displayMessages() {
	if (db) {
		db.transaction(function(tx) {
									tx.executeSql('SELECT id, message, created FROM Messages', [], displayMessagesResults, handleSQLError);
									}, handleTransactionError);
	}
}

/**
 * Called when the user clicks on the 'Add Message' button.
 */
function addMessage() {
	var created = new Date().getTime();
	var message = document.getElementById("txtMessage").value;
	if (message === "") {
		error("Enter a message");
	}
	else {
		if (db) {
			db.transaction(function(tx) {
										tx.executeSql("INSERT INTO Messages (message, created) VALUES (?, ?)", [message, created], insertComplete, handleSQLError);
										displayMessages();
										}, handleTransactionError);
		}
	}
}
/**
 * Called when the user clicks on the 'Delete' hyperlink.
 */
function deleteRow(id) {
	if (db) {
		db.transaction(function(tx) {
									tx.executeSql('DELETE FROM Messages WHERE id = ?', [id], deleteComplete, handleSQLError);
									displayMessages();
									}, handleTransactionError);
	}
}


/**
 * SQLStatementCallback methods raised after the first table was created.  Add test data.
 * @param tx (SQLTransaction) has a single method: void executeSql(string sqlStatement, optional array args, optional SQLStatementCallBack callback, optional SQLStatementErrorCallback errorCallback)
 *     http://www.w3.org/TR/webdatabase/#sqltransaction
 * @param result (SQLResultSet) contains three attributes: insertId (readonly long), rowsAffected (readonly long), rows (readonly SQLREsultSetRowList)
 *     http://www.w3.org/TR/webdatabase/#sqlresultset
 */
function firstCreateComplete(tx, result) {
	try {
		//Do not need to begin another transaction.  Since the active transaction object was
		//	provided as a parameter, it can now be reused to insert some test data:
		var created = new Date().getTime();
		tx.executeSql("INSERT INTO Messages (message, created) VALUES (?, ?)", ["Hello World A", created], insertComplete, handleSQLError);
		tx.executeSql("INSERT INTO Messages (message, created) VALUES (?, ?)", ["Hello World B", created], insertComplete, handleSQLError);
		tx.executeSql("INSERT INTO Messages (message, created) VALUES (?, ?)", ["Hello World C", created], insertComplete, handleSQLError);
		
		//Finally, display all rows in the table.
		displayMessages();
	}
	catch(ex) {
		error("exception (firstCreateComplete): " + ex);
	}
}

/**
 * DatabaseCallback method invoked when the Database is first created. Designed to initialize the schema by creating necessary table(s).
 *     http://www.w3.org/TR/webdatabase/#databasecallback
 * @param database (Database) - reference to the DB object that was creatd
 *     http://www.w3.org/TR/webdatabase/#database
 */
function createTableOnNewDatabase(database) {
	try {
		if (database) {
			//This method allows the page to verify the version number and change it at the same time as doing a schema update.
			//Getting this error on DB create: "current version of the database and `oldVersion` argument do not match", despite the fact that both values are ""
			//database.changeVersion("", "1.0", createFirstTable, handleTransactionError);
			//database.transaction(createFirstTable, handleTransactionError);
			database.transaction(function(tx) {
											//The following method is asyncronous, perform record insert statements within the callback method after table has been created successful
											tx.executeSql("CREATE TABLE IF NOT EXISTS Messages (id INTEGER PRIMARY KEY, message TEXT, created TIMESTAMP)", [], firstCreateComplete, handleSQLError);
											}, handleTransactionError);
		}
	}
	catch(ex) {
		error("exception (createTableOnNewDatabase): " + ex);
	}
}



/**
 * Called by page load event.  Opens DB reference and displays contents of Messages table
 */
function doPageLoad() {
	try {
	
		//Assign 2MB of space for the database
		var dbSize = 2 * 1024 * 1024;	
		db = window.openDatabase("WebDBSample", "1.0", "HTML5 Database API example", dbSize, createTableOnNewDatabase);
		
		//
		// What is the best practice for determining when you can begin reading/writing from the DB after it has first been created?
		//
		//
		
		if (db !== null) {
			displayMessages();
		}
	}
	catch(e) {
		error("exception (initPage): " + e);
	}
}

window.addEventListener("load", doPageLoad, false);
