const fs = require('fs');
const {Client, Intents, Collection} = require('discord.js');
const privateDM = require('./privateDM.js');
const admin = require('./admin.js');

const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES]});

const { prefix, token, developer_user_id } = require('./config.json');
client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

const cooldowns = new Collection();

client.once('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	client.user.setActivity(`s.help (${client.guilds.size} servers)`, { type: 'PLAYING' });
});

client.on('messageCreate', async message => {
	if (message.author.bot) return;

	// Private DM
	if (message.channel.type === 'dm' | 'group' && !message.author.bot) {
		if (message.author.id === developer_user_id) {
			admin.command(message, client);
			return;
		}
		privateDM.log(message);
	}

	const pre = message.content.toLowerCase();
	if (!pre.startsWith(prefix)) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	// Check valid command
	const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
	if (!command) return;

	// Check text channel
	if (message.channel.type !== 'GUILD_TEXT') {
		return message.channel.send('Bạn không thể sử dụng bot tại đây!');
	}

	// Check commands that require args
	if (command.args && !args.length) {
		let reply = `**${message.author.username}**, bạn viết thiếu câu lệnh rồi!`;

		if (command.usage) {
			reply += `\nCách sử dụng: \`${prefix}${command.name} ${command.usage}\``;
		}

		message.channel.send(reply);
		return;
	}

	// Check commands that requires tagging
	if (command.tags && !message.mentions.users.size) {
		let reply = `**${message.author.username}**, bạn chưa tag ai đó vào!`;

		if (command.usage) {
			reply += `\nCách sử dụng: \`${prefix}${command.name} ${command.usage}\``;
		}

		message.channel.send(reply);
		return;
	}

	// Check if cooldowns has command and add
	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 2) * 1000;

	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.channel.send(`:stopwatch:  **${message.author.username}**! Hãy chờ ${timeLeft.toFixed(1)} giây trước khi dùng lệnh \`${command.name}\` lần nữa.`);
		}
	}
	else {
		timestamps.set(message.author.id, now);
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
	}

	// Execute command
	try {
		await command.execute(message, args);
	}
	catch (error) {
		console.error(error);
		message.channel.send('Đã có lỗi xảy ra khi thực hiện câu lệnh đó!');
	}
});

client.login(token);

module.exports.client = client;