const sortFiles = (files, sort, order) => {
  return files.sort((a, b) => {
    if (sort === "date") {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      return order === "asc" ? timeA - timeB : timeB - timeA;
    }
    return 0;
  });
};

module.exports = { sortFiles };
