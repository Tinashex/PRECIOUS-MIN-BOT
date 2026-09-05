import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const FOOTER = "> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃";

// Safety Configuration for Harare Server Stability
const SAFETY = {
  MAX_JIDS: 25,
  BASE_DELAY: 1500,  
  LONG_DELAY: 3500,  
};

cmd({
  pattern: "forward",
  alias: ["fwd", "bulk"],
  desc: "Broadcast media or text to multiple group JIDs.",
  category: "owner",
  filename: __filename
}, async (conn, mek, m, { q, isOwner, reply }) => {
  try {
    // 1. UNTOUCHABLE SECURITY LAYER
    if (!isOwner) return await reply("🚫 *ACCESS DENIED:* Developer Only.");
    if (!m.quoted) return await reply("✍️ *𝐏𝐥𝐞𝐚𝐬𝐞 𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚 𝐦𝐞𝐬𝐬𝐚𝐠𝐞 𝐭𝐨 𝐟𝐨𝐫𝐰𝐚𝐫𝐝.*");

    // 2. JID EXTRACTION & CLEANING
    if (!q) return await reply("❌ *Missing JIDs!* Provide JIDs separated by commas.");
    
    const rawJids = q.split(/[\s,]+/).filter(j => j.trim().length > 0);
    const validJids = rawJids
      .map(j => {
        const clean = j.replace(/@g\.us$/i, "").replace(/[^0-9]/g, "");
        return clean.length > 5 ? `${clean}@g.us` : null;
      })
      .filter(j => j !== null)
      .slice(0, SAFETY.MAX_JIDS);

    if (validJids.length === 0) return await reply("❌ *No valid Group JIDs found.*");

    await reply(`⏳ *𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃: 𝐁𝐑𝐎𝐀𝐃𝐂𝐀𝐒𝐓𝐈𝐍𝐆 𝐓𝐎 ${validJids.length} 𝐆𝐑𝐎𝐔𝐏𝐒...*`);

    // 3. MEDIA PROCESSING (Download once, send many)
    let content = {};
    const type = m.quoted.mtype;
    
    if (["imageMessage", "videoMessage", "audioMessage", "stickerMessage", "documentMessage"].includes(type)) {
      const buffer = await m.quoted.download();
      
      const mediaMap = {
        imageMessage: { image: buffer, caption: m.quoted.text || '' },
        videoMessage: { video: buffer, caption: m.quoted.text || '' },
        audioMessage: { audio: buffer, mimetype: "audio/mp4", ptt: m.quoted.ptt || false },
        stickerMessage: { sticker: buffer },
        documentMessage: { 
          document: buffer, 
          mimetype: m.quoted.mimetype, 
          fileName: m.quoted.fileName || "File" 
        }
      };
      content = mediaMap[type];
    } else {
      content = { text: m.quoted.text || "📢 *Forwarded Message*" };
    }

    // 4. EXECUTION LOOP
    let success = 0;
    for (let i = 0; i < validJids.length; i++) {
      try {
        await conn.sendMessage(validJids[i], content);
        success++;
        
        // Anti-Ban & Server Health Delay
        const delay = (i + 1) % 5 === 0 ? SAFETY.LONG_DELAY : SAFETY.BASE_DELAY;
        await new Promise(r => setTimeout(r, delay));
      } catch (err) {
        console.error(`Forward failed for: ${validJids[i]}`);
      }
    }

    // 5. FINAL REPORT
    const report = `✅ *𝐁𝐑𝐎𝐀𝐃𝐂𝐀𝐒𝐓 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐄*\n\n` +
                 `📤 *Success:* ${success}/${validJids.length}\n` +
                 `📦 *Type:* ${type.replace('Message', '').toUpperCase()}\n\n` +
                 `${FOOTER}`;

    await reply(report);

  } catch (e) {
    console.error("Forward Error:", e);
    reply(`⚠️ *SYSTEM ERROR:* Forwarding failed.`);
  }
});
