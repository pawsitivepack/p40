"use client";

import { useState, useEffect, useRef } from "react";
import api from "../../api/axios";
import { jwtDecode } from "jwt-decode";
import { useLocation, useNavigate } from "react-router-dom";

import {
	FaUserShield,
	FaClipboardList,
	FaEnvelope,
	FaCheck,
	FaTimes,
	FaSpinner,
	FaExclamationTriangle,
	FaCheckCircle,
	FaPaw,
	FaInfoCircle,
	FaUser,
	FaCalendarAlt,
} from "react-icons/fa";

function MarshalApplication() {
	const [userId, setUserId] = useState("");
	const [userName, setUserName] = useState("");
	const [userEmail, setUserEmail] = useState("");
	const [role, setRole] = useState("");
	const [message, setMessage] = useState("");
	const [applications, setApplications] = useState([]);
	const [response, setResponse] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [hasApplied, setHasApplied] = useState(false);
	const [userApplication, setUserApplication] = useState(null);
	const [processingId, setProcessingId] = useState(null);

	const location = useLocation();
	const navigate = useNavigate();
	const formRef = useRef(null);

	// Decode the token to get userId and role
	useEffect(() => {
		const token = localStorage.getItem("token");
		if (token) {
			try {
				const decoded = jwtDecode(token);
				setUserId(decoded.id || decoded._id);
				setRole(decoded.role);

				// Get user details if available in the token
				if (decoded.firstName && decoded.lastName) {
					setUserName(`${decoded.firstName} ${decoded.lastName}`);
				}
				if (decoded.email) {
					setUserEmail(decoded.email);
				}
			} catch (error) {
				console.error("Invalid token:", error);
				setError("Invalid authentication token. Please log in again.");
			}
		} else {
			setError("No authentication token found. Please log in.");
		}
	}, []);

	// Fetch applications from backend (for admins) or check if user has already applied
	useEffect(() => {
		const fetchData = async () => {
			if (!userId) return;

			setLoading(true);
			try {
				if (role === "admin") {
					const res = await api.get(`/marshalApps`);
					setApplications(res.data);
				} else {
					// Check if user has already applied
					const res = await api.get(`/marshalApps/user/${userId}`);
					if (res.data && res.data.length > 0) {
						setHasApplied(true);
						setUserApplication(res.data[0]);
					}
				}
			} catch (error) {
				console.error("Error fetching data:", error);
				if (role === "admin") {
					setError("Failed to fetch applications.");
				}
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [userId, role]);

	// Handle form submission for user
	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitting(true);
		setResponse("");
		setError("");

		try {
			await api.post(`/marshalApps`, {
				userId,
				message,
			});

			setResponse(
				"Your application has been submitted successfully! We'll review it and get back to you soon."
			);
			setMessage("");
			setHasApplied(true);
		} catch (error) {
			console.error("Error submitting application:", error);
			setError("Failed to submit application. Please try again later.");
			setSubmitting(false);
			return;
		}

		try {
			const res = await api.get(`/marshalApps/user/${userId}`);
			if (res.data && res.data.length > 0) {
				setUserApplication(res.data[0]);
			}
		} catch (err) {
			console.warn("Warning: Could not fetch newly submitted application", err);
		}

		setSubmitting(false);

		// Scroll to response message
		setTimeout(() => {
			window.scrollTo({
				top: formRef.current.offsetTop,
				behavior: "smooth",
			});
		}, 100);
	};

	// Accept or Reject Application and Send Email
	const updateApplicationStatus = async (appId, status, applicant) => {
		setProcessingId(appId);
		try {
			await api.put(`/marshalApps/${appId}`, { appStatus: status });

			setResponse(`Application ${status.toLowerCase()} successfully!`);

			// Update the applications list
			const updatedApps = applications.map((app) =>
				app._id === appId ? { ...app, appStatus: status } : app
			);
			setApplications(updatedApps);
		} catch (error) {
			console.error(`Error updating application status:`, error);
			setError("Failed to update application status.");
		} finally {
			setProcessingId(null);
		}
	};

	// Get status badge color
	const getStatusBadge = (status) => {
		switch (status) {
			case "Pending":
				return (
					<span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium flex items-center">
						<FaInfoCircle className="mr-1" /> Pending Review
					</span>
				);
			case "Approved":
				return (
					<span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium flex items-center">
						<FaCheckCircle className="mr-1" /> Approved
					</span>
				);
			case "Rejected":
				return (
					<span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium flex items-center">
						<FaTimes className="mr-1" /> Declined
					</span>
				);
			default:
				return (
					<span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-medium flex items-center">
						<FaInfoCircle className="mr-1" /> {status}
					</span>
				);
		}
	};

	// Format date
	const formatDate = (dateString) => {
		const options = { year: "numeric", month: "long", day: "numeric" };
		return new Date(dateString).toLocaleDateString(undefined, options);
	};

	if (!userId && error) {
		return (
			<div className="min-h-screen bg-[#f8f5f0] py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
				<div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full">
					<div className="text-center mb-6">
						<FaExclamationTriangle className="mx-auto text-red-500 text-4xl mb-4" />
						<h2 className="text-2xl font-bold text-gray-800 mb-2">
							Authentication Required
						</h2>
						<p className="text-gray-600">{error}</p>
					</div>
					<button
						onClick={() => navigate("/login")}
						className="w-full bg-[#8c1d35] text-white py-3 rounded-lg font-medium hover:bg-[#7c1025] transition-colors"
					>
						Go to Login
					</button>
				</div>
			</div>
		);
	}

	return (
		<div
			className="min-h-screen bg-[#f8f5f0] py-12 px-4 sm:px-6 lg:px-8"
			ref={formRef}
		>
			<div className="max-w-3xl mx-auto">
				{/* Header */}
				<div className="bg-[#8c1d35] text-white p-6 rounded-t-xl shadow-md">
					<div className="flex items-center justify-between">
						<h1 className="text-2xl md:text-3xl font-bold flex items-center">
							<FaUserShield className="mr-3" /> Marshal Application
						</h1>
						<FaPaw className="text-[#e8d3a9] text-3xl" />
					</div>
					<p className="mt-2 text-gray-100 max-w-2xl">
						Marshals help coordinate dog walks, ensure safety protocols are
						followed, and assist with various activities.
					</p>
				</div>

				{/* Content */}
				<div className="bg-white p-6 rounded-b-xl shadow-md">
					{loading ? (
						<div className="flex flex-col items-center justify-center py-12">
							<FaSpinner className="animate-spin text-[#8c1d35] text-4xl mb-4" />
							<p className="text-gray-600">Loading...</p>
						</div>
					) : (
						<>
							{/* User Application Form */}
							{role === "user" && !hasApplied && (
								<div className="space-y-6">
									<div className="bg-[#f8f5f0] border border-[#e8d3a9] p-4 rounded-lg">
										<h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
											<FaInfoCircle className="text-[#8c1d35] mr-2" /> About
											Marshal Role
										</h3>
										<p className="text-gray-700">
											As a marshal, you'll be responsible for:
										</p>
										<ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
											<li>Coordinating dog walking sessions</li>
											<li>Ensuring safety protocols are followed</li>
											<li>Assisting with dog adoption events</li>
											<li>Helping new volunteers learn the ropes</li>
											<li>Recording and reporting walk data</li>
										</ul>
									</div>

									<form onSubmit={handleSubmit} className="space-y-6">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Why do you want to be a marshal?
											</label>
											<textarea
												value={message}
												onChange={(e) => setMessage(e.target.value)}
												placeholder="Share your experience with dogs, your motivation, and why you'd be a good fit for this role..."
												className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#8c1d35] focus:border-transparent"
												rows="6"
												required
											></textarea>
											<p className="mt-1 text-sm text-gray-500">
												Please be specific and include any relevant experience
												you have with dogs.
											</p>
										</div>

										<button
											type="submit"
											disabled={submitting}
											className="w-full bg-[#8c1d35] text-white py-3 rounded-lg font-medium hover:bg-[#7c1025] transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
										>
											{submitting ? (
												<>
													<FaSpinner className="animate-spin mr-2" />
													Submitting...
												</>
											) : (
												<>
													<FaClipboardList className="mr-2" />
													Submit Application
												</>
											)}
										</button>
									</form>
								</div>
							)}

							{/* User's Submitted Application */}
							{role === "user" && hasApplied && userApplication && (
								<div className="space-y-6">
									<div className="bg-[#f8f5f0] border border-[#e8d3a9] p-6 rounded-lg">
										<div className="flex justify-between items-start mb-4">
											<h3 className="text-xl font-bold text-gray-800">
												Your Application
											</h3>
											{getStatusBadge(userApplication.appStatus)}
										</div>

										<div className="space-y-4">
											<div>
												<p className="text-sm text-gray-500 mb-1 flex items-center">
													<FaCalendarAlt className="mr-1 text-[#8c1d35]" />{" "}
													Submitted on
												</p>
												<p className="text-gray-700">
													{formatDate(userApplication.createdAt)}
												</p>
											</div>

											<div>
												<p className="text-sm text-gray-500 mb-1">
													Your Message
												</p>
												<div className="bg-white p-4 rounded-lg border border-gray-200">
													<p className="text-gray-700 whitespace-pre-line">
														{userApplication.message}
													</p>
												</div>
											</div>

											{userApplication.appStatus === "Pending" && (
												<div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
													<p className="text-yellow-800">
														Your application is currently under review. We'll
														notify you once a decision has been made.
													</p>
												</div>
											)}

											{userApplication.appStatus === "Approved" && (
												<div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
													<p className="text-green-800">
														Congratulations! Your application has been approved.
														You now have marshal privileges.
													</p>
												</div>
											)}

											{userApplication.appStatus === "Rejected" && (
												<div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
													<p className="text-red-800">
														Unfortunately, your application has been declined at
														this time. You may apply again in the future.
													</p>
												</div>
											)}
										</div>
									</div>
								</div>
							)}

							{/* Admin View for Applications */}
							{role === "admin" && (
								<div className="space-y-6">
									<h2 className="text-xl font-bold text-gray-800 flex items-center">
										<FaClipboardList className="text-[#8c1d35] mr-2" /> Marshal
										Applications
									</h2>

									{applications.length === 0 ? (
										<div className="bg-[#f8f5f0] p-8 text-center rounded-lg border border-[#e8d3a9]">
											<FaClipboardList className="text-[#8c1d35] text-4xl mx-auto mb-3 opacity-50" />
											<p className="text-gray-700">
												No applications have been submitted yet.
											</p>
										</div>
									) : (
										<div className="space-y-4">
											{applications.map((app) => (
												<div
													key={app._id}
													className={`bg-white border rounded-lg shadow-sm overflow-hidden ${
														app.appStatus === "Pending"
															? "border-yellow-300"
															: app.appStatus === "Approved"
															? "border-green-300"
															: "border-gray-300"
													}`}
												>
													<div className="p-4 border-b bg-[#f8f5f0]">
														<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
															<div className="flex items-center">
																<div className="w-10 h-10 rounded-full bg-[#e8d3a9] flex items-center justify-center text-[#8c1d35] mr-3">
																	<FaUser className="w-5 h-5" />
																</div>
																<div>
																	<h3 className="font-bold text-gray-800">
																		{app.userId?.firstName || "N/A"}{" "}
																		{app.userId?.lastName || ""}
																	</h3>
																	<p className="text-sm text-gray-600 flex items-center">
																		<FaEnvelope className="mr-1" />{" "}
																		{app.userId?.email || "N/A"}
																	</p>
																</div>
															</div>
															<div className="flex items-center gap-2">
																{getStatusBadge(app.appStatus)}
																<span className="text-xs text-gray-500">
																	{formatDate(app.createdAt)}
																</span>
															</div>
														</div>
													</div>

													<div className="p-4">
														<p className="text-sm text-gray-500 mb-1">
															Application Message:
														</p>
														<div className="bg-[#f8f5f0] p-3 rounded-lg border border-[#e8d3a9] mb-4">
															<p className="text-gray-700 whitespace-pre-line">
																{app.message}
															</p>
														</div>

														{app.appStatus === "Pending" && (
															<div className="flex flex-wrap gap-3 mt-4">
																<button
																	onClick={() =>
																		updateApplicationStatus(
																			app._id,
																			"Approved",
																			app.userId
																		)
																	}
																	disabled={processingId === app._id}
																	className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
																>
																	{processingId === app._id ? (
																		<FaSpinner className="animate-spin mr-1" />
																	) : (
																		<FaCheck className="mr-1" />
																	)}
																	Approve
																</button>
																<button
																	onClick={() =>
																		updateApplicationStatus(
																			app._id,
																			"Rejected",
																			app.userId
																		)
																	}
																	disabled={processingId === app._id}
																	className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
																>
																	{processingId === app._id ? (
																		<FaSpinner className="animate-spin mr-1" />
																	) : (
																		<FaTimes className="mr-1" />
																	)}
																	Decline
																</button>
															</div>
														)}
													</div>
												</div>
											))}
										</div>
									)}
								</div>
							)}

							{/* Display responses and errors */}
							{response && (
								<div className="mt-6 bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg flex items-start">
									<FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
									<p>{response}</p>
								</div>
							)}

							{error && (
								<div className="mt-6 bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-start">
									<FaExclamationTriangle className="text-red-500 mt-1 mr-2 flex-shrink-0" />
									<p>{error}</p>
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
}

export default MarshalApplication;
