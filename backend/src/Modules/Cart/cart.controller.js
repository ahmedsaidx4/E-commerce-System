const Cart = require("./cart.model");
const Product = require("../../Modules/Products/product.model");
const asyncWrapper = require("../../Middleware/errorHandler");
const appError = require("../../utils/appError");

const getCart = asyncWrapper(async (req, res, next) => {
  const cart = await Cart.find({ user: req.user.id }).populate(
    "items.product",
    "name",
  );
  res.status(200).json({
    status: "success",
    count: cart.length,
    data: { cart },
  });
});

const postItem = asyncWrapper(async (req, res, next) => {
  const { product, quantity } = req.body;

  const productFind = await Product.findById(product);

  if (!productFind) {
    return next(new appError("Product not found", 404, "FAIL"));
  }

  if (!productFind.isActive) {
    return next(new appError("Product is not active", 400, "FAIL"));
  }

  if (quantity <= 0) {
    return next(new appError("Quantity must be greater than 0", 400, "FAIL"));
  }

  let cart = await Cart.findOne({
    user: req.user.id || req.user._id,
  });

  if (!cart) {
    cart = new Cart({
      user: req.user.id || req.user._id,
      items: [],
    });
  }

  const existingItem = cart.items.find(
    (item) => item.product.toString() === product.toString(),
  );

  const newQuantity = existingItem
    ? existingItem.quantity + quantity
    : quantity;

  if (newQuantity > productFind.stock) {
    return next(new appError("Not enough stock", 400, "FAIL"));
  }

  if (existingItem) {
    existingItem.quantity = newQuantity;
  } else {
    cart.items.push({
      product: productFind._id,
      quantity,
      price: productFind.price,
    });
  }

  await cart.save();

  res.status(200).json({
    status: "success",
    data: {
      cart,
    },
  });
});

const patchItem = asyncWrapper(async (req, res, next) => {
  const { quantity } = req.body;

  const productFind = await Product.findById(req.params.productId);

  if (!productFind) {
    return next(new appError("Product not found", 404, "FAIL"));
  }

  if (!productFind.isActive) {
    return next(new appError("Product is not active", 400, "FAIL"));
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return next(new appError("Quantity must be greater than 0", 400, "FAIL"));
  }

  if (quantity > productFind.stock) {
    return next(new appError("Quantity exceeds available stock", 400, "FAIL"));
  }

  const cart = await Cart.findOne({
    user: req.user.id || req.user._id,
  });

  if (!cart) {
    return next(new appError("Cart not found", 404, "FAIL"));
  }

  const item = cart.items.find(
    (item) => item.product.toString() === req.params.productId.toString(),
  );

  if (!item) {
    return next(new appError("Product is not in your cart", 404, "FAIL"));
  }

  item.quantity = quantity;

  item.price = productFind.price;

  await cart.save();

  res.status(200).json({
    status: "success",
    data: {
      cart,
    },
  });
});

const deleteItem = asyncWrapper(async (req, res, next) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({
    user: req.user.id || req.user._id,
  });

  if (!cart) {
    return next(new appError("Cart not found", 404, "FAIL"));
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId,
  );

  if (itemIndex === -1) {
    return next(new appError("Product is not in your cart", 404, "FAIL"));
  }

  cart.items.splice(itemIndex, 1);

  await cart.save();

  res.status(200).json({
    status: "success",
    data: {
      cart,
    },
  });
});
module.exports = {
  getCart,
  postItem,
  patchItem,
  deleteItem,
};
