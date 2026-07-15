const USER_ROLES = {
  USER: "user",
  VENDOR: "vendor",
  ADMIN: "admin",
};

const VENDOR_TIERS = {
  BASIC: "basic",
  PREMIUM: "premium",
  ENTERPRISE: "enterprise",
};

const PERMISSION_SCOPES = {
  GLOBAL: "global",
  OWN: "own",
  ASSIGNED: "assigned",
};

const ACCOUNT_STATUSES = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
  DEACTIVATED: "deactivated",
  PENDING_VERIFICATION: "pending_verification",
};

module.exports = {
  USER_ROLES,
  VENDOR_TIERS,
  PERMISSION_SCOPES,
  ACCOUNT_STATUSES,
};
