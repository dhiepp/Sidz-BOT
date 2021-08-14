const { footer } = require('../config.json');
const Discord = require('discord.js');
const ranks = require('../mining/ranks.json');
const userdata = require('../mining/userdata.js');
const { dollar } = require('../mining/currency.json');

module.exports = {
	name: 'rank',
	description: 'Check your rank',
	cooldown: 5000,
	async execute(interaction) {
		const author = interaction.user;

		// Get user data
		const user = await userdata.getUser(author);

		const currentRank = user.rank;
		const currentPres = user.prestige;
		const nextRank = String.fromCharCode(currentRank.charCodeAt() + 1);
		const price = ranks[nextRank];

		let rankMessage = '';
		let buttons = [];

		if (currentRank === 'Z') {
			rankMessage = `Rank hiện tại: [**${currentRank} ${currentPres}**]`
				+ '\nBạn đã đạt rank cao nhất!';
			buttons = [
				new Discord.MessageButton({
					customId: 'rank_prestige',
					emoji: { id:null, name: '⏫'},
					label: 'Lên cấp',
					style: 'PRIMARY',
				}),
			];
		}
		else {
			rankMessage = `Rank hiện tại: [**${currentRank} ${currentPres}**]`
				+ `\nRank tiếp theo: [**${nextRank} ${currentPres}**]`
				+ `\nYêu cầu: ${dollar.icon} **${price.toLocaleString()}** ${dollar.name}`;
			buttons = [
				new Discord.MessageButton({
					customId: 'rank_up',
					label: 'Lên rank tiếp theo',
					style: 'SUCCESS',
				}),
				new Discord.MessageButton({
					customId: 'rank_up_max',
					label: 'Lên rank cao nhất',
					style: 'DANGER',
				})
			];
		}

		const embed = new Discord.MessageEmbed()
			.setAuthor(`${author.username}`, author.avatarURL())
			.setColor('BLUE')
			.setDescription(rankMessage)
			.setFooter(footer);

		const component = new Discord.MessageActionRow()
			.addComponents(buttons);

		interaction.reply({ embeds: [embed], components: [component] });
	},
	actions: {
		rank_list: interaction => doRankList(interaction),
		rank_up: interaction => doRankUp(interaction, false),
		rank_up_max: interaction => doRankUp(interaction, true),
	},
};

async function doRankList(interaction) {
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
}

async function doRankUp(interaction, max) {

}