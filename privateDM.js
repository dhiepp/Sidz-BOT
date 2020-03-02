const { developer_user_id } = require('./config.json');

const userdata = require('./mining/userdata.js');
const inventorydata = require('./mining/inventorydata.js');

module.exports = {
	log(message) {
		if (message.author.id === developer_user_id) {
			this.adminCMD(message);
			return;
		}
		console.log(message.author.username + ': ' + message.content);
	},
	adminCMD(message) {
		const args = message.content.split(/ +/);
		const command = args.shift().toLowerCase();

		switch (command) {
		case 'reload':
			userdata.reload();
			inventorydata.reload();
			message.channel.send('🤖 **Reloaded all data!**');
			break;
		default:
			message.channel.send('🤖 **I don\'t understand...**');
		}
	},
};