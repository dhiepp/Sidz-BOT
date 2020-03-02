const { developer_user_id } = require('../config.json');
const Discord = require('discord.js');

module.exports = {
	name: 'kill',
	description: 'Kill someone!',
	args: true,
	tags: true,
	cooldown: 5,
	usage: '<@user>',
	execute(message) {
		const victimUser = message.mentions.users.first();

		const killer = message.author.username;
		const victim = victimUser.username;
		let deathMsg = '';
		let isKilled = true;

		// Check suicidal
		if (message.author == victimUser) {
			isKilled = false;
			deathMsg = `⚔️ **${killer}** đã tự sát vì bị trầm cảm.`;
		}
		// Check creator and bot
		if (victimUser.id === developer_user_id || victimUser.bot) {
			isKilled = false;
			deathMsg = `⚔️ **${killer}** cố gắng giết **${victim}** nhưng không thành công!`;
		}

		if (isKilled) {
			const method = Math.random() * 10;
			if (method >= 0 && method <= 4) {
				const weapons = ['Diamond Sword', 'Iron Sword', 'Stone Sword', 'Wooden Sword', 'Diamond Hoe', 'Wooden Axe', 'tay không'];
				const used = Math.round(Math.random() * (weapons.length - 1));
				deathMsg = `⚔️ **${victim}** đã bị giết bởi **${killer}** bằng ${weapons[used]}.`;
			}
			else if (method <= 6) {
				deathMsg = `⚔️ **${victim}** đã bị đẩy xuống void bởi **${killer}**.`;
			}
			else if (method <= 7) {
				deathMsg = `⚔️ **${victim}** đã bị bắn chết bởi **${killer}**.`;
			}
			else if (method <= 8) {
				deathMsg = `⚔️ **${victim}** đã bị đẩy từ trên cao xuống bởi **${killer}**.`;
			}
			else if (method <= 9) {
				deathMsg = `⚔️ **${victim}** đã bị giết bởi TNT của **${killer}**.`;
			}
			else if (method <= 10) {
				deathMsg = `⚔️ **${victim}** đã bị giết bởi fireball của **${killer}**.`;
			}
		}


		const embedDM = new Discord.RichEmbed()
			.setColor('RED')
			.setDescription(deathMsg);

		message.channel.send(embedDM);
	},
};