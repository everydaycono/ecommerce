const Product = require("../models/Product");
const path = require("path");
// Packages
const { StatusCodes } = require("http-status-codes");

// Error
const CustomError = require("../errors");

const createProduct = async (req, res) => {
  const user = req.body;

  user.user = req.user.userId; //만드는 사람의 아이디를 참조
  const product = await Product.create(user);
  res.status(StatusCodes.CREATED).json({ product });
};

const getAllProducts = async (req, res) => {
  const products = await Product.find({});
  res.status(StatusCodes.OK).json({ products });
};

const getSingleProduct = async (req, res) => {
  const { id: productId } = req.params;

  const product = await Product.findOne({ _id: productId });

  if (!product) {
    throw new CustomError.NotFoundError(`No Product With id ${productId}`);
  }
  res.status(StatusCodes.OK).json({ product });
};

const updateProduct = async (req, res) => {
  const { id: productId } = req.params;

  const product = await Product.findOneAndUpdate({ _id: productId }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    throw new CustomError.NotFoundError(`No Product With id ${productId}`);
  }
  res.status(StatusCodes.OK).json({ product });
};

const deleteProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOneAndDelete({ _id: productId });
  // const product = await Product.findOneAndRemove({ _id: productId });
  console.log(product, "???");
  if (!product) {
    throw new CustomError.NotFoundError(`No Product With id ${productId}`);
  }

  await product.remove();

  res.status(StatusCodes.OK).json({ msg: "Success Product Removed." });
};

// Express-fileUpload
const uploaadImage = async (req, res) => {
  console.log(req.files, "??");
  if (!req.files) {
    throw new CustomError.BadRequestError("No File Uploaded");
  }
  const productImage = req.files.file;
  if (!productImage.mimetype.startsWith("image")) {
    throw new CustomError.BadRequestError("Please Upload Image");
  }
  const maxSize = 1024 * 1024;
  if (productImage.size > maxSize) {
    throw new CustomError.BadRequestError(
      "Please Upload image smaller than 1MB"
    );
  }
  const imagePath = path.join(
    __dirname,
    "../public/uploads/" + `${productImage.name}`
  );
  await productImage.mv(imagePath);
  res
    .status(StatusCodes.OK)
    .json({ image: `/uploads/${productImage.name.trim()}` });
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploaadImage,
};

// // Multer
// const uploaadImage = async (req, res) => {
//   // console.log(req.photos, "파일스");
//   console.log(req.files[0], "파일스");
//   // console.log(req, "파일스");

//   // if (!req.files) {
//   //   throw new CustomError.BadRequestError("No File Uploaded");
//   // }
//   // const productImage = req.files.file;
//   // if (!productImage.mimetype.startsWith("image")) {
//   //   throw new CustomError.BadRequestError("Please Upload Image");
//   // }
//   // const maxSize = 1024 * 1024;
//   // if (productImage.size > maxSize) {
//   //   throw new CustomError.BadRequestError(
//   //     "Please Upload image smaller than 1MB"
//   //   );
//   // }
//   // const imagePath = path.join(
//   //   __dirname,
//   //   "../public/uploads/" + `${productImage.name}`
//   // );
//   // await productImage.mv(imagePath);
//   res
//     .status(StatusCodes.OK)
//     .json({ image: `/uploads/${req.files[0].filename}` });
// };
