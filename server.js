const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");

const app = express();
const port = process.env.PORT || 3000;

// Replace with actual secret key (store in environment variable)
const secret = "your_secret_key";

const userRoutes = require("./routes/routes");

const verifyJWT = require("./auth");
const upload = require("./upload");
const {
  generateUserId,
  validateUser,
  isAdmin,
  generateJWT,
} = require("./utils");

app.use(bodyParser.json());
app.use("/users", userRoutes); // Mount user routes

// ... rest of the code from the original app.js file ...

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
