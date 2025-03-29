const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.EMAIL_USER, // your Gmail
		pass: process.env.EMAIL_PASS, // your App Password
	},
});

const sendWalkConfirmationEmail = async (user, walk) => {
	const formattedDate = walk.date.toLocaleString("en-US", {
		timeZone: "America/Chicago",
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
	});

	const mailOptions = {
		from: `"Underdogs Team" <${process.env.EMAIL_USER}>`,
		to: user.email,
		subject: "Walk Confirmation – Underdogs Program",
		text: `Hi ${user.firstName},\n\nYou're all set! Your walk is scheduled for ${formattedDate} at ${walk.location}.\n\nThanks for supporting the Underdogs Program!\n\nView your walks: https://p40-positive.vercel.app/mywalks\n\nThis is an automated email. Please do not reply.`,
		html: `
			<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
				<h2 style="color: #8c1d35;">Hi ${user.firstName},</h2>
				<p>You're all set! Your walk is scheduled for:</p>
				<p style="font-size: 16px;">
					<strong>Date & Time:</strong> ${formattedDate}<br />
					<strong>Location:</strong> ${walk.location}
				</p>
				<p>Thank you for supporting the Underdogs Program. 🐶</p>
				<p><a href="https://p40-positive.vercel.app/mywalks" target="_blank" style="color: #8c1d35;">Click here to view your walks</a></p>
				<hr />
				<p style="font-size: 12px; color: #888;">This is an automated message. Please do not reply.</p>
			</div>
		`,
	};

	await transporter.sendMail(mailOptions);
};

const sendOtpVerificationEmail = async (user, otp) => {
	const mailOptions = {
		from: `"Underdogs Team" <${process.env.EMAIL_USER}>`,
		to: user.email,
		subject: "Your OTP Code – Underdogs Verification",
		text: `Hi ${user.firstName},\n\nYour OTP code is: ${otp}\nIt will expire in 10 minutes.\n\nThis is an automated email. Please do not reply.`,
		html: `
			<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
				<h2 style="color: #8c1d35;">Hi ${user.firstName},</h2>
				<p>Your OTP code is:</p>
				<h3>${otp}</h3>
				<p>This code will expire in 10 minutes.</p>
				<hr />
				<p style="font-size: 12px; color: #888;">This is an automated message. Please do not reply.</p>
			</div>
		`,
	};
	await transporter.sendMail(mailOptions);
};

module.exports = {
	transporter,
	sendWalkConfirmationEmail,
	sendOtpVerificationEmail,
};
