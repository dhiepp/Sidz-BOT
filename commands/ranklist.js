const { footer } = require('../config.json');
const Discord = require('discord.js');
const ranks = require('../mining/ranks.json');
const { dollar } = require('../mining/currency.json');
const userdata = require('../mining/userdata.js');

module.exports = {
	name: 'ranklist',
	description: 'List of ranks and prices',
	aliases: ['ranks', 'rl'],
	cooldown: 3,
	async execute(message) {
		// Get user dât
		const user = userdata.getUser(message.author);
		const currentRank = user.rank;
		let ranksMessage = '';

		for (const rank of ranks) {
			ranksMessage += `\n**${rank}**: ${dollar.icon} ${ranks[rank]}`;
			if (rank === currentRank) {
				ranksMessage += ' (Rank của bạn)';
			}
		}

		const embed = new Discord.RichEmbed()
			.setColor('BLUE')
			.setTitle('Danh sách các rank')
			.setDescription(ranksMessage)
			.setFooter(footer);

		message.channel.send(embed);
	},
};