const userdata = require('./mining/userdata.js');
const inventorydata = require('./mining/inventorydata.js');

module.exports = {
	command(message, client) {
		const args = message.content.split(/ +/);
		const command = args.shift().toLowerCase();

		switch (command) {
		case 'reload':
			userdata.reload();
			inventorydata.reload();
			message.channel.send('🤖 **Reloaded all data!**');
			break;
		case 'restart':
			break;
		case 'serverlist': {
			const svlist = [];
			for (const guild of client.guilds) {
				svlist.push(guild[1].name);
			}
			message.channel.send(svlist);
			break;
		}
		default:
			message.channel.send('🤖 **I don\'t understand...**');
		}
	},
};