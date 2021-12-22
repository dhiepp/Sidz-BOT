const Discord = require('discord.js');
const resources = require('../mining/resources.json');
const pickaxes = require('../mining/pickaxes.json');
const userdata = require('../mining/userdata.js');
const inventorydata = require('../mining/inventorydata.js');

const pickEmbeds = [];

module.exports = {
	name: 'craft',
	description: 'Craft pickaxes',
	usage: '[pickaxe]',
	cooldown: 3,
	async execute(message, args) {
		// Show craftable pickaxes
		if (args.length == 0) {
			const user = await userdata.getUser(message.author);
			let page = pickaxes[user.pickaxe].id;

			let embed = getPickEmbed(page);
			if (embed == null) return;
			embed.setFooter(`Trang ${page + 1} / ${pickEmbeds.length}`)

			const row = new Discord.MessageActionRow()
				.addComponents(
					new Discord.MessageButton().setCustomId('previous').setStyle('SECONDARY').setEmoji('⬅️'),
					new Discord.MessageButton().setCustomId('next').setStyle('SECONDARY').setEmoji('➡️'),
				);
			const selection = await message.channel.send({ embeds: [embed], components: [row] });

			const collector = selection.createMessageComponentCollector({
				filter: interaction => interaction.customId === 'previous' || interaction.customId === 'next' && interaction.user.id === message.author.id,
				time: 60000
			});

			collector.on('collect', async interaction => {
				switch (interaction.customId) {
				case 'previous':
					page = page > 0 ? --page : pickEmbeds.length - 1;
					break;
				case 'next':
					page = page + 1 < pickEmbeds.length ? ++page : 0;
					break;
				default:
					break;
				}
				embed = getPickEmbed(page);
				if (embed === null) return;
				embed.setFooter(`Trang ${page + 1} / ${pickEmbeds.length}`);
				await interaction.update({ embeds: [embed] });
			});
			collector.on('end', async interaction => {
				embed.setColor('GRAY');
				await interaction.update({ embeds: [embed], components: [] });
			});
		}

		// Crafting
		if (args.length >= 1) {
			const pickName = args[0].toLowerCase();
			const pick = pickaxes[pickName];

			// Invalid pickaxe
			if (pick === undefined) {
				message.channel.send(`:warning: **${message.author.username}**! Pickaxe mà bạn muốn chế tạo không hợp lệ!`);
				return;
			}

			const material = resources[pick.craft.material];
			const amount = pick.craft.amount;

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
	},
};

function getPickEmbed(page) {
	if (!pickEmbeds.length) {
		for (const pickName in pickaxes) {
			if (pickName === 'none') continue;
			const pick = pickaxes[pickName];
			const material = resources[pick.craft.material];
			const amount = pick.craft.amount;

			let mineableMessage = '';
			for (const mineable of pick.mineable) {
				mineableMessage += resources[mineable].icon + ' ';
			}

			const embed = new Discord.MessageEmbed()
				.setColor('ORANGE')
				.setTitle('⚒️ Chế tạo pickaxe')
				.setDescription(`${pick.icon} **${pick.name}**\nĐộ bền: **${pick.durability}**\nNguyên liệu: ${material.icon} **x${amount}**`)
				.addField('Khoáng sản đào được', mineableMessage)
				.addField('⚠️ Lưu ý', 'Pickaxe cũ của bạn và tất cả enchants sẽ bị mất!'
					+ `\nDùng lệnh \`s.craft ${pickName}\` để chế tạo`);

			pickEmbeds.push(embed);
		}
	}
	return pickEmbeds[page];
}