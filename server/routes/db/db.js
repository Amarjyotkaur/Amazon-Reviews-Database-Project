const mysql = require("mysql");
const dbConfig = require('../../../config/dbconfig');

var connection = mysql.createPool({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  port: dbConfig.port,
  database: dbConfig.database
});

module.exports = connection;