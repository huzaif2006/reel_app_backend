import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}-${file.originalname}`);
  },
});

//  File Type Filter (Optional Security Check)
const fileFilter = (req, file, cb) => {
  // Sirf images aur videos allow karne ke liye
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("video/")
  ) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type! Only images and videos are allowed."),
      false,
    );
  }
};

export const upload = multer({
  storage: storage,
//   limits: { fileSize: 10 * 1024 * 1024 },  // for limited specific ranges file size
//   fileFilter : fileFilter
});
