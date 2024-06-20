/* eslint-disable no-console */
import i18next, { InitOptions, TFunction } from "i18next";
import i18nextBackend from "i18next-fs-backend";
import i18nextMiddleware from "i18next-http-middleware";
import { join } from "node:path";

// Configuration import
import { getEnvConfig } from "@config/env";

// Error import
import { AppError } from "@shared/errors/AppError";

// Logs for i18n
const logs = false;

const options: InitOptions = {
  /**
   * LOGGING
   */

  // If true, will throw logs
  debug: false,

  /**
   * LANGUAGES, NAMESPACES AND RESOURCES
   */

  // Pre-load disabled, using backend instead
  resources: undefined,

  // Translation files paths
  backend: {
    loadPath: join(__dirname, "locales/{{lng}}/{{ns}}.json"),
    addPath: join(__dirname, "locales/{{lng}}/{{ns}}.missing.json"),
  },
  partialBundledLanguages: false,

  // Override all translations
  // lng: envConfig.DEFAULT_LANGUAGE || "en",

  // If not found language, switches to this
  fallbackLng: getEnvConfig().DEFAULT_LANGUAGE || "en",

  // Supported languages
  supportedLngs: false,
  nonExplicitSupportedLngs: false,

  // Preload languages
  load: "all",
  preload: [getEnvConfig().DEFAULT_LANGUAGE || "en"],

  // Locale lowercase
  lowerCaseLng: true,
  cleanCode: true,

  returnNull: false,

  // Namespaces to load
  ns: "translation",
  defaultNS: "translation",
  fallbackNS: false,

  /**
   * MISSING KEYS
   */

  // Save missing to missing json
  saveMissing: false,
  updateMissing: false,
  saveMissingTo: undefined,

  // Missing key handler function(lng, ns, key, fallbackValue) { }
  missingKeyHandler: false,
  // parseMissingKeyHandler: undefined,
  appendNamespaceToMissingKey: false,
  // missingInterpolationHandler: undefined,

  /**
   * DETECTION
   */

  // Language detector options
  detection: {
    // Order and from where user language should be detected
    order: [/* 'path', 'session', */ "querystring", "cookie", "header"],

    // Keys or params to lookup language from
    lookupQuerystring: "lng",
    lookupCookie: "i18n",
    lookupHeader: "accept-language",
    lookupSession: "lng",
    lookupPath: "lng",
    lookupFromPathIndex: 0,

    // Cache user language
    caches: false, // ['cookie']

    // Optional expire and domain for set cookie
    cookieExpirationDate: new Date(),
    cookieDomain: "lng",
    cookieSecure: true, // if need secure cookie
  },

  // Missing key function
  // missingKeyHandler: translationMissing,

  // Testing env
  ...(getEnvConfig().isTestEnv
    ? {
        lng: "cimode",
        initImmediate: true,
      }
    : {}),
};

i18next
  .use(i18nextBackend)
  .use(i18nextMiddleware.LanguageDetector)
  .init(options);

// Log only in development environment
if (getEnvConfig().NODE_ENV === "development" && logs) {
  i18next.on("initialized", () => {
    console.log("🆗 Translation initialized");
  });

  i18next.on("languageChanged", lng => {
    console.log(`🔁 Language changed to ${Object.keys(lng).join(" ")}`);
  });

  i18next.on("loaded", loaded => {
    console.log(`🔃 Translation loaded ${Object.keys(loaded).join(", ")}`);
  });

  i18next.on("failedLoading", lng => {
    console.log(`❌ Fail to load translation "${lng}"`);
  });

  i18next.on("missingKey", (lngs, namespace, key) => {
    console.log(
      `❌ Missing key [${Object.keys(key).join(
        " ",
      )}] in language [${Object.keys(lngs).join(
        " ",
      )}] with namespace [${Object.keys(namespace).join(" ")}]`,
    );
  });
}

const t = i18next.t.bind(i18next);

const i18n = async (lng: string) => {
  try {
    const translationFunction = await i18next
      .cloneInstance({ initImmediate: false })
      .changeLanguage(lng || getEnvConfig().DEFAULT_LANGUAGE || "en");
    return translationFunction;
  } catch (err) {
    throw new AppError({
      key: "@i18n/FAIL",
      message: "Failed to load translations.",
      statusCode: 500,
    });
  }
};

export type { TFunction };
export { i18next, i18n, t };
