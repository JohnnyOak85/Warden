export const getRandom = (max = 100, min = 1) => Math.floor(Math.random() * (max - min + 1) + min);

export const getNumber = (amount: string) => {
  const number = parseInt(amount, 10);

  if (!amount || isNaN(number) || number <= 0) return 1;
  if (number >= 100) return 99;

  return number;
};
