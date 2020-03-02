const mysql2 = require('mysql2/promise');

const pool = mysql2.createPool({
	connectionLimit: 10,
	host: 'localhost',
	user: 'user',
	password: 'pass',
	database: 'mining_bot',
});

module.exports = {
	pool: pool,
};