const NodeCache = require('node-cache');
const { pool } = require('../mysql.js');

const userCache = new NodeCache();
const topCache = new NodeCache();

module.exports = {
	async addUser(id, name, tag) {
		await pool.query('INSERT INTO user (id, username, tag) VALUES (?, ?, ?)', [id, name, tag]);
		const [results] = await pool.query('SELECT * FROM user WHERE id = ?', [id]);
		return results[0];
	},
	async getUser(author) {
		const id = author.id;
		let user = userCache.get(id);

		// If this user isnt cached yet
		if (user === undefined) {
			try {
				const [results] = await pool.query('SELECT * FROM user WHERE id = ?', [id]);
				user = results[0];

				// If this user isnt in record
				if (user === undefined) {
					user = await this.addUser(id, author.username, author.discriminator);
				}

				userCache.set(id, user, 600);
			}
			catch (error) {
				console.log(error);
			}
		}

		return user;
	},
	async getTop(type) {
		let leaderboard = topCache.get(type);

		// If top is not cached
		if (leaderboard === undefined) {
			let sql = '';
			switch (type) {
			case 'rank':
				sql = 'SELECT username, tag, rank, prestige FROM mining_bot.user ORDER BY prestige DESC, rank DESC LIMIT 10';
				break;
			case 'blocks':
				sql = 'SELECT username, tag, blocks FROM mining_bot.user ORDER BY blocks DESC LIMIT 10';
				break;
			default:
				sql = 'SELECT username, tag, money FROM user ORDER BY money DESC LIMIT 10';
			}
			[leaderboard] = await pool.query(sql);
			topCache.set(type, leaderboard, 600);
		}

		return leaderboard;
	},
	async mining(author, xp, durability, blocks) {
		const id = author.id;
		let user = userCache.get(id);

		// If this user isnt cached yet
		if (user === undefined) {
			user = await this.getUser(author);
		}

		user.xp = xp;
		user.durability = durability;
		user.blocks = blocks;
		try {
			pool.query('UPDATE user SET xp = ?, durability = ?, blocks = ? WHERE id = ?', [xp, durability, blocks, id]);
		}
		catch (error) {
			console.log(error);
		}

		userCache.set(id, user);
	},
	async updateXP(author, xp) {
		const id = author.id;
		let user = userCache.get(id);

		// If this user isnt cached yet
		if (user === undefined) {
			user = await this.getUser(author);
		}

		user.xp = xp;

		try {
			pool.query('UPDATE user SET xp = ? WHERE id = ?', [xp, id]);
		}
		catch (error) {
			console.log(error);
		}

		userCache.set(id, user);
	},
	async updateMoney(author, money) {
		const id = author.id;
		let user = userCache.get(id);

		// If this user isnt cached yet
		if (user === undefined) {
			user = await this.getUser(author);
		}

		user.money = money;
		try {
			pool.query('UPDATE user SET money = ? WHERE id = ?', [money, id]);
		}
		catch (error) {
			console.log(error);
		}

		userCache.set(id, user);
	},
	async updateEnchant(author, enchantName, level) {
		const id = author.id;
		let user = userCache.get(id);

		// If this user isnt cached yet
		if (user === undefined) {
			user = await this.getUser(author);
		}

		user[enchantName] = level;

		try {
			pool.query(`UPDATE user SET ${enchantName} = ? WHERE id = ?`, [level, id]);
		}
		catch (error) {
			console.log(error);
		}

		userCache.set(id, user);
	},
	async updatePickaxe(author, pickName, durability, resetEnchants) {
		const id = author.id;
		let user = userCache.get(id);

		// If this user isnt cached yet
		if (user === undefined) {
			user = await this.getUser(author);
		}

		user.pickaxe = pickName;
		user.durability = durability;
		let reset = '';
		if (resetEnchants) {
			user.unbreaking = 0;
			user.efficiency = 0;
			user.fortune = 0;
			reset = ', unbreaking = 0, efficiency = 0, fortune = 0';
		}


		try {
			pool.query('UPDATE user SET pickaxe = ?, durability = ?' + reset + ' WHERE id = ?', [pickName, durability, id]);
		}
		catch (error) {
			console.log(error);
		}

		userCache.set(id, user);
	},
	async updateRank(author, rank) {
		const id = author.id;
		let user = userCache.get(id);

		// If this user isnt cached yet
		if (user === undefined) {
			user = await this.getUser(author);
		}

		user.rank = rank;

		try {
			pool.query('UPDATE user SET rank = ? WHERE id = ?', [rank, id]);
		}
		catch (error) {
			console.log(error);
		}

		userCache.set(id, user);
	},
	async updatePrestige(author, prestige) {
		const id = author.id;
		let user = userCache.get(id);

		// If this user isnt cached yet
		if (user === undefined) {
			user = await this.getUser(author);
		}

		user.prestige = prestige;

		try {
			pool.query('UPDATE user SET prestige = ? WHERE id = ?', [prestige, id]);
		}
		catch (error) {
			console.log(error);
		}

		userCache.set(id, user);
	},
	reload() {
		userCache.flushAll();
		topCache.flushAll();
	},
};