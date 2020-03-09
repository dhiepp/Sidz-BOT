const { footer } = require('../config.json');
const Discord = require('discord.js');
const ranks = require('../mining/ranks.json');
const userdata = require('../mining/userdata.js');
const { dollar } = require('../mining/currency.json');

module.exports = {
	name: 'rank',
	description: 'Check your rank',
	cooldown: 3,
	async execute(message) {

		// Get user data
		const user = await userdata.getUser(message.author);

		const currentRank = user.rank;
		const currentPres = user.prestige;
		const nextRank = String.fromCharCode(currentRank.charCodeAt() + 1);
		const price = ranks[nextRank];

		let rankMessage = '';
		let helpMessage = '';

		if (currentRank === 'Z') {
			rankMessage = `Rank hiện tại: [**${currentRank} ${currentPres}**]`
				+ '\nBạn đã đạt rank cao nhất!';
			helpMessage = ['⏫ Lên cấp', 'Dùng lệnh `s.prestige` để lên cấp'];
		}
		else {
			rankMessage = `Rank hiện tại: [**${currentRank} ${currentPres}**]`
				+ `\nRank tiếp theo: [**${nextRank} ${currentPres}**]`
				+ `\nYêu cầu: ${dollar.icon} **${price.toLocaleString()}** ${dollar.name}`;
			helpMessage = ['🔼 Lên rank', 'Dùng lệnh `s.rankup` để lên rank\nDùng lệnh `s.rankup max` để lên cấp cao nhất có thể'];
		}

		const embed = new Discord.RichEmbed()
			.setAuthor(`${message.author.username}`, message.author.avatarURL)
			.setColor('BLUE')
			.setDescription(rankMessage)
			.addField(helpMessage[0], helpMessage[1])
			.setFooter(footer);

		message.channel.send(embed);
	},
};