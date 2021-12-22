const Discord = require('discord.js');
const NodeCache = require('node-cache');
const userdata = require('../mining/userdata.js');
const { dollar } = require('../mining/currency.json');

const topCache = new NodeCache();
const types = ['money', 'rank', 'blocks'];
const typeNames = { money: 'Tài sản', rank: 'Rank', blocks: 'Blocks đã đào' };
const numbers = [':one:', ':two:', ':three:', ':four:', ':five:', ':six:', ':seven:', ':eight:', ':nine:', ':keycap_ten:'];

module.exports = {
	name: 'top',
	description: 'Check the leaderboard for money',
	aliases: ['leaderboard', 'baltop'],
	cooldown: 10,
	async execute(message) {
		let page = 0;

		let embed = await getTop(message, types[page]);
		if (embed == null) return;
		embed.setFooter(`Trang ${page + 1} / ${types.length}`)

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
				page = page > 0 ? --page : types.length - 1;
				break;
			case 'next':
				page = page + 1 < types.length ? ++page : 0;
				break;
			default:
				break;
			}
			embed = await getTop(message, types[page]);
			if (embed === null) return;
			embed.setFooter(`Trang ${page + 1} / ${types.length}`);
			await interaction.update({ embeds: [embed] });
		});
		collector.on('end', async () => {
			embed.setColor('GREY');
			await selection.edit({ embeds: [embed], components: [] });
		});
	},
};

async function getTop(message, type) {
	let embed = topCache.get(type);

	// This top type is cached
	if (embed !== undefined) {
		return embed;
	}

	// Not cached yet
	// Get leaderboard data
	const leaderboard = await userdata.getTop(type);
	// Get user data
	const user = await userdata.getUser(message.author);

	let leaderboardMessage = '';

	let count = 0;
	for (const pos in leaderboard) {
		const player = leaderboard[pos];
		switch (type) {
		case 'rank':
			leaderboardMessage += `${numbers[count]} ${player.username}\`#${player.tag}\` : [**${player.rank} ${player.prestige}**]\n`;
			break;
		case 'blocks':
			leaderboardMessage += `${numbers[count]} ${player.username}\`#${player.tag}\` : **${player.blocks}** blocks\n`;
			break;
		default:
			leaderboardMessage += `${numbers[count]} ${player.username}\`#${player.tag}\` = ${dollar.icon} **${player.money.toLocaleString()} ${dollar.name}**\n`;
		}
		count++;
	}

	embed = new Discord.MessageEmbed()
		.setColor('GOLD')
		.setTitle(`📜 Bảng xếp hạng ${typeNames[type]}`)
		.setDescription(leaderboardMessage)
		.setTimestamp(new Date());

	topCache.set(type, embed, 600);
	return embed;
}