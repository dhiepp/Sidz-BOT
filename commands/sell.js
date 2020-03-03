const { footer } = require('../config.json');
const Discord = require('discord.js');
const resources = require('../mining/resources.json');
const { dollar } = require('../mining/currency.json');
const userdata = require('../mining/userdata.js');
const inventorydata = require('../mining/inventorydata.js');

module.exports = {
	name: 'sell',
	description: 'Sell your resources',
	args: true,
	usage: '<resource|all> [amount]',
	cooldown: 3,
	async execute(message, args) {
		let selling;
		let resource;
		let amount;

		// Selling all
		if (args.length == 1) {
			if (args[0] === 'all') {
				selling = 'all';
			}
			else {
				selling = args[0].toLowerCase();
				resource = resources[selling];
				if (resource === undefined) {
					message.channel.send(`:warning: **${message.author.username}**! Khoáng sản bạn muốn bán không tồn tại!`);
					return;
				}
				amount = 'all';
			}
		}

		// Selling amount
		if (args.length == 2) {
			selling = args[0].toLowerCase();
			resource = resources[selling];
			if (resource === undefined) {
				message.channel.send(`:warning: **${message.author.username}**! Khoáng sản bạn muốn bán không tồn tại!`);
				return;
			}
			amount = parseInt(args[1], 10);
			if (isNaN(amount)) {
				message.channel.send(`:warning: **${message.author.username}**! Hãy nhập số lượng \`${selling}\` mà bạn muốn bán, hoặc bỏ trống để bán tất cả!`);
				return;
			}
		}

		// Bulk selling is not supported yet
		if (args.length > 2) {
			message.channel.send(`:warning: Cách để bán khoáng sản: \`s.sell ${this.usage}\``);
			return;
		}

		// Get player data
		const user = await userdata.getUser(message.author);
		// Get inventory data
		const inv = await inventorydata.getInv(message.author.id);

		const sold = [];
		let soldMessage = '';
		let earned = 0;

		if (selling === 'all') {
			for (const item in inv) {
				amount = inv[item];
				if (amount == 0) continue;

				resource = resources[item];

				earned += resource.worth * amount;
				soldMessage += `${resource.icon} **x${amount}** `;
				sold[item] = amount;
				inv[item] -= amount;
			}
		}
		else {
			if (amount === 'all') {
				amount = inv[selling];
			}

			if (amount > 0 && amount <= inv[selling]) {
				earned = resource.worth * amount;
				soldMessage += `${resource.icon} **x${amount}** `;
				sold[selling] = amount;
				inv[selling] -= amount;
			}
		}

		if (!Object.keys(sold).length) {
			message.channel.send(':warning: Bạn không có đủ khoáng sản để bán!');
			return;
		}

		// Apply rank multiplier
		earned = Math.round(earned * (user.prestige * 0.1 + 0.9));

		userdata.updateMoney(message.author, user.money + earned);
		inventorydata.updateItems(message.author.id, inv);

		const embed = new Discord.RichEmbed()
			.setAuthor(`${message.author.username} đã bán khoáng sản!`, message.author.avatarURL)
			.setColor('GREEN')
			.addField('Resources Sold', soldMessage)
			.addField('Money Earned', `${dollar.icon} **+${earned}**`)
			.setFooter(footer);

		message.channel.send(embed);
	},
};