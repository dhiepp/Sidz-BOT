const { footer } = require('../config.json');
const Discord = require('discord.js');
const ranks = require('../mining/ranks.json');
const { dollar } = require('../mining/currency.json');
const userdata = require('../mining/userdata.js');

module.exports = {
	name: 'ranklist',
	description: 'List of ranks and prices',
	aliases: ['ranks', 'rl'],
	cooldown: 3000,
	async execute(interaction) {
		const author = interaction.user;
		
		// Get user data
		const user = await userdata.getUser(author);

		let ranksMessage = '';

		for (const rank in ranks) {
			ranksMessage += `\n**${rank}**: ${dollar.icon} ${ranks[rank]}`;
			if (rank === user.rank) {
				ranksMessage += ' (Bạn ở đây)';
			}
		}

		const embed = new Discord.MessageEmbed()
			.setColor('BLUE')
			.setTitle('Danh sách các rank')
			.setDescription(ranksMessage)
			.setFooter(footer);

		interaction.reply({ embeds: [embed] });
	},
};