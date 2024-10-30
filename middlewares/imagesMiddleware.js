const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const AppError = require("../config/appError");

dotenv.config({ path: "config.env" });
cloudinary.config({
  cloud_name: process.env.IMG_NAME,
  api_key: process.env.IMG_KEY,
  api_secret: process.env.IMG_SECRET,
});

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

const uploadToCloudinary = (buffer, folder, filename) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          public_id: filename.replace(".png", ""),
          resource_type: "image",
        },
        (err, res) => {
          if (res.secure_url) {
            resolve(res.secure_url);
          } else {
            reject("Invalid image file");
          }
        }
      )
      .end(buffer);
  });
};

exports.resizeImage = async (req, res, next, name) => {
  const fileName = `${name}-${uuidv4()}-${Date.now()}.jpeg`;
  if (req.file) {
    const file = await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .toBuffer();
    try {
      const imageUrl = await uploadToCloudinary(buffer, `/${name}`, fileName);
      req.body.image = imageUrl;
    } catch (error) {
      return next(new AppError("Image upload failed", 500));
    }
  }
  next();
};

exports.resizeMultiImages = async (req, res, next, name) => {
  const directory = path.join(__dirname, "..", `uploads/${name}`);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
  if (req.files.imageCover) {
    const fileName = `${name}-${uuidv4()}-${Date.now()}.jpeg`;
    const buffer = await sharp(req.files.imageCover[0].buffer)
      .resize(700, 700)
      .toFormat("png")
      .png({quality:80})
      .toBuffer();
    const image = await uploadToCloudinary(buffer, `/${name}`, fileName);
    req.body.imageCover = image;
  }
  if (req.files.images) {
    const data = await Promise.all(
      req.files.images.map(async (e) => {
        const fileName = `${name}-${uuidv4()}-${Date.now()}.jpeg`;
        const buffer = await sharp(e.buffer)
          .resize(700, 700)
          .toFormat("png")
          .png({quality:80})
          .toBuffer();
        const image = await uploadToCloudinary(buffer, `/${name}`, fileName);
        return image;
      })
    );
    if (Array.isArray(req.body.images)) {
      req.body.images = [...req.body.images, ...data];
    } else if (typeof req.body.images === "string") {
      data.push(req.body.images);
      req.body.images = data;
    }
    req.body.images = data;
  }
  next();
};

exports.imageModelOptions = (options, file) => {
  const removeImage = (doc) => {
    if (doc.image) {
      const url = doc.image.split("/");
      const image = `${url[url.length - 2]}/${url[url.length - 1]}`.replace(
        ".png",
        ""
      );
      cloudinary.uploader.destroy(image);
    }
    if (doc.imageCover) {
      const url = doc.imageCover.split("/");
      const image = `${url[url.length - 2]}/${url[url.length - 1]}`.replace(
        ".png",
        ""
      );
      cloudinary.uploader.destroy(image);
    }
    if (doc.images) {
      doc.images.forEach((e) => {
        const url = e.split("/");
        const image = `${url[url.length - 2]}/${url[url.length - 1]}`.replace(
          ".png",
          ""
        );
        cloudinary.uploader.destroy(image);
      });
    }
  };
  options.post("findOneAndDelete", (doc) => {
    removeImage(doc);
  });
};

exports.singleImageHandler = (filename) => ImageHandler().single(filename);

exports.multiImagesHandler = (fialdsArray) =>
  ImageHandler().fields(fialdsArray);
