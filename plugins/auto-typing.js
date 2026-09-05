import fs from 'fs';
import path from 'path';
import config from '../config.js';
import { cmd, commands } from '../command.js';

// Auto Typing (Composing) Presence System
cmd({
    on: "body"
}, async (conn, mek, m, { from, body, isOwner }) => {
    try {
        // 1. Check if the feature is enabled in config.js
        if (config.AUTO_TYPING === 'true') {
            
            // 2. Prevent the bot from triggering typing for its own messages
            if (mek.key.fromMe) return;

            // 3. Send 'composing' status to the chat
            // This displays "typing..." in the WhatsApp header
            await conn.sendPresenceUpdate('composing', from);
        }
    } catch (e) {
        console.error("Auto-Typing Error:", e);
    }
});
