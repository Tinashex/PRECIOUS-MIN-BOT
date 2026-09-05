import { cmd } from '../command.js';
import axios from 'axios';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

// --- AI Chat Command (EliteProTech Talk AI) ---
cmd({
    pattern: "ai",
    alias: ["bot", "talk"],
    desc: "Chat with an AI model",
    category: "ai",
    react: "🤖",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for the AI.\nExample: `.ai Hello`");

        // Connected to eliteprotech talk-ai endpoint
        const apiUrl = `https://eliteprotech-apis.zone.id/talk-ai?q=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        // Standard eliteprotech validation check
        const aiMsg = data?.result || data?.message || data?.response;

        if (!data?.status || !aiMsg) {
            await react("❌");
            return reply("AI failed to respond. The API might be down.");
        }

        await reply(`🤖 *AI Response:*\n\n${aiMsg}\n\n> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`);
        await react("✅");
    } catch (e) {
        console.error("Error in AI command:", e);
        await react("❌");
        reply("An error occurred. Check if the API is online.");
    }
});

// --- OpenAI Chat Command ---
cmd({
    pattern: "openai",
    alias: ["chatgpt", "gpt3"],
    desc: "Chat with OpenAI",
    category: "ai",
    react: "🧠",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for OpenAI.\nExample: `.openai Hello`");

        const apiUrl = `https://vapis.my.id/api/openai?q=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        const aiMsg = data.result || data.message || data.answer || data.data;

        if (!aiMsg) {
            await react("❌");
            return reply("OpenAI endpoint failed.");
        }

        await reply(`🧠 *OpenAI Response:*\n\n${aiMsg}\n\n> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`);
        await react("✅");
    } catch (e) {
        console.error("Error in OpenAI command:", e);
        await react("❌");
        reply("OpenAI API error.");
    }
});

// --- DeepSeek AI Command ---
cmd({
    pattern: "deepseek",
    alias: ["deep"],
    desc: "Chat with DeepSeek AI",
    category: "ai",
    react: "🧠",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for DeepSeek AI.\nExample: `.deep Hello`");

        const apiUrl = `https://api.ryzendesu.vip/api/ai/deepseek?text=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        const aiMsg = data.answer || data.result || data.message;

        if (!aiMsg) {
            await react("❌");
            return reply("DeepSeek API is currently unresponsive.");
        }

        await reply(`🧠 *DeepSeek AI Response:*\n\n${aiMsg}\n\n> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`);
        await react("✅");
    } catch (e) {
        console.error("Error in DeepSeek AI command:", e);
        await react("❌");
        reply("DeepSeek API error.");
    }
});
