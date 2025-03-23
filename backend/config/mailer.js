const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.EMAIL_USER, // your Gmail
		pass: process.env.EMAIL_PASS, // your App Password
	},
});

module.exports = transporter;
