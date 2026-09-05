let antiDelete = true;

export const getAnti = async () => {
    return antiDelete;
};

export const setAnti = async (val) => {
    antiDelete = val;
    return antiDelete;
};