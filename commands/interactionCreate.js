const { handleWlButton, handleWlModal, handleWlDecision } = require('../commands/whitelist');
const { handleTicketCriar, handleTicketFechar } = require('../commands/ticket');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {

    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(`Erro no comando /${interaction.commandName}:`, error);
        const msg = { content: '❌ Ocorreu um erro ao executar este comando.', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(msg);
        } else {
          await interaction.reply(msg);
        }
      }
      return;
    }

    if (interaction.isButton()) {
      const id = interaction.customId;
      if (id === 'wl_iniciar') return handleWlButton(interaction);
      if (id === 'ticket_criar') return handleTicketCriar(interaction);
      if (id === 'ticket_fechar') return handleTicketFechar(interaction);
      if (id.startsWith('wl_aprovar_') || id.startsWith('wl_reprovar_')) {
        return handleWlDecision(interaction, client);
      }
      return;
    }

    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'wl_modal') {
        return handleWlModal(interaction, client);
      }
      return;
    }
  },
};
