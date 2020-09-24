/**
 * Convert a number with decimals to a percentage (multiplies by 100).
 */
export const perc = (n: number) => Math.round(n * 100);

/**
 * Gets picks a string from an array of strings based on
 */
export const getGradedColor = (colors: string[], value: number) => {
  value = Math.min(1, Math.max(0, value));

  for (let i = 0; i < colors.length; i++) {
    if (value >= (colors.length - i) / colors.length) {
      return colors[i];
    }
  }

  return colors[colors.length - 1];
};

/**
 * Gets picks a string from an array of strings based on
 */
export const getLighthouseGradedColor = (colors: string[], value: number) => {
  value = Math.min(1, Math.max(0, value));

  if (value >= 0.9) {
    return colors[0];
  } else if (value >= 0.5) {
    return colors[1];
  }

  return colors[2];
};
