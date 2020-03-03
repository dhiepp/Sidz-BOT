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
		let nextPres = currentPres;
		let nextRank = String.fromCharCode(currentRank.charCodeAt() + 1);
		if (currentRank === 'Z') {
			nextRank = 'A';
			nextPres++;
		}
		const price = Math.round(ranks[currentRank] * (currentPres * 0.2 + 0.8));
		const sellMul = currentPres * 0.1 + 0.9;

		const embed = new Discord.RichEmbed()
			.setAuthor(`${message.author.username}`, message.author.avatarURL)
			.setColor('BLUE')
			.setDescription(`Rank hiện tại: **${currentRank}${currentPres}**`
				+ `\nGiá bán đồ: **x${sellMul}**`
				+ `\nRank tiếp theo: **${nextRank}${nextPres}**`
				+ `\nYêu cầu: ${dollar.icon} **${price}** ${dollar.name}`)
			.addField('Lên rank', 'Dùng lệnh `s.rankup` để lên rank')
			.setFooter(footer);

		message.channel.send(embed);
	},
};