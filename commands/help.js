const Discord = require('discord.js');
const { bot_name, prefix } = require('../config.json');

module.exports = {
	name: 'help',
	description: 'List all of my commands or info about a specific command.',
	aliases: ['commands', '?'],
	usage: '[command name]',
	cooldown: 10,
	async execute(message, args) {
		const data = [];
		const { commands } = message.client;

		// main help
		if (!args.length) {
			const helpPages = [];

			// Page 1
			const embed1 = new Discord.MessageEmbed()
				.setColor('AQUA')
				.setTitle(`🤖 Các câu lệnh của **${bot_name}**`)
				.setDescription('**Tất cả câu lệnh**\n`' + commands.map(command => command.name).join(', ') + '`')
				.addField('🔍 Trợ giúp chi tiết', `Sử dụng lệnh \`${prefix}help [command]\` để xem thông tin về lệnh nào đó!`)
				.addField('➡️ Chuyển trang', 'Hãy sang trang tiếp theo để biết thêm về các chức năng cụ thể');
			helpPages.push(embed1);

			// Page 2
			const embed2 = new Discord.MessageEmbed()
				.setColor('AQUA')
				.setTitle(`🤖 Các câu lệnh của **${bot_name}**`)
				.addField('⛏️ Trợ giúp chức năng đào khoáng sản `(1/2)`',
					'Để đi mine hãy dùng lệnh `s.mine`'
					+ '\nChế tạo cúp: `s.craft`'
					+ '\nPhù phép cúp: `s.enchant`'
					+ '\nSửa chữa cúp: `s.fix`'
					+ '\nXem rương đồ: `s.inventory`'
					+ '\nBán khoáng sản: `s.sell`'
					+ '\nXem tài sản: `s.money`')
				.addField('🔍 Trợ giúp chi tiết', `Sử dụng lệnh \`${prefix}help [command]\` để xem thông tin về lệnh nào đó!`);
			helpPages.push(embed2);

			// Page 3
			const embed3 = new Discord.MessageEmbed()
				.setColor('AQUA')
				.setTitle(`🤖 Các câu lệnh của **${bot_name}**`)
				.addField('⛏️ Trợ giúp chức năng đào khoáng sản `(2/2)`',
					'\nXem rank hiện tại: `s.rank`'
					+ '\nLên rank tiếp theo: `s.rankup`'
					+ '\nLên cấp tiếp theo: `s.prestige`'
					+ '\nXem thông tin cá nhận: `s.me`'
					+ '\nXem bảng xếp hạng: `s.top`')
				.addField('🔍 Trợ giúp chi tiết', `Sử dụng lệnh \`${prefix}help [command]\` để xem thông tin về lệnh nào đó!`);
			helpPages.push(embed3);

			// Page 4
			const embed4 = new Discord.MessageEmbed()
				.setColor('AQUA')
				.setTitle(`🤖 Các câu lệnh của **${bot_name}**`)
				.addField('<:RedBed:683144711145652232> Trợ giúp chức năng tra cứu Bedwars',
					'Để tra cứu thông tin: `s.bwstats`'
					+ '\nĐể xem bảng xếp hạng: `s.bwlead`')
				.addField('📝 Một số chức năng khác',
					'Xem thông tin server: `s.server`'
					+ '\nKiểm tra nubs: `s.check`'
					+ '\nGiết ai đó: `s.kill`'
					+ '\nPing: `s.ping`')
				.addField('🔍 Trợ giúp chi tiết', `Sử dụng lệnh \`${prefix}help [command]\` để xem thông tin về lệnh nào đó!`);
			helpPages.push(embed4);

			let page = 0;

			const embed = helpPages[0].setFooter(`Trang ${page + 1} / ${helpPages.length}`);
			const row = new Discord.MessageActionRow()
				.addComponents(
					new Discord.MessageButton().setCustomId('previous').setStyle('SECONDARY').setEmoji('⬅️'),
					new Discord.MessageButton().setCustomId('next').setStyle('SECONDARY').setEmoji('➡️'),
				);
			const selection = await message.channel.send({ embeds: [embed], components: [row] });

			const collector = selection.createMessageComponentCollector({
				filter: interaction => interaction.customId === 'previous' || interaction.customId === 'next' && interaction.user.id === message.author.id,
				time: 60000
			});

			collector.on('collect', async interaction => {
				switch (interaction.customId) {
				case 'previous':
					page = page > 0 ? --page : helpPages.length - 1;
					break;
				case 'next':
					page = page + 1 < helpPages.length ? ++page : 0;
					break;
				default:
					break;
				}
				const embed = helpPages[page].setFooter(`Trang ${page + 1} / ${helpPages.length}`);
				await interaction.update({ embeds: [embed] });
			});
			collector.on('end', async interaction => {
				const embed = helpPages[page].setColor('GREY');
				await interaction.update({ embeds: [embed], components: [] });
			});
			return;
		}

		// Detailed help
		const name = args[0].toLowerCase();
		const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

		if (!command) {
			return message.channel.send('Lệnh đó không tồn tại');
		}

		data.push(`**Câu lệnh:** ${command.name}`);

		if (command.aliases) data.push(`**Có thể dùng:** ${command.aliases.join(', ')}`);
		if (command.description) data.push(`**Mô tả:** ${command.description}`);
		if (command.usage) data.push(`**Cách dùng:** ${prefix}${command.name} ${command.usage}`);
		if (command.cooldown) data.push(`**Thời gian chờ:** ${command.cooldown} giây`);

		message.channel.send(data, { split: true });
	},
};