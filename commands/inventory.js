const { footer } = require('../config.json');
const Discord = require('discord.js');
const resources = require('../mining/resources.json');
const inventorydata = require('../mining/inventorydata.js');

module.exports = {
	name: 'inventory',
	description: 'Check your inventory',
	aliases: ['inv'],
	cooldown: 3,
	async execute(message) {

		// Get inv data
		const inv = await inventorydata.getInv(message.author.id);

		let resMessage = '';

		for (const item in inv) {
			resMessage += (`${resources[item].icon} **${resources[item].name}**: \`${inv[item]}\`\n`);
		}

		const embed = new Discord.RichEmbed()
			.setAuthor(`Rương đồ của ${message.author.username}`, message.author.avatarURL)
			.setColor('BLUE')
			.setDescription(resMessage)
			.setFooter(footer);

		message.channel.send(embed);
	},
};