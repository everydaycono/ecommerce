const Review = require("../models/Review");
const Product = require("../models/Product");

// package
const { StatusCodes } = require("http-status-codes");

// Error
const CustomError = require("../errors");

// utils
const { checkPermissions } = require("../utils");

const createReview = async (req, res) => {
  const { product: productId } = req.body;
  if (!productId) {
    throw new CustomError.BadRequestError(`Please Provide product ID`);
  }

  const isValidProduct = await Product.findOne({ _id: productId });

  if (!isValidProduct) {
    throw new CustomError.NotFoundError(`No Product with id : ${productId}`);
  }

  const userHasReview = await Review.findOne({
    product: productId,
    user: req.user.userId,
  });

  if (userHasReview) {
    throw new CustomError.BadRequestError(
      "Already has review for this product"
    );
  }

  req.body.user = req.user.userId;
  const review = await Review.create(req.body);
  res.status(StatusCodes.CREATED).json({ review });
};

const getAllReviews = async (req, res) => {
  const reviews = await Review.find({}).populate({
    path: "product",
    select: "name company price",
  });
  // const reviews = await Review.find({});

  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

const getSingleReview = async (req, res) => {
  const { id: reviewId } = req.params;

  const review = await Review.findOne({ _id: reviewId });

  if (!review) {
    throw new CustomError.NotFoundError(`No Review with id ${reviewId}`);
  }

  res.status(StatusCodes.OK).json({ review });
};

const updateReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const { rating, title, comment } = req.body;
  const review = await Review.findOne({ _id: reviewId });

  if (!review) {
    throw new CustomError.NotFoundError(`No Review with id ${reviewId}`);
  }

  review.rating = rating;
  review.title = title;
  review.comment = comment;

  // FindOneAndUpdate 를 사용하지 않는이유. save 할때 mongoose 로 무엇을 해준다.
  await review.save();
  res.status(StatusCodes.OK).json({ review });
};

const deleteReview = async (req, res) => {
  const { id: reviewId } = req.params;

  const review = await Review.findOne({ _id: reviewId });

  if (!review) {
    throw new CustomError.NotFoundError(`No Review with id ${reviewId}`);
  }

  // 요청하는 사람과 리뷰의 주인이 맞는지 확인
  checkPermissions({ reqUser: req.user, resourceUserId: review.user });

  await review.remove();
  res.status(StatusCodes.OK).json({ msg: "Success, Review Removed!" });
};

const getSingleProductReviews = async (req, res) => {
  const { id: productId } = req.params;
  const reviews = await Review.find({ product: productId });
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleProductReviews,
};
