const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function generateUserId() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

function validateUser(username, password, users) {
  const user = users.find((u) => u.username === username);
  if (user && bcrypt.compareSync(password, user.password)) {
    return user;
  }
  return null;
}

function isAdmin(user) {
  return user.isAdmin;
}

function generateJWT(user, secret) {
  const payload = {
    userId: user.id,
  };
  return jwt.sign(payload, secret, { expiresIn: "30m" });
}

module.exports = {
  generateUserId,
  validateUser,
  isAdmin,
  generateJWT,
};
