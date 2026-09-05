import { cmd } from '../command.js';
import config from '../config.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

cmd({
    pattern: "botconfig",
    alias: ["settings", "panel"],
    desc: "View and manage active premium configurations.",
    category: "owner",
    react: "⚙️",
    use: "",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, reply }) => {
    if (!isOwner) return reply("❌ This command is strictly for the Bot Owner.");

    const currentSettings = `✨ *【 ${config.BOT_NAME} SYSTEM CONTROLS 】* ✨\n\n` +
                            `📞 *Anti-Call:* ${config.ANTI_CALL === "true" ? "🟢 ON" : "🔴 OFF"}\n` +
                            `🗑️ *Anti-Delete:* ${config.ANTI_DELETE === "true" ? "🟢 ON" : "🔴 OFF"}\n` +
                            `📥 *Delete Path:* \`${config.ANTI_DEL_PATH}\`\n` +
                            `👁️‍🗨️ *Anti-ViewOnce:* ${config.ANTI_VV === "true" ? "🟢 ON" : "🔴 OFF"}\n` +
                            `🛡️ *Anti-Link:* ${config.ANTI_LINK === "true" ? "🟢 ON" : "🔴 OFF"}\n` +
                            `🚫 *Anti-BadWords:* ${config.ANTI_BAD === "true" ? "🟢 ON" : "🔴 OFF"}\n` +
                            `👥 *Group Events:* ${config.GROUP_EVENTS === "true" ? "🟢 ON" : "🔴 OFF"}\n` +
                            `✍️ *Auto-Typing:* ${config.AUTO_TYPING === "true" ? "🟢 ON" : "🔴 OFF"}\n\n` +
                            `💡 _To change these permanently, update your environment variables or config.js file._`;

    return reply(currentSettings);
});

// Dynamic fast toggles for the current session
cmd({
    pattern: "anticall",
    desc: "Toggle incoming call rejection features.",
    category: "owner",
    react: "📞",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, args, reply }) => {
    if (!isOwner) return reply("❌ Owner only.");
    if (!args[0]) return reply("💡 Use `.anticall on` or `.anticall off`");
    
    if (args[0] === 'on') {
        config.ANTI_CALL = "true";
        reply("🟢 *Anti-Call Mode has been activated.* System will automatically block incoming calls.");
    } else if (args[0] === 'off') {
        config.ANTI_CALL = "false";
        reply("🔴 *Anti-Call Mode has been deactivated.*");
    }
});

cmd({
    pattern: "antidelete1",
    desc: "Toggle tracking of deleted messages.",
    category: "owner",
    react: "🗑️",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, args, reply }) => {
    if (!isOwner) return reply("❌ Owner only.");
    if (!args[0]) return reply("💡 Use `.antidelete on` or `.antidelete off`");
    
    if (args[0] === 'on') {
        config.ANTI_DELETE = "true";
        reply("🟢 *Anti-Delete Tracking active.* Deleted messages will now be saved.");
    } else if (args[0] === 'off') {
        config.ANTI_DELETE = "false";
        reply("🔴 *Anti-Delete Tracking deactivated.*");
    }
});
