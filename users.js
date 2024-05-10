const fs = require("fs");

const users = []; // Replace with actual user data (initially empty)

function updateUser(userId, updatedUser) {
  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex !== -1) {
    users[userIndex] = updatedUser;
  }
}

module.exports = {
  users,
  updateUser,
};
