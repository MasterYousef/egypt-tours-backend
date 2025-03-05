const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const dbconnect = require("./config/dbconnect");
const AppError = require("./config/appError");
const globalError = require("./middlewares/errorHandler");
const routes = require("./utils");
const { redisConnect } = require("./config/redisConnect");

const app = express();
dotenv.config({ path: "config.env" });
const port = process.env.PORT || 3000;
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`app work on ${process.env.NODE_ENV}`);
}
dbconnect(process.env.MONGO_KEY);
redisConnect();
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONT_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));
routes(app);
app.all("*", (req, res, next) => {
  next(new AppError(`can't find this route ${req.originalUrl}`, 404));
});
app.use(globalError);

const server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
process.on("unhandledRejection", (err) => {
  console.log(`error from app ${err.message} || ${err.stack}`);
  server.close(() => {
    process.exit(1);
  });
});
