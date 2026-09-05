import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const FOOTER = "> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃";

// Default rules - you can edit these
let groupRules = {
    default: `📋 *𝐆𝐑𝐎𝐔𝐏 𝐑𝐔𝐋𝐄𝐒*

1️⃣ *Respect Everyone*
No fighting, racism, or bullying

2️⃣ *No Spam*
Don't flood with messages, stickers, or links

3️⃣ *No NSFW*
No 18+ content, porn, or gore

4️⃣ *No Promotions*
No ads, youtube links, or other groups without admin permission

5️⃣ *Follow Admins*
Listen to admins and moderators

6️⃣ *Keep It Clean*
Use proper language. No bad words

❌ *Breaking rules = Kick/Ban*

${FOOTER}`
};

cmd({
    pattern: "rules",
    alias: ["rule", "grouprules"],
    desc: "Show group rules. Admins can set custom rules.",
    category: "group",
    react: "📋",
    filename: __filename
},
async (conn, mek, m, { from, args, isGroup, isAdmins, isOwner, reply, q }) => {
    try {
        if (!isGroup) return reply("❌ *ERROR:* This command is for groups only.");

        // If admin wants to set new rules
        if (q && (isAdmins || isOwner)) {
            if (args[0] === "set") {
                const newRules = q.replace("set ", "");
                groupRules[from] = `📋 *𝐆𝐑𝐎𝐔𝐏 𝐑𝐔𝐋𝐄𝐒*\n\n${newRules}\n\n${FOOTER}`;
                return reply(`✅ *RULES UPDATED*\n\nNew rules have been set for this group.`);
            }
        }

        // Show rules
        const rules = groupRules[from] || groupRules.default;

        await conn.sendMessage(from, {
            text: rules,
            buttons: [
                { buttonId: '.welcome', buttonText: { displayText: '👋 WELCOME' }, type: 1 },
                { buttonId: '.menu', buttonText: { displayText: '📜 MENU' }, type: 1 }
            ],
            headerType: 1
        }, { quoted: mek });

    } catch (e) {
        console.error("Rules error:", e);
        reply("⚠️ *ERROR:* Failed to show rules.");
    }
});