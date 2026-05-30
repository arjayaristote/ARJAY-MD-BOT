const { default: makeWASocket, DisconnectReason, useSingleFileAuthState } = require('@adiwajshing/baileys');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode-terminal');
const { state, saveState } = useSingleFileAuthState('./auth_info.json');

const startBot = () => {
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                startBot();
            }
        } else if (connection === 'open') {
            console.log('ARJAY MD Bot connecté avec succès!');
        }
    });

    sock.ev.on('creds.update', saveState);

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;

        const { conversation } = msg.message;

        if (conversation) {
            console.log('Message reçu:', conversation);
            if (conversation === '!help') {
                await sock.sendMessage(msg.key.remoteJid, { text: 'Bienvenue sur ARJAY MD Bot! Tapez !menu pour voir les options.' });
            } else if (conversation === '!menu') {
                await sock.sendMessage(msg.key.remoteJid, { text: 'Voici les commandes disponibles:\n!help - Affiche l\'aide\n!menu - Affiche ce menu' });
            }
        }
    });
};

startBot();