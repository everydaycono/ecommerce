const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { attachCookiesToResponse, checkPermissions } = require("../utils");

/**
 * get All Users 컨트롤러는
 * admin 권한 user 만 접근 가능.
 * @param {*} req
 * @param {*} res
 */
const getAllUser = async (req, res) => {
  console.log(req.user, "뭐가 있나?");
  const users = await User.find({ role: "user" }).select("-password");
  res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id }).select("-password");

  checkPermissions({ reqUser: req.user, resourceUserId: user._id });
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id :${req.params.id}`);
  }
  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
  // req.user 를 받을수 있는이유. 미들웨어
  res.status(StatusCodes.OK).json({ user: req.user });
};
const updateUser = async (req, res) => {
  const { email, name } = req.body;

  if (!email || !name) {
    throw new CustomError.BadRequestError("Please Provide All Values");
  }

  const user = await User.findOneAndUpdate(
    { _id: req.user.userId },
    {
      email,
      name,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  const userInfo = { name: user.name, userId: user._id, role: user.role };

  attachCookiesToResponse({ res, user: userInfo });
  res.status(StatusCodes.OK).json({ user: userInfo });
};

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError(
      "Please Provide Old-password and new-Password"
    );
  }

  const user = await User.findOne({ _id: req.user.userId });
  const isPasswordCorrect = await user.comparePassword(
    oldPassword,
    newPassword
  );

  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }

  user.password = newPassword;
  await user.save();

  res.status(StatusCodes.OK).json({ msg: `Success! Password Updated!` });
};

module.exports = {
  getAllUser,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
