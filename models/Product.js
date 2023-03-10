const mongoose = require("mongoose");

/**
 * [R]name
 * [O]price
 * [R]description
 * [O]image
 * [R]category
 * [R]company
 * [O]colors
 * [O]featured
 * [O]freeShipping
 * [O]inventory
 * [O]averageRating
 * [O]user  // User Collection 참조
 */
const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      require: [true, "Please Provide Product Name"],
      maxLength: [100, "Name Can not be more than 100 chracters"],
    },
    price: {
      type: Number,
      require: [true, "Please Provide Product Price"],
      default: 0,
      min: 0,
    },
    description: {
      type: String,
      require: [true, "Please Provide Product Name"],
      maxLength: [1000, "Description Can not be more than 1000 chracters"],
    },
    image: {
      type: String,
      default: "/uploads/example.jpeg",
    },
    category: {
      type: String,
      required: [true, "Please Provide Product Category"],
      enum: ["office", "kitchen", "bedroom"],
    },
    company: {
      type: String,
      required: [true, "Please Provide Company"],
      enum: {
        values: ["ikea", "liddy", "marcos"],
        message: `{VALUE} is not supported`,
      },
    },
    colors: {
      type: [String],
      default: ["#222"],
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    inventory: {
      type: Number,
      required: true,
      default: 15,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numberOfReviews: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

ProductSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id", //프로덕트 _id 가 Review의 product 와 같다.
  foreignField: "product",
  justOne: false,
});

// 리뷰 모델안에서 product 가 현재 지우는 this._id 와 연결
ProductSchema.pre("remove", async function (next) {
  await this.model("Review").deleteMany({ product: this._id });
});

module.exports = mongoose.model("Product", ProductSchema);
