const { footer } = require('../config.json');
const Discord = require('discord.js');
const userdata = require('../mining/userdata.js');
const { dollar } = require('../mining/currency.json');

module.exports = {
	name: 'money',
	description: 'Check your balance',
	aliases: ['balance', 'bal', 'cash'],
	cooldown: 3,
	async execute(message) {

		// Get user data
		const user = await userdata.getUser(message.author);

		const embed = new Discord.RichEmbed()
			.setAuthor(`Tài sản của ${message.author.username}`, message.author.avatarURL)
			.setColor('BLUE')
			.setDescription(`${dollar.icon} **${user.money}** ${dollar.name}`)
			.setFooter(footer);

		message.channel.send(embed);
	},
};