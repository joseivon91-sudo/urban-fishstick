const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ChannelType,
  PermissionFlagsBits,
} = require('discord.js');
const { createTicket, closeTicket, getTicketByChannel } = require('../data-manager');

const ticketCommand = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('[STAFF] Posta o painel de suporte com botão para abrir ticket')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x2B2D31)
      .setTitle('🎫 Suporte — Abrir Ticket')
      .setDescription('> Precisa de ajuda? Clique no botão abaixo para abrir um ticket com nossa equipe.\n\n**📌 Use o ticket para:**\n• Dúvidas sobre o servidor\n• Reportar jogadores\n• Problemas com economia\n• Solicitar suporte da staff\n\n**⚠️ Não abuse do sistema de tickets!**')
      .setFooter({ text: 'BOT SERRA DO NORTE • Suporte' })
      .setTimestamp();
    const btn = new ButtonBuilder()
      .setCustomId('ticket_criar')
      .setLabel('🎫 Abrir Ticket')
      .setStyle(ButtonStyle.Primary);
    await interaction.reply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(btn)] });
  },
};

async function handleTicketCriar(interaction) {
  const guild = interaction.guild;
  const user = interaction.user;
  const existing = guild.channels.cache.find(ch => ch.name.startsWith('ticket-') && ch.topic === user.id);
  if (existing) return interaction.reply({ content: `⚠️ Você já tem um ticket aberto: ${existing}`, ephemeral: true });
  const ticketNum = Math.floor(Math.random() * 900) + 100;
  const ticketChannel = await guild.channels.create({
    name: `ticket-${ticketNum}`,
    type: ChannelType.GuildText,
    topic: user.id,
    ...(process.env.TICKET_CATEGORY_ID ? { parent: process.env.TICKET_CATEGORY_ID } : {}),
    permissionOverwrites: [
      { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
      { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
      ...(process.env.STAFF_ROLE_ID ? [{ id: process.env.STAFF_ROLE_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageMessages] }] : []),
    ],
  });
  createTicket(user.id, ticketChannel.id);
  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle(`🎫 Ticket #${ticketNum}`)
    .setDescription(`Olá ${user}! 👋\n\nNossa equipe irá te atender em breve.\nDescreva seu problema ou dúvida aqui.\n\n> Para fechar este ticket, clique no botão abaixo.`)
    .setFooter({ text: 'BOT SERRA DO NORTE • Suporte' })
    .setTimestamp();
  const fecharBtn = new ButtonBuilder()
    .setCustomId('ticket_fechar')
    .setLabel('🔒 Fechar Ticket')
    .setStyle(ButtonStyle.Danger);
  await ticketChannel.send({ content: `${user}`, embeds: [embed], components: [new ActionRowBuilder().addComponents(fecharBtn)] });
  await interaction.reply({ content: `✅ Ticket criado! Acesse: ${ticketChannel}`, ephemeral: true });
}

async function handleTicketFechar(interaction) {
  const ticket = getTicketByChannel(interaction.channel.id);
  if (!ticket) return interaction.reply({ content: '❌ Este não é um canal de ticket válido.', ephemeral: true });
  const isOwner = ticket.userId === interaction.user.id;
  const isStaff = interaction.member.permissions.has(PermissionFlagsBits.ManageGuild);
  if (!isOwner && !isStaff) return interaction.reply({ content: '❌ Apenas o dono do ticket ou staff pode fechar.', ephemeral: true });
  await interaction.reply({ content: `🔒 Ticket fechado por ${interaction.user}. Canal será deletado em 5 segundos...` });
  closeTicket(interaction.channel.id);
  setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
}

module.exports = { ticketCommand, handleTicketCriar, handleTicketFechar };
