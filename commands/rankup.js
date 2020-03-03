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
		let nextPres = currentPres;
		let nextRank = String.fromCharCode(currentRank.charCodeAt() + 1);

		let bonus = '';
		if (currentRank === 'Z') {
			nextRank = 'A';
			nextPres++;
			bonus += `\nBạn đã nâng cấp giá bán khoáng sản! **x${nextPres * 0.1 + 0.9}**`;
		}

		const price = ranks[currentRank] * (currentPres * 0.2 + 0.8);

		if (user.money < price) {
			message.channel.send(`🚫 **${message.author.username}**! Bạn không có đủ ${dollar.icon} **${dollar.name}** để lên rank! \`${user.money}/${price}\``);
			return;
		}

		userdata.updateRank(message.author, nextRank, nextPres);
		userdata.updateMoney(message.author, user.money - price);

		const embed = new Discord.RichEmbed()
			.setAuthor(`${message.author.username}`, message.author.avatarURL)
			.setColor('BLUE')
			.setDescription(`Bạn đã lên rank **${nextRank}${nextPres}**!` + bonus)
			.setFooter(footer);

		message.channel.send(embed);
	},
};