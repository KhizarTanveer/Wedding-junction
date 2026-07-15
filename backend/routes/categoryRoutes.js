const express = require("express");
const router = express.Router();

const {
  getCategories,
  getCategoryByName,
} = require("../controllers/categoryController");

router.get("/categories", getCategories);
router.get("/categories/:name", getCategoryByName);

module.exports = router;
