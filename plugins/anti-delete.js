import { cmd } from '../command.js';
import { getAnti, setAnti } from '../data/antidel.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

export default (conn, ownerNumber) => {
    cmd({
        pattern: "antidelete",
        alias: ['antidel', 'del'],
        desc: "Toggle anti-delete feature",
        category: "misc",
        filename: __filename
    },
    async (conn, mek, m, { text }) => {
        try {
            const senderNumber = (mek.key.participant || mek.key.remoteJid || '').split('@')[0];
            const isOwner = ownerNumber.includes(senderNumber) || mek.key.fromMe;
            if (!isOwner) return m.reply('❌ This command is only for the bot owner');

            const currentStatus = await getAnti();

            // Show status if no argument or "status"
            if (!text || text.toLowerCase() === 'status') {
                return m.reply(
                    `*AntiDelete Status:* ${currentStatus ? '✅ ON' : '❌ OFF'}\n\nUsage:\n` +
                    `• .antidelete on - Enable\n` +
                    `• .antidelete off - Disable`
                );
            }

            const action = text.toLowerCase().trim();

            if (action === 'on') {
                await setAnti(true);
                return m.reply('✅ Anti-delete has been enabled');
            } else if (action === 'off') {
                await setAnti(false);
                return m.reply('❌ Anti-delete has been disabled');
            } else {
                return m.reply('❌ Invalid command. Usage:\n• .antidelete on\n• .antidelete off\n• .antidelete status');
            }
        } catch (e) {
            console.error("Error in antidelete command:", e);
            return m.reply("❌ An error occurred while processing your request.");
        }
    });
};