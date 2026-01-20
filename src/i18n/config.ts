import type { Resource } from "i18next"
import i18n from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { initReactI18next } from "react-i18next"
import aboutEn from "../locales/en_US/about.json"
import braveEn from "../locales/en_US/brave.json"
import commonEn from "../locales/en_US/common.json"
import controlsEn from "../locales/en_US/controls.json"
import explorationEn from "../locales/en_US/exploration.json"
import liverDataEn from "../locales/en_US/liverData.json"
import loadingEn from "../locales/en_US/loading.json"
import metaEn from "../locales/en_US/meta.json"
import aboutIt from "../locales/it_IT/about.json"
import braveIt from "../locales/it_IT/brave.json"
import commonIt from "../locales/it_IT/common.json"
import controlsIt from "../locales/it_IT/controls.json"
import explorationIt from "../locales/it_IT/exploration.json"
import liverDataIt from "../locales/it_IT/liverData.json"
import loadingIt from "../locales/it_IT/loading.json"
import metaIt from "../locales/it_IT/meta.json"

const resources: Resource = {
  en_US: {
    common: commonEn,
    about: aboutEn,
    controls: controlsEn,
    exploration: explorationEn,
    loading: loadingEn,
    brave: braveEn,
    meta: metaEn,
    liverData: liverDataEn,
  },
  it_IT: {
    common: commonIt,
    about: aboutIt,
    controls: controlsIt,
    exploration: explorationIt,
    loading: loadingIt,
    brave: braveIt,
    meta: metaIt,
    liverData: liverDataIt,
  },
}

const supportedLanguages = ["en_US", "it_IT"]

const languageMap: Record<string, string> = {
  en: "en_US",
  "en-US": "en_US",
  "en-GB": "en_US",
  it: "it_IT",
  "it-IT": "it_IT",
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS: "common",
    fallbackLng: "en_US",
    supportedLngs: supportedLanguages,
    interpolation: {
      escapeValue: false,
      prefix: "{",
      suffix: "}",
    },
    detection: {
      order: ["path", "localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
      lookupFromPathIndex: 0,
      convertDetectedLanguage: (lng: string) => {
        const normalized = lng.toLowerCase().replace("_", "-")
        if (languageMap[normalized]) {
          return languageMap[normalized]
        }
        if (normalized.startsWith("it")) {
          return "it_IT"
        }
        if (normalized.startsWith("en")) {
          return "en_US"
        }
        return "en_US"
      },
    },
  })

export default i18n
