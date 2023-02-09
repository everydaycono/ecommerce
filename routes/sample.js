const express = require("express");
const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    throw new Error("error Occureed");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
