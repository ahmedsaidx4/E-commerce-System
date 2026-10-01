const { required } = require("joi");
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "product require"],
      trim: true,
      unique: [true, " product must be unique"],
      minLength: 3,
      maxLength: 32,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: { type: Number, required: true },
    compareAtPrice: { type: String },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: [true, "category require"],
    },
    images: { type: String },
    stock: { type: String },
    sku: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Product", productSchema);
