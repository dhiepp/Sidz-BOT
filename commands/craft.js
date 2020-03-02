const { footer } = require('../config.json');
const Discord = require('discord.js');
const resources = require('../mining/resources.json');
const pickaxes = require('../mining/pickaxes.json');
const userdata = require('../mining/userdata.js');
const inventorydata = require('../mining/inventorydata.js');

module.exports = {
	name: 'craft',
	description: 'Craft pickaxes',
	usage: '[pickaxe]',
	cooldown: 3,
	async execute(message, args) {
		// Show craftable pickaxes
		if (args.length == 0) {
			const embed = new Discord.RichEmbed()
				.setColor('ORANGE')
				.setTitle('⚒️ Chế tạo pickaxe')
				.setDescription('Dùng lệnh `s.craft [pickaxe]` để chế tạo')
				.setFooter(footer);

			for (const pickName in pickaxes) {
				if (pickName === 'none') continue;
				const pick = pickaxes[pickName];
				const material = resources[pick.craft.material];
				embed.addField(`\`s.craft ${pickName}\``, `${pick.icon} **${pick.name}**\nĐộ bền: **${pick.durability}**\nNguyên liệu: ${material.icon} **x${pick.craft.amount}**`, true);
			}
			message.channel.send(embed);
		}

		// Crafting
		if (args.length >= 1) {
			const pickName = args[0];
			const pick = pickaxes[pickName];

			// Invalid pickaxe
			if (pick === undefined) {
				message.channel.send(`:warning: **${message.author.username}**! Pickaxe mà bạn muốn chế tạo không hợp lệ!`);
				return;
			}

			const material = resources[pick.craft.material];
			const amount = pick.craft.amount;

			let mineableMessage = '';
			for (const mineable of pick.mineable) {
				mineableMessage += resources[mineable].icon + ' ';
			}

			const embed = new Discord.RichEmbed()
				.setAuthor(message.author.username, message.author.avatarURL)
				.setColor('ORANGE')
				.setTitle('⚒️ Bạn có muốn chế tạo pickaxe này không?')
				.setDescription(`${pick.icon} **${pick.name}**\nĐộ bền: **${pick.durability}**\nNguyên liệu: ${material.icon} **x${amount}**`)
				.addField('Khoáng sản đào được', mineableMessage)
				.addField(':warning: Lưu ý', 'Pickaxe cũ của bạn và tất cả enchants sẽ bị mất!\nReact với ✅ để xác nhận')
				.setFooter('Yêu cầu hết hạn sau 10 giây');

			const selection = await message.channel.send(embed);
			await selection.react('✅');
			await selection.react('❎');

			const filter = (reaction, user) => {
				return ['✅', '❎'].includes(reaction.emoji.name) && user.id === message.author.id;
			};

			selection.awaitReactions(filter, { max: 1, time: 10000, errors: ['time'] })
				.then(collected => {
					const reaction = collected.first();

					if (reaction.emoji.name === '✅') {
						embed.setColor('GRAY').setFooter('Yêu cầu này đã được xác nhận');
						craftPickaxe(message, pickName, pick, material, amount);
					}
					else {
						embed.setColor('GRAY').setFooter('Yêu cầu này đã bị hủy');
					}
					selection.edit(embed);
				})
				.catch(() => {
					selection.clearReactions();
					embed.setColor('GRAY').setFooter('Yêu cầu này đã hết thời gian');
					selection.edit(embed);
				});
		}
	},
};

async function craftPickaxe(message, pickName, pick, material, amount) {
	const inv = await inventorydata.getInv(message.author.id);

	if (inv[pick.craft.material] < amount) {
		message.channel.send(`🚫 **${message.author.username}**! Bạn không có đủ ${material.icon} **${material.name}** để chế tạo`
		+ ` ${pick.icon} **${pick.name}** \`(${inv[pick.craft.material]} / ${amount})\``);
		return;
	}

	inv[pick.craft.material] -= amount;

	userdata.updatePickaxe(message.author, pickName, pick.durability, true);
	inventorydata.updateItems(message.author.id, inv);
	message.channel.send(`✅ **${message.author.username}**, bạn đã chế tạo thành công ${pick.icon} **${pick.name}**`);
}