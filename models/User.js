const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, "Pleas Provide name"],
    min: 3,
    max: 20,
  },
  email: {
    type: String,
    require: [true, "Please Provide email"],
    unique: true,
    validate: {
      //custom Error 노션 validator
      validator: validator.isEmail,
      message: "Please Provide valid email",
    },
  },
  password: {
    type: String,
    require: [true, "Please Provide password"],
    min: 6,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
});

UserSchema.pre("save", async function () {
  const salt = await bcrypt.genSaltSync(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidate) {
  const isMatch = await bcrypt.compare(candidate, this.password);
  return isMatch;
};

module.exports = mongoose.model("User", UserSchema);
