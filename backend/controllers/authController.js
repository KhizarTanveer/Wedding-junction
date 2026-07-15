const User = require("../models/user");
const VendorApplication = require("../models/vendorApplication");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendPasswordResetEmail } = require("../utils/sendEmail");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Password strength validation (simple - just minimum length)
const validatePasswordStrength = (password) => {
  const errors = [];

  if (password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }

  return errors;
};

// Hash reset token for secure storage
const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

// SIGN UP
const signup = async (req, res) => {
  try {
    const { name, email, password, registerAsVendor, vendorData } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Please provide all required fields",
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        status: "error",
        message: "Email already exists",
      });
    }

    // Validate password strength
    const passwordErrors = validatePasswordStrength(password);
    if (passwordErrors.length > 0) {
      return res.status(400).json({
        status: "error",
        message: passwordErrors[0],
        errors: passwordErrors,
      });
    }

    // Validate vendor data if registering as vendor
    if (registerAsVendor && !vendorData) {
      return res.status(400).json({
        status: "error",
        message: "Vendor data is required when registering as vendor",
      });
    }

    // Hash password before storing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({ name, email, password: hashedPassword });

    let vendorApplication = null;

    // If registering as vendor, create VendorApplication
    if (registerAsVendor && vendorData) {
      try {
        vendorApplication = await VendorApplication.create({
          applicant: newUser._id,
          businessInfo: {
            name: vendorData.businessInfo.name,
            description: vendorData.businessInfo.description,
          },
          serviceDetails: {
            category: vendorData.serviceDetails.category,
            experience: vendorData.serviceDetails.experience,
            servicesOffered: vendorData.serviceDetails.servicesOffered,
            pricing: {
              minPrice: vendorData.serviceDetails.pricing.minPrice,
              maxPrice: vendorData.serviceDetails.pricing.maxPrice,
              pricingModel: vendorData.serviceDetails.pricing.pricingModel || "package",
            },
          },
          contact: {
            phone: vendorData.contact.phone,
            email: vendorData.contact.email,
            website: vendorData.contact.website || "",
            socialMedia: {
              instagram: vendorData.contact.socialMedia?.instagram || "",
              facebook: vendorData.contact.socialMedia?.facebook || "",
            },
          },
          location: {
            city: vendorData.location.city,
            state: vendorData.location.state,
            serviceAreas: vendorData.location.serviceAreas || [],
          },
          status: "submitted",
          submittedAt: new Date(),
          termsAccepted: vendorData.termsAccepted || true,
          termsAcceptedAt: new Date(),
        });

        // Link application to user (just the ObjectId reference)
        newUser.vendorApplication = vendorApplication._id;
        await newUser.save();
      } catch (vendorError) {
        console.error("Failed to create vendor application:", vendorError);
        // User created successfully but vendor application failed
        // Return success with warning
        return res.status(201).json({
          status: "success",
          message: "Account created but vendor application failed. Please apply again from your profile.",
          token: generateToken(newUser._id),
          user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
          },
        });
      }
    }

    return res.status(201).json({
      status: "success",
      message: registerAsVendor
        ? "Account created and vendor application submitted successfully"
        : "Account created successfully",
      token: generateToken(newUser._id),
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        vendorApplication: newUser.vendorApplication,
      },
      ...(vendorApplication && { applicationId: vendorApplication._id }),
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to create account",
    });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials",
      });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        status: "error",
        message: `Account is locked due to too many failed attempts. Try again in ${remainingTime} minutes.`,
      });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Increment failed login attempts
      await user.incLoginAttempts();

      const attemptsLeft = Math.max(0, 5 - (user.failedLoginAttempts + 1));
      const message = attemptsLeft > 0
        ? `Invalid credentials. ${attemptsLeft} attempts remaining before account lock.`
        : "Account locked due to too many failed attempts. Try again in 2 hours.";

      return res.status(401).json({
        status: "error",
        message,
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    return res.status(200).json({
      status: "success",
      message: "Login successful",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      status: "error",
      message: "Login failed",
    });
  }
};

