const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require('discord.js');
const {
  getBalance, addBalance, removeBalance, setBalance, getTop100,
} = require('../data-manager');

function formatMoney(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const balCommand = {
  data: new SlashCommandBuilder()
    .setName('bal')
    .setDescription('Veja seu saldo ou o de outro membro')
    .addUserOption(opt =>
      opt.setName('membro')
        .setDescription('Membro para consultar (opcional)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('membro') ?? interaction.user;
    const balance = getBalance(target.id);
    const embed = new EmbedBuilder()
      .setColor(0xF1C40F)
      .setTitle('💰 Saldo')
      .setDescription(`**${target.username}**\n\n💵 **Saldo atual:** ${formatMoney(balance)}`)
      .setThumbnail(target.displayAvatarURL())
      .setFooter({ text: 'BOT SERRA DO NORTE • Economia' })
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};

const pixCommand = {
  data: new SlashCommandBuilder()
    .setName('pix')
    .setDescription('Envia dinheiro para outro membro')
    .addUserOption(opt =>
      opt.setName('membro')
        .setDescription('Para quem enviar o PIX')
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt.setName('valor')
        .setDescription('Quantidade a enviar (em reais)')
        .setRequired(true)
        .setMinValue(1)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('membro');
    const amount = interaction.options.getInteger('valor');
    if (target.id === interaction.user.id)
      return interaction.reply({ content: '❌ Você não pode enviar PIX para si mesmo.', ephemeral: true });
    if (target.bot)
      return interaction.reply({ content: '❌ Você não pode enviar PIX para um bot.', ephemeral: true });
    const success = removeBalance(interaction.user.id, amount);
    if (!success) {
      const balance = getBalance(interaction.user.id);
      return interaction.reply({ content: `❌ Saldo insuficiente! Seu saldo: **${formatMoney(balance)}**`, ephemeral: true });
    }
    addBalance(target.id, amount);
    const embed = new EmbedBuilder()
      .setColor(0x57F287)
      .setTitle('💸 PIX Enviado!')
      .setDescription(`**De:** ${interaction.user}\n**Para:** ${target}\n**Valor:** ${formatMoney(amount)}\n\nNovo saldo de ${interaction.user.username}: **${formatMoney(getBalance(interaction.user.id))}**`)
      .setFooter({ text: 'BOT SERRA DO NORTE • Economia' })
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};

const topCommand = {
  data: new SlashCommandBuilder()
    .setName('top')
    .setDescription('Lista os 100 membros mais ricos do servidor'),

  async execute(interaction) {
    await interaction.deferReply();
    const top = getTop100();
    if (top.length === 0)
      return interaction.editReply({ content: 'Nenhum membro com saldo ainda.' });
    const medals = ['🥇', '🥈', '🥉'];
    const lines = top.map((entry, i) => {
      const prefix = medals[i] ?? `**${i + 1}.**`;
      return `${prefix} <@${entry.id}> — ${formatMoney(entry.balance)}`;
    });
    const embed = new EmbedBuilder()
      .setColor(0xF1C40F)
      .setTitle('🏆 Top 100 — Mais Ricos do Servidor')
      .setDescription(lines.join('\n'))
      .setFooter({ text: `BOT SERRA DO NORTE • Total: ${top.length} membros` })
      .setTimestamp();
    await interaction.editReply({ embeds: [embed] });
  },
};

const addMoneyCommand = {
  data: new SlashCommandBuilder()
    .setName('add-money')
    .setDescription('[ADM] Adiciona ou remove dinheiro de um membro')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption(opt =>
      opt.setName('membro')
        .setDescription('Membro que receberá/perderá o dinheiro')
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt.setName('valor')
        .setDescription('Valor em reais (positivo para adicionar, negativo para remover)')
        .setRequired(true)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('membro');
    const amount = interaction.options.getInteger('valor');
    const before = getBalance(target.id);
    if (amount >= 0) {
      addBalance(target.id, amount);
    } else {
      setBalance(target.id, Math.max(0, before + amount));
    }
    const after = getBalance(target.id);
    const action = amount >= 0 ? 'adicionado ✅' : 'removido ❌';
    const color = amount >= 0 ? 0x57F287 : 0xED4245;
    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle('💰 Saldo Atualizado')
      .setDescription(`**Membro:** ${target}\n**Valor ${action}:** ${formatMoney(Math.abs(amount))}\n\n**Antes:** ${formatMoney(before)}\n**Depois:** ${formatMoney(after)}`)
      .setFooter({ text: `Executado por ${interaction.user.tag} • BOT SERRA DO NORTE` })
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};

module.exports = { balCommand, pixCommand, topCommand, addMoneyCommand };
