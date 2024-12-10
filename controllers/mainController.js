const cloudinary = require("cloudinary").v2;
const jwt = require("jsonwebtoken");
const expressAsyncHandler = require("express-async-handler");
const ApiFeatures = require("../utils/ApiFeatures");
const AppError = require("../config/appError");
const { client } = require("../config/redisConnect");

const getAllData = async (req, res, model, name) => {
  let fillter;
  let mongo = model.find(fillter);
  if (req.params.tour) {
    fillter = { tour: req.params.tour };
    mongo = model.find(fillter).populate("user", "_id username image");
  }
  if (req.params.user) {
    fillter = { user: req.params.user };
  }
  const apiFeatures = await new ApiFeatures(mongo, req.query)
    .searchfillter()
    .resultSort()
    .selectFailds()
    .paginate();
  let keyword = {};
  if (req.query.keyword) {
    keyword.$or = [
      { title: { $regex: req.query.keyword } },
      { description: { $regex: req.query.keyword } },
    ];
  }
  const data = await apiFeatures.mongo;
  const result = data.length || 0;
  const total = await model.countDocuments(keyword);
  const limit = req.query.limit * 1 || 10;
  const page = req.query.page * 1 || 1;
  const paginationResult = {
    page,
    limit,
    pages: Math.ceil(total / limit),
  };
  if (paginationResult.page < paginationResult.pages) {
    paginationResult.nextPage = paginationResult.page + 1;
  } else if (total < limit) {
    paginationResult.page = 1;
  }
  if (paginationResult.page !== 1) {
    paginationResult.prevPage = paginationResult.page - 1;
  }
  if (name && queryLength <= 0) {
    client.json.set(name, ".", { data, result, paginationResult });
  }
  res.status(200).json({ status: "success", result, paginationResult, data });
};
exports.getAll = (model, name) =>
  expressAsyncHandler(async (req, res) => {
    if (name) {
      const cash = await client.json.get(name);
      const query = req.query;
      query.limit ? delete query.limit : null;
      queryLength = Object.keys(query).length;
      if (cash && queryLength <= 0) {
        res.status(200).json({
          status: "success",
          result: cash.result,
          paginationResult: cash.paginationResult,
          data: cash.data,
        });
      } else getAllData(req, res, model, name, queryLength);
    } else getAllData(req, res, model, name, queryLength);
  });

exports.postOne = (Model, type) =>
  expressAsyncHandler(async (req, res) => {
    if (type === "tours") {
      req.body.imageCover = Array.isArray(req.body.images)
        ? req.body.images[0]
        : req.body.images;
      client.json.del(type);
    }
    const data = await Model.create(req.body);
    res.status(201).json({ status: "success", data: data });
  });

exports.getOne = (model,type) =>
  expressAsyncHandler(async (req, res, next) => {
    let fillter = { _id: req.params.id };
    let data;
    if (req.params.couponName) {
      fillter = { name: req.params.couponName };
    }
    if(type === "tours"){
      const redis = await client.json.get(type)
      if(redis){
        data = redis.data.filter((e)=>e._id === req.params.id)[0]
      }else{
      data = await model.findOne(fillter);
      }
    }else{
      data = await model.findOne(fillter);
    }
    if (!data) {
      next(new AppError("No data found", 404));
    }
    res.status(200).json({ status: "success", data });
  });

exports.deleteOne = (model, type) =>
  expressAsyncHandler(async (req, res, next) => {
    if (type === "tours") {
      client.json.del(type);
    }
    await model.findByIdAndDelete(req.params.id);
    res.status(204).send();
  });

exports.updateOne = (model, type) =>
  expressAsyncHandler(async (req, res, next) => {
    const cookieOptions = {
      secure: true,
      httpOnly: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
    if (type === "tours") {
      client.json.del(type);
    }
    if (type === "user") {
      const data = await model.findOne({ _id: req.params.id });
      if (!data) {
        next(new AppError("id is not valid", 404));
      }
      if (
        req.body.image &&
        data.image !==
          "https://res.cloudinary.com/dgka3dogf/image/upload/v1730375378/default_pmuuhg.png"
      ) {
        const url = data.image.split("/");
        const image = `${url[url.length - 2]}/${url[url.length - 1]}`.replace(
          ".png",
          ""
        );
        cloudinary.uploader.destroy(image);
      }
      const entries = Object.entries(req.body);
      entries.forEach(([key, value]) => {
        data[key] = req.body[key];
      });
      const token = jwt.sign({ userId: data._id }, process.env.JWT_KEY, {
        expiresIn: process.env.JWT_EXPIRE,
      });
      await data.save();
      res
        .status(200)
        .cookie("user", data, cookieOptions)
        .cookie("token", token, cookieOptions)
        .json({ status: "success" });
    } else {
      const data = await model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      res.status(200).json({ status: "success", data });
    }
  });
