// سیستم کنترل دسترسی مبتنی بر ویژگی (ABAC)
// Attribute-Based Access Control system

export type Role = "admin" | "manager" | "operator" | "representative" | "user" | "member";

export type Resource =
  | "product"
  | "category"
  | "order"
  | "user"
  | "discount"
  | "shipping"
  | "ticket"
  | "notification"
  | "settings"
  | "report"
  | "role"
  | "template"
  | "brand"
  | "blog"
  | "chat";

export type Action = "create" | "read" | "update" | "delete" | "export" | "manage";

interface Policy {
  resource: Resource;
  actions: Action[];
  conditions?: {
    ownResource?: boolean; // فقط منابع خود کاربر
    minRole?: Role;        // حداقل نقش مورد نیاز
  };
}

// نقش‌ها و سیاست‌های دسترسی آن‌ها
const ROLE_POLICIES: Record<Role, Policy[]> = {
  admin: [
    // ادمین به همه چیز دسترسی دارد
    { resource: "product", actions: ["create", "read", "update", "delete", "export"] },
    { resource: "category", actions: ["create", "read", "update", "delete"] },
    { resource: "order", actions: ["read", "update", "delete", "export"] },
    { resource: "user", actions: ["create", "read", "update", "delete", "export", "manage"] },
    { resource: "discount", actions: ["create", "read", "update", "delete"] },
    { resource: "shipping", actions: ["create", "read", "update", "delete"] },
    { resource: "ticket", actions: ["read", "update", "manage"] },
    { resource: "notification", actions: ["create", "read", "delete"] },
    { resource: "settings", actions: ["read", "update"] },
    { resource: "report", actions: ["read", "export"] },
    { resource: "role", actions: ["create", "read", "update", "delete"] },
    { resource: "template", actions: ["create", "read", "update", "delete"] },
    { resource: "brand", actions: ["create", "read", "update", "delete"] },
    { resource: "blog", actions: ["create", "read", "update", "delete"] },
    { resource: "chat", actions: ["read", "update"] },
  ],
  manager: [
    { resource: "product", actions: ["create", "read", "update", "export"] },
    { resource: "category", actions: ["create", "read", "update"] },
    { resource: "order", actions: ["read", "update", "export"] },
    { resource: "user", actions: ["read", "update"] },
    { resource: "discount", actions: ["create", "read", "update"] },
    { resource: "shipping", actions: ["create", "read", "update"] },
    { resource: "ticket", actions: ["read", "update"] },
    { resource: "notification", actions: ["create", "read"] },
    { resource: "report", actions: ["read", "export"] },
    { resource: "brand", actions: ["create", "read", "update"] },
    { resource: "blog", actions: ["create", "read", "update"] },
    { resource: "chat", actions: ["read"] },
  ],
  operator: [
    { resource: "product", actions: ["read"] },
    { resource: "order", actions: ["read", "update"] },
    { resource: "user", actions: ["read"] },
    { resource: "ticket", actions: ["read", "update"] },
    { resource: "notification", actions: ["read"] },
    { resource: "chat", actions: ["read", "update"] },
  ],
  representative: [
    { resource: "product", actions: ["read"] },
    { resource: "order", actions: ["read"] },
    { resource: "ticket", actions: ["read"] },
  ],
  user: [
    { resource: "product", actions: ["read"] },
    { resource: "order", actions: ["create", "read"], conditions: { ownResource: true } },
    { resource: "user", actions: ["read", "update"], conditions: { ownResource: true } },
    { resource: "discount", actions: ["read"] },
    { resource: "ticket", actions: ["create", "read"], conditions: { ownResource: true } },
    { resource: "notification", actions: ["read"], conditions: { ownResource: true } },
    { resource: "chat", actions: ["create", "read"], conditions: { ownResource: true } },
  ],
  member: [
    { resource: "product", actions: ["read"] },
    { resource: "order", actions: ["read"], conditions: { ownResource: true } },
    { resource: "user", actions: ["read"], conditions: { ownResource: true } },
  ],
};

// سلسله‌مراتب نقش‌ها (هر نقش بالاتر شامل نقش‌های پایین‌تر نیست — ABAC)
const ROLE_HIERARCHY: Record<Role, number> = {
  admin: 6,
  manager: 5,
  operator: 4,
  representative: 3,
  user: 2,
  member: 1,
};

/**
 * بررسی دسترسی کاربر به یک منبع با یک عملیات
 * Check if user has access to a resource with an action
 */
export function hasPermission(
  role: Role,
  resource: Resource,
  action: Action,
  options?: { isOwnResource?: boolean }
): boolean {
  const policies = ROLE_POLICIES[role];
  if (!policies) return false;

  const relevantPolicy = policies.find((p) => p.resource === resource);
  if (!relevantPolicy) return false;

  // بررسی عملیات
  if (!relevantPolicy.actions.includes(action)) return false;

  // بررسی شرط مالکیت
  if (relevantPolicy.conditions?.ownResource && options?.isOwnResource === false) {
    return false;
  }

  return true;
}

/**
 * بررسی دسترسی بر اساس نقش حداقلی
 * Check access based on minimum role level
 */
export function hasMinimumRole(userRole: Role, minimumRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole];
}

/**
 * دریافت تمام عملیات مجاز برای یک منبع
 * Get all allowed actions for a resource
 */
export function getAllowedActions(role: Role, resource: Resource): Action[] {
  const policies = ROLE_POLICIES[role];
  if (!policies) return [];
  const policy = policies.find((p) => p.resource === resource);
  return policy?.actions || [];
}

/**
 * بررسی دسترسی ادمین
 * Quick check if user is admin
 */
export function isAdmin(role: Role): boolean {
  return role === "admin";
}

/**
 * بررسی دسترسی مدیر یا بالاتر
 * Quick check if user is manager or above
 */
export function isManagerOrAbove(role: Role): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY.manager;
}
