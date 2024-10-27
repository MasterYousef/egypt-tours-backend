const fs = require("node:fs");
const multer = require("multer");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const AppError = require("../config/appError");

const ImageHandler = () => {
  const multerStorge = multer.memoryStorage();
  const multerFilter = function (req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new AppError("Only Images allowed", 400), false);
    }
  };
  const upload = multer({ storage: multerStorge, fileFilter: multerFilter });
  return upload;
};

exports.resizeImage = async (req, res, next, name) => {
  const filename = `${name}-${uuidv4()}-${Date.now()}.jpeg`;
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .toFile(`images/${name}/${filename}`);
    req.body.image = filename;
  }
  next()
};

exports.resizeMultiImages = async (req, res, next, name) => {
  if (req.files.imageCover) {
    const fileName = `${name}-${uuidv4()}-${Date.now()}.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(700, 700)
      .toFormat("jpeg")
      .toFile(`images/${name}/${fileName}`);
    req.body.imageCover = fileName;
  }
  if (req.files.images) {
     await Promise.all(
      req.files.images.map(async (e) => {
        const fileName = `${name}-${uuidv4()}-${Date.now()}.jpeg`;
        await sharp(e.buffer)
          .resize(700, 700)
          .toFormat("jpeg")
          .toFile(`images/${name}/${fileName}`);
        req.body.images.push(fileName)
      })
    );
  }
  next();
};

exports.imageModelOptions = (options, file) => {
  const setImage = (doc) => {
    if (doc.image && !doc.image.startsWith(`${process.env.BASE_URL}`)) {
      const imgUrl = `${process.env.BASE_URL}/${file}/${doc.image}`;
      console.log(process.env.BASE_URL);
      console.log(imgUrl);
      doc.image = imgUrl;
    }
    if (doc.imageCover && !doc.imageCover.startsWith(`${process.env.BASE_URL}`)){
      const imgUrl = `${process.env.BASE_URL}/${file}/${doc.imageCover}`;
      doc.imageCover = imgUrl;
    }
    if(doc.images){
      const data = doc.images.map((e) => {
        if(!e.startsWith(`${process.env.BASE_URL}`)){
          e = `${process.env.BASE_URL}/${file}/${e}`;
        }
        return e;
      });
      doc.images = data;
    }
  };
  const removeImage = (doc) => {
    if (
      doc.image &&
      doc.image !== `${process.env.BASE_URL}/user/default.jpeg`
    ) {
      const image = doc.image.replace(`${process.env.BASE_URL}/`, "");
      fs.unlinkSync(`images/${image}`);
    }
    if (doc.imageCover) {
      const image = doc.imageCover.replace(`${process.env.BASE_URL}/`, "");
      fs.unlinkSync(`images/${image}`);
    }
    if (doc.images) {
      doc.images.forEach((e) => {
        const image = e.replace(`${process.env.BASE_URL}/`, "");
        fs.unlinkSync(`images/${image}`);
      });
    }
  };
  options.post("init", (doc) => {
    setImage(doc);
  });
  options.post("save", (doc) => {
    setImage(doc);
  });
  options.post("findOneAndDelete", (doc) => {
    removeImage(doc);
  });
};

exports.singleImageHandler = (filename) => ImageHandler().single(filename);

exports.multiImagesHandler = (fialdsArray) =>
  ImageHandler().fields(fialdsArray);
