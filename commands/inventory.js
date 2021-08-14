const { footer } = require('../config.json');
const Discord = require('discord.js');
const resources = require('../mining/resources.json');
const inventorydata = require('../mining/inventorydata.js');

module.exports = {
	name: 'inventory',
	description: 'Check your inventory',
	cooldown: 10000,
	async execute(interaction) {
		const author = interaction.user;

		// Get inv data
		const inv = await inventorydata.getInv(author.id);

		let result = '';
		for (const item in inv) {
			result += (`${resources[item].icon} **${resources[item].name}**: \`${inv[item]}\`\n`);
		}

		const embed = new Discord.MessageEmbed()
			.setAuthor(`Rương đồ của ${author.username}`, author.avatarURL())
			.setColor('BLUE')
			.setDescription(result)
			.setFooter(footer);

		interaction.reply({ embeds: [embed] });
	},
};