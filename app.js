require("dotenv").config();

const express = require("express");
const connectDB = require("./db/connect");

const app = express();

require("express-async-errors");

// router
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoute");
const productRouter = require("./routes/productRoute");
const reviewRouter = require("./routes/reviewRoute");
const orderRouter = require("./routes/orderRoute");

// package
const cookieParser = require("cookie-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");

const rateLimiter = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");

const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
});

// middleware
const morganMiddleware = require("./middleware/morgan");
const notFoundMiddleware = require("./middleware/not-found");
const errorHandleMiddleware = require("./middleware/error-handler");

const port = process.env.PORT || 5555;

app.set("trust proxy", 1);
app.use(limiter);
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());

app.use(express.json());
app.use(morganMiddleware);
app.use(cookieParser(process.env.JWT_SECRET));
app.use(cors());
app.use(express.static("./public"));
app.use(fileUpload());

//

app.get("/api/v1", (req, res) => {
  console.log(req.cookies, "쿠키");
  console.log(req.signedCookies, "사인드 쿠키");
  res.send("aaa");
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/orders", orderRouter);

app.use(notFoundMiddleware);
app.use(errorHandleMiddleware);

const serverStart = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Example app listening on port ${port} @@`)
    );
  } catch (error) {
    console.log(error);
  }
};

serverStart();
