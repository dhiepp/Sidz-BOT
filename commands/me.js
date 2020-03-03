const { footer } = require('../config.json');
const Discord = require('discord.js');
const userdata = require('../mining/userdata.js');
const { dollar, experience } = require('../mining/currency.json');

module.exports = {
	name: 'me',
	description: 'Check your profile',
	aliases: ['profile', 'my'],
	cooldown: 3,
	async execute(message) {
		// Get user data
		const user = await userdata.getUser(message.author);


		const embed = new Discord.RichEmbed()
			.setAuthor(`Tài khoản của ${message.author.username}`, message.author.avatarURL)
			.setColor('DEFAULT')
			.setDescription(`Rank: **${user.rank}${user.prestige}**`
				+ `\nMultiplier: **x${user.prestige * 0.1 + 0.9}**`
				+ `\nTài sản: ${dollar.icon} **${user.money} ${dollar.name}**`
				+ `\nKinh nghiệm: ${experience.icon} **${user.xp}**`
				+ `\nĐã đào: **${user.blocks}** blocks`)
			.setFooter(footer);

		if (user.username !== message.author.username) {
			userdata.updateUser(message.author);
			embed.addField('📝 Cập nhật thông tin', 'Đã cập nhật dữ liệu mới của bạn!');
		}

		message.channel.send(embed);
	},
};