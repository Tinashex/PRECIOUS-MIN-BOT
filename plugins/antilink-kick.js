import { cmd } from '../command.js';
import config from '../config.js';

// List of link patterns to detect
const linkPatterns = [
  /https?:\/\/(?:chat\.whatsapp\.com|wa\.me)\/\S+/gi,
  /whatsapp\.com\/channel\/[a-zA-Z0-9_-]+/gi,
  /wa\.me\/\S+/gi,
  /https?:\/\/(?:t\.me|telegram\.me)\/\S+/gi,
  /https?:\/\/(?:www\.)?youtube\.com\/\S+/gi,
  /https?:\/\/youtu\.be\/\S+/gi,
  /https?:\/\/(?:www\.)?facebook\.com\/\S+/gi,
  /https?:\/\/fb\.me\/\S+/gi,
  /https?:\/\/(?:www\.)?instagram\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?twitter\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?tiktok\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?linkedin\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?snapchat\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?pinterest\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?reddit\.com\/\S+/gi,
  /https?:\/\/ngl\.\S+/gi,
  /https?:\/\/(?:www\.)?discord\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?twitch\.tv\/\S+/gi,
  /https?:\/\/(?:www\.)?vimeo\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?medium\.com\/\S+/gi
];

cmd({
  on: "body"
}, async (conn, mek, m, {
  from,
  body,
  sender,
  isGroup,
  isAdmins,
  isBotAdmins,
  reply
}) => {
  try {
    // 1. Feature Check (Matches your config key)
    if (config.ANTI_LINK_KICK !== 'true') return;

    // 2. Permissions Check
    if (!isGroup || isAdmins || !isBotAdmins) return;

    // 3. Detect Forbidden Links
    const containsLink = body && linkPatterns.some(pattern => pattern.test(body));

    if (containsLink) {
      console.log(`🚫 Link detected! Removing ${sender} from ${from}`);

      // Delete the message
      await conn.sendMessage(from, { delete: mek.key });

      // Send removal notification
      await conn.sendMessage(from, {
        text: `*⚠️ 𝐀𝐍𝐓𝐈-𝐋𝐈𝐍𝐊 𝐃𝐄𝐓𝐄𝐂𝐓𝐄𝐃 ⚠️*\n\n@${sender.split('@')[0]} has been removed for sending links. 🚫\n\n> © 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`,
        mentions: [sender]
      });

      // Kick the user
      await conn.groupParticipantsUpdate(from, [sender], "remove");
    }
  } catch (error) {
    console.error("Anti-Link-Kick Error:", error);
  }
});
