import axios from 'axios';
import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

cmd({
  pattern: "country",
  alias: ["countryinfo", "nation"],
  desc: "Get detailed information about a country",
  category: "search",
  filename: __filename,
  use: "<country name>",
}, async (conn, mek, m, { from, q, reply }) => {
  try {
    // 1. Validation Check
    if (!q) {
      return reply("✍️ *Please provide a country name.* \n\nExample: .country Zimbabwe");
    }

    // 2. Loading State / Reaction
    await conn.sendMessage(from, { react: { text: '🌍', key: mek.key } });

    // 3. Fetch from your Countries API endpoint
    const apiUrl = `https://eliteprotech-apis.zone.id/countries?q=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl);

    // 4. Validate the response structure
    if (!data?.status || !data?.result) {
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        return reply("❌ Country not found. Please make sure the spelling is correct.");
    }

    const country = data.result;

    // 5. Parse arrays safely (currencies and languages)
    const currencyList = country.currencies 
        ? country.currencies.map(c => `${c.name} (${c.symbol || ''})`).join(", ") 
        : "N/A";
        
    const languageList = Array.isArray(country.languages) 
        ? country.languages.join(", ") 
        : "N/A";

    // 6. Format the message layout
    let countryMsg = `🌍 *𝐂𝐎𝐔𝐍𝐓𝐑𝐘 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍*\n\n` +
                     `📍 *Name:* ${country.name} (${country.officialName || country.name})\n` +
                     `🏛️ *Capital:* ${country.capital || "N/A"}\n` +
                     `🗺️ *Region:* ${country.region} (${country.subregion || "N/A"})\n` +
                     `👥 *Population:* ${country.population ? country.population.toLocaleString() : "N/A"}\n` +
                     `📐 *Area:* ${country.area || "N/A"}\n` +
                     `💵 *Currencies:* ${currencyList}\n` +
                     `🗣️ *Languages:* ${languageList}\n\n` +
                     `📖 *Flag Description:* _${country.flag?.description || "No description available."}_\n\n` +
                     `> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`;

    // 7. Send the info with the flag image if available
    if (country.flag && country.flag.image) {
        await conn.sendMessage(from, {
            image: { url: country.flag.image },
            caption: countryMsg
        }, { quoted: mek });
    } else {
        await conn.sendMessage(from, { text: countryMsg }, { quoted: mek });
    }

    // 8. Success Reaction
    await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

  } catch (error) {
    console.error("Country Plugin Error:", error);
    await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
    reply("❌ An error occurred while retrieving country data.");
  }
});
