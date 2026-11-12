import { i18n } from "./index";

const namespaces = {
  workspace: () => Promise.all([import("./resources/vi/workspace.json"), import("./resources/en/workspace.json")]),
  quotation: () => Promise.all([import("./resources/vi/quotation.json"), import("./resources/en/quotation.json")]),
  catalog: () => Promise.all([import("./resources/vi/catalog.json"), import("./resources/en/catalog.json")]),
  cart: () => Promise.all([import("./resources/vi/cart.json"), import("./resources/en/cart.json")]),
  checkout: () => Promise.all([import("./resources/vi/checkout.json"), import("./resources/en/checkout.json")]),
  orders: () => Promise.all([import("./resources/vi/orders.json"), import("./resources/en/orders.json")]),
  payment: () => Promise.all([import("./resources/vi/payment.json"), import("./resources/en/payment.json")]),
  auth: () => Promise.all([import("./resources/vi/auth.json"), import("./resources/en/auth.json")]),
  admin: () => Promise.all([import("./resources/vi/admin.json"), import("./resources/en/admin.json")]),
  adminDashboard: () => Promise.all([import("./resources/vi/adminDashboard.json"), import("./resources/en/adminDashboard.json")]),
  adminProducts: () => Promise.all([import("./resources/vi/adminProducts.json"), import("./resources/en/adminProducts.json")]),
  adminCategories: () => Promise.all([import("./resources/vi/adminCategories.json"), import("./resources/en/adminCategories.json")]),
  adminUsers: () => Promise.all([import("./resources/vi/adminUsers.json"), import("./resources/en/adminUsers.json")]),
  adminOrders: () => Promise.all([import("./resources/vi/adminOrders.json"), import("./resources/en/adminOrders.json")]),
  policies: () => Promise.all([import("./resources/vi/policies.json"), import("./resources/en/policies.json")]),
};

export type ScreenNamespace = keyof typeof namespaces;
const pending = new Map<ScreenNamespace, Promise<void>>();

/** Load both locales once before first screen mount; switching language never suspends it. */
export function loadScreenNamespaces(names: readonly ScreenNamespace[]) {
  return Promise.all(names.map((name) => {
    if (i18n.hasResourceBundle("vi", name) && i18n.hasResourceBundle("en", name)) return Promise.resolve();
    let promise = pending.get(name);
    if (!promise) {
      promise = namespaces[name]().then(([vi, en]) => {
        i18n.addResourceBundle("vi", name, vi.default, true, true);
        i18n.addResourceBundle("en", name, en.default, true, true);
      }).catch((error) => { pending.delete(name); throw error; });
      pending.set(name, promise);
    }
    return promise;
  }));
}
