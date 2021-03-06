const { footer } = require('../config.json');
const Discord = require('discord.js');
const userdata = require('../mining/userdata.js');
const inventorydata = require('../mining/inventorydata.js');
const { dollar, experience } = require('../mining/currency.json');

module.exports = {
	name: 'prestige',
	description: 'Prestige up!',
	aliases: ['pres'],
	cooldown: 10,
	async execute(message) {

		// Get user data
		const user = await userdata.getUser(message.author);

		const currentRank = user.rank;
		const currentPres = user.prestige;
		const nextPres = currentPres + 1;

		if (currentRank !== 'Z') {
			message.channel.send(`🚫 **${message.author.username}**! Bạn phải đạt rank **Z** để lên cấp!`);
			return;
		}

		const newMul = (nextPres * 0.1 + 0.9).toFixed(1);

		const embed = new Discord.RichEmbed()
			.setAuthor(`${message.author.username}`, message.author.avatarURL)
			.setColor('RED')
			.setTitle('⏫ Bạn có muốn lên cấp tiếp theo không?')
			.setDescription(`Cấp độ tiếp theo: **${nextPres}**\nGiá bán khoáng sản: **x${newMul}**`)
			.addField('⚠️ Lưu ý', 'Sau khi lên cấp những thứ sau sẽ được reset:'
				+ `\n- ${dollar.icon} **${dollar.name}** và ${experience.icon} **${experience.name}**\n- Rương đồ và Pickaxe của bạn`)
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
	// Check again
	// Get user data
	const user = await userdata.getUser(message.author);
	if (user.rank !== 'Z') {
		message.channel.send(`🚫 **${message.author.username}**! Bạn phải đạt rank **Z** để lên cấp!`);
		return;
	}

	// Reset inv
	const inv = await inventorydata.getInv(message.author.id);
	for (const resource in inv) {
		inv[resource] = 0;
	}
	try {
		await userdata.updatePrestige(message.author, nextPres);
		await userdata.updateRank(message.author, 'A');
		await userdata.updateMoney(message.author, 0);
		await userdata.updateXP(message.author, 0);
		await userdata.updatePickaxe(message.author, 'none', 0, true);
		await inventorydata.updateItems(message.author.id, inv);
	}
	catch(error) {
		message.channel.send(`🚫 **${message.author.username}**, đã có lỗi xảy ra khi thực hiện yêu cầu của bạn!`);
		return;
	}

	const newMul = (nextPres * 0.1 + 0.9).toFixed(1);

	const embed = new Discord.RichEmbed()
		.setAuthor(`${message.author.username}`, message.author.avatarURL)
		.setColor('GREEN')
		.setTitle(`⏫ Bạn đã lên cấp! Rank hiện tại: [**A ${nextPres}**]!`)
		.setDescription(`🔓 Đã nâng cấp giá bán khoáng sản: **x${newMul}**!`)
		.setFooter(footer);
	message.channel.send(embed);
}