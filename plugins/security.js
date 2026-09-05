// ================== plugins/security.js ==================
import { getAnti, setAnti } from '../data/antidel1.js';
import { getBadWords } from '../data/badwords1.js';

export default async (conn, mek, from, body, sender, isGroup, isBotAdmins, isAdmins) => {
    try {
        // ================== ANTI-DELETE ==================
        const antiDeleteEnabled = await getAnti(); // true/false from database
        if (antiDeleteEnabled && mek.key.remoteJid.endsWith('@s.whatsapp.net')) {
            // Listen for deleted messages (Baileys will emit a "messages.update" event)
            conn.ev.on('messages.update', async (update) => {
                if (!update || !update[0]?.key) return;
                const key = update[0].key;
                if (update[0].update?.messageStubType === 68) { // deleted message type
                    const msg = await conn.loadMessage(key.remoteJid, key.id).catch(() => null);
                    if (!msg) return;
                    const content = msg.message?.conversation || msg.message?.imageMessage?.caption || msg.message?.videoMessage?.caption || '';
                    await conn.sendMessage(msg.key.remoteJid, { text: `⚠️ Anti-Delete Activated!\nSender: @${msg.key.participant.split("@")[0]}\nMessage: ${content}` }, { mentions: [msg.key.participant] });
                }
            });
        }

        // ================== ANTI-LINK ==================
        if (isGroup && isBotAdmins) {
            if (conn.ANTI_LINK === undefined) conn.ANTI_LINK = true; // default
            const antiLinkEnabled = conn.ANTI_LINK;
            const linkRegex = /(https?:\/\/)?(www\.)?(chat\.whatsapp\.com|wa\.me)\/[a-zA-Z0-9]+/i;
            if (antiLinkEnabled && body && linkRegex.test(body) && !isAdmins) {
                await conn.sendMessage(from, { text: `🚫 Links are not allowed in this group!` }, { quoted: mek });
                await conn.sendMessage(from, { delete: mek.key });
            }
        }

        // ================== BADWORDS FILTER ==================
        const badwords = await getBadWords(); // returns array of words from database/file
        if (isGroup && body && badwords?.length > 0) {
            const msgLower = body.toLowerCase();
            for (let word of badwords) {
                if (msgLower.includes(word.toLowerCase())) {
                    await conn.sendMessage(from, { text: `⚠️ Please avoid using bad words, @${sender.split("@")[0]}!` }, { mentions: [sender], quoted: mek });
                    await conn.sendMessage(from, { delete: mek.key });
                    break;
                }
            }
        }

    } catch (e) {
        console.error("Security Plugin Error:", e);
    }
};