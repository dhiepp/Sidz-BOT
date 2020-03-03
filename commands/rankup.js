const { footer } = require('../config.json');
const Discord = require('discord.js');
const ranks = require('../mining/ranks.json');
const userdata = require('../mining/userdata.js');
const { dollar } = require('../mining/currency.json');

module.exports = {
	name: 'rankup',
	description: 'Rankup!',
	aliases: ['ru'],
	cooldown: 3,
	async execute(message) {

		// Get user data
		const user = await userdata.getUser(message.author);

		const currentRank = user.rank;
		const currentPres = user.prestige;
		const nextRank = String.fromCharCode(currentRank.charCodeAt() + 1);
		const price = Math.round(ranks[currentRank] * (currentPres * 0.2 + 0.8));

		if (currentRank === 'Z') {
			message.channel.send(`🚫 **${message.author.username}**! Bạn đã đạt rank cao nhất rồi, hãy dùng lệnh \`s.prestige\` để lên cấp!`);
			return;
		}

		if (user.money < price) {
			message.channel.send(`🚫 **${message.author.username}**! Bạn không có đủ ${dollar.icon} **${dollar.name}** để lên rank! \`${user.money}/${price}\``);
			return;
		}

		userdata.updateRank(message.author, nextRank);
		userdata.updateMoney(message.author, user.money - price);

		const embed = new Discord.RichEmbed()
			.setAuthor(`${message.author.username}`, message.author.avatarURL)
			.setColor('GREEN')
			.setTitle(`Bạn đã lên rank **${nextRank}${currentPres}**!`)
			.setFooter(footer);

		message.channel.send(embed);
	},
};