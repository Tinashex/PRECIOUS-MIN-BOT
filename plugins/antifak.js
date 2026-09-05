import { cmd } from '../command.js';
import config from '../config.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '../config.env');

// Helper to save to config.env
function saveToEnv(key, value) {
    let envContent = fs.existsSync(envPath)? fs.readFileSync(envPath, 'utf-8') : '';
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
        envContent += `\n${key}=${value}`;
    }
    fs.writeFileSync(envPath, envContent.trim());
}

// ========== COMMAND PART ==========
cmd({
    pattern: "antifake",
    alias: ["antifk", "fake"],
    desc: "Enable/disable anti-fake and manage blocked country codes",
    category: "group",
    use: ".antifake on/off/add/del/list 92",
    react: "🛡️",
    filename: __filename,
}, async (conn, mek, m, {
    from, body, args, q, reply, isGroup, isAdmins
}) => {
    try {
        if (!isGroup) return reply("❌ This command only works in groups");
        if (!isAdmins) return reply("❌ Only admins can use this");

        const action = args[0]?.toLowerCase();
        let codes = config.FAKE_COUNTRY_CODES;

        if (!action) return reply(`*ANTI-FAKE PANEL*\n\n` +
            `*Usage:*\n` +
            `1. ${config.PREFIX}antifake on/off - Toggle system\n` +
            `2. ${config.PREFIX}antifake add 92 - Block Pakistan\n` +
            `3. ${config.PREFIX}antifake del 234 - Unblock Nigeria\n` +
            `4. ${config.PREFIX}antifake list - Show all blocked codes\n` +
            `*Status:* ${config.ANTI_FAKE === "true"? "✅ ON" : "❌ OFF"}`);

        if (action === "on") {
            config.ANTI_FAKE = "true";
            saveToEnv("ANTI_FAKE", "true");
            return reply("✅ Anti-Fake *Enabled*\nBot will now kick foreign numbers");
        }
        if (action === "off") {
            config.ANTI_FAKE = "false";
            saveToEnv("ANTI_FAKE", "false");
            return reply("❌ Anti-Fake *Disabled*");
        }
        if (action === "list") {
            return reply(`🌍 *Blocked Country Codes:*\n+${codes.join(", +")}\n\n*Total:* ${codes.length}\n\n*Common:* 263=ZW, 27=SA, 234=NG, 92=PK, 91=IN, 1=US`);
        }
        if (action === "add") {
            const code = q.split(" ")[1]?.replace(/\+/g, '');
            if (!code || isNaN(code)) return reply(`❌ Enter valid country code. Ex: ${config.PREFIX}antifake add 92`);
            if (codes.includes(code)) return reply(`⚠️ +${code} is already blocked`);
            codes.push(code);
            config.FAKE_COUNTRY_CODES = codes;
            saveToEnv("FAKE_COUNTRY_CODES", codes.join(","));
            return reply(`✅ Added +${code} to blocklist\n*New List:* +${codes.join(", +")}`);
        }
        if (action === "del") {
            const code = q.split(" ")[1]?.replace(/\+/g, '');
            if (!code || isNaN(code)) return reply(`❌ Enter valid country code. Ex: ${config.PREFIX}antifake del 92`);
            if (!codes.includes(code)) return reply(`⚠️ +${code} is not in blocklist`);
            config.FAKE_COUNTRY_CODES = codes.filter(c => c!== code);
            saveToEnv("FAKE_COUNTRY_CODES", config.FAKE_COUNTRY_CODES.join(","));
            return reply(`✅ Removed +${code} from blocklist\n*New List:* +${codes.join(", +")}`);
        }
    } catch (error) {
        console.error("Anti-Fake Command Error:", error);
        reply("❌ Error in Anti-Fake command");
    }
});

// ========== AUTO KICK PART ==========
cmd({
    on: "body"
}, async (conn, mek, m, {
    from, body, sender, isGroup, isAdmins, isBotAdmins, reply
}) => {
    try {
        if (config.ANTI_FAKE!== "true") return;
        if (!isGroup || isAdmins ||!isBotAdmins) return;

        const senderNumber = sender.split("@")[0];
        const fakeCodes = config.FAKE_COUNTRY_CODES;

        const isFake = fakeCodes.some(code => senderNumber.startsWith(code));

        if (isFake) {
            let fakeMsg = `🚨 ** 🚨\n\n` +
                          `👤 *User:* @${senderNumber}\n` +
                          `🌍 *Country Code:* +${senderNumber.substring(0, 4)}\n` +
                          `❌ *Reason:* Foreign number not allowed in this group\n` +
                          `⚙️ *Action:* Removed automatically`;

            await conn.sendMessage(from, { text: fakeMsg, mentions: [sender] });
            await new Promise(resolve => setTimeout(resolve, 1500)); // sleep
            await conn.groupParticipantsUpdate(from, [sender], "remove").catch(()=>{});
        }
    } catch (error) {
        console.error("Anti-Fake AutoKick Error:", error);
    }
});