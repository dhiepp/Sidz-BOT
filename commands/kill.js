const { developer_user_id } = require('../config.json');
const Discord = require('discord.js');

module.exports = {
	name: 'kill',
	description: 'Kill someone!',
	options: [
		{
			type: 'USER',
			name: 'target',
			description: 'Who do you want to kill?',
			required: true,
		}
	],
	cooldown: 5000,
	execute(interaction) {
		const killer = interaction.user;
		const victim = interaction.options.getUser('target', true);
		let deathMsg = '';
		let isKilled = true;

		// Check suicidal
		if (killer == victim) {
			isKilled = false;
			deathMsg = `⚔️ **${killer.username}** đã tự sát vì bị trầm cảm.`;
		}
		// Check creator and bot
		if (victim.id === developer_user_id || victim.bot) {
			isKilled = false;
			deathMsg = `⚔️ **${killer.username}** cố gắng giết **${victim.username}** nhưng không thành công!`;
		}

		if (isKilled) {
			const method = Math.random() * 10;
			if (method >= 0 && method <= 4) {
				const weapons = ['Diamond Sword', 'Iron Sword', 'Stone Sword', 'Wooden Sword', 'Diamond Hoe', 'Wooden Axe', 'tay không'];
				const used = Math.round(Math.random() * (weapons.length - 1));
				deathMsg = `⚔️ **${victim.username}** đã bị giết bởi **${killer.username}** bằng ${weapons[used]}.`;
			}
			else if (method <= 6) {
				deathMsg = `⚔️ **${victim.username}** đã bị đẩy xuống void bởi **${killer.username}**.`;
			}
			else if (method <= 7) {
				deathMsg = `⚔️ **${victim.username}** đã bị bắn chết bởi **${killer.username}**.`;
			}
			else if (method <= 8) {
				deathMsg = `⚔️ **${victim.username}** đã bị đẩy từ trên cao xuống bởi **${killer.username}**.`;
			}
			else if (method <= 9) {
				deathMsg = `⚔️ **${victim.username}** đã bị giết bởi TNT của **${killer.username}**.`;
			}
			else if (method <= 10) {
				deathMsg = `⚔️ **${victim.username}** đã bị giết bởi fireball của **${killer.username}**.`;
			}
		}


		const embed = new Discord.MessageEmbed()
			.setColor('RED')
			.setDescription(deathMsg);

		interaction.reply({embeds: [embed]});
	},
};