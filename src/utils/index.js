const toJSON = (data) => {
  if (Array.isArray(data)) {
    return data.map(toJSON);
  }

  if (data && typeof data === 'object') {
    const result = {};
    for (const key in data) {
      result[key] = toJSON(data[key]);
    }
    return result;
  }

  return data;
};

module.exports = { toJSON };
