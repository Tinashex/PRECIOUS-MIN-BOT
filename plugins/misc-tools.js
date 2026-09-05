import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const FOOTER = "> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃";

cmd({
    pattern: "vv3",
    alias: ['retrieve', 'viewonce', 'pv'],
    desc: "Fetch and bypass ViewOnce restrictions for images/videos.",
    category: "misc",
    use: 'Reply to a ViewOnce message',
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        // 1. EXTRACT QUOTED MESSAGE DATA
        const quoted = m.quoted ? m.quoted : m.msg.contextInfo?.quotedMessage;
        if (!quoted) return reply("✨ *WATSON XD* \n\nPlease reply to a ViewOnce message to retrieve it.");

        // 2. NORMALIZE VIEWONCE CONTENT
        // Handles both V2 and V2Extension structures
        const viewOnceContent = quoted.viewOnceMessageV2?.message || 
                            quoted.viewOnceMessageV2Extension?.message || 
                            quoted.message || 
                            quoted;

        const messageType = Object.keys(viewOnceContent)[0];
        const mediaData = viewOnceContent[messageType];

        // 3. MEDIA TYPE VALIDATION
        if (!['imageMessage', 'videoMessage', 'audioMessage'].includes(messageType)) {
            return reply("❌ This message does not contain ViewOnce media.");
        }

        await reply("🔄 *Retrieving ViewOnce content...*");

        // 4. DOWNLOAD & REDELIVER
        const buffer = await conn.downloadAndSaveMediaMessage(mediaData);
        const caption = mediaData.caption || "Retrieved by Watson XD";

        if (messageType === 'imageMessage') {
            return await conn.sendMessage(from, { image: { url: buffer }, caption: `${caption}\n\n${FOOTER}` }, { quoted: mek });
        } 
        
        if (messageType === 'videoMessage') {
            return await conn.sendMessage(from, { video: { url: buffer }, caption: `${caption}\n\n${FOOTER}` }, { quoted: mek });
        }

        if (messageType === 'audioMessage') {
            return await conn.sendMessage(from, { audio: { url: buffer }, mimetype: 'audio/mp4', ptt: true }, { quoted: mek });
        }

    } catch (e) {
        console.error("VV3 Error:", e);
        reply("⚠️ *SYSTEM ERROR:* Failed to bypass ViewOnce protocol. Content may have expired.");
    }
});
