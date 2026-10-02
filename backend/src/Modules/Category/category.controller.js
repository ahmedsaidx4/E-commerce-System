const Category = require("./category.model");
const Product = require("../Products/product.model");
const asyncWrapper = require("../../Middleware/errorHandler");
const appError = require("../../utils/appError");
const slugify = require("slugify");
const getCategories = asyncWrapper(async (req, res, next) => {
  const query = req.query;
  const limit = query.limit || 3;
  const page = query.page || 1;
  const skip = (page - 1) * limit;

  const categories = await Category.find({ isActive: true }, {})
    .limit(limit)
    .skip(skip);
  res.status(200).json({
    status: "success",
    count: categories.length,
    data: { categories },
  });
});

const getSingleCategory = asyncWrapper(async (req, res, next) => {
  const cid = req.params.cid;
  const category = await Category.findById(cid).exec();
  if (!category) {
    return next(new appError("Sorry, not Found this category", 404, "FAIL"));
  }
  if (!category.isActive) {
    return next(new appError("Sorry, category is not Active", 404, "ERROR"));
  }
  res.status(200).json({ status: "success", data: { category } });
});

const postCategories = asyncWrapper(async (req, res, next) => {
  const { name, description, isActive } = req.body;
  const slugCategory = slugify(name, { lower: true });
  const category = new Category({
    name,
    slug: slugCategory,
    description,
    isActive,
  });
  await category.save();
  res.status(201).json({
    status: "success",
    data: { category },
  });
});

const patchCategory = asyncWrapper(async (req, res, next) => {
  const cid = req.params.cid;
  const category = await Category.findByIdAndUpdate(cid, req.body, {
    returnDocument: "after",
  });
  if (!category) {
    return next(new appError("Sorry, not Found this category", 404, "FAIL"));
  }
  return res.status(200).json({
    status: "success",
    data: {
      category,
    },
  });
});

const deleteCategory = asyncWrapper(async (req, res, next) => {
  const cid = req.params.cid;
  const category = await Category.findByIdAndDelete(cid);
  if (!category) {
    return next(new appError("category not exist!", 400, "FAIL"));
  }
  return res.status(200).json({ status: "success", data: null });
});
const deActiveCategory = asyncWrapper(async (req, res, next) => {
  const cid = req.params.cid;
  const category = await Category.findById(cid);
  if (!category) {
    return next(new appError("Sorry, not Found this category", 404, "FAIL"));
  }
  category.isActive = false;
  await category.save();
  const product = await Product.updateMany(
    { category: cid },
    { isActive: false },
  );
  res.status(200).json({ status: "success", data: null });
});
module.exports = {
  getCategories,
  postCategories,
  getSingleCategory,
  patchCategory,
  deleteCategory,
  deActiveCategory,
};
