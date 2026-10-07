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

  // 1. Find product
  const productFind = await Product.findById(product);

  // 2. Check product
  if (!productFind) {
    return next(new appError("Product not found", 404, "FAIL"));
  }

  // 3. Check product is active
  if (!productFind.isActive) {
    return next(new appError("Product is not active", 400, "FAIL"));
  }

  // 4. Validate quantity
  if (quantity <= 0) {
    return next(new appError("Quantity must be greater than 0", 400, "FAIL"));
  }

  // 5. Find user's cart
  let cart = await Cart.findOne({
    user: req.user.id || req.user._id,
  });

  // 6. Create cart if user doesn't have one
  if (!cart) {
    cart = new Cart({
      user: req.user.id || req.user._id,
      items: [],
    });
  }

  // 7. Check if product already exists in cart
  const existingItem = cart.items.find(
    (item) => item.product.toString() === product.toString(),
  );

  // 8. Calculate new quantity
  const newQuantity = existingItem
    ? existingItem.quantity + quantity
    : quantity;

  // 9. Check stock
  if (newQuantity > productFind.stock) {
    return next(new appError("Not enough stock", 400, "FAIL"));
  }

  // 10. Update existing item or add new item
  if (existingItem) {
    existingItem.quantity = newQuantity;
  } else {
    cart.items.push({
      product: productFind._id,
      quantity,
      price: productFind.price,
    });
  }

  // IMPORTANT:
  // We don't decrease product stock here.
  // Stock should be decreased during checkout/order creation.

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

  // 1. Find product
  const productFind = await Product.findById(req.params.productId);

  // 2. Check product
  if (!productFind) {
    return next(new appError("Product not found", 404, "FAIL"));
  }

  // 3. Check product is active
  if (!productFind.isActive) {
    return next(new appError("Product is not active", 400, "FAIL"));
  }

  // 4. Validate quantity
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return next(new appError("Quantity must be greater than 0", 400, "FAIL"));
  }

  // 5. Check stock
  if (quantity > productFind.stock) {
    return next(new appError("Quantity exceeds available stock", 400, "FAIL"));
  }

  // 6. Find user's cart
  const cart = await Cart.findOne({
    user: req.user.id || req.user._id,
  });

  if (!cart) {
    return next(new appError("Cart not found", 404, "FAIL"));
  }

  // 7. Find product inside cart
  const item = cart.items.find(
    (item) => item.product.toString() === req.params.productId.toString(),
  );

  if (!item) {
    return next(new appError("Product is not in your cart", 404, "FAIL"));
  }

  // 8. Update quantity
  item.quantity = quantity;

  // 9. Update price from current product price
  item.price = productFind.price;

  // 10. Save cart
  await cart.save();

  // 11. Return updated cart
  res.status(200).json({
    status: "success",
    data: {
      cart,
    },
  });
});

const deleteItem = asyncWrapper(async (req, res, next) => {
  const { productId } = req.params;

  // 1. Find user's cart
  const cart = await Cart.findOne({
    user: req.user.id || req.user._id,
  });

  if (!cart) {
    return next(new appError("Cart not found", 404, "FAIL"));
  }

  // 2. Find product inside cart
  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId,
  );

  // 3. Check if product exists in cart
  if (itemIndex === -1) {
    return next(new appError("Product is not in your cart", 404, "FAIL"));
  }

  // 4. Remove item
  cart.items.splice(itemIndex, 1);

  // 5. Save cart
  await cart.save();

  // 6. Return updated cart
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
