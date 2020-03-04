const Discord = require('discord.js');
const config = require('../config.json');
const index = require('../index.js');

module.exports = {
	name: 'about',
	description: 'Show bot information',
	aliases: ['bot', 'sidz'],
	cooldown: 10,
	execute(message) {
		const client = index.client;
		const uptime = process.uptime();
		const days = Math.floor(uptime / 86400);
		const hours = Math.floor((uptime % 86400) / 3600).toString().padStart(2, '0');
		const minutes = Math.floor((uptime % 3600) / 60).toString().padStart(2, '0');
		const seconds = Math.floor(uptime % 60).toString().padStart(2, '0');
		const upString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

		const embed = new Discord.RichEmbed()
			.setAuthor(`${config.bot_name} v${config.version}`, client.user.avatarURL)
			.setColor('AQUA')
			.setTitle('Made by **Sidz**`#0242`')
			.setDescription(`Prefix: \`${config.prefix}\`` + '\nCommands: `s.help`'
				+ `\nUptime: **${upString}**\nServers: **${client.guilds.size}**`)
			.addField('🗨️ Bot Server', `[Click to join bot server](${config.server_link})`)
			.addField('🤖 Invite Bot', `[Click to add to your server](${config.invite_link})`)
			.setFooter(config.footer);

		message.channel.send(embed);
	},
};