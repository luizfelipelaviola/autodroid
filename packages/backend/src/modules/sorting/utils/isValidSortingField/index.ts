const isValidSortingField = (key: string, options: readonly string[]) => {
  return options.includes(key);
};

export { isValidSortingField };
