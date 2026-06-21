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
  }

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

  try {
    console.log('🔄 Registrando slash commands...');
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    console.log(`✅ ${commands.length} comandos registrados com sucesso!`);
  } catch (error) {
    console.error('Erro ao registrar comandos:', error);
  }
}

module.exports = { deployCommands };
