import path from "path";
import fs from "fs";
import i18n from "i18n";

const distLocalesDir = path.resolve(process.cwd(), "dist/locales");
const srcLocalesDir = path.resolve(process.cwd(), "src/locales");
const localesDirectory = fs.existsSync(distLocalesDir) ? distLocalesDir : srcLocalesDir;

i18n.configure({
  locales: ["pt-BR", "en"],
  defaultLocale: process.env.DEFAULT_LOCALE || "pt-BR",
  directory: localesDirectory,
  objectNotation: true,
  queryParameter: "lang",
  fallbacks: {
    pt: "pt-BR",
    "pt-*": "pt-BR",
    "en-*": "en",
  },
});

export default i18n;