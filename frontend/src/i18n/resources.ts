// Shared shell and the always-mounted assistant need these in both languages.
// Screen-specific namespaces load with their UI, never on language switching.
import commonVI from "./resources/vi/common.json";
import navigationVI from "./resources/vi/navigation.json";
import marketingVI from "./resources/vi/marketing.json";
import commonEN from "./resources/en/common.json";
import navigationEN from "./resources/en/navigation.json";
import marketingEN from "./resources/en/marketing.json";

export default {
  vi: { common: commonVI, navigation: navigationVI, marketing: marketingVI },
  en: { common: commonEN, navigation: navigationEN, marketing: marketingEN },
};
