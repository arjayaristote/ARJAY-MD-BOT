const express = require('express');
const http = require('http');
const { default: makeWASocket, DisconnectReason, useSingleFileAuthState } = require('@adiwajshing/baileys');
const qrcode = require('qrcode');
const path = require('path');
const { Boom } = require('@hapi/boom');
const { state, saveState } = useSingleFileAuthState('./auth_info.json');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Serve static files (CSS, JS, etc.)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Endpoint: Serve the session page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint: Generate WhatsApp session
app.get('/generate-session', async (req, res) => {
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, qr } = update;

        if (qr) {
            const qrCodeImage = await qrcode.toDataURL(qr);
            res.json({ qr: qrCodeImage });
        }
        if (connection === 'open') {
            console.log('WhatsApp connecté avec succès !');
            res.json({ message: 'Succès : WhatsApp est connecté !', status: 'connected' });
        }
    });

    sock.ev.on('creds.update', saveState);
});

// Start the server
server.listen(PORT, () => {
    console.log(`Le serveur est en ligne sur le port ${PORT}`);
});