const Product = require("./product.model");
const asyncWrapper = require("../../Middleware/errorHandler");
const appError = require("../../utils/appError");

const getProducts = asyncWrapper(async (req, res, next) => {});

const getSingleProduct = asyncWrapper(async (req, res, next) => {});

const getProductsSearch = asyncWrapper(async (req, res, next) => {});

const postProducts = asyncWrapper(async (req, res, next) => {});

const patchProduct = asyncWrapper(async (req, res, next) => {});

const deleteProduct = asyncWrapper(async (req, res, next) => {});

module.exports = {
  getProducts,
  getSingleProduct,
  getProductsSearch,
  postProducts,
  patchProduct,
  deleteProduct,
};
