import axios from "axios";

/**
 * Fetch Emoji Mix image from API.
 * @param {string} emoji1 - First emoji.
 * @param {string} emoji2 - Second emoji.
 * @returns {Promise<string>} - The image URL.
 */
export async function fetchEmix(emoji1, emoji2) {
    try {
        if (!emoji1 || !emoji2) {
            throw new Error("Invalid emoji input. Please provide two emojis.");
        }

        const apiUrl = `https://levanter.onrender.com/emix?q=${encodeURIComponent(emoji1)},${encodeURIComponent(emoji2)}`;
        const response = await axios.get(apiUrl);

        if (response.data && response.data.result) {
            return response.data.result;
        }

        throw new Error("No valid image found.");
    } catch (error) {
        console.error("Error fetching emoji mix:", error.message);
        throw new Error("Failed to fetch emoji mix.");
    }
}