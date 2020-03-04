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
		const days = Math.round(uptime / 86400).padStart(2, '0');
		const hours = Math.round((uptime % 86400) / 3600).padStart(2, '0');
		const minutes = Math.round((uptime % 3600) / 60).padStart(2, '0');
		const seconds = Math.round(uptime % 60).padStart(2, '0');
		const upString = `${days}:${hours}:${minutes}:${seconds}`;

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