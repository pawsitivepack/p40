const jwt = require("jsonwebtoken");

const verifyAdmin = (req, res, next) => {
	console.log("the admin is :" + req.user);
	if (req.user && req.user.role === "admin") {
		next();
	} else {
		return res.status(403).json({ message: "Access denied" });
	}
};

module.exports = verifyAdmin;
