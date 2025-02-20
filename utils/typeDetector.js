const isInteger = (value) => {
  return /^\d+$/.test(value);
};

const isRealNumber = (value) => {
  return /^\d*\.\d+$/.test(value);
};

const isAlphaString = (value) => {
  return /^[a-zA-Z]+$/.test(value);
};

const isAlphanumeric = (value) => {
  return /^[a-zA-Z0-9]+$/.test(value);
};

const getValueType = (value) => {
  const trimmedValue = value.trim();
  if (isInteger(trimmedValue)) return 'Integer';
  if (isRealNumber(trimmedValue)) return 'Real Number';
  if (isAlphaString(trimmedValue)) return 'Alphabetical String';
  if (isAlphanumeric(trimmedValue)) return 'Alphanumeric';
  return 'Unknown Type';
};

module.exports = { getValueType };
