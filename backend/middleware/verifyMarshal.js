const jwt = require("jsonwebtoken");

const verifyMarshal = (req, res, next) => {
	if ((req.user && req.user.role === "marshal") || req.user.role === "admin") {
		next();
	} else {
		return res.status(403).json({ message: "Access denied" });
	}
};

module.exports = verifyMarshal;
