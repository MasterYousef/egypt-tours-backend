const expressAsyncHandler = require("express-async-handler");
const ApiFeatures = require("../utils/ApiFeatures");
const AppError = require("../config/appError");

exports.getAll = (model) =>
  expressAsyncHandler(async (req, res) => {
    let fillter;
    if (req.params.tourId) {
      fillter = { tour: req.params.tourId };
    }
    const apiFeatures = await new ApiFeatures(model.find(fillter), req.query)
      .searchfillter()
      .resultSort()
      .selectFailds()
      .paginate();
    const data = await apiFeatures.mongo;
    const result = data.length || 0;
    const total = await model.countDocuments();
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
    console.log(req.body);
    const data = await Model.create(req.body);
    res.status(201).json({ data: data });
  });

exports.getOne = (model) =>
  expressAsyncHandler(async (req, res, next) => {
    const data = await model.findOne({ _id: req.params.id });
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

exports.updateOne = (model) =>
  expressAsyncHandler(async (req, res, next) => {
    const data = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json({ status: "success", data });
  });
