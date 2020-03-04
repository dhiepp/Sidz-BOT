const Discord = require('discord.js');
const config = require ('../config.json');

let client;

module.exports = {
	name: 'about',
	description: 'Show bot information',
	aliases: ['bot', 'sidz'],
	cooldown: 10,
	setClient(cl) {
		this.client = cl;
	},
	execute(message) {
		const version = process.env.npm_package_version;
		const uptime = process.uptime();
		const days = Math.floor(uptime / 86400);
		const hours = Math.floor((uptime % 86400) / 3600);
		const minutes = Math.floor((uptime % 3600) / 60);
		const seconds = Math.floor(uptime % 60);
		const upString = `${days}d ${hours.padStart(2, '0')}h ${minutes.padStart(2, '0')}m ${seconds.padStart(2, '0')}s`;

		const embed = new Discord.RichEmbed()
			.setAuthor(`${config.bot.name} v${version}`, client.user.avatarURL)
			.setColor('AQUA')
			.setTitle('Made by **Sidz**`#0242`')
			.setDescription(`Prefix: \`${config.prefix}\`` + '\nCommands: `s.help`'
				+ `\nUptime: **${upString}**\nServers: **${client.guilds.size}**`)
			.addField('🗨️ Bot Discord', `[Click to join bot server](${config.invite_link})`)
			.addField('🤖 Invite Bot', `[Click to add to your server](${config.invite_link})`)
			.setFooter(config.footer);

		message.channel.send(embed);
	},
};