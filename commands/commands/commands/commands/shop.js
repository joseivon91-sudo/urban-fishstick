const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require('discord.js');
const fs = require('fs');
const path = require('path');

function getShop() {
  const p = path.join(__dirname, '../data/shop.json');
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
function saveShop(items) {
  const p = path.join(__dirname, '../data/shop.json');
  if (!fs.existsSync(path.dirname(p))) fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(items, null, 2));
}
function formatMoney(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const addItemCommand = {
  data: new SlashCommandBuilder()
    .setName('add-item')
    .setDescription('[ADM] Adiciona um item à loja')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(opt => opt.setName('nome').setDescription('Nome do item').setRequired(true))
    .addIntegerOption(opt => opt.setName('preco').setDescription('Preço em reais').setRequired(true).setMinValue(1))
    .addStringOption(opt => opt.setName('descricao').setDescription('Descrição do item').setRequired(false)),

  async execute(interaction) {
    const nome = interaction.options.getString('nome');
    const preco = interaction.options.getInteger('preco');
    const descricao = interaction.options.getString('descricao') ?? 'Sem descrição';
    const shop = getShop();
    shop.push({ id: Date.now().toString(), nome, preco, descricao });
    saveShop(shop);
    const embed = new EmbedBuilder()
      .setColor(0x57F287)
      .setTitle('✅ Item Adicionado à Loja')
      .addFields(
        { name: '🏷️ Nome', value: nome, inline: true },
        { name: '💰 Preço', value: formatMoney(preco), inline: true },
        { name: '📝 Descrição', value: descricao },
      )
      .setFooter({ text: 'BOT SERRA DO NORTE • Loja' })
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};

const removeItemCommand = {
  data: new SlashCommandBuilder()
    .setName('remove-item')
    .setDescription('[ADM] Remove um item da loja pelo nome')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(opt => opt.setName('nome').setDescription('Nome do item para remover').setRequired(true)),

  async execute(interaction) {
    const nome = interaction.options.getString('nome').toLowerCase();
    const shop = getShop();
    const idx = shop.findIndex(i => i.nome.toLowerCase() === nome);
    if (idx === -1) return interaction.reply({ content: `❌ Item **${nome}** não encontrado.`, ephemeral: true });
    const removed = shop.splice(idx, 1)[0];
    saveShop(shop);
    await interaction.reply({ content: `✅ Item **${removed.nome}** removido da loja.` });
  },
};

const lojaCommand = {
  data: new SlashCommandBuilder()
    .setName('loja')
    .setDescription('Abre a loja do servidor para comprar itens'),

  async execute(interaction) {
    const shop = getShop();
    if (shop.length === 0) return interaction.reply({ content: '🏪 A loja está vazia no momento.', ephemeral: true });
    const embed = new EmbedBuilder()
      .setColor(0xF1C40F)
      .setTitle('🏪 Loja do Servidor')
      .setFooter({ text: 'BOT SERRA DO NORTE • Loja' })
      .setTimestamp();
    for (const item of shop.slice(0, 25)) {
      embed.addFields({ name: `🏷️ ${item.nome} — ${formatMoney(item.preco)}`, value: item.descricao });
    }
    await interaction.reply({ embeds: [embed] });
  },
};

module.exports = { addItemCommand, removeItemCommand, lojaCommand };
