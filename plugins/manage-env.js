import { cmd } from '../command.js';
import config from '../config.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const FOOTER = "> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃";

// ---------------------------------------------------------------------------
//  WATSON XD - CORE SETTINGS SYSTEM
// ---------------------------------------------------------------------------

const toggleSettings = [
    { pattern: "welcome", configKey: "WELCOME", desc: "Welcome messages" },
    { pattern: "admin-events", configKey: "ADMIN_EVENTS", desc: "Admin notifications" },
    { pattern: "auto-typing", configKey: "AUTO_TYPING", desc: "Auto-typing effect" },
    { pattern: "always-online", configKey: "ALWAYS_ONLINE", desc: "Always online status" },
    { pattern: "auto-recording", configKey: "AUTO_RECORDING", desc: "Auto-recording effect" },
    { pattern: "auto-seen", configKey: "AUTO_STATUS_SEEN", desc: "Auto status viewing" },
    { pattern: "status-react", configKey: "AUTO_STATUS_REACT", desc: "Auto status liking" },
    { pattern: "read-message", configKey: "READ_MESSAGE", desc: "Auto message read" },
    { pattern: "anti-bad", configKey: "ANTI_BAD_WORD", desc: "Anti-bad word system" },
    { pattern: "auto-sticker", configKey: "AUTO_STICKER", desc: "Auto-sticker conversion" },
    { pattern: "auto-reply", configKey: "AUTO_REPLY", desc: "Auto-reply system" },
    { pattern: "auto-react", configKey: "AUTO_REACT", desc: "Auto message reactions" },
    { pattern: "status-reply", configKey: "AUTO_STATUS_REPLY", desc: "Auto status reply" },
    { pattern: "mention-reply", configKey: "MENTION_REPLY", desc: "Mention reply system" }
];

// DYNAMIC SETTINGS GENERATOR
toggleSettings.forEach(set => {
    cmd({
        pattern: set.pattern,
        desc: `Enable or disable ${set.desc}.`,
        category: "settings",
        filename: __filename
    }, async (conn, mek, m, { args, isOwner, reply }) => {
        if (!isOwner) return reply("🚫 *ACCESS DENIED:* Developer Only.");
        
        const status = args[0]?.toLowerCase();
        if (status === "on") {
            config[set.configKey] = "true";
            return reply(`✅ *${set.desc}* is now *ENABLED*.\n\n${FOOTER}`);
        } else if (status === "off") {
            config[set.configKey] = "false";
            return reply(`❌ *${set.desc}* is now *DISABLED*.\n\n${FOOTER}`);
        } else {
            return reply(`✍️ *USAGE:* .${set.pattern} on/off`);
        }
    });
});

// ---------------------------------------------------------------------------
//  ADVANCED CONFIGURATION
// ---------------------------------------------------------------------------

cmd({
    pattern: "setprefix",
    alias: ["prefix"],
    desc: "Change the bot's command prefix.",
    category: "settings",
    filename: __filename,
}, async (conn, mek, m, { args, isOwner, reply }) => {
    if (!isOwner) return reply("🚫 *ACCESS DENIED:* Developer Only.");
    const newPrefix = args[0];
    if (!newPrefix) return reply("❌ Please provide a new prefix. Example: `.setprefix !`");
    config.PREFIX = newPrefix;
    return reply(`✅ Prefix successfully changed to *${newPrefix}*\n\n${FOOTER}`);
});

cmd({
    pattern: "mode",
    alias: ["setmode"],
    desc: "Set bot mode to private or public.",
    category: "settings",
    filename: __filename,
}, async (conn, mek, m, { args, isOwner, reply }) => {
    if (!isOwner) return reply("🚫 *ACCESS DENIED:* Developer Only.");
    const mode = args[0]?.toLowerCase();
    if (mode === "private" || mode === "public") {
        config.MODE = mode;
        return reply(`✅ Bot mode set to *${mode.toUpperCase()}*.\n\n${FOOTER}`);
    }
    return reply(`📌 Current mode: *${config.MODE}*\nUsage: .mode private/public`);
});

// ---------------------------------------------------------------------------
//  GROUP SECURITY SETTINGS
// ---------------------------------------------------------------------------

const groupSecurity = [
    { pattern: "antilink", key: "ANTI_LINK", desc: "Anti-Link Detection" },
    { pattern: "antilinkkick", key: "ANTI_LINK_KICK", desc: "Anti-Link Auto-Kick" },
    { pattern: "deletelink", key: "DELETE_LINKS", desc: "Link Auto-Deletion" }
];

groupSecurity.forEach(sec => {
    cmd({
        pattern: sec.pattern,
        desc: `Enable or disable ${sec.desc}.`,
        category: "group",
        filename: __filename
    }, async (conn, mek, m, { isGroup, isAdmins, isOwner, isBotAdmins, args, reply }) => {
        if (!isGroup) return reply("❌ Groups only.");
        if (!isAdmins && !isOwner) return reply("🚫 Admin only.");
        if (!isBotAdmins) return reply("❌ I need admin to enforce this.");

        const status = args[0]?.toLowerCase();
        if (status === "on" || status === "off") {
            config[sec.key] = status === "on" ? "true" : "false";
            return reply(`${status === "on" ? "✅" : "❌"} *${sec.desc}* is now ${status.toUpperCase()}.`);
        }
        return reply(`Usage: .${sec.pattern} on/off`);
    });
});
