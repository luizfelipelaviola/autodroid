import { isLangCode } from "is-language-code";

const isValidLanguage = (language: string): boolean => {
  try {
    return isLangCode(language).res;
  } catch {
    return false;
  }
};

export { isValidLanguage };
