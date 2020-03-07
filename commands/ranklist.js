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
<<<<<<< HEAD
		// Get user data
		const user = await userdata.getUser(message.author);

=======
		// Get user dât
		const user = userdata.getUser(message.author);

		const currentRank = user.rank;
>>>>>>> aa3ccbbbb77439de5faca89f226a67b93123a88e
		let ranksMessage = '';

		for (const rank in ranks) {
			ranksMessage += `\n**${rank}**: ${dollar.icon} ${ranks[rank]}`;
			if (rank === user.rank) {
				ranksMessage += ' (Bạn ở đây)';
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