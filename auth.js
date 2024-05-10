const jwt = require("jsonwebtoken");

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, "jwtSecret"); // Use environment variable for secret
    //console.log(`userid - ${JSON.stringify(decoded)}`);
    req.user = { id: decoded.userId };
    // Attach user ID to the request object
    // console.log(`req.user - ${JSON.stringify(decoded)}`);
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid token" });
  }
}

module.exports = verifyJWT;
