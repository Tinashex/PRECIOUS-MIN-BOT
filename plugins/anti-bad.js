import { cmd } from '../command.js';
import config from '../config.js';

// Store warnings in memory. Resets on restart. Use DB if you want permanent
const userWarnings = new Map();

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

        // Check for bad word
        const foundWord = badWords.find(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'i');
            return regex.test(messageText);
        });

        if (foundWord) {
            // Delete message
            await conn.sendMessage(from, { delete: mek.key }).catch(()=>{});

            const userId = sender;
            let warns = userWarnings.get(userId) || 0;
            warns += 1;
            userWarnings.set(userId, warns);

            if (warns >= maxWarn) {
                // KICK after max warnings
                userWarnings.delete(userId);
                let kickMsg = `🚨 ** 🚨\n\n` +
                              `👤 *User:* @${sender.split("@")[0]}\n` +
                              `⚠️ *Reason:* Used bad word "${foundWord}" ${warns}/${maxWarn} times\n` +
                              `🛡️ *Action:* Removed from group`;
                await conn.sendMessage(from, { text: kickMsg, mentions: [sender] });
                await sleep(1000);
                await conn.groupParticipantsUpdate(from, [sender], "remove").catch(()=>{});
            } else {
                // WARNING
                let warnMsg = `⚠️ ** ⚠️\n\n` +
                              `@${sender.split("@")[0]}, Don't use bad words!\n\n` +
                              `*Word Detected:* ${foundWord}\n` +
                              `*Warning:* ${warns}/${maxWarn}\n` +
                              `*Next ${maxWarn - warns} warnings = KICK*`;
                await conn.sendMessage(from, { text: warnMsg, mentions: [sender] }, { quoted: mek });
            }
        }
    } catch (error) {
        console.error("Anti-Badword Error:", error);
    }
});