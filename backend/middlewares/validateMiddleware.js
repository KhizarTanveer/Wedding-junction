const Joi = require("joi");

// Vendor data schema for signup
const vendorDataSchema = Joi.object({
  businessInfo: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      "string.min": "Business name must be at least 2 characters",
      "any.required": "Business name is required",
    }),
    description: Joi.string().min(50).max(2000).required().messages({
      "string.min": "Business description must be at least 50 characters",
      "any.required": "Business description is required",
    }),
  }).required(),
  serviceDetails: Joi.object({
    category: Joi.string().required().messages({
      "any.required": "Service category is required",
    }),
    experience: Joi.number().min(0).max(50).required().messages({
      "number.min": "Experience cannot be negative",
      "any.required": "Years of experience is required",
    }),
    servicesOffered: Joi.array().items(Joi.string()).min(1).required().messages({
      "array.min": "At least one service must be offered",
      "any.required": "Services offered is required",
    }),
    pricing: Joi.object({
      minPrice: Joi.number().min(0).required().messages({
        "number.min": "Minimum price cannot be negative",
        "any.required": "Minimum price is required",
      }),
      maxPrice: Joi.number().min(0).required().messages({
        "number.min": "Maximum price cannot be negative",
        "any.required": "Maximum price is required",
      }),
      pricingModel: Joi.string().valid("package", "hourly", "fixed", "custom").default("package"),
    }).required(),
  }).required(),
  contact: Joi.object({
    phone: Joi.string().required().messages({
      "any.required": "Contact phone is required",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Please enter a valid contact email",
      "any.required": "Contact email is required",
    }),
    website: Joi.string().allow("").optional(),
    socialMedia: Joi.object({
      instagram: Joi.string().allow("").optional(),
      facebook: Joi.string().allow("").optional(),
    }).optional(),
  }).required(),
  location: Joi.object({
    city: Joi.string().required().messages({
      "any.required": "City is required",
    }),
    state: Joi.string().required().messages({
      "any.required": "State is required",
    }),
    serviceAreas: Joi.array().items(Joi.string()).optional(),
  }).required(),
  termsAccepted: Joi.boolean().valid(true).required().messages({
    "any.only": "You must accept the terms and conditions",
    "any.required": "Terms acceptance is required",
  }),
});

