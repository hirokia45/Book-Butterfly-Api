const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

const s3 = new aws.S3();

aws.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_ACCESS_SECRET,
  region: process.env.REGION,
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type, only JPEG and PNG is allowed!"), false);
  }
};

const upload = multer({
  fileFilter,
  storage: multerS3({
    acl: 'public-read',
    s3,
    bucket: 'bookbutterfly',
    metadata: function (req, file, cb) {
      cb(null, { fileName: file.originalname })
    },
    limits: { fileSize: 2000000 },
    key: function (req, file, cb) {
      console.log(file)
      cb(null, Date.now() + file.originalname)
    },
  }),
})

module.exports = upload;
