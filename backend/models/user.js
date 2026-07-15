const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "vendor", "admin"],
      default: "user",
    },

    // Profile picture for all users
    avatar: {
      type: String,
    },
    phone: {
      type: String,
    },

    // Vendor-specific reference (only for vendor role)
    vendorProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
    },

    // Reference to vendor application (separate model)
    vendorApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VendorApplication",
    },

    // Vendor tier (for vendors)
    vendorTier: {
      type: String,
      enum: ["basic", "premium", "enterprise"],
      default: "basic",
    },

    // Permissions for granular access control
    permissions: [
      {
        resource: {
          type: String,
          required: true,
        },
        actions: [String],
        scope: {
          type: String,
          enum: ["global", "own", "assigned"],
          default: "own",
        },
        grantedAt: {
          type: Date,
          default: Date.now,
        },
        grantedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        expiresAt: Date,
      },
    ],

    // Online status for chat
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
    },

    // Socket connection for real-time
    socketId: {
      type: String,
    },

    // Notification preferences
    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      sms: {
        type: Boolean,
        default: true,
      },
      push: {
        type: Boolean,
        default: true,
      },
      chat: {
        type: Boolean,
        default: true,
      },
    },

    // Account status
    accountStatus: {
      type: String,
      enum: ["active", "suspended", "deactivated", "pending_verification"],
      default: "active",
    },
    accountStatusReason: String,
    accountStatusChangedAt: Date,

    // Email verification
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,

    // Phone verification
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerificationCode: String,
    phoneVerificationExpires: Date,

    // Password reset
    resetToken: {
      type: String,
    },
    resetTokenExpire: {
      type: Date,
    },

    // Security
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
    lastLogin: Date,
    lastPasswordChange: Date,

    // Preferences
    preferences: {
      language: {
        type: String,
        default: "en",
      },
      currency: {
        type: String,
        default: "INR",
      },
      timezone: {
        type: String,
        default: "Asia/Karachi",
      },
    },

    // Referral
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Terms acceptance
    termsAcceptedAt: Date,
    privacyPolicyAcceptedAt: Date,
  },
  { timestamps: true }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isOnline: 1 });
userSchema.index({ referralCode: 1 });
userSchema.index({ accountStatus: 1 });

// Virtual for checking if account is locked
userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Virtual for checking if user can apply as vendor
userSchema.virtual("canApplyAsVendor").get(function () {
  return this.role === "user" && !this.vendorApplication && this.accountStatus === "active";
});

// Pre-save hook for generating referral code
userSchema.pre("save", function () {
  if (!this.referralCode && this.isNew) {
    this.referralCode = `WJ${this._id.toString().slice(-6).toUpperCase()}`;
  }
});

// Method to check permission
userSchema.methods.hasPermission = function (resource, action) {
  // Admin has all permissions
  if (this.role === "admin") return true;

  // Check explicit permissions
  const permission = this.permissions.find(
    (p) =>
      p.resource === resource &&
      p.actions.includes(action) &&
      (!p.expiresAt || p.expiresAt > new Date())
  );

  return !!permission;
};

// Method to grant permission
userSchema.methods.grantPermission = function (resource, actions, scope, grantedBy, expiresAt) {
  const existingIndex = this.permissions.findIndex((p) => p.resource === resource);

  if (existingIndex >= 0) {
    this.permissions[existingIndex].actions = [
      ...new Set([...this.permissions[existingIndex].actions, ...actions]),
    ];
    this.permissions[existingIndex].scope = scope;
    this.permissions[existingIndex].expiresAt = expiresAt;
  } else {
    this.permissions.push({
      resource,
      actions,
      scope,
      grantedAt: new Date(),
      grantedBy,
      expiresAt,
    });
  }

  return this;
};

// Method to revoke permission
userSchema.methods.revokePermission = function (resource, actions = null) {
  if (actions) {
    const permission = this.permissions.find((p) => p.resource === resource);
    if (permission) {
      permission.actions = permission.actions.filter((a) => !actions.includes(a));
      if (permission.actions.length === 0) {
        this.permissions = this.permissions.filter((p) => p.resource !== resource);
      }
    }
  } else {
    this.permissions = this.permissions.filter((p) => p.resource !== resource);
  }

  return this;
};

// Method to increment failed login attempts
userSchema.methods.incLoginAttempts = function () {
  // Reset if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { failedLoginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates = { $inc: { failedLoginAttempts: 1 } };

  // Lock account after 5 failed attempts for 2 hours
  if (this.failedLoginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }

  return this.updateOne(updates);
};

// Method to reset login attempts on successful login
userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $set: { failedLoginAttempts: 0, lastLogin: new Date() },
    $unset: { lockUntil: 1 },
  });
};

// Method to change account status
userSchema.methods.changeAccountStatus = function (newStatus, reason) {
  this.accountStatus = newStatus;
  this.accountStatusReason = reason;
  this.accountStatusChangedAt = new Date();
  return this;
};

// Static method to find active users
userSchema.statics.findActive = function (filter = {}) {
  return this.find({ ...filter, accountStatus: "active" });
};

// Static method to find vendors
userSchema.statics.findVendors = function (filter = {}) {
  return this.find({ ...filter, role: "vendor", accountStatus: "active" });
};

module.exports = mongoose.model("User", userSchema);
