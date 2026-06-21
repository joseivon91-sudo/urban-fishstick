const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

async function deployCommands(client) {
  const commands = [];
  const commandsPath = path.join(__dirname, 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if (command.data) commands.push(command.data.toJSON());
    else {
      for (const value of Object.values(command)) {
        if (value?.data) commands.push(value.data.toJSON());
      }
    }
  }

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

  try {
    console.log('🔄 Registrando slash commands...');
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, '1517264758930145301'),
      { body: commands }
    );
    console.log(`✅ ${commands.length} comandos registrados!`);
  } catch (error) {
    console.error('Erro ao registrar comandos:', error);
  }
}

module.exports = { deployCommands };
