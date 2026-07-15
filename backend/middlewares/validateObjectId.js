const mongoose = require("mongoose");

/**
 * Middleware to validate MongoDB ObjectId in route params
 * @param {string} paramName - The name of the param to validate (default: 'id')
 */
const validateObjectId = (paramName = "id") => {
  return (req, res, next) => {
    const id = req.params[paramName];

    if (!id) {
      return next();
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: `Invalid ${paramName} format`,
      });
    }

    next();
  };
};

/**
 * Validate multiple ObjectIds in params
 * @param {string[]} paramNames - Array of param names to validate
 */
const validateObjectIds = (paramNames) => {
  return (req, res, next) => {
    for (const paramName of paramNames) {
      const id = req.params[paramName];

      if (id && !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: "error",
          message: `Invalid ${paramName} format`,
        });
      }
    }

    next();
  };
};

module.exports = { validateObjectId, validateObjectIds };
