const Product = require("./product.model");
const asyncWrapper = require("../../Middleware/errorHandler");
const appError = require("../../utils/appError");
const Category = require("../Category/category.model");
const slugify = require("slugify");
const getProducts = asyncWrapper(async (req, res, next) => {
  const query = req.query;
  const limit = query.limit || 3;
  const page = query.page || 1;
  const skip = (page - 1) * limit;

  const { search, category, minPrice, maxPrice, sort, fields } = req.query;
  //Filter
  let filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }
  if (category) {
    filter.category = category;
  }
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};

    if (minPrice !== undefined) {
      filter.price.$gte = Number(minPrice);
    }

    if (maxPrice !== undefined) {
      filter.price.$lte = Number(maxPrice);
    }
  }
  const sortBy = sort ? sort.split(",").join(" ") : "-createdAt";
  const selectedFields = fields ? fields.split(",").join(" ") : "";
  const products = await Product.find(filter, { isActive: false })
    .limit(limit)
    .skip(skip)
    .sort(sortBy)
    .select(selectedFields);
  res.status(200).json({
    status: "success",
    count: products.length,
    data: { products },
  });
});

const getSingleProduct = asyncWrapper(async (req, res, next) => {
  const cid = req.params.cid;
  const product = await Product.findById(cid).exec();
  if (!product) {
    return next(new appError("Sorry, not Found this product", 404, "FAIL"));
  }
  if (!product.isActive) {
    return next(new appError("Sorry, product is not Active", 404, "ERROR"));
  }
  res.status(200).json({ status: "success", data: { product } });
});

const postProducts = asyncWrapper(async (req, res, next) => {
  const { name, description, price, category } = req.body;
  const categoryInMongo = await Category.findById(category);
  if (!categoryInMongo) {
    return next(new appError("Sorry, category not found!", 404, "ERROR"));
  }
  if (!categoryInMongo.isActive) {
    return next(new appError("Sorry, category is not Active!", 404, "ERROR"));
  }
  const product = new Product({
    name,
    description,
    price,
    category,
    slug: slugify(name, { lower: true }),
  });
  await product.save();
  res.status(201).json({ status: "success", data: { product } });
});

const patchProduct = asyncWrapper(async (req, res, next) => {
  const cid = req.params.cid;
  const product = await Product.findByIdAndUpdate(cid, req.body, {
    returnDocument: "after",
  });
  if (!product) {
    return next(new appError("Sorry, not Found this product", 404, "FAIL"));
  }
  return res.status(200).json({
    status: "success",
    data: {
      product,
    },
  });
});

const deleteProduct = asyncWrapper(async (req, res, next) => {
  const cid = req.params.cid;
  const product = await Product.findByIdAndDelete(cid);
  if (!product) {
    return next(new appError("product not exist!", 400, "FAIL"));
  }
  return res.status(200).json({ status: "success", data: null });
});

module.exports = {
  getProducts,
  getSingleProduct,
  postProducts,
  patchProduct,
  deleteProduct,
};
