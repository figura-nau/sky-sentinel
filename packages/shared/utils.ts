export const getRoundedValue = (val: number): string => {
  return val % 1 !== 0 ? val.toFixed(2) : val.toFixed(0);
};
