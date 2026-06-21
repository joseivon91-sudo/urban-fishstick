const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  PermissionFlagsBits,
} = require('discord.js');
const { getWhitelist, setWhitelist } = require('../data-manager');

const WL_QUESTIONS = [
  { id: 'nome_personagem', label: 'Qual o nome do seu personagem?', placeholder: 'Ex: João Silva', style: TextInputStyle.Short },
  { id: 'combat_logging', label: 'O que é Combat Logging?', placeholder: 'Explique com suas palavras...', style: TextInputStyle.Paragraph },
  { id: 'rdm', label: 'O que é RDM (Random Death Match)?', placeholder: 'Explique com suas palavras...', style: TextInputStyle.Paragraph },
  { id: 'vdm', label: 'O que é VDM (Vehicle Death Match)?', placeholder: 'Explique com suas palavras...', style: TextInputStyle.Paragraph },
  { id: 'powergaming', label: 'O que é Powergaming?', placeholder: 'Explique com suas palavras...', style: TextInputStyle.Paragraph },
];

const wlCommand = {
  data: new SlashCommandBuilder()
    .setName('wl')
    .setDescription('Posta a mensagem de whitelist com o botão para fazer a aplicação'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x2B2D31)
      .setTitle('🎮 Whitelist — Acesso ao Servidor')
      .setDescription('> Para ter acesso ao nosso **servidor privado de roleplay**, você precisa passar pela whitelist.\n\n**📋 Como funciona:**\n• Clique no botão abaixo para iniciar\n• Responda todas as perguntas com atenção\n• Sua aplicação será avaliada pela staff\n\n**⚠️ Atenção:**\n• Respostas copiadas serão reprovadas\n• Cada pessoa pode enviar apenas uma aplicação\n• Seja honesto e detalhado nas respostas')
      .setFooter({ text: 'BOT SERRA DO NORTE • Whitelist' })
      .setTimestamp();
    const btn = new ButtonBuilder()
      .setCustomId('wl_iniciar')
      .setLabel('📝 Fazer Whitelist')
      .setStyle(ButtonStyle.Primary);
    await interaction.reply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(btn)] });
  },
};

const setupWlCommand = {
  data: new SlashCommandBuilder()
    .setName('setup-whitelist')
    .setDescription('[STAFF] Posta os embeds de whitelist e ticket no canal atual')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) { return wlCommand.execute(interaction); },
};

async function handleWlButton(interaction) {
  const wl = getWhitelist(interaction.user.id);
  if (wl?.status === 'pendente') return interaction.reply({ content: '⏳ Você já tem uma aplicação **pendente**! Aguarde a avaliação da staff.', ephemeral: true });
  if (wl?.status === 'approved') return interaction.reply({ content: '✅ Você já está **aprovado** na whitelist!', ephemeral: true });
  const modal = new ModalBuilder().setCustomId('wl_modal').setTitle('📋 Whitelist — Preencha com atenção');
  for (const q of WL_QUESTIONS) {
    const input = new TextInputBuilder()
      .setCustomId(q.id).setLabel(q.label).setPlaceholder(q.placeholder)
      .setStyle(q.style).setRequired(true).setMinLength(10);
    modal.addComponents(new ActionRowBuilder().addComponents(input));
  }
  await interaction.showModal(modal);
}

async function handleWlModal(interaction, client) {
  await interaction.deferReply({ ephemeral: true });
  const answers = {};
  for (const q of WL_QUESTIONS) answers[q.id] = interaction.fields.getTextInputValue(q.id);
  setWhitelist(interaction.user.id, { userId: interaction.user.id, username: interaction.user.tag, status: 'pendente', answers });
  const staffChannelId = process.env.WL_STAFF_CHANNEL;
  if (staffChannelId) {
    const staffChannel = await client.channels.fetch(staffChannelId).catch(() => null);
    if (staffChannel) {
      const embed = new EmbedBuilder()
        .setColor(0xFFA500)
        .setTitle('📋 Nova Aplicação de Whitelist')
        .setDescription(`**Usuário:** ${interaction.user} (${interaction.user.tag})\n**ID Discord:** \`${interaction.user.id}\``)
        .addFields(
          { name: '👤 Nome do Personagem', value: answers.nome_personagem },
          { name: '💀 Combat Logging', value: answers.combat_logging },
          { name: '🔫 RDM', value: answers.rdm },
          { name: '🚗 VDM', value: answers.vdm },
          { name: '💪 Powergaming', value: answers.powergaming },
        )
        .setTimestamp();
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`wl_aprovar_${interaction.user.id}`).setLabel('✅ Aprovar').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`wl_reprovar_${interaction.user.id}`).setLabel('❌ Reprovar').setStyle(ButtonStyle.Danger),
      );
      await staffChannel.send({ embeds: [embed], components: [row] });
    }
  }
  await interaction.editReply({ content: '✅ **Aplicação enviada!** Aguarde a avaliação da nossa staff.' });
}

async function handleWlDecision(interaction, client) {
  const parts = interaction.customId.split('_');
  const action = parts[1];
  const userId = parts[2];
  const wl = getWhitelist(userId);
  if (!wl) return interaction.reply({ content: 'Aplicação não encontrada.', ephemeral: true });
  if (action === 'aprovar') {
    setWhitelist(userId, { ...wl, status: 'approved', reviewedBy: interaction.user.id });
    if (process.env.WL_ROLE_ID) {
      const member = await interaction.guild.members.fetch(userId).catch(() => null);
      if (member) await member.roles.add(process.env.WL_ROLE_ID).catch(() => {});
    }
    const user = await client.users.fetch(userId).catch(() => null);
    if (user) await user.send('✅ **Parabéns! Sua whitelist foi APROVADA!** Bem-vindo ao servidor!').catch(() => {});
    await interaction.update({ content: `✅ Whitelist de <@${userId}> **APROVADA** por ${interaction.user}`, embeds: interaction.message.embeds, components: [] });
  } else {
    setWhitelist(userId, { ...wl, status: 'reprovado', reviewedBy: interaction.user.id });
    const user = await client.users.fetch(userId).catch(() => null);
    if (user) await user.send('❌ **Sua whitelist foi REPROVADA.** Revise suas respostas e tente novamente.').catch(() => {});
    await interaction.update({ content: `❌ Whitelist de <@${userId}> **REPROVADA** por ${interaction.user}`, embeds: interaction.message.embeds, components: [] });
  }
}

module.exports = { wlCommand, setupWlCommand, handleWlButton, handleWlModal, handleWlDecision };
