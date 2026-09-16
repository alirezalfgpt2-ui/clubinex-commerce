/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activityLogs from "../activityLogs.js";
import type * as audit from "../audit.js";
import type * as auth from "../auth.js";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as autoNotifications from "../autoNotifications.js";
import type * as bookings from "../bookings.js";
import type * as brands from "../brands.js";
import type * as cart from "../cart.js";
import type * as categories from "../categories.js";
import type * as contentPages from "../contentPages.js";
import type * as discounts from "../discounts.js";
import type * as emailTemplates from "../emailTemplates.js";
import type * as giftCards from "../giftCards.js";
import type * as http from "../http.js";
import type * as loyaltyPoints from "../loyaltyPoints.js";
import type * as messages from "../messages.js";
import type * as newsletters from "../newsletters.js";
import type * as notifications from "../notifications.js";
import type * as orders from "../orders.js";
import type * as payment from "../payment.js";
import type * as products from "../products.js";
import type * as rateLimit from "../rateLimit.js";
import type * as reviews from "../reviews.js";
import type * as roles from "../roles.js";
import type * as seed from "../seed.js";
import type * as settings from "../settings.js";
import type * as shipping from "../shipping.js";
import type * as smsNotifications from "../smsNotifications.js";
import type * as tickets from "../tickets.js";
import type * as users from "../users.js";
import type * as wishlists from "../wishlists.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activityLogs: typeof activityLogs;
  audit: typeof audit;
  auth: typeof auth;
  "auth/emailOtp": typeof auth_emailOtp;
  autoNotifications: typeof autoNotifications;
  bookings: typeof bookings;
  brands: typeof brands;
  cart: typeof cart;
  categories: typeof categories;
  contentPages: typeof contentPages;
  discounts: typeof discounts;
  emailTemplates: typeof emailTemplates;
  giftCards: typeof giftCards;
  http: typeof http;
  loyaltyPoints: typeof loyaltyPoints;
  messages: typeof messages;
  newsletters: typeof newsletters;
  notifications: typeof notifications;
  orders: typeof orders;
  payment: typeof payment;
  products: typeof products;
  rateLimit: typeof rateLimit;
  reviews: typeof reviews;
  roles: typeof roles;
  seed: typeof seed;
  settings: typeof settings;
  shipping: typeof shipping;
  smsNotifications: typeof smsNotifications;
  tickets: typeof tickets;
  users: typeof users;
  wishlists: typeof wishlists;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
