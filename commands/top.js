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

		const selection = await message.channel.send(embed.setFooter(`Trang ${page + 1} / ${types.length}`));
		await selection.react('⬅️');
		await selection.react('➡️');

		const reactionCollector = selection.createReactionCollector(
			(reaction, user) => ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === message.author.id,
			{ time: 60000 },
		);

		reactionCollector.on('collect', async (reaction) => {
			reaction.remove(message.author);
			switch (reaction.emoji.name) {
			case '⬅️':
				page = page > 0 ? --page : types.length - 1;
				break;
			case '➡️':
				page = page + 1 < types.length ? ++page : 0;
				break;
			default:
				break;
			}
			embed = await getTop(message, types[page]);
			if (embed === null) return;
			selection.edit(embed.setFooter(`Trang ${page + 1} / ${types.length}`));
		});
		reactionCollector.on('end', () => {
			selection.clearReactions();
			selection.edit(embed.setColor('GRAY'));
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
			leaderboardMessage += `${numbers[count]} ${player.username}\`#${player.tag}\` : **${player.rank} ${player.prestige}**\n`;
			break;
		case 'blocks':
			leaderboardMessage += `${numbers[count]} ${player.username}\`#${player.tag}\` : **${player.blocks}** blocks\n`;
			break;
		default:
			leaderboardMessage += `${numbers[count]} ${player.username}\`#${player.tag}\` = ${dollar.icon} **${player.money.toLocaleString()} ${dollar.name}**\n`;
		}
		count++;
	}

	let your = '';
	switch (type) {
	case 'rank':
		your = `${user.username}\`#${user.tag}\` : **${user.rank} ${user.prestige}**\n`;
		break;
	case 'blocks':
		your = `${user.username}\`#${user.tag}\` : **${user.blocks}** blocks\n`;
		break;
	default:
		your = `${user.username}\`#${user.tag}\` = ${dollar.icon} **${user.money.toLocaleString()} ${dollar.name}**\n`;
	}

	embed = new Discord.RichEmbed()
		.setColor('GOLD')
		.setTitle(`📜 Bảng xếp hạng ${typeNames[type]}`)
		.setDescription(leaderboardMessage)
		.addField(`${typeNames[type]} của bạn`, your)
		.setTimestamp(new Date());

	topCache.set(type, embed);
	return embed;
}