const { developer_user_id } = require('../config.json');
module.exports = {
	name: 'check',
	description: 'Perform check nubs for you',
	cooldown: 10,
	execute(interaction) {
		const name = interaction.user.username;
		interaction.reply(`:clock1:  Xin chờ, đang check nubs cho **${name}** ...`)
		setTimeout(() => {
			const ran = Math.round(Math.random());
			if (interaction.user.id == developer_user_id || ran == 0) 
				interaction.editReply(`:white_check_mark:  Xin chúc mừng, **${name}** không phải là nubs!`);
			else interaction.editReply(`:warning:  Cảnh báo! **${name}** chính là nubs!`);
		}, 3000);
	},
};