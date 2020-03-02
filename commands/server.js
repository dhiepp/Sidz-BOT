module.exports = {
	name: 'server',
	description: 'Check server info',
	execute(message) {
		message.channel.send(`Server name: ${message.guild.name}\nTotal members: ${message.guild.memberCount}\nRoles count: ${message.guild.roles.size}\nOwner: ${message.guild.owner.displayName}`);
	},
};