const mysql = require('mysql2');
const config = require('./config/default.json');

const connection = mysql.createConnection(config.database);

connection.connect((err) => {
    if (err) {
        throw new Error(err)
        return;
    }
})

module.exports = connection;