// Validation schemas
const schemas = {
  signup: Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
      "string.min": "Name must be at least 2 characters",
      "string.max": "Name cannot exceed 50 characters",
      "any.required": "Name is required",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Please enter a valid email address",
      "any.required": "Email is required",
    }),
    password: Joi.string().min(6).max(100).required().messages({
      "string.min": "Password must be at least 6 characters",
      "string.max": "Password cannot exceed 100 characters",
      "any.required": "Password is required",
    }),
    // Optional vendor registration fields
    registerAsVendor: Joi.boolean().optional(),
    vendorData: Joi.when("registerAsVendor", {
      is: true,
      then: vendorDataSchema.required().messages({
        "any.required": "Vendor data is required when registering as vendor",
      }),
      otherwise: Joi.optional(),
    }),
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Please enter a valid email address",
      "any.required": "Email is required",
    }),
    password: Joi.string().required().messages({
      "any.required": "Password is required",
    }),
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Please enter a valid email address",
      "any.required": "Email is required",
    }),
  }),

  resetPassword: Joi.object({
    password: Joi.string().min(6).max(100).required().messages({
      "string.min": "Password must be at least 6 characters",
      "string.max": "Password cannot exceed 100 characters",
      "any.required": "Password is required",
    }),
  }),

  booking: Joi.object({
    vendorId: Joi.string().required().messages({
      "any.required": "Vendor ID is required",
    }),
    userName: Joi.string().required().messages({
      "any.required": "User name is required",
    }),
    userEmail: Joi.string().email().allow("").optional(),
    service: Joi.string().required().messages({
      "any.required": "Service is required",
    }),
    price: Joi.number().positive().required().messages({
      "number.positive": "Price must be a positive number",
      "any.required": "Price is required",
    }),
    image: Joi.string().uri().allow("").optional(),
    clientDetails: Joi.object().optional(),
    status: Joi.string()
      .valid(
        "draft", "requested", "vendor_accepted", "vendor_declined",
        "payment_pending", "confirmed", "in_progress", "completed",
        "cancelled_by_user", "cancelled_by_vendor", "refund_pending",
        "refunded", "disputed", "resolved", "expired", "closed"
      )
      .optional(),
  }),

  // ==================== ADMIN SCHEMAS ====================

  createVendor: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      "string.min": "Name must be at least 2 characters",
      "any.required": "Vendor name is required",
    }),
    service: Joi.string().required().messages({
      "any.required": "Service type is required",
    }),
    category: Joi.string().required().messages({
      "any.required": "Category ID is required",
    }),
    image: Joi.string().uri().required().messages({
      "string.uri": "Image must be a valid URL",
      "any.required": "Image URL is required",
    }),
    description: Joi.string().min(10).required().messages({
      "string.min": "Description must be at least 10 characters",
      "any.required": "Description is required",
    }),
    details: Joi.string().optional(),
    experience: Joi.string().optional(),
    servicesOffered: Joi.array().items(Joi.string()).optional(),
    price: Joi.number().positive().required().messages({
      "number.positive": "Price must be positive",
      "any.required": "Price is required",
    }),
    contact: Joi.object({
      phone: Joi.string().optional(),
      email: Joi.string().email().optional(),
      website: Joi.string().uri().allow("").optional(),
    }).optional(),
    location: Joi.string().optional(),
    rating: Joi.number().min(0).max(5).optional(),
    isFeatured: Joi.boolean().optional(),
  }),

  updateVendor: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    service: Joi.string().optional(),
    category: Joi.string().optional(),
    image: Joi.string().uri().optional(),
    description: Joi.string().min(10).optional(),
    details: Joi.string().optional(),
    experience: Joi.string().optional(),
    servicesOffered: Joi.array().items(Joi.string()).optional(),
    price: Joi.number().positive().optional(),
    contact: Joi.object({
      phone: Joi.string().optional(),
      email: Joi.string().email().optional(),
      website: Joi.string().uri().allow("").optional(),
    }).optional(),
    location: Joi.string().optional(),
    rating: Joi.number().min(0).max(5).optional(),
    isFeatured: Joi.boolean().optional(),
  }).min(1).messages({
    "object.min": "At least one field must be provided for update",
  }),

  createCategory: Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
      "any.required": "Category name is required",
    }),
    description: Joi.string().min(10).required().messages({
      "any.required": "Description is required",
    }),
    image: Joi.string().uri().required().messages({
      "any.required": "Image URL is required",
    }),
    details: Joi.object({
      highlights: Joi.array().items(Joi.string()).optional(),
      services: Joi.array().items(Joi.string()).optional(),
      whyChoose: Joi.array().items(Joi.string()).optional(),
      testimonial: Joi.object({
        name: Joi.string().optional(),
        text: Joi.string().optional(),
      }).optional(),
    }).optional(),
  }),

  updateCategory: Joi.object({
    name: Joi.string().min(2).max(50).optional(),
    description: Joi.string().min(10).optional(),
    image: Joi.string().uri().optional(),
    details: Joi.object({
      highlights: Joi.array().items(Joi.string()).optional(),
      services: Joi.array().items(Joi.string()).optional(),
      whyChoose: Joi.array().items(Joi.string()).optional(),
      testimonial: Joi.object({
        name: Joi.string().optional(),
        text: Joi.string().optional(),
      }).optional(),
    }).optional(),
  }).min(1).messages({
    "object.min": "At least one field must be provided for update",
  }),

  createService: Joi.object({
    title: Joi.string().min(2).max(100).required().messages({
      "any.required": "Service title is required",
    }),
    description: Joi.string().required().messages({
      "any.required": "Description is required",
    }),
    icon: Joi.string().required().messages({
      "any.required": "Icon is required",
    }),
    details: Joi.string().required().messages({
      "any.required": "Details are required",
    }),
    image: Joi.string().uri().required().messages({
      "any.required": "Image URL is required",
    }),
  }),

  updateService: Joi.object({
    title: Joi.string().min(2).max(100).optional(),
    description: Joi.string().optional(),
    icon: Joi.string().optional(),
    details: Joi.string().optional(),
    image: Joi.string().uri().optional(),
  }).min(1).messages({
    "object.min": "At least one field must be provided for update",
  }),
};

// Validation middleware factory
const validate = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      return next();
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        status: "error",
        message: messages[0], // Return first error message
        errors: messages,
      });
    }

    req.body = value; // Use sanitized value
    next();
  };
};

module.exports = { validate, schemas };
