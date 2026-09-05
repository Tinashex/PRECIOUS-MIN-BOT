import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const FOOTER = "> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃";

// 1. REMOVE ALL NON-ADMIN MEMBERS
cmd({
    pattern: "removemembers",
    alias: ["kickall", "cleanmembers"],
    desc: "Remove all non-admin members from the group.",
    category: "group",
    react: "🧹",
    filename: __filename,
}, 
async (conn, mek, m, { from, groupMetadata, groupAdmins, isBotAdmins, isOwner, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ *ERROR:* Groups only.");
        if (!isOwner) return reply("🚫 *ACCESS DENIED:* Developer Only.");
        if (!isBotAdmins) return reply("❌ *PERMISSION ERROR:* I need Admin rights.");

        const nonAdmins = groupMetadata.participants.filter(member => !groupAdmins.includes(member.id));

        if (nonAdmins.length === 0) return reply("ℹ️ No non-admin members found.");

        await reply(`🧹 *𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃 𝐂𝐋𝐄𝐀𝐍𝐔𝐏*\n\n📍 *Action:* Removing ${nonAdmins.length} members.\n⏳ *Status:* Processing...`);

        for (let participant of nonAdmins) {
            await conn.groupParticipantsUpdate(from, [participant.id], "remove");
            await sleep(2000); // Essential anti-ban delay
        }

        return reply(`✅ *𝐒𝐔𝐂𝐂𝐄𝐒𝐒:* All non-admin members removed.\n\n${FOOTER}`);
    } catch (e) {
        reply("⚠️ *SYSTEM ERROR:* Mass removal failed.");
    }
});

// 2. REMOVE ALL ADMINS (EXCEPT OWNER & BOT)
cmd({
    pattern: "removeadmins",
    alias: ["kickadmins", "deladmins"],
    desc: "Remove all admins excluding the bot and developer.",
    category: "group",
    react: "👑",
    filename: __filename,
}, 
async (conn, mek, m, { from, isGroup, isOwner, groupMetadata, groupAdmins, isBotAdmins, reply }) => {
    try {
        if (!isGroup) return reply("❌ *ERROR:* Groups only.");
        if (!isOwner) return reply("🚫 *ACCESS DENIED.*");
        if (!isBotAdmins) return reply("❌ *PERMISSION ERROR.*");

        const botId = conn.user.id.split(':')[0] + "@s.whatsapp.net";
        const devId = "263781330745@s.whatsapp.net"; // Watson XT Protection

        const targetAdmins = groupAdmins.filter(admin => admin !== botId && admin !== devId);

        if (targetAdmins.length === 0) return reply("ℹ️ No target admins to remove.");

        await reply(`🧹 *𝐀𝐃𝐌𝐈𝐍 𝐏𝐔𝐑𝐆𝐄*\n\n📍 *Action:* Removing ${targetAdmins.length} admins.\n⏳ *Status:* Processing...`);

        for (let adminId of targetAdmins) {
            await conn.groupParticipantsUpdate(from, [adminId], "remove");
            await sleep(2000);
        }

        return reply(`✅ *𝐒𝐔𝐂𝐂𝐄𝐒𝐒:* Admin purge completed.\n\n${FOOTER}`);
    } catch (e) {
        reply("⚠️ *SYSTEM ERROR.*");
    }
});

// 3. NUCLEAR OPTION: REMOVE EVERYONE (EXCEPT OWNER & BOT)
cmd({
    pattern: "removeall2",
    alias: ["nuclear", "kickeveryone"],
    desc: "Remove EVERYONE from the group except the bot and developer.",
    category: "group",
    react: "☢️",
    filename: __filename,
}, 
async (conn, mek, m, { from, isGroup, isOwner, groupMetadata, isBotAdmins, reply }) => {
    try {
        if (!isGroup) return reply("❌ *ERROR:* Groups only.");
        if (!isOwner) return reply("🚫 *ACCESS DENIED.*");
        if (!isBotAdmins) return reply("❌ *PERMISSION ERROR.*");

        const botId = conn.user.id.split(':')[0] + "@s.whatsapp.net";
        const devId = "263781330745@s.whatsapp.net";

        const targets = groupMetadata.participants.filter(p => p.id !== botId && p.id !== devId);

        if (targets.length === 0) return reply("ℹ️ Group is already empty.");

        await reply(`☢️ *𝐍𝐔𝐂𝐋𝐄𝐀𝐑 𝐂𝐋𝐄𝐀𝐍𝐔𝐏*\n\n📍 *Action:* Full group wipe.\n👥 *Targets:* ${targets.length}\n\n${FOOTER}`);

        for (let t of targets) {
            await conn.groupParticipantsUpdate(from, [t.id], "remove");
            await sleep(2000);
        }

        return reply(`✅ *𝐒𝐓𝐀𝐓𝐔𝐒:* Group successfully cleared.`);
    } catch (e) {
        reply("⚠️ *SYSTEM ERROR.*");
    }
});
