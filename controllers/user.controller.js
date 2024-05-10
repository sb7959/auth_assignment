const { users, updateUser } = require("../users");
const {
  generateUserId,
  validateUser,
  isAdmin,
  generateJWT,
} = require("../utils");
const bcrypt = require("bcryptjs");

async function createUser(req, res) {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const existingUser = users.find(
    (u) => u.username === username || u.email === email
  );
  if (existingUser) {
    return res
      .status(409)
      .json({ message: "Username or email already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: generateUserId(),
    username,
    email,
    password: hashedPassword,
    role,
    isAdmin: role === "admin" ? true : false,
    isPublic: true, // Public profile by default
  };
  users.push(newUser);

  res.status(201).json({ message: "User created successfully" });
}

async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const user = validateUser(username, password, users);
  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }
  const token = generateJWT(user, "jwtSecret");
  res.json({ message: "Login successful", id: user.id, token });
}

function getUserProfile(req, res) {
  const userId = req.query.userId; // Assuming user ID passed in query string
  const currentUser = req.user.id;

  if (!userId) {
    return res.status(400).json({ message: "Missing user ID" });
  }

  const user = users.find((u) => u.id === userId);
  const currUSer = users.find((u) => u.id === currentUser);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isAdminUser = isAdmin(currUSer);
  const isPublicOrOwnProfile = user.isPublic || userId === currentUser;
  console.log(
    `value of -isAdmin-${isAdminUser} and ispublicor own- ${isPublicOrOwnProfile}`
  );
  if (isAdminUser || isPublicOrOwnProfile) {
    // Allow admins to see all profiles and users to see public or their own profile
    res.json({ user });
  } else {
    // Unauthorized access to private profile
    res.status(403).json({ message: "Unauthorized to view this profile" });
  }
}

async function updateUserProfile(req, res) {
  const currentUser = req.user.id;
  const { name, bio, phone, email, password, isPublic } = req.body;

  if (!currentUser) {
    return res.status(400).json({ message: "Missing user ID" });
  }

  const user = users.find((u) => u.id === currentUser);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  //   if (userId !== currentUser) {
  //     return res
  //       .status(401)
  //       .json({ message: "Unauthorized to edit other users" });
  //   }

  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
  }

  user.name = name || user.name;
  user.bio = bio || user.bio;
  user.phone = phone || user.phone;
  user.email = email || user.email;

  user.isPublic = isPublic;
  const userIndex = users.findIndex((u) => u.id === currentUser);
  if (userIndex !== -1) {
    updateUser(currentUser, user); // Assuming updatedUser object is prepared
  }

  res.json({ message: "User profile updated successfully", user });
}

function updatePrivacy(req, res) {
  const userId = req.user.id;
  const { isPublic } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "Missing user ID" });
  }

  const user = users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (isPublic === undefined) {
    return res
      .status(400)
      .json({ message: "Missing isPublic field in request body" });
  }

  if (![true, false].includes(isPublic)) {
    return res.status(400).json({ message: "Invalid value for isPublic" });
  }

  user.isPublic = isPublic;

  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex !== -1) {
    updateUser(userId, user); //  user object is prepared
  }

  res.json({ message: "Profile privacy updated successfully", user });
}
async function uploadImage(req, res) {
  const userId = req.user.id; // Access user ID from decoded JWT
  const user = users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  let imageData = null;

  // Handle image upload if a file is provided
  if (req.file) {
    imageData = {
      path: req.file.path,
      filename: req.file.filename,
      // ... other image details
    };
  } else if (req.body.imageUrl) {
    // Handle image URL if provided
    const imageUrl = req.body.imageUrl;

    try {
      const response = await https.get(imageUrl);
      if (response.statusCode === 200) {
        const imageBuffer = await response.arrayBuffer();
        const filename = imageUrl.split("/").pop(); // Extract filename from URL

        // Save downloaded image (replace with your storage logic)
        fs.writeFileSync(`uploads/${filename}`, imageBuffer);

        imageData = {
          path: `uploads/${filename}`,
          filename,
          // ... other image details
        };
      } else {
        return res.status(400).json({ message: "Invalid image URL" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error downloading image" });
    }
  } else {
    // No image uploaded or URL provided
    return res.status(400).json({
      message: "Please select an image file or provide an image URL.",
    });
  }

  // Update user object with image details
  user.image = imageData;
  updateUser(userId, user);

  res.json({ message: "Image uploaded successfully", user });
}
function getPublicUsers(req, res) {
  const publicUsers = users.filter((user) => user.isPublic);
  res.json({ users: publicUsers });
}
function getUsersByRole(req, res) {
  const role = req.query.role; // Assuming role is passed in query string

  if (!role) {
    return res.status(400).json({ message: "Missing role parameter" });
  }

  const usersByRole = users.filter((user) => user.role === role); // Filter users by role
  res.json({ users: usersByRole });
}

module.exports = {
  createUser,
  login,
  getUserProfile,
  updateUserProfile,
  updatePrivacy,
  uploadImage,
  getPublicUsers,
  getUsersByRole,
};
