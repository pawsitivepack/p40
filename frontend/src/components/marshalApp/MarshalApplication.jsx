import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useLocation } from "react-router-dom";
import emailjs from "@emailjs/browser";

function MarshalApplication() {
	const [userId, setUserId] = useState("");
	const [role, setRole] = useState("");
	const [message, setMessage] = useState("");
	const [applications, setApplications] = useState([]);
	const [response, setResponse] = useState("");
	const [error, setError] = useState("");
	const location = useLocation();

	// Decode the token to get userId and role
	useEffect(() => {
		const token = localStorage.getItem("token");
		if (token) {
			try {
				const decoded = jwtDecode(token);
				setUserId(decoded.id || decoded._id);
				setRole(decoded.role);
			} catch (error) {
				console.error("Invalid token:", error);
				setError("Invalid authentication token. Please log in again.");
			}
		} else {
			setError("No authentication token found. Please log in.");
		}
	}, []);

	// Fetch applications from backend (only for admins)
	const fetchApplications = async () => {
		try {
			const token = localStorage.getItem("token");
			const res = await axios.get(
				`${import.meta.env.VITE_BACKEND_URL}/marshalApps`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			setApplications(res.data);
		} catch (error) {
			console.error("Error fetching applications:", error);
			setError("Failed to fetch applications.");
		}
	};

	// Send Email Notification
	const sendEmailNotification = async (
		toEmail,
		applicantName,
		status,
		adminMessage
	) => {
		try {
			const response = await emailjs.send(
				import.meta.env.VITE_EMAILJS_SERVICE_ID,
				import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
				{
					to_name: toEmail,
					name: applicantName,
					status: status,
					message: adminMessage,
				},
				import.meta.env.VITE_EMAILJS_PUBLIC_KEY
			);

			console.log("Email sent successfully:", response.status, response.text);
		} catch (error) {
			console.error("Error sending email:", error);
		}
	};

	// Handle form submission for user
	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const token = localStorage.getItem("token");
			await axios.post(
				`${import.meta.env.VITE_BACKEND_URL}/marshalApps`,
				{
					userId,
					message,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			setResponse("Application submitted successfully!");
			setMessage("");
		} catch (error) {
			console.error("Error submitting application:", error);
			setError("Failed to submit application.");
		}
	};

	// Accept or Reject Application and Send Email
	const updateApplicationStatus = async (appId, status, applicant) => {
		try {
			const token = localStorage.getItem("token");
			await axios.put(
				`${import.meta.env.VITE_BACKEND_URL}/marshalApps/${appId}`,
				{ appStatus: status },
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			// Send Email after successful status update
			await sendEmailNotification(
				applicant.email,
				`${applicant.firstName} ${applicant.lastName}`,
				status,
				status === "Approved"
					? "Congratulations! Your marshal application has been approved."
					: "Unfortunately, your marshal application has been rejected."
			);

			setResponse(`Application ${status} and email sent successfully!`);
			fetchApplications(); // Refresh applications
		} catch (error) {
			console.error(`Error updating application status:`, error);
			setError("Failed to update application status.");
		}
	};

	useEffect(() => {
		if (role === "admin") {
			fetchApplications();
		}
	}, [role]);

	return (
		<div
			className="p-8 max-w-lg mx-auto rounded-lg shadow-2xl border my-auto mt-10"
			style={{ backgroundColor: "var(--bg-100)" }}
		>
			<h2
				className="text-3xl font-extrabold text-center mb-6"
				style={{ color: "var(--primary-200)" }}
			>
				Marshal Application
			</h2>

			{/* User Application Form */}
			{role === "user" && (
				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "var(--text-200)" }}
						>
							Message
						</label>
						<textarea
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							placeholder="Why do you want to be a marshal?"
							className="w-full border p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent"
							style={{
								color: "var(--text-100)",
								borderColor: "var(--bg-300)",
								backgroundColor: "white",
							}}
							rows="4"
							required
						></textarea>
					</div>

					<button
						type="submit"
						className="w-full text-white p-3 rounded-md shadow transition duration-300 ease-in-out"
						style={{ backgroundColor: "var(--primary-200)" }}
					>
						Submit Application
					</button>
				</form>
			)}

			{/* Admin View for Applications */}
			{role === "admin" && (
				<div>
					<h3
						className="text-xl font-bold mb-4"
						style={{ color: "var(--text-100)" }}
					>
						Submitted Applications
					</h3>
					{applications.length === 0 ? (
						<p className="text-black">No applications found.</p>
					) : (
						applications.map((app) => (
							<div
								key={app._id}
								className="p-4 border rounded-md mb-3 shadow-sm"
								style={{
									backgroundColor: "var(--bg-200)",
									color: "var(--text-100)",
									borderColor: "var(--bg-300)",
								}}
							>
								<p>
									<strong>Applicant Name:</strong>{" "}
									{`${app.userId?.firstName || "N/A"} ${
										app.userId?.lastName || ""
									}`}
								</p>
								<p>
									<strong>Email:</strong> {app.userId?.email || "N/A"}
								</p>
								<p>
									<strong>Message:</strong> {app.message}
								</p>
								<p>
									<strong>Status:</strong> {app.appStatus}
								</p>

								<div className="flex gap-3 mt-4">
									<button
										onClick={() =>
											updateApplicationStatus(app._id, "Approved", app.userId)
										}
										className="px-4 py-2 text-white rounded"
										style={{ backgroundColor: "var(--primary-300)" }}
										disabled={app.appStatus === "Approved"}
									>
										Accept
									</button>
									<button
										onClick={() =>
											updateApplicationStatus(app._id, "Rejected", app.userId)
										}
										className="px-4 py-2 text-white rounded"
										style={{ backgroundColor: "var(--accent-100)" }}
										disabled={app.appStatus === "Rejected"}
									>
										Reject
									</button>
								</div>
							</div>
						))
					)}
				</div>
			)}

			{/* Display responses and errors */}
			{response && (
				<p
					className="mt-4 text-center font-medium p-2 rounded-md"
					style={{
						color: "var(--primary-300)",
						backgroundColor: "var(--accent-200)",
						border: "1px solid var(--primary-300)",
					}}
				>
					{response}
				</p>
			)}

			{error && (
				<p
					className="mt-4 text-center font-medium p-2 rounded-md"
					style={{
						color: "var(--accent-100)",
						backgroundColor: "#fff1e6",
						border: "1px solid var(--accent-100)",
					}}
				>
					{error}
				</p>
			)}
		</div>
	);
}

export default MarshalApplication;
