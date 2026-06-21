const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function loadJSON(filename) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return {};
  }
}

function saveJSON(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// ─── ECONOMY ────────────────────────────────────────────────
function getEconomy() { return loadJSON('economy.json'); }
function saveEconomy(data) { saveJSON('economy.json', data); }

function getBalance(userId) {
  const eco = getEconomy();
  return eco[userId]?.balance ?? 0;
}

function setBalance(userId, amount) {
  const eco = getEconomy();
  if (!eco[userId]) eco[userId] = { balance: 0 };
  eco[userId].balance = amount;
  saveEconomy(eco);
}

function addBalance(userId, amount) {
  setBalance(userId, getBalance(userId) + amount);
}

function removeBalance(userId, amount) {
  const current = getBalance(userId);
  if (current < amount) return false;
  setBalance(userId, current - amount);
  return true;
}

function getTop100() {
  const eco = getEconomy();
  return Object.entries(eco)
    .map(([id, data]) => ({ id, balance: data.balance ?? 0 }))
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 100);
}

// ─── IDs ────────────────────────────────────────────────────
function getIds() { return loadJSON('ids.json'); }
function saveIds(data) { saveJSON('ids.json', data); }

function getNextId() {
  const ids = getIds();
  const numbers = Object.values(ids).map(d => d.number).filter(Boolean);
  if (numbers.length === 0) return 1;
  return Math.max(...numbers) + 1;
}

function assignId(userId, nickname) {
  const ids = getIds();
  if (ids[userId]) return null; // já tem ID
  const number = getNextId();
  ids[userId] = { number, nickname, assignedAt: Date.now() };
  saveIds(ids);
  return { number, nickname };
}

function getId(userId) {
  return getIds()[userId] || null;
}

function resetId(userId) {
  const ids = getIds();
  if (!ids[userId]) return false;
  delete ids[userId];
  saveIds(ids);
  return true;
}

function getAllIds() {
  const ids = getIds();
  return Object.entries(ids)
    .map(([userId, data]) => ({ userId, ...data }))
    .sort((a, b) => a.number - b.number);
}

// ─── WHITELIST ──────────────────────────────────────────────
function getWhitelists() { return loadJSON('whitelist.json'); }
function saveWhitelists(data) { saveJSON('whitelist.json', data); }

function getWhitelist(userId) {
  return getWhitelists()[userId] || null;
}

function setWhitelist(userId, data) {
  const wl = getWhitelists();
  wl[userId] = { ...data, updatedAt: Date.now() };
  saveWhitelists(wl);
}

function isApproved(userId) {
  const wl = getWhitelist(userId);
  return wl?.status === 'approved';
}

// ─── TICKETS ────────────────────────────────────────────────
function getTickets() { return loadJSON('tickets.json'); }
function saveTickets(data) { saveJSON('tickets.json', data); }

function createTicket(userId, channelId) {
  const tickets = getTickets();
  tickets[channelId] = { userId, createdAt: Date.now(), closed: false };
  saveTickets(tickets);
}

function closeTicket(channelId) {
  const tickets = getTickets();
  if (!tickets[channelId]) return;
  tickets[channelId].closed = true;
  saveTickets(tickets);
}

function getTicketByChannel(channelId) {
  return getTickets()[channelId] || null;
}

module.exports = {
  getBalance, setBalance, addBalance, removeBalance, getTop100,
  getNextId, assignId, getId, resetId, getAllIds,
  getWhitelist, setWhitelist, isApproved,
  createTicket, closeTicket, getTicketByChannel,
};
