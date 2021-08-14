const { footer } = require('../config.json');
const Discord = require('discord.js');
const userdata = require('../mining/userdata.js');
const { dollar, experience } = require('../mining/currency.json');

module.exports = {
	name: 'profile',
	description: 'Check your profile',
	cooldown: 10000,
	async execute(interaction) {
		const author = interaction.user;

		// Get user data
		const user = await userdata.getUser(author);

		const embed = new Discord.MessageEmbed()
			.setAuthor(`Tài khoản của ${author.username}`, author.avatarURL())
			.setColor('BLUE')
			.setDescription(`Rank: [**${user.rank} ${user.prestige}**]`
				+ `\nMultiplier: **x${(user.prestige * 0.1 + 0.9).toFixed(1)}**`
				+ `\nTài sản: ${dollar.icon} **${user.money.toLocaleString()} ${dollar.name}**`
				+ `\nKinh nghiệm: ${experience.icon} **${user.xp}**`
				+ `\nĐã đào: **${user.blocks}** blocks`)
			.setFooter(footer);

		if (user.username !== author.username) {
			userdata.updateUser(author);
			embed.addField('📝 Cập nhật thông tin', 'Đã cập nhật dữ liệu mới của bạn!');
		}

		interaction.reply({ embeds: [embed] });
	},
};