const { footer } = require('../config.json');
const Discord = require('discord.js');
const ranks = require('../mining/ranks.json');
const userdata = require('../mining/userdata.js');
const { dollar } = require('../mining/currency.json');

module.exports = {
	name: 'prestige',
	description: 'Prestige up!',
	aliases: ['pres'],
	cooldown: 3,
	async execute(message) {

		// Get user data
		const user = await userdata.getUser(message.author);

		const currentRank = user.rank;
		const currentPres = user.prestige;
		const nextPres = currentPres + 1;
		const price = Math.round(ranks.Z * (currentPres * 0.2 + 0.8));

		if (currentRank !== 'Z') {
			message.channel.send(`🚫 **${message.author.username}**! Bạn phải đạt rank **Z** để lên cấp!`);
			return;
		}

		if (user.money < price) {
			message.channel.send(`🚫 **${message.author.username}**! Bạn không có đủ ${dollar.icon} **${dollar.name}** để lên cấp! \`${user.money}/${price}\``);
			return;
		}

		const newMul = Math.round(nextPres * 0.1 + 0.9);

		const embed = new Discord.RichEmbed()
			.setAuthor(`${message.author.username}`, message.author.avatarURL)
			.setColor('BLUE')
			.setTitle('⏫ Bạn có muốn lên cấp tiếp theo không?')
			.setDescription(`Cấp độ tiếp theo: **${nextPres}**\nGiá bán khoáng sản: **${newMul}**`)
			.addField('⚠️ Lưu ý', 'Sau khi lên cấp những thứ sau sẽ reset:'
				+ '\n**- Tiền và Kinh nghiệm**\n**- Rương đồ và Pickaxe của bạn**')
			.addField('Xác nhận', 'React với ✅ để xác nhận lên cấp')
			.setFooter('Yêu cầu này sẽ hết hạn sau 10 giây');

		const selection = await message.channel.send(embed);
		await selection.react('✅');
		await selection.react('❎');

		const filter = (reaction, reactor) => {
			return ['✅', '❎'].includes(reaction.emoji.name) && reactor.id === message.author.id;
		};

		selection.awaitReactions(filter, { max: 1, time: 10000, errors: ['time'] })
			.then(collected => {
				const reaction = collected.first();

				if (reaction.emoji.name === '✅') {
					embed.setColor('GRAY').setFooter('Yêu cầu này đã được xác nhận');
					prestigeUp(message, nextPres);
				}
				else {
					embed.setColor('GRAY').setFooter('Yêu cầu này đã bị hủy');
				}
				selection.edit(embed);
			})
			.catch(() => {
				selection.clearReactions();
				embed.setColor('GRAY').setFooter('Yêu cầu này đã hết thời gian');
				selection.edit(embed);
			});
	},
};

async function prestigeUp(message, nextPres) {
	try {
		await userdata.updatePrestige(message.author, nextPres);
		await userdata.updateRank(message.author, 'A');
		await userdata.updateMoney(message.author, 0);
		await userdata.updateXP(message.author, 0);
		await userdata.updatePickaxe(message.author, 'none', 0, true);
	}
	catch(error) {
		message.channel.send(`🚫 **${message.author.username}**, đã có lỗi xảy ra khi thực hiện yêu cầu của bạn!`);
		return;
	}

	const newMul = Math.round(nextPres * 0.1 + 0.9);

	const embed = new Discord.RichEmbed()
		.setAuthor(`${message.author.username}`, message.author.avatarURL)
		.setColor('GREEN')
		.setTitle(`⏫ Bạn đã lên cấp! Rank hiện tại: **A${nextPres}**!`)
		.setDescription(`🔓 Đã nâng cấp giá bán khoáng sản: **x${newMul}**!`)
		.setFooter(footer);
	message.channel.send(embed);
}