// FORGOT PASSWORD
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Return success to prevent email enumeration attacks
      return res.status(200).json({
        status: "success",
        message: "If an account exists, a password reset link will be sent",
      });
    }

    // Generate random token
    const token = crypto.randomBytes(32).toString("hex");

    // Hash token before storing (security best practice)
    user.resetToken = hashToken(token);
    user.resetTokenExpire = Date.now() + 3600000; // 1 hour expiration
    await user.save();

    // Send the unhashed token to the user via email
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetLink = `${frontendUrl}/reset-password/${token}`;

    // Send password reset email
    const emailSent = await sendPasswordResetEmail(email, resetLink);

    return res.status(200).json({
      status: "success",
      message: emailSent
        ? "Password reset link sent to your email"
        : "Password reset link generated (email service not configured)",
      // Only include resetLink in development mode when email is not configured
      ...(process.env.NODE_ENV === "development" && !emailSent && { resetLink }),
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to process password reset request",
    });
  }
};

// RESET PASSWORD
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Hash the incoming token and compare with stored hash
    const hashedToken = hashToken(token);

    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "Invalid or expired reset link",
      });
    }

    // Validate password strength
    const passwordErrors = validatePasswordStrength(password);
    if (passwordErrors.length > 0) {
      return res.status(400).json({
        status: "error",
        message: passwordErrors[0],
        errors: passwordErrors,
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    user.lastPasswordChange = new Date();

    // Reset failed login attempts on password change
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;

    await user.save();

    return res.status(200).json({
      status: "success",
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to reset password",
    });
  }
};

// LOGOUT (client-side token removal, but we can track it server-side)
const logout = async (req, res) => {
  try {
    // In a more complex system, you would invalidate the token here
    // For now, we just return success as the client removes the token
    return res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Logout failed",
    });
  }
};

// GET CURRENT USER
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: "success",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        vendorApplication: user.vendorApplication,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch user data",
    });
  }
};

// APPLY TO BECOME A VENDOR
const applyAsVendor = async (req, res) => {
  try {
    const { businessInfo, serviceDetails, contact, location, termsAccepted } = req.body;

    // Validate required fields
    if (!businessInfo?.name || !businessInfo?.description) {
      return res.status(400).json({
        status: "error",
        message: "Business name and description are required",
      });
    }

    if (!serviceDetails?.category || serviceDetails?.experience === undefined) {
      return res.status(400).json({
        status: "error",
        message: "Service category and experience are required",
      });
    }

    if (!contact?.phone || !contact?.email) {
      return res.status(400).json({
        status: "error",
        message: "Contact phone and email are required",
      });
    }

    if (!location?.city || !location?.state) {
      return res.status(400).json({
        status: "error",
        message: "City and state are required",
      });
    }

    if (!termsAccepted) {
      return res.status(400).json({
        status: "error",
        message: "You must accept the terms and conditions",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    if (user.role === "vendor") {
      return res.status(400).json({
        status: "error",
        message: "You are already a vendor",
      });
    }

    // Check for existing pending/submitted application
    const existingApplication = await VendorApplication.findOne({
      applicant: user._id,
      status: { $in: ["draft", "submitted", "under_review", "documents_pending"] },
    });

    if (existingApplication) {
      return res.status(400).json({
        status: "error",
        message: "You already have a pending application",
      });
    }

    // Create VendorApplication document
    const vendorApplication = await VendorApplication.create({
      applicant: user._id,
      businessInfo: {
        name: businessInfo.name,
        description: businessInfo.description,
        registrationNumber: businessInfo.registrationNumber || "",
        gstNumber: businessInfo.gstNumber || "",
        panNumber: businessInfo.panNumber || "",
      },
      serviceDetails: {
        category: serviceDetails.category,
        subCategories: serviceDetails.subCategories || [],
        experience: serviceDetails.experience,
        servicesOffered: serviceDetails.servicesOffered || [],
        pricing: {
          minPrice: serviceDetails.pricing?.minPrice || 0,
          maxPrice: serviceDetails.pricing?.maxPrice || 0,
          pricingModel: serviceDetails.pricing?.pricingModel || "package",
        },
      },
      contact: {
        phone: contact.phone,
        alternatePhone: contact.alternatePhone || "",
        email: contact.email,
        website: contact.website || "",
        socialMedia: {
          instagram: contact.socialMedia?.instagram || "",
          facebook: contact.socialMedia?.facebook || "",
          youtube: contact.socialMedia?.youtube || "",
        },
      },
      location: {
        address: location.address || "",
        city: location.city,
        state: location.state,
        pincode: location.pincode || "",
        serviceAreas: location.serviceAreas || [],
      },
      documents: [],
      portfolio: [],
      status: "submitted",
      submittedAt: new Date(),
      termsAccepted: true,
      termsAcceptedAt: new Date(),
    });

    // Update user with application reference (just the ObjectId)
    user.vendorApplication = vendorApplication._id;
    await user.save();

    return res.status(200).json({
      status: "success",
      message: "Vendor application submitted successfully",
      vendorApplication: {
        _id: vendorApplication._id,
        status: vendorApplication.status,
        businessInfo: vendorApplication.businessInfo,
        serviceDetails: {
          category: vendorApplication.serviceDetails.category,
          experience: vendorApplication.serviceDetails.experience,
        },
        submittedAt: vendorApplication.submittedAt,
      },
    });
  } catch (error) {
    console.error("Apply as vendor error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to submit vendor application",
    });
  }
};

// GET VENDOR APPLICATION STATUS
const getApplicationStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("vendorApplication role");

    // If no application reference, return null
    if (!user.vendorApplication) {
      return res.status(200).json({
        status: "success",
        vendorApplication: null,
      });
    }

    // If user is already a vendor, return approved status
    if (user.role === "vendor") {
      return res.status(200).json({
        status: "success",
        vendorApplication: {
          status: "approved",
        },
      });
    }

    // Populate the full application document
    const application = await VendorApplication.findById(user.vendorApplication)
      .populate("serviceDetails.category", "name")
      .select("status businessInfo serviceDetails contact location submittedAt review createdAt");

    if (!application) {
      return res.status(200).json({
        status: "success",
        vendorApplication: null,
      });
    }

    return res.status(200).json({
      status: "success",
      vendorApplication: {
        _id: application._id,
        status: application.status,
        businessInfo: application.businessInfo,
        serviceDetails: {
          category: application.serviceDetails?.category?.name || "Unknown",
          experience: application.serviceDetails?.experience,
          servicesOffered: application.serviceDetails?.servicesOffered,
        },
        contact: application.contact,
        location: application.location,
        submittedAt: application.submittedAt,
        review: application.review,
        createdAt: application.createdAt,
      },
    });
  } catch (error) {
    console.error("Get application status error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch application status",
    });
  }
};

