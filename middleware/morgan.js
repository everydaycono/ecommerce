const chalk = require("chalk");
const morgan = require("morgan");

const morganMiddleware = morgan(function (tokens, req, res) {
  return [
    chalk.hex("#34ace0").bold(tokens.method(req, res)),
    tokens.url(req, res),
    chalk.hex("#ffb142").bold(tokens.status(req, res)),
    chalk.hex("#2ed573").bold(tokens["response-time"](req, res) + " ms"),
  ].join(" ");
});

module.exports = morganMiddleware;
