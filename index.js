const { Client, Intents, Collection } = require('discord.js');
const { token, developer_user_id } = require('./config.json');
const fs = require('fs');
const NodeCace = require('node-cache');
const admin = require('./admin.js');

const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES]});

commands = new Collection();
actions = new Collection();
cooldowns = new Collection();

client.once('ready', async () => {
	console.log(`Logged in as ${client.user.tag}!`);
	client.user.setActivity(`Minecraft on ${client.guilds.cache.size} servers`, { type: 'PLAYING' });

	//Read all command files
	const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const command = require(`./commands/${file}`);
		commands.set(command.name, command);
		if (command.actions) {
			for (const action in command.actions) {
				actions.set(action, command.actions[action]);
			}
		}

		await client.guilds.cache.get('680395302095683594').commands.create(
			{name: command.name, description: command.description, options: command.options});
		console.log('registered ' + command.name);
	}
});


client.on('interactionCreate', async interaction => {
	if (interaction.user.bot) return;

	if (interaction.channel.type == 'DM') {
		if (interaction.user.id == developer_user_id) {
			// TODO admin command
		} else interaction.reply('Bạn không thể sử dụng bot tại đây!');
		return;
	}

	if (interaction.isCommand()) {
		const command = commands.get(interaction.commandName);
		if (command) {
			// Cooldown System
			const cooldown = command.cooldown ? command.cooldown : 1000;
			if (!cooldowns.has(command.name)) {
				cooldowns.set(command.name, new NodeCace({ stdTTL: cooldown }));
			}

			const now = Date.now();
			const timestamps = cooldowns.get(command.name);
			if (timestamps.has(interaction.user.id)) {
				const expiration = timestamps.get(interaction.user.id);
				if (now < expiration) {
					const timeLeft = (expiration - now) / 1000;
					interaction.reply(`⏱ **${interaction.user.username}**! Hãy chờ ${timeLeft.toFixed(1)} giây trước khi dùng lệnh \`${command.name}\` lần nữa.`);
					return;
				}
			}
			timestamps.set(interaction.user.id, now + cooldown);

			// Execute command
			try {
				await command.execute(interaction);
			}
			catch (error) {
				console.error(error);
				interaction.reply('🛑 Đã có lỗi xảy ra khi thực hiện câu lệnh đó!');
			}
		}
	}
	

	if (interaction.isMessageComponent() && interaction.user.id == interaction.message.interaction.user.id) {
		const action = actions.get(interaction.customId);
		if (action) {
			// Perform action
			try {
				await action(interaction);
			}
			catch (error) {
				console.error(error);
				interaction.update('🛑 Đã có lỗi xảy ra khi thực hiện hành động đó!');
			}
		}
	}
});


// client.on('message', async message => {
// 	if (message.author.bot) return;

// 	// Private DM
// 	if (message.channel.type === 'dm' | 'group' && !message.author.bot) {
// 		if (message.author.id === developer_user_id) {
// 			admin.command(message, client);
// 			return;
// 		}
// 		privateDM.log(message);
// 	}

// 	// Check text channel
// 	if (message.channel.type !== 'text') {
// 		return message.channel.send('Bạn không thể sử dụng bot tại đây!');
// 	}

// 	const pre = message.content.toLowerCase();
// 	if (!pre.startsWith(prefix)) return;

// 	const args = message.content.slice(prefix.length).split(/ +/);
// 	const commandName = args.shift().toLowerCase();

// 	// Check valid command
// 	const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
// 	if (!command) return;

// 	// Check commands that require args
// 	if (command.args && !args.length) {
// 		let reply = `**${message.author.username}**, bạn viết thiếu câu lệnh rồi!`;

// 		if (command.usage) {
// 			reply += `\nCách sử dụng: \`${prefix}${command.name} ${command.usage}\``;
// 		}

// 		message.channel.send(reply);
// 		return;
// 	}

// 	// Check commands that requires tagging
// 	if (command.tags && !message.mentions.users.size) {
// 		let reply = `**${message.author.username}**, bạn chưa tag ai đó vào!`;

// 		if (command.usage) {
// 			reply += `\nCách sử dụng: \`${prefix}${command.name} ${command.usage}\``;
// 		}

// 		message.channel.send(reply);
// 		return;
// 	}

// 	// Check if cooldowns has command and add
// 	if (!cooldowns.has(command.name)) {
// 		cooldowns.set(command.name, new Discord.Collection());
// 	}

// 	const now = Date.now();
// 	const timestamps = cooldowns.get(command.name);
// 	const cooldownAmount = (command.cooldown || 2) * 1000;

// 	if (timestamps.has(message.author.id)) {
// 		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

// 		if (now < expirationTime) {
// 			const timeLeft = (expirationTime - now) / 1000;
// 			return message.channel.send(`:stopwatch:  **${message.author.username}**! Hãy chờ ${timeLeft.toFixed(1)} giây trước khi dùng lệnh \`${command.name}\` lần nữa.`);
// 		}
// 	}
// 	else {
// 		timestamps.set(message.author.id, now);
// 		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
// 	}

// 	// Execute command
// 	try {
// 		(command.execute(message, args));
// 	}
// 	catch (error) {
// 		console.error(error);
// 		message.channel.send('Đã có lỗi xảy ra khi thực hiện câu lệnh đó!');
// 	}
// });

client.login(token);

module.exports.client = client;