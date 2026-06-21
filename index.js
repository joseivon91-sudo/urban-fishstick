const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const { deployCommands } = require('./deploy-commands');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel],
});

client.commands = new Collection();

// Load commands — each file can export multiple commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  const exports_ = require(path.join(commandsPath, file));
  // Iterate all exported values and register those that look like commands
  for (const value of Object.values(exports_)) {
    if (value && value.data && value.execute) {
      client.commands.set(value.data.name, value);
    }
  }
}

// Load events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

client.once('ready', async () => {
  console.log(`✅ Bot online como ${client.user.tag}`);
  await deployCommands(client);
});

client.login(process.env.TOKEN);
