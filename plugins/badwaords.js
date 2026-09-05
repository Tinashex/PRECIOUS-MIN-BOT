import { cmd } from '../command.js';
import config from '../config.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '../config.env');
const userWarnings = new Map(); // resets on restart

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

// ========== AUTO DELETE + WARN/KICK ==========
cmd({
    on: "body"
}, async (conn, mek, m, {
    from, body, isGroup, isAdmins, isBotAdmins, reply, sender
}) => {
    try {
        if (config.ANTI_BAD!== "true") return;
        if (!isGroup || isAdmins ||!isBotAdmins) return;

        const maxWarn = parseInt(config.MAX_WARNINGS) || 3;
        const badWords = (config.BAD_WORDS || "fuck,porn,bitch").split(",").map(w => w.trim().toLowerCase());

        const messageText = body? body.toLowerCase() : "";
        const foundWord = badWords.find(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'i');
            return regex.test(messageText);
        });

        if (foundWord) {
            await conn.sendMessage(from, { delete: mek.key }).catch(()=>{});

            const userId = sender;
            let warns = userWarnings.get(userId) || 0;
            warns += 1;
            userWarnings.set(userId, warns);

            if (warns >= maxWarn) {
                userWarnings.delete(userId);
                let kickMsg = `🚨 ** 🚨\n\n` +
                              `👤 *User:* @${sender.split("@")[0]}\n` +
                              `⚠️ *Reason:* Bad word "${foundWord}" ${warns}/${maxWarn} times\n` +
                              `🛡️ *Action:* Removed from group`;
                await conn.sendMessage(from, { text: kickMsg, mentions: [sender] });
                await sleep(1000);
                await conn.groupParticipantsUpdate(from, [sender], "remove").catch(()=>{});
            } else {
                let warnMsg = `⚠️ ** ⚠️\n\n` +
                              `@${sender.split("@")[0]}, No bad words!\n\n` +
                              `*Word:* ${foundWord}\n` +
                              `*Warning:* ${warns}/${maxWarn}\n` +
                              `*${maxWarn - warns} more = KICK*`;
                await conn.sendMessage(from, { text: warnMsg, mentions: [sender] }, { quoted: mek });
            }
        }
    } catch (error) {
        console.error("Anti-Badword Error:", error);
    }
});

// ========== COMMAND TO MANAGE BADWORDS ==========
cmd({
    pattern: "badwords",
    alias: ["badword", "bw"],
    desc: "Manage bad words list and anti-bad settings",
    category: "group",
    use: ".badwords on/off/add/del/list 123",
    react: "🚫",
    filename: __filename,
}, async (conn, mek, m, {
    from, args, q, reply, isGroup, isAdmins
}) => {
    try {
        if (!isGroup) return reply("❌ Group only");
        if (!isAdmins) return reply("❌ Admins only");

        const action = args[0]?.toLowerCase();
        let words = (config.BAD_WORDS || "").split(",").map(w => w.trim()).filter(Boolean);

        if (!action) return reply(`*BADWORDS PANEL*\n\n` +
            `1. ${config.PREFIX}badwords on/off - Toggle system\n` +
            `2. ${config.PREFIX}badwords add fuck - Add word\n` +
            `3. ${config.PREFIX}badwords del porn - Remove word\n` +
            `4. ${config.PREFIX}badwords list - Show all words\n` +
            `5. ${config.PREFIX}badwords warn 5 - Set max warnings\n` +
            `*Status:* ${config.ANTI_BAD === "true"? "✅ ON" : "❌ OFF"}\n` +
            `*Max Warns:* ${config.MAX_WARNINGS}`);

        if (action === "on") {
            config.ANTI_BAD = "true";
            saveToEnv("ANTI_BAD", "true");
            return reply("✅ Anti-Badword *Enabled*");
        }
        if (action === "off") {
            config.ANTI_BAD = "false";
            saveToEnv("ANTI_BAD", "false");
            return reply("❌ Anti-Badword *Disabled*");
        }
        if (action === "list") {
            return reply(`🚫 *Bad Words List:* \n${words.length > 0? words.map((w,i)=>`${i+1}. ${w}`).join('\n') : "Empty"}\n\n*Total:* ${words.length}`);
        }
        if (action === "add") {
            const word = q.split(" ")[1]?.toLowerCase();
            if (!word) return reply(`❌ Example: ${config.PREFIX}badwords add huththa`);
            if (words.includes(word)) return reply(`⚠️ "${word}" is already in list`);
            words.push(word);
            config.BAD_WORDS = words.join(",");
            saveToEnv("BAD_WORDS", config.BAD_WORDS);
            return reply(`✅ Added "${word}"\n*New List:* ${words.join(", ")}`);
        }
        if (action === "del") {
            const word = q.split(" ")[1]?.toLowerCase();
            if (!word) return reply(`❌ Example: ${config.PREFIX}badwords del fuck`);
            if (!words.includes(word)) return reply(`⚠️ "${word}" not found in list`);
            words = words.filter(w => w!== word);
            config.BAD_WORDS = words.join(",");
            saveToEnv("BAD_WORDS", config.BAD_WORDS);
            return reply(`✅ Removed "${word}"\n*New List:* ${words.join(", ") || "Empty"}`);
        }
        if (action === "warn") {
            const num = parseInt(q.split(" ")[1]);
            if (!num || num < 1) return reply(`❌ Example: ${config.PREFIX}badwords warn 3`);
            config.MAX_WARNINGS = num;
            saveToEnv("MAX_WARNINGS", num);
            return reply(`✅ Max warnings set to: ${num}`);
        }

    } catch (error) {
        console.error("Badwords Command Error:", error);
        reply("❌ Error in Badwords command");
    }
});