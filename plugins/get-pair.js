import { cmd } from '../command.js';
import axios from 'axios';
import config from '../config.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

cmd({
    pattern: "pair",
    alias: ["getpair", "freebot"],
    react: "✅",
    desc: "Get pairing code for knight bot and save creds",
    category: "download",
    use: ".pair 26378133XX",
    filename: __filename
}, async (conn, mek, m, { q, senderNumber, reply, from }) => {
    try {
        const phoneNumber = q
            ? q.trim().replace(/[^0-9]/g, '')
            : senderNumber.replace(/[^0-9]/g, '');

        if (!phoneNumber || phoneNumber.length < 10 || phoneNumber.length > 15) {
            return await reply("❌ Please provide a valid phone number without `+`\nExample: `.pair 26378133XX`");
        }

        await reply("⏳ *Ｇ𝙴𝙽𝙴𝚁𝙰𝚃𝙸𝙽𝙶 Ｙ𝙾𝚄𝚁 Ｐ𝙰𝙸𝚁𝙸𝙽𝙶 Ｃ𝙾𝙳𝙴...*\n\n𝐏ʟᴇᴀꜱ𝐄 𝐖ᴀɪ𝐓 𝐖ʜɪʟ𝐄 𝐖𝐄 𝐂ᴏɴɴᴇᴄ𝐓 𝐓𝐎 𝐓ʜ𝐄 𝐊ɪɴ𝐆 - 𝐒ᴀɴᴅᴇꜱ𝐇 - 𝐌𝐃 𝐒ᴇʀᴠᴇ𝐑.");

        const res = await axios.get(`knight-bot-paircode.onrender.com/code?number=${encodeURIComponent(phoneNumber)}`);

        if (!res.data || !res.data.code) {
            return await reply("❌ Failed to retrieve pairing code. Please try again later.");
        }

        const pairingCode = res.data.code;
        const instructions = 
            `✅ *ＫꜱᴍＤ ＰᴀɪʀɪɴＧ ＣᴏᴍᴘʟᴇᴛᴇＤ*\n\n` +
            `*𝐘𝐨𝐮𝐫 𝐏𝐚𝐢𝐫𝐢𝐧𝐠 𝐂𝐨𝐝𝐞 𝐈𝐬:* \`\`\`${pairingCode}\`\`\`\n\n` +
            `📌 *𝐈𝐧𝐬𝐭𝐫𝐮𝐜𝐭𝐢𝐨𝐧𝐬 𝐅𝐨𝐫 𝐏𝐚𝐢𝐫:*\n` +
            `1. 𝙾𝙿𝙴𝙽 𝚆𝙷𝙰𝚃𝚂𝙰𝙿𝙿 𝙾𝙽 𝚈𝙾𝚄𝚁 𝙳𝙴𝚅𝙸𝙲𝙴.\n` +
            `2. 𝙶𝙾 𝚃𝙾 *𝙻𝙸𝙽𝙺𝙴𝙳 𝙳𝙴𝚅𝙸𝙲𝙴𝚂*.\n` +
            `3. 𝙲𝙻𝙸𝙲𝙺 𝙾𝙽 *𝙻𝙸𝙽𝙺 𝚆𝙸𝚃𝙷 𝙿𝙷𝙾𝙽𝙴 𝙽𝚄𝙼𝙱𝙴𝚁*.\n` +
            `4. 𝙴𝙽𝚃𝙴𝚁 𝚃𝙷𝙴 𝙿𝙰𝙸𝚁𝙸𝙽𝙶 𝙲𝙾𝙳𝙴 𝙰𝙱𝙾𝚅𝙴.\n` +
            `5. 𝚆𝙰𝙸𝚃 𝙵𝙾𝚁 𝚃𝙷𝙴 𝙱𝙾𝚃 𝚃𝙾 𝙲𝙾𝙽𝙽𝙴𝙲𝚃.\n\n` +
            `⚠️ *ＮＯＴＥ:* 𝚃𝙷𝙸𝚂 𝙲𝙾𝙳𝙴 𝚆𝙸𝙻𝙻 𝙴𝚇𝙿𝙸𝚁𝙴 𝙸𝙽 1 𝙼𝙸𝙽𝚄𝚃𝙴. 𝚄𝚂𝙴 𝙸𝚃 𝙸𝙼𝙼𝙴𝙳𝙸𝙰𝚃𝙻𝚈..!`;

        if (process.env.BUTTON === 'true') {
            await conn.sendMessage(from, {
                text: instructions,
                buttons: [
                    { buttonId: `.copy ${pairingCode}`, buttonText: { displayText: "📋 𝙲𝙾𝙿𝚈 𝙲𝙾𝙳𝙴" }, type: 1 },
                    { buttonId: `.pair ${phoneNumber}`, buttonText: { displayText: "🔄 𝙶𝙴𝙽𝙴𝚁𝙰𝚃𝙴 𝙰𝙶𝙰𝙸𝙽" }, type: 1 }
                ],
                headerType: 4
            }, { quoted: mek });
        } else {
            await reply(instructions);
            await new Promise(r => setTimeout(r, 2000));
            await reply(pairingCode);
        }

    } catch (err) {
        console.error("Pair command error:", err);
        await reply("❌ An error occurred while getting pairing code. Please try again later.");
    }
});
