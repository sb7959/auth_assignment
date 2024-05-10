const express = require("express");
const verifyJWT = require("../auth");
const upload = require("../upload");
const userController = require("../controllers/user.controller");

const router = express.Router();

router.post("/signup", userController.createUser);
router.post("/login", userController.login);

router.get("/me", verifyJWT, userController.getUserProfile);

router.put("/me", verifyJWT, userController.updateUserProfile);
router.patch("/me/privacy", verifyJWT, userController.updatePrivacy);

router.post(
  "/me/image",
  verifyJWT,
  upload.single("image"),
  userController.uploadImage // Add uploadImage function to userController
);
router.get("/public", userController.getPublicUsers);

// Route for getting users by role
router.get("/fetch", userController.getUsersByRole);

module.exports = router;
