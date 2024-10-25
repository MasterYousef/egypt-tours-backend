const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const user = require("../models/userModel");
const AppError = require("../config/appError");
const emailMiddleware = require("../middlewares/emailMiddleware");

const cookieOptions = {
  secure:true,
  httpOnly: true,
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000) ,
};

exports.signUp = expressAsyncHandler(async (req, res, next) => {
  const data = await user.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    image: req.body.image || "default.jpeg",
  });
  const token = jwt.sign({ userId: data._id }, process.env.JWT_KEY, {
    expiresIn: process.env.JWT_EXPIRE,
  });
  res
    .status(201)
    .cookie("user", data , cookieOptions)
    .cookie("token", token, cookieOptions)
    .json({ status: "success" });
});

exports.login = expressAsyncHandler(async (req, res, next) => {
  const data = await user.findOne({ email: req.body.email });
  if (!data) {
    next(new AppError("email or password are wrong", 404));
  } else {
    const password = await bcrypt.compare(req.body.password, data.password);
    if (password === true) {
      const token = jwt.sign({ userId: data._id }, process.env.JWT_KEY, {
        expiresIn: process.env.JWT_EXPIRE,
      });
      res
        .status(200)
        .cookie("user", data , cookieOptions)
        .cookie("token", token, cookieOptions)
        .json({ status: "success" });
    } else {
      next(new AppError("email or password are wrong", 404));
    }
  }
});

exports.changePassword = expressAsyncHandler(async (req, res, next) => {
  const data = await user.findById(req.user._id);
  if (data) {
    const compare = await bcrypt.compare(req.body.password, data.password);
    if (compare !== true) {
      next(new AppError("Invalid password", 404));
    } else {
      const password = await bcrypt.hash(req.body.newPassword, 12);
      data.password = password;
      data.passwordChangeAt = Date.now();
      await data.save();
      res.status(200).json({ status: "success", data });
    }
  } else {
    next(new AppError("User not found", 402));
  }
});

exports.protect = expressAsyncHandler(async (req, res, next) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    const jwtData = jwt.verify(token, process.env.JWT_KEY);
    if (jwtData) {
      const userData = await user.findById(jwtData.userId);
      if (Date.parse(userData.passwordChangeAt) / 1000 > jwtData.iat) {
        next(new AppError("password changed please login again", 401));
      } else {
        req.user = userData;
      }
    } else {
      next(new AppError("token is invalid", 401));
    }
  } else {
    next(new AppError("please login first", 401));
  }
  next();
});

exports.forgetPassword = expressAsyncHandler(async (req, res, next) => {
  const data = await user.findOne({ email: req.body.email });
  if (data) {
    const min = 100000;
    const max = 999999;
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    const options = {
      email: data.email,
      subject: "password reset code",
      text: `hi ${data.username} \n your password reset code is ${randomNumber} \n only avilable for 10 minutes `,
    };
    emailMiddleware(options);
    data.passwordResetToken = randomNumber;
    const date = new Date();
    data.passwordResetExpires = date.setMinutes(date.getMinutes() + 10);
    await data.save();
    res.status(200).json({
      status: "success",
      message: "check your email for the password reset code",
    });
  } else {
    next(new AppError("User not found", 402));
  }
});

exports.resetCode = expressAsyncHandler(async (req, res, next) => {
  const data = await user.findOne({ email: req.body.email });
  const date = new Date();
  if (data) {
    if (
      data.passwordResetToken === req.body.code &&
      date <= data.passwordResetExpires
    ) {
      data.passwordReset = true;
      data.passwordResetToken = null;
      await data.save();
      res
        .status(200)
        .json({
          status: "success",
          message: "The code has been added successfully",
        });
    } else {
      next(new AppError("the code is wrong or expire", 400));
    }
  } else {
    next(new AppError("User not found", 402));
  }
});

exports.resetPassword = expressAsyncHandler(async (req, res, next) => {
  const data = await user.findOne({ email: req.body.email });
  const date = new Date();
  if (data) {
    if (data.passwordReset === true && date <= data.passwordResetExpires) {
      const password = await bcrypt.hash(req.body.password, 12);
      data.password = password;
      data.passwordReset = false;
      data.passwordResetToken = null;
      data.passwordResetExpires = null;
      await data.save();
      res.status(200).json({
        status: "success",
        message: "your password has been reset successfully",
      });
    } else {
      next(
        new AppError("can not change your password please try again later", 400)
      );
    }
  } else {
    next(new AppError("User not found", 402));
  }
});

exports.permissions = (...roles) =>
  expressAsyncHandler((req, res, next) => {
    if (roles.includes(req.user.role)) {
      next();
    } else {
      next(new AppError("you are not authorized to access this route", 403));
    }
  });
