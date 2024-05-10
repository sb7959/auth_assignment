const multer = require("multer");

const upload = multer({ dest: "uploads/" }); // Configure upload destination

module.exports = upload;
