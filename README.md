# 🤖 Bot Serra do Norte — Guia de Instalação

## 📋 Sistemas incluídos

| Sistema | Comandos |
|---------|----------|
| Whitelist RP | `/wl`, `/setup-whitelist` |
| IDs únicos | `/pedir-id`, `/resetar-id`, `/ids` |
| Economia | `/bal`, `/pix`, `/top`, `/add-money` |
| Loja | `/loja`, `/add-item`, `/remove-item` |
| Tickets | `/ticket` |

---

## 🚀 Como subir no Railway (passo a passo)

### 1. Criar o bot no Discord
1. Acesse https://discord.com/developers/applications
2. Clique em **New Application** → dê um nome
3. Vá em **Bot** → clique em **Add Bot**
4. Em **Privileged Gateway Intents**, ative:
   - ✅ Server Members Intent
   - ✅ Message Content Intent
5. Copie o **TOKEN** (guarde com segurança)
6. Vá em **OAuth2 → URL Generator**
   - Scope: `bot` + `applications.commands`
   - Permissions: `Administrator`
7. Copie o link gerado e convide o bot para seu servidor

### 2. Subir para o GitHub
1. Crie um repositório novo no GitHub
2. Faça upload de todos os arquivos desta pasta
3. **NUNCA** suba o arquivo `.env` (coloque no `.gitignore`)

### 3. Deploy no Railway
1. Acesse https://railway.app
2. Clique em **New Project → Deploy from GitHub**
3. Selecione seu repositório
4. Vá em **Variables** e adicione:
   ```
   TOKEN = seu_token_aqui
   WL_STAFF_CHANNEL = id_do_canal
   WL_ROLE_ID = id_do_cargo_whitelist
   STAFF_ROLE_ID = id_do_cargo_staff
   TICKET_CATEGORY_ID = id_da_categoria
   ```
5. Clique em **Deploy** — o bot ficará online 24/7!

---

## ⚙️ Configurando o servidor Discord

### Canais recomendados
- `#whitelist` — use `/wl` aqui para postar o painel
- `#suporte` — use `/ticket` aqui para o painel de tickets
- `#staff-whitelist` — coloque o ID deste canal em `WL_STAFF_CHANNEL`
- Uma **categoria** para tickets — coloque o ID em `TICKET_CATEGORY_ID`

### Cargos recomendados
- **Whitelist** — cargo dado automaticamente após aprovação (`WL_ROLE_ID`)
- **Staff** — cargo que vê os tickets e aprova whitelist (`STAFF_ROLE_ID`)

---

## 📖 Comandos detalhados

### Whitelist
| Comando | Quem usa | O que faz |
|---------|----------|-----------|
| `/wl` | Staff | Posta o painel com botão "Fazer Whitelist" |
| `/setup-whitelist` | Staff | Mesmo que `/wl` |

**Fluxo:**
1. Membro clica em **📝 Fazer Whitelist**
2. Abre um formulário com 5 perguntas:
   - Nome do personagem
   - O que é Combat Logging
   - O que é RDM
   - O que é VDM
   - O que é Powergaming
3. Staff recebe no canal configurado com botões **✅ Aprovar** / **❌ Reprovar**
4. Membro recebe DM com o resultado

### IDs únicos (estilo FiveM)
| Comando | Quem usa | O que faz |
|---------|----------|-----------|
| `/pedir-id [nickname]` | Membros | Solicita um ID único (001, 002...) |
| `/resetar-id [@membro]` | Staff | Reseta o ID de alguém |
| `/ids` | Todos | Lista todos os IDs |

**Exemplo:** `/pedir-id João Silva` → bot responde `001 | João Silva`

### Economia
| Comando | Quem usa | O que faz |
|---------|----------|-----------|
| `/bal [@membro]` | Todos | Ver saldo |
| `/pix [@membro] [valor]` | Todos | Transferir dinheiro |
| `/top` | Todos | Top 100 mais ricos |
| `/add-money [@membro] [valor]` | ADM | Adicionar/remover dinheiro |

**Exemplos:**
- `/add-money @João 1000000` → adiciona R$ 1.000.000
- `/add-money @João -500` → remove R$ 500
- `/pix @Maria 250` → envia R$ 250 para Maria

### Loja
| Comando | Quem usa | O que faz |
|---------|----------|-----------|
| `/loja` | Todos | Ver itens disponíveis |
| `/add-item [nome] [preco]` | ADM | Adicionar item |
| `/remove-item [nome]` | ADM | Remover item |

### Tickets
| Comando | Quem usa | O que faz |
|---------|----------|-----------|
| `/ticket` | Staff | Posta o painel de tickets |

**Fluxo:**
1. Membro clica em **🎫 Abrir Ticket**
2. Bot cria canal privado `ticket-671` (número aleatório)
3. Apenas o membro e a staff veem o canal
4. Clicando em **🔒 Fechar Ticket**, o canal é deletado após 5 segundos

---

## 💾 Persistência de dados

Os dados ficam em arquivos JSON na pasta `data/`:
- `economy.json` — saldos de todos os membros
- `ids.json` — IDs únicos
- `whitelist.json` — aplicações de whitelist
- `tickets.json` — histórico de tickets

No Railway, os dados persistem enquanto o projeto estiver ativo. Para persistência permanente, considere usar um banco de dados externo.

---

## 🆘 Problemas comuns

**Bot não responde aos comandos slash:**
- Aguarde até 1 hora após o primeiro deploy para os comandos aparecerem
- Verifique se o bot tem permissão `applications.commands`

**Erro "Missing Permissions":**
- Certifique-se que o bot tem permissão de **Administrador** no servidor

**Dados sumindo após restart:**
- No Railway, os dados persistem normalmente. Se ocorrer, verifique os logs.
