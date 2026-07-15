const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    details: {
      highlights: [String],
      services: [String],
      whyChoose: [String],
      testimonial: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
