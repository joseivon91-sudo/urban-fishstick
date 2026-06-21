const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require('discord.js');
const { assignId, getId, resetId, getAllIds } = require('../data-manager');

const pedirIdCommand = {
  data: new SlashCommandBuilder()
    .setName('pedir-id')
    .setDescription('Solicita seu ID único no servidor (001, 002, 003...)')
    .addStringOption(opt =>
      opt.setName('nickname')
        .setDescription('Nome do seu personagem')
        .setRequired(true)
    ),

  async execute(interaction) {
    const nickname = interaction.options.getString('nickname');
    const existing = getId(interaction.user.id);
    if (existing) {
      const num = String(existing.number).padStart(3, '0');
      return interaction.reply({ content: `⚠️ Você já possui o ID **${num} | ${existing.nickname}**!`, ephemeral: true });
    }
    const result = assignId(interaction.user.id, nickname);
    if (!result) return interaction.reply({ content: '❌ Erro ao atribuir ID.', ephemeral: true });
    const num = String(result.number).padStart(3, '0');
    const embed = new EmbedBuilder()
      .setColor(0x57F287)
      .setTitle('🪪 ID Registrado com Sucesso!')
      .setDescription(`> **${num} | ${nickname}**\n\n**Jogador:** ${interaction.user}\n**Número:** \`${num}\`\n**Personagem:** \`${nickname}\``)
      .setFooter({ text: 'BOT SERRA DO NORTE • Sistema de IDs' })
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};

const resetarIdCommand = {
  data: new SlashCommandBuilder()
    .setName('resetar-id')
    .setDescription('[STAFF] Remove o ID de um membro para que ele possa solicitar um novo')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption(opt =>
      opt.setName('membro')
        .setDescription('Membro para resetar o ID')
        .setRequired(true)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('membro');
    const success = resetId(target.id);
    if (!success) return interaction.reply({ content: `⚠️ ${target} não possui ID registrado.`, ephemeral: true });
    await interaction.reply({ content: `✅ ID de ${target} foi resetado com sucesso!` });
  },
};

const idsCommand = {
  data: new SlashCommandBuilder()
    .setName('ids')
    .setDescription('Lista todos os IDs registrados no servidor'),

  async execute(interaction) {
    const all = getAllIds();
    if (all.length === 0) return interaction.reply({ content: 'Nenhum ID registrado ainda.', ephemeral: true });
    const lines = all.map(e => `\`${String(e.number).padStart(3, '0')}\` | ${e.nickname} — <@${e.userId}>`);
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`🪪 IDs Registrados — ${all.length} membros`)
      .setDescription(lines.join('\n'))
      .setFooter({ text: 'BOT SERRA DO NORTE • Sistema de IDs' })
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};

module.exports = { pedirIdCommand, resetarIdCommand, idsCommand };
