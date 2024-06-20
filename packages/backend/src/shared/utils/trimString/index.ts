const trimString = (str: string): string => {
  if (!str) return "";
  return String(str).trim().replace(/\s+/g, " ");
};

export { trimString };
