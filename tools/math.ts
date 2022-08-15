export const getRandom = (max = 100, min = 1) => Math.floor(Math.random() * (max - min + 1) + min);

const parse = (str: string) => parseInt(str, 10);

export const getNumber = (amount: string, max = 100) => {
    const number = parse(amount);

    if (!amount || isNaN(number) || number <= 0) return 1;
    if (number >= max) return max - 1;

    return number;
};

export const isNumber = (str: string) => !str || !isNaN(parse(str));
