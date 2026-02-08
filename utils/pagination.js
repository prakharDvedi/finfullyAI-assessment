const paginateFiles = (files, page, limit) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  return {
    files: files.slice(startIndex, endIndex),
    startIndex,
    endIndex,
  };
};

module.exports = { paginateFiles };
