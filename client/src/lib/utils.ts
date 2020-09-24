/**
 * Pads string with given character and amount.
 */
export const pad = (n: string | number, width: number, z = '0') => {
  n = n.toString();
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};

/**
 * Converts unix timestamp to usable fragments.
 */
export const timestampToDate = (timestamp: number) => {
  const d = new Date(timestamp);

  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
    time: `${pad(d.getHours(), 2)}:${pad(d.getMinutes(), 2)}`,
  };
};

/**
 * Simple deep copy function.
 */
export const deepCopy = (data: any) => JSON.parse(JSON.stringify(data));

/**
 * Function for extracting query params from URL.
 */
export const getUrlQuery = (): { [key: string]: any } =>
  location.search
    .substring(1)
    .split('&')
    .filter(str => str)
    .reduce((obj, param) => {
      const [key, val] = param.split('=');

      return { ...obj, [key]: typeof val !== 'undefined' ? val : true };
    }, {});

/**
 * Helper function for delaying async functions.
 */
export const wait = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));
