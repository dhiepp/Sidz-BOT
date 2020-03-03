const Discord = require('discord.js');
const userdata = require('../mining/userdata.js');
const { dollar } = require('../mining/currency.json');

const numbers = [':one:', ':two:', ':three:', ':four:', ':five:', ':six:', ':seven:', ':eight:', ':nine:', ':keycap_ten:'];

module.exports = {
	name: 'top',
	description: 'Check the leaderboard for money',
	aliases: ['leaderboard', 'baltop'],
	cooldown: 10,
	async execute(message) {

		// Get leaderboard data
		const leaderboard = await userdata.getTopMoney(message.author.id);
		// Get user data
		const user = await userdata.getUser(message.author);

		let leaderboardMessage = '';

		let count = 0;
		for (const pos in leaderboard) {
			const player = leaderboard[pos];
			leaderboardMessage += `${numbers[count]} ${player.username}\`#${player.tag}\` = ${dollar.icon} **${player.money.toLocaleString()} ${dollar.name}**\n`;
			count++;
		}

		const embed = new Discord.RichEmbed()
			.setColor('GOLD')
			.setTitle('📜 Bảng xếp hạng tài sản')
			.setDescription(leaderboardMessage)
			.addField('Tài sản của bạn', `${user.username}\`#${user.tag}\` = ${dollar.icon} **${user.money.toLocaleString()} ${dollar.name}**\n`)
			.setFooter('Bảng xếp hạng được cập nhật mỗi 10 phút');

		message.channel.send(embed);
	},
};