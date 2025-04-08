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
		text: `Hi ${user.firstName},\n\nYou're all set! Your walk is scheduled for ${formattedDate} at ${walk.location}.\n\nVisit us at: https://p40-positive.vercel.app/\n\nULM P40 Underdogs – Walking dogs, changing lives.\n\nThis is an automated email. Please do not reply.`,
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
				<p>Visit our website: <a href="https://p40-positive.vercel.app/" target="_blank">p40-positive.vercel.app</a></p>
				<p style="font-size: 14px; margin-top: 10px;">ULM P40 Underdogs – Walking dogs, changing lives.</p>
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
		text: `Hi ${user.firstName},\n\nYour OTP code is: ${otp}\nIt will expire in 10 minutes.\n\nVisit us at: https://p40-positive.vercel.app/\n\nULM P40 Underdogs – Building trust one step at a time.\n\nThis is an automated email. Please do not reply.`,
		html: `
			<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
				<h2 style="color: #8c1d35;">Hi ${user.firstName},</h2>
				<p>Your OTP code is:</p>
				<h3>${otp}</h3>
				<p>This code will expire in 10 minutes.</p>
				<p>Visit our website: <a href="https://p40-positive.vercel.app/" target="_blank">p40-positive.vercel.app</a></p>
				<p style="font-size: 14px; margin-top: 10px;">ULM P40 Underdogs – Building trust one step at a time.</p>
				<hr />
				<p style="font-size: 12px; color: #888;">This is an automated message. Please do not reply.</p>
			</div>
		`,
	};
	await transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (user, otp) => {
	const mailOptions = {
		from: `"Underdogs Team" <${process.env.EMAIL_USER}>`,
		to: user.email,
		subject: "Password Reset OTP – Underdogs Program",
		text: `Hi ${user.firstName},\n\nYour OTP for password reset is: ${otp}\nIt will expire in 10 minutes.\n\nVisit us at: https://p40-positive.vercel.app/\n\nULM P40 Underdogs – Resetting with care.\n\nThis is an automated email. Please do not reply.`,
		html: `
			<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
				<h2 style="color: #8c1d35;">Hi ${user.firstName},</h2>
				<p>Your OTP for password reset is:</p>
				<h3>${otp}</h3>
				<p>This code will expire in 10 minutes.</p>
				<p>Visit our website: <a href="https://p40-positive.vercel.app/" target="_blank">p40-positive.vercel.app</a></p>
				<p style="font-size: 14px; margin-top: 10px;">ULM P40 Underdogs – Resetting with care.</p>
				<hr />
				<p style="font-size: 12px; color: #888;">This is an automated message. Please do not reply.</p>
			</div>
		`,
	};
	await transporter.sendMail(mailOptions);
};

const sendMarshalApplicationStatusEmail = async (
	user,
	status,
	adminMessage
) => {
	const mailOptions = {
		from: `"Underdogs Team" <${process.env.EMAIL_USER}>`,
		to: user.email,
		subject: `Marshal Application ${status} – ULM P40 Underdogs`,
		text: `Hi ${user.firstName},\n\n${adminMessage}\n\nVisit us at: https://p40-positive.vercel.app/\n\nULM P40 Underdogs – Thank you for your support.\n\nThis is an automated email. Please do not reply.`,
		html: `
			<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
				<h2 style="color: #8c1d35;">Hi ${user.firstName},</h2>
				<p>${adminMessage}</p>
				<p>Visit our website: <a href="https://p40-positive.vercel.app/" target="_blank">p40-positive.vercel.app</a></p>
				<p style="font-size: 14px; margin-top: 10px;">ULM P40 Underdogs – Thank you for your support.</p>
				<hr />
				<p style="font-size: 12px; color: #888;">This is an automated message. Please do not reply.</p>
			</div>
		`,
	};
	await transporter.sendMail(mailOptions);
};

const sendAdoptionReplyEmail = async (user, dogName, replyMessage) => {
	const mailOptions = {
		from: `"Underdogs Team" <${process.env.EMAIL_USER}>`,
		to: user.email,
		subject: `Re: Adoption Inquiry about ${dogName} – ULM P40 Underdogs`,
		text: `Hi ${user.firstName},\n\n${replyMessage}\n\nVisit us at: https://p40-positive.vercel.app/\n\nULM P40 Underdogs – Thank you for your interest.\n\nThis is an automated email. Please do not reply.`,
		html: `
			<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
				<h2 style="color: #8c1d35;">Hi ${user.firstName},</h2>
				<p>${replyMessage}</p>
				<p>Thank you for your interest in adopting <strong>${dogName}</strong>.</p>
				<p>Visit our website: <a href="https://p40-positive.vercel.app/" target="_blank">p40-positive.vercel.app</a></p>
				<p style="font-size: 14px; margin-top: 10px;">ULM P40 Underdogs – Making tails wag.</p>
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
	sendPasswordResetEmail,
	sendMarshalApplicationStatusEmail,
	sendAdoptionReplyEmail,
};
