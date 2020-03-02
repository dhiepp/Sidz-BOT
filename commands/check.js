module.exports = {
	name: 'check',
	description: 'Perform check nubs for you',
	aliases: ['checknubs'],
	cooldown: 10,
	execute(message) {
		const name = message.author.username;
		message.channel.send(`:clock1:  Xin chờ, đang check nubs cho **${name}** ...`)
			.then((loadMsg) => setTimeout(() => {
				const ran = Math.round(Math.random());
				if (name === 'Sidz' || ran == 0) loadMsg.edit(`:white_check_mark:  Xin chúc mừng, **${name}** không phải là nubs!`);
				else loadMsg.edit(`:warning:  Cảnh báo! **${name}** chính là nubs!`);
			}, 2000));
	},
};