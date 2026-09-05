import { cmd } from '../command.js';
import config from '../config.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

// delay helper function
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

cmd({
  pattern: "end",
  desc: "Remove all members from group and reset link (Bot Owner only)",
  category: "group",
  react: "🔚",
  filename: __filename
}, async (conn, m, msg, { isAdmin, isBotAdmin, groupMetadata, sender, from, reply, args }) => {
  try {
    if (!msg.isGroup) return reply("❌ This command only works in group chats.");
    if (sender !== conn.user.id) return reply("❌ Only the bot number that deployed this bot can use this command.");
    if (!isAdmin) return reply("❌ You must be *group admin* to use this command.");
    if (!isBotAdmin) return reply("❌ Bot must be *admin* to remove members.");

    const creator = groupMetadata.participants.find(p => p.admin === 'superadmin')?.id;

    if (config.BUTTON === "true" && args[0] !== "now") {
      return await conn.sendMessage(from, {
        text: "⚠️ *Ｄᴏ Ｙᴏᴜ Ｗᴀɴᴛ Ｔｏ Ｒｅｍｏᴠᴇ Ａｌｌ Ｍｅｍｂᴇｒꜱ (Ｗɪᴛʜᴏᴜᴛ Ｙᴏᴜ Ａɴᴅ Ｇʀᴏᴜᴘ Ｃʀᴇᴀᴛᴏʀ) Ａɴᴅ Ｒｅꜱᴇｔ Ｔｈᴇ Ｇʀᴏᴜᴘ Ｌɪɴᴋ..?*",
        footer: "🚨 POWERED BY PRECIOUS-MD",
        buttons: [
          { buttonId: `${msg.prefix}end now`, buttonText: { displayText: "✅ 𝚈𝙴𝚂, 𝙴𝙽𝙳 𝙶𝚁𝙾𝚄𝙿" }, type: 1 },
          { buttonId: `${msg.prefix}cancel`, buttonText: { displayText: "❌ 𝙲𝙰𝙽𝙲𝙴𝙻 𝙶𝚁𝙾𝚄𝙿 𝙴𝙽𝙳" }, type: 1 }
        ],
        headerType: 1
      }, { quoted: m });
    }

    // 🛡️ Update Group Name, DP, Description, Lock Chat — BEFORE hacker lines
    const imageBuffer = await conn.getFile("https://files.catbox.moe/qvm47t.png", true);

    // ✅ Group name change added here
    await conn.groupUpdateSubject(from, "🖥️ POWERED BY PRECIOUS-MD");

    await conn.updateProfilePicture(from, imageBuffer.data);

    await conn.groupUpdateDescription(from,
      `🔒 *Group Access Restricted By King-Sandesh-Md-Hijack-System*\n\n•This group is now secured by *KING-SANDESH-MD-V2* 🛡️\n\n* All admin controls and permissions are managed by the new security protocol\n* Previous admin rights revoked | Group links reset for maximum safety\n\nFor inquiries, please contact the group management 📩\n\n#KING-SANDESH-MD-V2`
    );

    await conn.groupSettingUpdate(from, "announcement");

    const hackerLines = [
      "🦹‍♂️ *卄ⁱＪᵃ匚Ҝ  ˢㄒᵃʳㄒ  ⁿㄖʷ...!*",
      "*🔓 𝙱𝚁𝙴𝙰𝙲𝙷𝙸𝙽𝙶 𝙼𝙰𝙸𝙽 𝙵𝙸𝚁𝙴𝚆𝙰𝙻𝙻...*",
      "*[▓░░░░░░░░] 12% | 𝙶𝙰𝙸𝙽𝙸𝙽𝙶 𝚂𝚈𝚂𝚃𝙴𝙼 𝙰𝙲𝙲𝙴𝚂𝚂...*",
      "*⚡ 𝙱𝚈𝙿𝙰𝚂𝚂𝙸𝙽𝙶 𝙰𝙳𝙼𝙸𝙽 𝚁𝙴𝚂𝚃𝚁𝙸𝙲𝚃𝙸𝙾𝙽𝚂...*",
      "*[▓▓░░░░░░░] 29% | 𝙴𝚇𝙿𝙻𝙾𝙸𝚃 𝚁𝚄𝙽𝙽𝙸𝙽𝙶...*",
      "*🛰️ 𝚂𝙲𝙰𝙽𝙽𝙸𝙽𝙶 𝙼𝙴𝙼𝙱𝙴𝚁 𝙷𝙸𝙴𝚁𝙰𝚁𝙲𝙷𝚈..*.",
      "*[▓▓▓░░░░░░] 44% | 𝙼𝙰𝙿𝙿𝙸𝙽𝙶 𝙿𝙴𝚁𝙼𝙸𝚂𝚂𝙸𝙾𝙽𝚂...*",
      "*👑 𝙵𝙾𝚁𝙲𝙸𝙽𝙶 𝙲𝚁𝙴𝙰𝚃𝙾𝚁 𝙿𝚁𝙸𝚅𝙸𝙻𝙴𝙶𝙴𝚂 𝙾𝚅𝙴𝚁𝚁𝙸𝙳𝙴...*",
      "*[▓▓▓▓░░░░░] 60% | 𝚂𝚃𝙴𝙰𝙻𝙸𝙽𝙶 𝙾𝚆𝙽𝙴𝚁𝚂𝙷𝙸𝙿 𝙺𝙴𝚈𝚂...*",
      "*👥 𝙻𝙾𝙲𝙺𝙸𝙽𝙶 𝙳𝙾𝚆𝙽 𝙶𝚁𝙾𝚄𝙿 𝙲𝙷𝙰𝚃 𝙵𝙾𝚁 𝙰𝙻𝙻 𝙼𝙴𝙼𝙱𝙴𝚁𝚂...*",
      "*[▓▓▓▓▓░░░░] 76% | 𝙳𝙸𝚂𝙰𝙱𝙻𝙴 𝙽𝙾𝚁𝙼𝙰𝙻 𝙲𝙾𝙽𝚃𝚁𝙾𝙻𝚂...*",
      "*🔗 𝚁𝙴𝚂𝙴𝚃𝚃𝙸𝙽𝙶 𝙸𝙽𝚅𝙸𝚃𝙴 𝙻𝙸𝙽𝙺𝚂 & 𝙰𝙳𝙼𝙸𝙽 𝚁𝙾𝙻𝙴𝚂...*",
      "*[▓▓▓▓▓▓█░░] 92% | 𝙵𝙸𝙽𝙰𝙻𝙸𝚉𝙸𝙽𝙶 𝚃𝙰𝙺𝙴𝙾𝚅𝙴𝚁...*",
      "🚨 *_𝐆𝐑𝐎𝐔𝐏 𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋𝐋𝐘 𝐇𝐈𝐉𝐀𝐂𝐊𝐄𝐃..!_*",
      "*🕶️ ηєω яυℓєя: *ＨＩＪＡＣＫＥＲ* | 𝚂𝚈𝚂𝚃𝙴𝙼 𝚁𝚄𝙽𝙽𝙸𝙽𝙶 𝚄𝙽𝙳𝙴𝚁 𝚂𝙷𝙰𝙳𝙾𝚆 𝙿𝚁𝙾𝚃𝙾𝙲𝙾𝙻𝚂.*",
      "*[▓▓▓▓▓▓▓▓▓] 100% | 𝚁𝙴𝚂𝙸𝚂𝚃𝙰𝙽𝙲𝙴 𝙸𝚂 𝙵𝚄𝚃𝙸𝙻𝙴..!*"
    ];

    for (const line of hackerLines) {
      await reply(line);
      await delay(1000);
    }

    const participants = groupMetadata.participants
      .map(p => p.id)
      .filter(id => id !== conn.user.id && id !== creator);

    await conn.groupRevokeInvite(from);

    for (let member of participants) {
      try {
        await conn.groupParticipantsUpdate(from, [member], "remove");
        await delay(1000);
      } catch (err) {
        console.log(`⚠️ Failed to remove ${member}:`, err.message);
      }
    }

    await reply("✅ 𝐆ʀᴏᴜᴘ 𝐄ɴᴅᴇᴅ. 𝐀ʟʟ 𝐌ᴇᴍʙᴇʀꜱ 𝐑ᴇᴍᴏᴠᴇᴅ, 𝐍ᴀᴍᴇ & 𝐃ᴇꜱᴄ 𝐔ᴘᴅᴀᴛᴇᴅ, 𝐂ʜᴀᴛ 𝐋ᴏᴄᴋᴇᴅ.");

  } catch (e) {
    console.error(e);
    return reply("❌ Error occurred while ending the group.");
  }
});
