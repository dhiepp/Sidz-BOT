const { footer } = require('../config.json');
const Discord = require('discord.js');
const resources = require('../mining/resources.json');
const pickaxes = require('../mining/pickaxes.json');
const enchants = require('../mining/enchants.json');
const { experience } = require('../mining/currency.json');
const userdata = require('../mining/userdata.js');
const inventorydata = require('../mining/inventorydata.js');
const NodeCache = require('node-cache');

module.exports = {
	name: 'mine',
	description: 'Go mining...',
	cooldown: 5,
	async execute(message) {
		// Cheat detection
		const name = message.author.username;
		if (cheatDetect(name)) return message.channel.send(`**${name}**! Bạn chưa thể đi mine lúc này!`);

		// Get user data
		const user = await userdata.getUser(message.author);
		// Get inventory
		const inv = await inventorydata.getInv(message.author.id);

		const pick = pickaxes[user.pickaxe];
		let enchantMessage = '';
		const mined = [];

		for (const enchant in enchants) {
			if (user[enchant] > 0) {
				enchantMessage += `\n${enchants[enchant].name} ${user[enchant]}`;
			}
		}

		for (const mineable of pick.mineable) {
			mined[mineable] = 0;
		}

		for (let i = 0; i <= user.efficiency; i++) {
			const ran = Math.random() * 100;
			let percent = 0;

			for (const mineable of pick.mineable) {
				const resource = resources[mineable];
				percent += resource.chance;
				if (ran <= percent) {
					mined[mineable]++;
					break;
				}
			}

			// Also using this random value to calculate the chance of unbreaking
			// If the random value is below the breaking percent then the pick lose durability
			// Unbreaking below 5 = +10% each level, from 6 = + 5% each level
			const unbreakChance = (user.unbreaking <= 5) ? user.unbreaking * 10 : user.unbreaking * 5 + 25;
			if (ran <= (100 - unbreakChance)) {
				// If the pick is broken, stop the loop (1 bonus resource)
				// Also works as none pick filter
				if (user.durability <= 0) break;
				user.durability--;
			}
		}

		let minedMessage = '';
		let gainedXP = 0;

		for (const resource in resources) {
			if (mined[resource] > 0) {
				// XP does not multiply with fortune
				gainedXP += resources[resource].worth * mined[resource];
				// Multiple by fortune level
				mined[resource] *= user.fortune + 1;
				minedMessage += `${resources[resource].icon} **x${mined[resource]}** `;
			}
		}

		for (const item in mined) {
			inv[item] += mined[item];
		}

		// Increase blocks mined
		user.blocks += 1 + user.efficiency;

		inventorydata.updateItems(message.author.id, inv);
		userdata.mining(message.author, user.xp + gainedXP, user.durability, user.blocks);
		// Break the pickaxe if not hand
		if (user.durability <= 0 && user.pickaxe !== 'none') {
			enchantMessage += '\n💥 **Pickaxe của bạn đã bị hỏng!**';
			userdata.updatePickaxe(message.author, 'none', 0, true);
		}

		const embed = new Discord.RichEmbed()
			.setAuthor(`${message.author.username} đã đi mine!`, message.author.avatarURL)
			.setTitle(`${pick.icon} ${pick.name} \`(${user.durability}/${pick.durability})\``)
			.setColor('GREEN')
			.setDescription(enchantMessage)
			.addField('Mined Resources', minedMessage)
			.addField('Experience Gained', `${experience.icon} **${gainedXP}**`)
			.setFooter(footer);

		message.channel.send(embed);
	},
};

const protection = new NodeCache();

function cheatDetect(name) {
	let blocked = false;
	let data = protection.get(name);
	if (data === undefined) {
		data = {};
		data.lastPeriod = 0;
		data.vl = 0;
	}
	else {
		const period = Date.now() - data.lastMined;

		// Perform protection
		if (period <= (this.cooldown + data.vl / 2) * 1000) {
			console.log('BLOCKED ' + name);
			blocked = true;
		}

		// The time that fluctuate between action periods (ms)
		const dif = Math.abs(data.lastPeriod - period);
		if (dif < 100) data.vl++;

		data.lastPeriod = period;
	}
	data.lastMined = Date.now();
	protection.set(name, data, 600);
	return blocked;
}