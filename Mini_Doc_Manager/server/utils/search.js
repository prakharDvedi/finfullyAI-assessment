const filterFiles = (files, search) => {
  if (!search) return files;
  return files.filter((file) =>
    file.name.toLowerCase().includes(search.toLowerCase()),
  );
};

module.exports = { filterFiles };
