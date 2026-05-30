const makeWASocket = require("@adiwajshing/baileys").default;
const { DisconnectReason } = require("@adiwajshing/baileys");
const { Boom } = require("@hapi/boom");
const qrcode = require("qrcode-terminal");

(async () => {
    const connectToWhatsApp = () => {
        const sock = makeWASocket();

        sock.ev.on("connection.update", (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === "close") {
                const shouldReconnect =
                    lastDisconnect.error &&
                    lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;
                if (shouldReconnect) {
                    connectToWhatsApp();
                }
            } else if (connection === "open") {
                console.log("ARJAY MD Bot connecté avec succès !");
            }
        });

        sock.ev.on("messages.upsert", async ({ messages }) => {
            const msg = messages[0];
            if (!msg.message) return;
            const { conversation } = msg.message;

            if (conversation === "!help") {
                await sock.sendMessage(msg.key.remoteJid, {
                    text: "Bienvenue sur ARJAY MD ! Tapez !info ou !menu."
                });
            }
        });

        sock.ev.on("creds.update", saveState);
    };

    connectToWhatsApp();
})();