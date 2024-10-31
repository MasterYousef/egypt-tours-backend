const cloudinary = require("cloudinary").v2;
const expressAsyncHandler = require("express-async-handler");
const ApiFeatures = require("../utils/ApiFeatures");
const AppError = require("../config/appError");
const order = require("../models/orderModel");

exports.getAll = (model) =>
  expressAsyncHandler(async (req, res) => {
    let fillter;
    let mongo = model.find(fillter)
    if (req.params.tour) {
      fillter = { tour: req.params.tour };
      mongo = model.find(fillter).populate("user","_id username image")
    }
    if(req.params.user){
      fillter = { user: req.params.user };
    }
    if(model === order){
      mongo = model.find(fillter).populate("tour","title start duration price imageCover people").populate("user","username email")
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
    res.status(200).json({ status: "success", result, paginationResult, data });
  });

exports.postOne = (Model) =>
  expressAsyncHandler(async (req, res) => {
    const data = await Model.create(req.body);
    res.status(201).json({ status: "success", data: data });
  });

exports.getOne = (model) =>
  expressAsyncHandler(async (req, res, next) => {
    let fillter = {_id:req.params.id}
    if(req.params.couponName){
      fillter = {name:req.params.couponName}
    }
    const data = await model.findOne(fillter);
    if (!data) {
      next(new AppError("No data found", 404));
    }
    res.status(200).json({ status: "success", data });
  });

exports.deleteOne = (model) =>
  expressAsyncHandler(async (req, res, next) => {
    await model.findByIdAndDelete(req.params.id);
    res.status(204).send();
  });

exports.updateOne = (model, type) =>
  expressAsyncHandler(async (req, res, next) => {
    if (type === "user") {
      const data = await model.findOne({ _id: req.params.id });
      if (!data) {
        next(new AppError("id is not valid", 404));
      }
      if (req.body.image) {
        const url = req.body.image.split("/");
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
      await data.save();
      res.status(200).cookie("user", data).json({ status: "success", data });
    } else {
      const data = await model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      res.status(200).json({ status: "success", data });
    }
  });
