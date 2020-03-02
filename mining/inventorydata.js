const NodeCache = require('node-cache');
const { pool } = require('../mysql.js');

const invCache = new NodeCache();

module.exports = {
	async addInv(id) {
		await pool.query('INSERT INTO inventory (id) VALUES (?)', [id]);
		const [results] = await pool.query('SELECT * FROM inventory WHERE id = ?', [id]);
		return results[0];
	},
	async getInv(id) {
		let inv = invCache.get(id);

		// If this inv isnt cached yet
		if (inv === undefined) {
			try {
				const [results] = await pool.query('SELECT * FROM inventory WHERE id = ?', [id]);
				inv = results[0];

				// If this inv isnt in record
				if (inv === undefined) {
					inv = await this.addInv(id);
				}

				delete inv['id'];
				invCache.set(id, inv, 600);
			}
			catch (error) {
				console.log(error);
			}
		}

		return inv;
	},
	async updateItems(id, items) {
		let inv = invCache.get(id);

		// If this inv isnt cached yet
		if (inv === undefined) {
			inv = await this.getInv(id);
		}

		const sql = [];
		for (const item in items) {
			sql.push(`${item} = ${items[item]}`);
			inv[item] = items[item];
		}

		try {
			pool.query('UPDATE inventory SET ' + sql.join(', ') + ' WHERE id = ?', [id]);
		}
		catch (error) {
			console.log(error);
		}

		invCache.set(id, inv);
	},
	reload() {
		invCache.flushAll();
	},
};