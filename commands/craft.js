const Discord = require('discord.js');
const resources = require('../mining/resources.json');
const pickaxes = require('../mining/pickaxes.json');
const userdata = require('../mining/userdata.js');
const inventorydata = require('../mining/inventorydata.js');

const types = {options: [], choices: []};
for (const type in pickaxes) {
	if (type == 'none') continue;
	const pickaxe = pickaxes[type];
	types.options.push({ name: pickaxe.name, value: type });
	types.choices.push({ label: pickaxe.name, value: type, emoji: pickaxe.emoji });
}

const select = new Discord.MessageActionRow()
	.addComponents(
		new Discord.MessageSelectMenu()
			.setCustomId('craft_select')
			.setPlaceholder('Bấm vào đây để chọn')
			.addOptions(types.choices));

module.exports = {
	name: 'craft',
	description: 'Craft pickaxes',
	cooldown: 5000,
	options: [
		{
			type: 'STRING',
			name: 'type',
			description: 'Bạn muốn chế tạo Pickaxe nào?',
			choices: types.options,
			required: false,
		}
	],
	async execute(interaction) {
		const type = interaction.options.getString('type');
		if (!type) {
			interaction.reply({ content: 'Hãy chọn một Pickaxe để xem chi tiết', components: [select] });
			return;
		}

		const author = interaction.user;
		const pick = pickaxes[type];

		// Invalid pickaxe
		if (pick === undefined) {
			interaction.reply(`:warning: **${author.username}**! Pickaxe mà bạn muốn chế tạo không hợp lệ!`);
			return;
		}

		const material = resources[pick.craft.material];
		const amount = pick.craft.amount;

		const inv = await inventorydata.getInv(author.id);

		if (inv[pick.craft.material] < amount) {
			interaction.reply(`🚫 **${author.username}**! Bạn không có đủ ${material.icon} **${material.name}** để chế tạo`
			+ ` ${pick.icon} **${pick.name}** \`(${inv[pick.craft.material]} / ${amount})\``);
			return;
		}

		inv[pick.craft.material] -= amount;

		userdata.updatePickaxe(author, type, pick.durability, true);
		inventorydata.updateItems(author.id, inv);
		interaction.reply(`✅ **${author.username}**, bạn đã chế tạo thành công ${pick.icon} **${pick.name}**`);
	},
	actions: {
		craft_select: async (interaction) => {
			const type = interaction.values[0];
			const pick = pickaxes[type];
			const material = resources[pick.craft.material];
			const amount = pick.craft.amount;
	
			let mineables = ' ';
			for (const mineable of pick.mineable) {
				mineables += resources[mineable].icon + ' ' + resources[mineable].name + ' ';
			}
	
			const embed = new Discord.MessageEmbed()
				.setColor('ORANGE')
				.setTitle(`**${pick.icon} ${pick.name}**`)
				.setDescription(`Độ bền: **${pick.durability}**\nNguyên liệu: ${material.icon} **x${amount}**`)
				.addField('Khoáng sản đào được', mineables)
				.addField('⚠️ Lưu ý', 'Pickaxe cũ của bạn và tất cả enchants sẽ bị mất!'
					+ `\nDùng lệnh \`/craft ${pick.name}\` để chế tạo`);
	
			interaction.update({ content: '**⚒️ Chế tạo pickaxe**', embeds: [embed] });
		},
	},
}
// 		// Show craftable pickaxes
// 		if (args.length == 0) {
// 			const user = await userdata.getUser(message.author);
// 			let page = pickaxes[user.pickaxe].id;

// 			let embed = getPickEmbed(page);
// 			if (embed == null) return;

// 			const selection = await message.channel.send(embed.setFooter(`Trang ${page + 1} / ${pickEmbeds.length}`));
// 			await selection.react('⬅️');
// 			await selection.react('➡️');

// 			const reactionCollector = selection.createReactionCollector(
// 				(reaction, reactor) => ['⬅️', '➡️'].includes(reaction.emoji.name) && reactor.id === message.author.id,
// 				{ time: 60000 },
// 			);

// 			reactionCollector.on('collect', async (reaction) => {
// 				reaction.remove(message.author);
// 				switch (reaction.emoji.name) {
// 				case '⬅️':
// 					page = page > 0 ? --page : pickEmbeds.length - 1;
// 					break;
// 				case '➡️':
// 					page = page + 1 < pickEmbeds.length ? ++page : 0;
// 					break;
// 				default:
// 					break;
// 				}
// 				embed = getPickEmbed(page);
// 				if (embed === null) return;
// 				selection.edit(embed.setFooter(`Trang ${page + 1} / ${pickEmbeds.length}`));
// 			});
// 			reactionCollector.on('end', () => {
// 				selection.clearReactions();
// 				selection.edit(embed.setColor('GRAY'));
// 			});
// 		}

// 		// Crafting
// 		if (args.length >= 1) {
// 			const pickName = args[0].toLowerCase();
// 			const pick = pickaxes[pickName];

// 			// Invalid pickaxe
// 			if (pick === undefined) {
// 				message.channel.send(`:warning: **${message.author.username}**! Pickaxe mà bạn muốn chế tạo không hợp lệ!`);
// 				return;
// 			}

// 			const material = resources[pick.craft.material];
// 			const amount = pick.craft.amount;

// 			const inv = await inventorydata.getInv(message.author.id);

// 			if (inv[pick.craft.material] < amount) {
// 				message.channel.send(`🚫 **${message.author.username}**! Bạn không có đủ ${material.icon} **${material.name}** để chế tạo`
// 				+ ` ${pick.icon} **${pick.name}** \`(${inv[pick.craft.material]} / ${amount})\``);
// 				return;
// 			}

// 			inv[pick.craft.material] -= amount;

// 			userdata.updatePickaxe(message.author, pickName, pick.durability, true);
// 			inventorydata.updateItems(message.author.id, inv);
// 			message.channel.send(`✅ **${message.author.username}**, bạn đã chế tạo thành công ${pick.icon} **${pick.name}**`);
// 		}
// 	},
// };

// function getPickEmbed(page) {
// 	if (!pickEmbeds.length) {
// 		for (const pickName in pickaxes) {
// 			if (pickName === 'none') continue;
// 			const pick = pickaxes[pickName];
// 			const material = resources[pick.craft.material];
// 			const amount = pick.craft.amount;

// 			let mineableMessage = '';
// 			for (const mineable of pick.mineable) {
// 				mineableMessage += resources[mineable].icon + ' ';
// 			}

// 			const embed = new Discord.RichEmbed()
// 				.setColor('ORANGE')
// 				.setTitle('⚒️ Chế tạo pickaxe')
// 				.setDescription(`${pick.icon} **${pick.name}**\nĐộ bền: **${pick.durability}**\nNguyên liệu: ${material.icon} **x${amount}**`)
// 				.addField('Khoáng sản đào được', mineableMessage)
// 				.addField('⚠️ Lưu ý', 'Pickaxe cũ của bạn và tất cả enchants sẽ bị mất!'
// 					+ `\nDùng lệnh \`s.craft ${pickName}\` để chế tạo`);

// 			pickEmbeds.push(embed);
// 		}
// 	}
// 	return pickEmbeds[page];
// }