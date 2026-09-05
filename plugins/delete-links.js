import { cmd } from '../command.js';
import config from '../config.js';

// List of forbidden link patterns
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
  /https?:\/\/(?:www\.)?dailymotion\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?medium\.com\/\S+/gi
];

cmd({
  on: 'body'
}, async (conn, mek, m, {
  from,
  body,
  sender,
  isGroup,
  isAdmins,
  isBotAdmins
}) => {
  try {
    // 1. Feature Check (Matches config key)
    if (config.DELETE_LINKS !== 'true') return;

    // 2. Permissions Check (Skip DMs, Admins, and if bot isn't Admin)
    if (!isGroup || isAdmins || !isBotAdmins) return;

    // 3. Detect Links
    const containsLink = body && linkPatterns.some(pattern => pattern.test(body));

    if (containsLink) {
      // Delete the message instantly
      await conn.sendMessage(from, { delete: mek.key });

      // Notify the group with your requested branding
      await conn.sendMessage(from, {
        image: { url: 'https://cdn.phototourl.com/free/2026-04-27-7d887981-eedf-41fe-86de-eb707ccefdc3.png' },
        caption: `⚠️ *𝐀𝐍𝐓𝐈-𝐋𝐈𝐍𝐊 𝐃𝐄𝐓𝐄𝐂𝐓𝐄𝐃*\n\n@${sender.split('@')[0]}, links are not allowed here. Your message has been deleted.\n\n> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`,
        mentions: [sender],
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363424621387196@newsletter',
            newsletterName: '𝐖𝐀𝐓𝐒𝐎𝐍 𝐗𝐃',
            serverMessageId: 143
          }
        }
      });
    }
  } catch (error) {
    console.error("Delete-Link Error:", error);
  }
});
