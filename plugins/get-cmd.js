import { cmd, commands } from '../command.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

cmd({
    pattern: "get",
    alias: ["source", "js", "code"],
    desc: "Fetch the full source code of a specific command file.",
    category: "owner",
    react: "📜",
    filename: __filename
},
async (conn, mek, m, { from, args, reply, isOwner }) => {
    try {
        // 1. Security Check
        if (!isOwner) return reply("🚫 *Access Denied!* This command is for my developer only.");
        
        // 2. Input Validation
        if (!args[0]) return reply("❌ Please provide a command name.\n*Example:* .get menu");

        const commandName = args[0].toLowerCase();
        const commandData = commands.find(cmd => 
            cmd.pattern === commandName || (cmd.alias && cmd.alias.includes(commandName))
        );

        if (!commandData || !commandData.filename) {
            return reply("❌ Command not found in the current plugin directory.");
        }

        const commandPath = commandData.filename;

        // 3. Read Source Code
        if (!fs.existsSync(commandPath)) return reply("❌ Source file does not exist on the server.");
        const fullCode = fs.readFileSync(commandPath, 'utf-8');

        // 4. Truncate for Preview
        let truncatedCode = fullCode;
        if (truncatedCode.length > 3500) {
            truncatedCode = fullCode.substring(0, 3500) + "\n\n// ... Code truncated. Check the file below for full source! 📂";
        }

        const formattedCaption = `📜 *𝐒𝐎𝐔𝐑𝐂𝐄 𝐂𝐎𝐃𝐄: ${commandName.toUpperCase()}*\n\n` +
            `\`\`\`js\n${truncatedCode}\`\`\`\n\n` +
            `⚡ *Sending full JS file below...*\n\n` +
            `> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`;

        // 5. Send Preview with Image (No Newsletter Metadata)
        await conn.sendMessage(from, { 
            image: { url: `https://cdn.phototourl.com/free/2026-04-27-7d887981-eedf-41fe-86de-eb707ccefdc3.png` },
            caption: formattedCaption,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });

        // 6. Send Document
        const fileName = `${commandName}.js`;
        await conn.sendMessage(from, { 
            document: Buffer.from(fullCode),
            mimetype: 'text/javascript',
            fileName: fileName,
            caption: `📂 Full source for: ${commandName}`
        }, { quoted: mek });

    } catch (e) {
        console.error("Error in .get command:", e);
        reply(`❌ Internal Error: ${e.message}`);
    }
});
