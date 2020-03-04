const { footer } = require('../config.json');
const Discord = require('discord.js');
const pickaxes = require('../mining/pickaxes.json');
const enchants = require('../mining/enchants.json');
const { experience } = require('../mining/currency.json');
const userdata = require('../mining/userdata.js');

module.exports = {
	name: 'enchant',
	description: 'Enchant pickaxe',
	usage: '[enchantment]',
	aliases: ['pick'],
	cooldown: 3,
	async execute(message, args) {
		// Get user data
		const user = await userdata.getUser(message.author);
		const pick = pickaxes[user.pickaxe];

		// No pick
		if (user.pickaxe === 'none') {
			const embed = new Discord.RichEmbed()
				.setAuthor(message.author.username, message.author.avatarURL)
				.setColor('PURPLE')
				.setTitle('⭐ Enchanting pickaxe')
				.setDescription(pick.icon + ' Bạn không có pickaxe!\nHãy dùng lệnh `s.craft` để chế tạo.')
				.setFooter(footer);
			message.channel.send(embed);
			return;
		}

		// Show enchantments
		if (args.length == 0) {
			const pickMessage = `${pick.icon} **${pick.name}** \`(${user.durability}/${pick.durability})\``
				+ '\nDùng lệnh `s.enchant [enchantment] [level]` để phù phép'
				+ `\nBạn đang có ${experience.icon} **${user.xp}** ${experience.name}`;

			const embed = new Discord.RichEmbed()
				.setAuthor(message.author.username, message.author.avatarURL)
				.setColor('PURPLE')
				.setTitle('⭐ Enchanting pickaxe')
				.setDescription(pickMessage)
				.setFooter(footer);

			for (const enc in enchants) {
				const enchant = enchants[enc];
				const cur = user[enc];
				const next = cur + 1;
				const price = enchant.prices[next - 1];

				let enMsg = enchant.description;
				if (next > enchant.max) {
					enMsg += '\nĐã đạt level tối đa';
				}
				else {
					enMsg += `\nLevel tiếp theo: **${next} / ${enchant.max}**\nYêu cầu: ${experience.icon} **${price}**`;
				}
				embed.addField(`${enchant.name} ${cur}`, enMsg);
			}
			message.channel.send(embed);
		}

		// Enchanting
		if (args.length >= 1) {
			const enchantName = args[0];
			const enchant = enchants[enchantName];

			// Invalid pickaxe
			if (enchant === undefined) {
				message.channel.send(`:warning: **${message.author.username}**! Enchant mà bạn muốn phù phép không hợp lệ!`);
				return;
			}

			const cur = user[enchantName];
			let level = cur + 1;
			let price = enchant.prices[level - 1];
			// Specify level
			if (args[1] !== undefined) {
				level = parseInt(args[1]);
				// Invalid enchantmet
				if (isNaN(level) || level > enchant.max || level <= 0) {
					message.channel.send(`🚫 **${message.author.username}**! Hãy nhập cấp độ phù hợp cho **${enchant.name}** \`(Max ${enchant.max})\``);
					return;
				}
				// Passed enchantment
				if (level <= cur) {
					message.channel.send(`🚫 **${message.author.username}**! Pickaxe của bạn đã có hoặc hơn enchant **${enchant.name} ${level}** rồi!`);
					return;
				}
				// Calculate from the next level to the desired level
				// Note: the next level price is already included, so we start from the next next level
				for (let i = user[enchantName] + 1; i < level; i++) {
					price += enchant.prices[i];
				}
			}

			if (level > enchant.max) {
				message.channel.send(`🚫 **${message.author.username}**! Bạn đã đạt cấp độ tối đa cho enchant **${enchant.name}**`);
				return;
			}

			if (user.xp < price) {
				message.channel.send(`🚫 **${message.author.username}**! Bạn không có đủ ${experience.icon} **${experience.name}** để phù phép **${enchant.name} ${level}** \`(${user.xp} / ${price})\``);
				return;
			}

			userdata.updateXP(message.author, user.xp - price);
			userdata.updateEnchant(message.author, enchantName, level);

			message.channel.send(`✅ **${message.author.username}**, bạn đã enchant thành công **${enchant.name} ${level}** cho ${pick.icon} **${pick.name}** với ${experience.icon} **${price}**`);
		}
	},
};