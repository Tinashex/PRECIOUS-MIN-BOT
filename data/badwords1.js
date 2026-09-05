let badWords = [
    "fuck",
    "porn",
    "mhata"
]; // add your words here


export const getBadWords = async () => {
    return badWords;
};


export const addBadWord = async (word) => {
    if (!word) return badWords;

    if (!badWords.includes(word)) {
        badWords.push(word);
    }

    return badWords;
};


export const removeBadWord = async (word) => {
    badWords = badWords.filter((w) => w !== word);
    return badWords;
};