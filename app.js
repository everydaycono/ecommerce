require("dotenv").config();

const express = require("express");
const connectDB = require("./db/connect");

// router
const authRouter = require("./routes/authRoutes");

// middleware
const notFoundMiddleware = require("./middleware/not-found");
const errorHandleMiddleware = require("./middleware/error-handler");
const morgan = require("morgan");

const app = express();
const port = process.env.PORT || 5555;

app.use(morgan("tiny"));
app.use(express.json());

app.use("/api/v1/auth", authRouter);

app.use(notFoundMiddleware);
app.use(errorHandleMiddleware);

const serverStart = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Example app listening on port ${port}`)
    );
  } catch (error) {
    console.log(error);
    process.exit();
  }
};

serverStart();