// UPDATE USER PROFILE
const updateProfile = async (req, res) => {
  try {
    const allowedFields = ["name", "phone", "avatar", "notifications", "preferences"];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // Handle avatar from Cloudinary upload
    if (req.uploadedImage) {
      updates.avatar = req.uploadedImage.url;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No valid fields to update",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    return res.status(200).json({
      status: "success",
      message: "Profile updated",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to update profile",
    });
  }
};

// CHANGE PASSWORD
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: "error",
        message: "Please provide current and new password",
      });
    }

    // Validate password strength
    const passwordErrors = validatePasswordStrength(newPassword);
    if (passwordErrors.length > 0) {
      return res.status(400).json({
        status: "error",
        message: passwordErrors[0],
        errors: passwordErrors,
      });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        status: "error",
        message: "Current password is incorrect",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.lastPasswordChange = new Date();
    await user.save();

    return res.status(200).json({
      status: "success",
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to change password",
    });
  }
};

// DELETE ACCOUNT
const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        status: "error",
        message: "Please provide your password to confirm",
      });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        status: "error",
        message: "Incorrect password",
      });
    }

    // Prevent admin self-deletion
    if (user.role === "admin") {
      return res.status(403).json({
        status: "error",
        message: "Admin accounts cannot be self-deleted",
      });
    }

    await User.findByIdAndDelete(req.user._id);

    return res.status(200).json({
      status: "success",
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to delete account",
    });
  }
};

// RESET TEST USERS (only in test/development mode)
// Resets failed login attempts and account locks for test users
const resetTestUsers = async (req, res) => {
  try {
    // Only allow in test/development mode
    if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'development') {
      return res.status(403).json({
        status: "error",
        message: "Not allowed in production",
      });
    }

    // Test user emails to reset
    const testEmails = [
      'testuser@example.com',
      'testvendor@example.com',
      'admin@weddingjunction.com',
    ];

    // Reset failed login attempts and lock status for all test users
    const result = await User.updateMany(
      { email: { $in: testEmails } },
      {
        $set: {
          failedLoginAttempts: 0,
          lockUntil: null,
        },
      }
    );

    return res.status(200).json({
      status: "success",
      message: `Reset ${result.modifiedCount} test user(s)`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Reset test users error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to reset test users",
    });
  }
};

module.exports = {
  signup,
  login,
  forgotPassword,
  resetPassword,
  logout,
  getMe,
  updateProfile,
  changePassword,
  deleteAccount,
  applyAsVendor,
  getApplicationStatus,
  resetTestUsers,
};
