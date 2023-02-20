const Order = require("../models/Order");
const Product = require("../models/Product");

// package
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { checkPermissions } = require("../utils");

// FAKE STRIPE API
const fakeStripeAPI = async ({ amount, currency }) => {
  const client_secret = "someRandomeValue";

  return { client_secret, amount };
};

const createOrder = async (req, res) => {
  const { tax, shippingFee, items } = req.body;

  if (!items || items.length < 1) {
    throw new CustomError.BadRequestError("No Items Provided");
  }
  if (!tax || !shippingFee) {
    throw new CustomError.BadRequestError(
      "Please Provide Tax and Shipping Fee"
    );
  }

  let orderItems = [];
  let subtotal = 0;
  // items 이 있는지 확인하는 로직
  for (const item of items) {
    const exactProduct = await Product.findOne({ _id: item.product });

    if (!exactProduct) {
      throw new CustomError.NotFoundError(
        `No Product with id : ${item.product}`
      );
    }

    const { name, price, image, _id } = exactProduct;
    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    };

    // add item to order
    orderItems = [...orderItems, singleOrderItem];

    subtotal += item.amount * price;
  }

  // Calculate Total
  const total = tax + shippingFee + subtotal;

  //
  const paymentIntent = await fakeStripeAPI({ amont: total, currency: "USD" });

  // order Create
  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.client_secret,
    user: req.user.userId,
  });

  res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: order.clientSecret });
};

const getAllOrders = async (req, res) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const getSingleOrder = async (req, res) => {
  const singleOrder = await Order.findOne({ _id: req.params.id });

  if (!singleOrder) {
    throw new CustomError.NotFoundError(
      `No Order founded with ${req.params.id}`
    );
  }
  checkPermissions({
    reqUser: req.user,
    resourceUserId: singleOrder.user,
  });
  res.status(StatusCodes.OK).json(singleOrder);
};

const getCurrentUserOrders = async (req, res) => {
  const myOrder = await Order.findOne({ user: req.user.userId });

  if (!myOrder) {
    throw new CustomError.NotFoundError(`No Order founded`);
  }
  res.status(StatusCodes.OK).json({ orders: myOrder, count: myOrder.length });
};

const updateOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const { paymentIntentId } = req.body;

  const order = await Order.findOne({ _id: orderId });

  if (!order) {
    throw new CustomError.NotFoundError(`No Order With id : ${orderId}`);
  }

  checkPermissions({ reqUser: req.user, resourceUserId: order.user });

  order.paymentIntent = paymentIntentId;
  order.status = "paid";
  await order.save();
  res.status(StatusCodes.OK).json({ order });
};

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
};
