const { footer } = require('../config.json');
const Discord = require('discord.js');
const resources = require('../mining/resources.json');
const pickaxes = require('../mining/pickaxes.json');
const enchants = require('../mining/enchants.json');
const { dollar, experience } = require('../mining/currency.json');
const userdata = require('../mining/userdata.js');
const inventorydata = require('../mining/inventorydata.js');

module.exports = {
	name: 'fix',
	description: 'Fix pickaxe',
	aliases: ['repair', 'mend'],
	usage: '[yes]',
	cooldown: 5,
	async execute(message, args) {
		// Get user data
		const user = await userdata.getUser(message.author);
		const pick = pickaxes[user.pickaxe];

		// No pick
		if (user.pickaxe === 'none') {
			const embed = new Discord.RichEmbed()
				.setAuthor(message.author.username, message.author.avatarURL)
				.setColor('LUMINOUS_VIVID_PINK')
				.setTitle('🩹 Fixing pickaxe')
				.setDescription(pick.icon + ' Bạn không có pickaxe!\nHãy dùng lệnh `s.craft` để chế tạo.')
				.setFooter(footer);
			message.channel.send(embed);
			return;
		}

		// Full durability
		if (user.durability == pick.durability) {
			message.channel.send(`🚫 **${message.author.username}**! Pickaxe của bạn đã ở độ bền tối đa!`);
			return;
		}

		const material = pick.craft.material;
		const resource = resources[material];
		let resAmount = pick.craft.amount;
		let xpAmount = 0;
		let moneyCost = 0;

		for (const enchantName in enchants) {
			const enchant = enchants[enchantName];
			const level = user[enchantName];
			if (level > 0) {
				for (let i = 0; i < level; i++) {
					xpAmount += enchant.prices[i];
				}
			}
		}

		resAmount = Math.ceil((1 - user.durability / pick.durability) * resAmount);
		xpAmount = Math.ceil((1 - user.durability / pick.durability) * xpAmount);
		moneyCost = Math.ceil(resAmount * resource.worth + xpAmount / 2);

		// Show fix prices
		if (args.length == 0) {
			let pickMessage = `${pick.icon} **${pick.name}** \`[${user.durability}/${pick.durability}]\``;
			for (const enchantName in enchants) {
				const enchant = enchants[enchantName];
				const level = user[enchantName];
				if (level > 0) {
					pickMessage += `\n${enchant.name} ${level}`;
				}
			}

			const embed = new Discord.RichEmbed()
				.setAuthor(message.author.username, message.author.avatarURL)
				.setColor('LUMINOUS_VIVID_PINK')
				.setTitle('🩹 Fixing pickaxe')
				.setDescription(pickMessage)
				.addField('Chi phí sửa chữa', `${resource.icon} **${resAmount}** ${resource.name}`
					+ `\n${experience.icon} **${xpAmount}** ${experience.name}\n${dollar.icon} **${moneyCost}** ${dollar.name}`)
				.addField('Bạn có muốn sửa pickaxe này không?', 'Dùng lệnh `s.fix yes` để xác nhận')
				.setFooter(footer);

			message.channel.send(embed);
		}

		// Do fixing
		if (args.length >= 1) {
			const inv = await inventorydata.getInv(message.author.id);
			// Check resources, xp and money
			if (inv[material] < resAmount) {
				message.channel.send(`🚫 **${message.author.username}**! Bạn không có đủ ${resource.icon} **${resource.name}** để sửa chữa! `
					+ `\`(${inv[material]}/${resAmount})\``);
				return;
			}
			if (user.xp < xpAmount) {
				message.channel.send(`🚫 **${message.author.username}**! Bạn không có đủ ${experience.icon} **${experience.name}** để sửa chữa! `
				+ `\`(${user.xp}/${xpAmount})\``);
				return;
			}
			if (user.money < moneyCost) {
				message.channel.send(`🚫 **${message.author.username}**! Bạn không có đủ ${dollar.icon} **${dollar.name}** để sửa chữa! `
				+ `\`(${user.money}/${moneyCost})\``);
				return;
			}

			inv[material] -= resAmount;

			inventorydata.updateItems(message.author.id, inv);
			userdata.updateXP(message.author, user.xp - xpAmount);
			userdata.updateMoney(message.author, user.money - moneyCost);
			userdata.updatePickaxe(message.author, user.pickaxe, pick.durability, false);

			message.channel.send(`✅ **${message.author.username}**, bạn đã sửa chữa thành công ${pick.icon} **${pick.name}**`);
		}
	},
};