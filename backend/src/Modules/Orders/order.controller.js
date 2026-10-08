const Order = require("./order.model");
const Cart = require("../Cart/cart.model");
const Product = require("../Products/product.model");

const asyncWrapper = require("../../Middleware/errorHandler");
const appError = require("../../utils/appError");

const getOrders = asyncWrapper(async (req, res, next) => {
  const orders = await Order.find({ user: req.user.id });
  return res.status(200).json({ status: "success", data: { orders } });
});
const getSingleOrders = asyncWrapper(async (req, res, next) => {
  const order = await Order.findById({
    _id: req.params.orderId,
    user: req.user.id,
  });
  if (!order) {
    return next(new appError("Order not found", 404, "ERROR"));
  }
  return res.status(200).json({ status: "success", data: { order } });
});
const checkout = asyncWrapper(async (req, res, next) => {
  const { shippingAddress } = req.body;

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return next(new appError("Cart not found", 404, "FAIL"));
  }
  if (cart.items.length === 0) {
    return next(new appError("Cart is empty", 400, "FAIL"));
  }
  let orderItems = [];
  let subtotal = 0;
  for (const item of cart.items) {
    const product = await Product.findById(item.product);
    if (!product) {
      return next(
        new appError(`Product ${item.product} not found`, 404, "FAIL"),
      );
    }

    if (!product.isActive) {
      return next(
        new appError(`${product.name} is not available`, 400, "FAIL"),
      );
    }

    if (product.stock < item.quantity) {
      return next(
        new appError(`Insufficient stock for ${product.name}`, 409, "FAIL"),
      );
    }
    const itemSubtotal = product.price * item.quantity;
    orderItems.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      subtotal: itemSubtotal,
    });
    subtotal += itemSubtotal;
  }
  const discount = 0;
  const shippingFee = 0.1 * subtotal;
  const tax = 20;
  const total = subtotal - discount + shippingFee + tax;
  const order = new Order({
    user: req.user.id,
    shippingAddress,
    items: orderItems,
    subtotal,
    total,
    discount,
    shippingFee,
    tax,
    paymentStatus: "pending",
    orderStatus: "pending",
  });
  await order.save();
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    product.stock -= item.quantity;
    await product.save();
  }
  await Cart.deleteMany({ user: req.user.id });
  return res.status(201).json({ status: "success", data: { order } });
});

module.exports = {
  getOrders,
  getSingleOrders,
  checkout,
};
