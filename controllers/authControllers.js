const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const jwt = require("jsonwebtoken");
const { createJWT, attachCookiesToResponse } = require("../utils");

const register = async (req, res, next) => {
  const { email, name, password } = req.body;
  try {
    // ❌ No User
    if (!email || !name || !password) {
      throw new CustomError.BadRequestError("Please provide all fields");
    }

    // ❌ email exist
    const emailAlreadyExists = await User.findOne({ email });
    if (emailAlreadyExists) {
      throw new CustomError.BadRequestError("Email already exists");
    }

    // 🚧 first registered user is an admin
    const isFirstAccount = (await User.countDocuments({})) === 0;
    const role = isFirstAccount ? "admin" : "user";

    const user = await User.create({ ...req.body, role });

    // JWT
    const userInfo = { name: user.name, userId: user._id, role: user.role };

    attachCookiesToResponse({ res, user: userInfo });
    return res.status(StatusCodes.CREATED).json({ user: userInfo });
  } catch (error) {
    next(error);
  }
};
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new CustomError.BadRequestError(
        "Please Provide email and password"
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new CustomError.UnauthenticatedError("Invalid Credentials");
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new CustomError.UnauthenticatedError("Invalid Credentials");
    }

    const userInfo = { name: user.name, userId: user._id, role: user.role };

    attachCookiesToResponse({ res, user: userInfo });
    return res.status(StatusCodes.OK).json({ user: userInfo });
  } catch (error) {
    next(error);
  }
};
const logout = async (req, res, next) => {
  try {
    res.cookie("token", "logout", {
      httpOnly: true,
      expries: new Date(Date.now()),
    });
    res.clearCookie("token");
    // res.status(200).json({ msg: "user logged out" });
    res.end();
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  register,
  login,
  logout,
};
