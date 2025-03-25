import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import dogBackground from "../assets/dog.png";
import {
	FaUserShield,
	FaDog,
	FaWalking,
	FaDonate,
	FaUsers,
	FaPaw,
	FaCalendarAlt,
	FaHistory,
	FaCogs,
	FaArrowRight,
} from "react-icons/fa";

export default function Home() {
	const [role, setRole] = useState("");
	const [walks, setWalks] = useState([]);
	const [username, setUsername] = useState("");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (token) {
			try {
				const decoded = jwtDecode(token);
				setRole(decoded.role);
				setUsername(decoded.username || decoded.firstName || "");
				fetchWalks(decoded.id, decoded.role);
			} catch (error) {
				console.error("Invalid token:", error);
				setRole("");
			} finally {
				setLoading(false);
			}
		} else {
			setLoading(false);
		}
	}, []);

	const fetchWalks = async (userId, userRole) => {
		try {
			setLoading(true);
			let response;
			if (userRole === "user") {
				response = await axios.get(
					`${import.meta.env.VITE_BACKEND_URL}/scheduledWalks/${userId}`,
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem("token")}`,
						},
					}
				);
			} else {
				response = await axios.get(
					`${import.meta.env.VITE_BACKEND_URL}/scheduledWalks`,
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem("token")}`,
						},
					}
				);
			}
			setWalks(response.data);
		} catch (error) {
			console.error("Error fetching walks:", error);
		} finally {
			setLoading(false);
		}
	};

	// Format date for better display
	const formatDate = (dateString) => {
		const options = { weekday: "short", month: "short", day: "numeric" };
		return new Date(dateString).toLocaleDateString("en-US", options);
	};

	// Format time for better display
	const formatTime = (dateString) => {
		const options = { hour: "2-digit", minute: "2-digit" };
		return new Date(dateString).toLocaleTimeString("en-US", options);
	};

	return (
		<div className="min-h-screen bg-[#f8f5f0]">
			{/* Full Background Section */}
			<div
				className="fixed inset-0 z-0 bg-cover bg-center filter blur-sm opacity-30"
				style={{ backgroundImage: `url(${dogBackground})` }}
			></div>

			<div className="relative z-10">
				{/* Main Content */}
				<div className="max-w-7xl mx-auto px-4 py-12">
					{/* Welcome Message */}
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-[#8c1d35] mb-4">
							Welcome, {username ? username : "to ULM P40 UNDERDOGS!"}!
						</h2>

						<p className="text-lg text-gray-700 max-w-3xl mx-auto">
							ULM P40 UNDERDOGS is dedicated to providing care and finding homes
							for dogs in need. Join us in our mission to make a difference in
							the lives of these wonderful animals.
						</p>
					</div>

					{/* Dashboard Sections */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{/* Quick Links Section */}
						<div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
							<div className="bg-[#e8d3a9] px-6 py-4 border-b border-gray-200">
								<h3 className="text-xl font-bold text-[#8c1d35] flex items-center">
									<FaUserShield className="mr-2" /> Quick Links
								</h3>
							</div>
							<div className="p-6">
								<div className="space-y-3">
									{/* Admin Links */}
									{role === "admin" && (
										<>
											<Link
												to="/marshal-application"
												className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 hover:bg-[#f5f0e8] hover:border-[#e8d3a9] transition-all duration-200"
											>
												<div className="flex items-center">
													<div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
														<FaUserShield className="text-blue-600 text-lg" />
													</div>
													<span className="font-medium text-gray-800">
														Marshal Application
													</span>
												</div>
												<FaArrowRight className="text-gray-400" />
											</Link>
											<Link
												to="/dog-inventory"
												className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 hover:bg-[#f5f0e8] hover:border-[#e8d3a9] transition-all duration-200"
											>
												<div className="flex items-center">
													<div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
														<FaDog className="text-green-600 text-lg" />
													</div>
													<span className="font-medium text-gray-800">
														Dog Inventory
													</span>
												</div>
												<FaArrowRight className="text-gray-400" />
											</Link>
											<Link
												to="/adoption-board"
												className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 hover:bg-[#f5f0e8] hover:border-[#e8d3a9] transition-all duration-200"
											>
												<div className="flex items-center">
													<div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-3">
														<FaPaw className="text-orange-600 text-lg" />
													</div>
													<span className="font-medium text-gray-800">
														Adoption Board
													</span>
												</div>
												<FaArrowRight className="text-gray-400" />
											</Link>
											<Link
												to="/users"
												className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 hover:bg-[#f5f0e8] hover:border-[#e8d3a9] transition-all duration-200"
											>
												<div className="flex items-center">
													<div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
														<FaUsers className="text-purple-600 text-lg" />
													</div>
													<span className="font-medium text-gray-800">
														Manage Users
													</span>
												</div>
												<FaArrowRight className="text-gray-400" />
											</Link>
											<Link
												to="/donate"
												className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 hover:bg-[#f5f0e8] hover:border-[#e8d3a9] transition-all duration-200"
											>
												<div className="flex items-center">
													<div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
														<FaDonate className="text-red-600 text-lg" />
													</div>
													<span className="font-medium text-gray-800">
														Donate & Support
													</span>
												</div>
												<FaArrowRight className="text-gray-400" />
											</Link>
										</>
									)}

									{role === "" && (
										<>
											<Link
												to="/adoption-board"
												className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 hover:bg-[#f5f0e8] hover:border-[#e8d3a9] transition-all duration-200"
											>
												<div className="flex items-center">
													<div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-3">
														<FaPaw className="text-orange-600 text-lg" />
													</div>
													<span className="font-medium text-gray-800">
														Adoption Board
													</span>
												</div>
												<FaArrowRight className="text-gray-400" />
											</Link>
											<Link
												to="/login"
												className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 hover:bg-[#f5f0e8] hover:border-[#e8d3a9] transition-all duration-200"
											>
												<div className="flex items-center">
													<div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
														<FaUserShield className="text-blue-600 text-lg" />
													</div>
													<span className="font-medium text-gray-800">
														Login
													</span>
												</div>
												<FaArrowRight className="text-gray-400" />
											</Link>
										</>
									)}

									{/* Marshal Links */}
									{role === "marshal" && (
										<>
											<Link
												to="/adoption-board"
												className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 hover:bg-[#f5f0e8] hover:border-[#e8d3a9] transition-all duration-200"
											>
												<div className="flex items-center">
													<div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-3">
														<FaPaw className="text-orange-600 text-lg" />
													</div>
													<span className="font-medium text-gray-800">
														Adoption Board
													</span>
												</div>
												<FaArrowRight className="text-gray-400" />
											</Link>
											<Link
												to="/donate"
												className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 hover:bg-[#f5f0e8] hover:border-[#e8d3a9] transition-all duration-200"
											>
												<div className="flex items-center">
													<div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
														<FaDonate className="text-red-600 text-lg" />
													</div>
													<span className="font-medium text-gray-800">
														Donate & Support
													</span>
												</div>
												<FaArrowRight className="text-gray-400" />
											</Link>
											<Link
												to="/walkdogs"
												className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 hover:bg-[#f5f0e8] hover:border-[#e8d3a9] transition-all duration-200"
											>
												<div className="flex items-center">
													<div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
														<FaWalking className="text-yellow-600 text-lg" />
													</div>
													<span className="font-medium text-gray-800">
														Walk Dogs
													</span>
												</div>
												<FaArrowRight className="text-gray-400" />
											</Link>
										</>
									)}

									{/* User Links */}
									{role === "user" && (
										<>
											<Link
												to="/marshal-application"
												className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 hover:bg-[#f5f0e8] hover:border-[#e8d3a9] transition-all duration-200"
											>
												<div className="flex items-center">
													<div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
														<FaUserShield className="text-blue-600 text-lg" />
													</div>
													<span className="font-medium text-gray-800">
														Apply for Marshal
													</span>
												</div>
												<FaArrowRight className="text-gray-400" />
											</Link>
											<Link
												to="/adoption-board"
												className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 hover:bg-[#f5f0e8] hover:border-[#e8d3a9] transition-all duration-200"
											>
												<div className="flex items-center">
													<div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-3">
														<FaPaw className="text-orange-600 text-lg" />
													</div>
													<span className="font-medium text-gray-800">
														Adoption Board
													</span>
												</div>
												<FaArrowRight className="text-gray-400" />
											</Link>
											<Link
												to="/mywalks"
												className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 hover:bg-[#f5f0e8] hover:border-[#e8d3a9] transition-all duration-200"
											>
												<div className="flex items-center">
													<div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
														<FaWalking className="text-yellow-600 text-lg" />
													</div>
													<span className="font-medium text-gray-800">
														My Walks
													</span>
												</div>
												<FaArrowRight className="text-gray-400" />
											</Link>
											<Link
												to="/donate"
												className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 hover:bg-[#f5f0e8] hover:border-[#e8d3a9] transition-all duration-200"
											>
												<div className="flex items-center">
													<div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
														<FaDonate className="text-red-600 text-lg" />
													</div>
													<span className="font-medium text-gray-800">
														Donate & Support
													</span>
												</div>
												<FaArrowRight className="text-gray-400" />
											</Link>
										</>
									)}
								</div>
							</div>
						</div>

						{/* Upcoming Walks Section */}
						<div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
							<div className="bg-[#e8d3a9] px-6 py-4 border-b border-gray-200">
								<h3 className="text-xl font-bold text-[#8c1d35] flex items-center">
									<FaCalendarAlt className="mr-2" /> Upcoming Walks
								</h3>
							</div>
							<div className="p-6">
								{loading ? (
									<div className="flex justify-center items-center h-40">
										<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8c1d35]"></div>
									</div>
								) : walks.length > 0 ? (
									<div className="space-y-4">
										{walks
											.filter((walk) => walk.walker && walk.walker.length > 0)
											.slice(0, 3)
											.map((walk) => (
												<div
													key={walk._id}
													className="bg-[#f9f6f0] rounded-lg p-4 border border-gray-100"
												>
													<div className="flex items-start">
														<div className="bg-[#f5b82e] rounded-full p-2 mr-3">
															<FaWalking className="text-white text-lg" />
														</div>
														<div>
															<div className="flex items-center">
																<span className="font-semibold text-gray-800">
																	{formatDate(walk.date)}
																</span>
																<span className="mx-2 text-gray-400">•</span>
																<span className="text-gray-600">
																	{formatTime(walk.date)}
																</span>
															</div>
															{(role === "admin" || role === "marshal") && (
																<p className="text-sm text-gray-600 mt-1">
																	Walker:{" "}
																	<span className="font-medium">
																		{walk.walker[0].firstName}{" "}
																		{walk.walker[0].lastName}
																	</span>
																</p>
															)}
															{walk.dogId && (
																<p className="text-sm text-gray-600 mt-1">
																	Dog:{" "}
																	<span className="font-medium">
																		{walk.dogId.name}
																	</span>
																</p>
															)}
														</div>
													</div>
												</div>
											))}

										{walks.filter(
											(walk) => walk.walker && walk.walker.length > 0
										).length >= 2 && (
											<Link
												to={role === "user" ? "/mywalks" : "/scheduledwalk"}
												className="inline-flex items-center text-[#8c1d35] font-medium hover:text-[#6b1528] mt-2"
											>
												View all walks <FaArrowRight className="ml-1 text-sm" />
											</Link>
										)}
									</div>
								) : (
									<div className="text-center py-10">
										<FaCalendarAlt className="mx-auto text-gray-300 text-4xl mb-3" />
										<p className="text-gray-500">
											No upcoming walks available.
										</p>
										<Link
											to="/walkdogs"
											className="inline-flex items-center text-[#8c1d35] font-medium hover:text-[#6b1528] mt-4"
										>
											Schedule a walk <FaArrowRight className="ml-1 text-sm" />
										</Link>
									</div>
								)}
							</div>
						</div>

						{/* Past Walks Section */}
						<div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
							<div className="bg-[#e8d3a9] px-6 py-4 border-b border-gray-200">
								<h3 className="text-xl font-bold text-[#8c1d35] flex items-center">
									<FaHistory className="mr-2" /> Past Walks
								</h3>
							</div>
							<div className="p-6">
								<div className="text-center py-10">
									<FaHistory className="mx-auto text-gray-300 text-4xl mb-3" />
									<p className="text-gray-500 mb-2">Coming Soon...</p>
									<p className="text-sm text-gray-400">
										We're working on a feature to track your past walks and
										achievements.
									</p>
								</div>
							</div>
						</div>

						{/* Management Section */}
						<div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 md:col-span-2 lg:col-span-3">
							<div className="bg-[#e8d3a9] px-6 py-4 border-b border-gray-200">
								<h3 className="text-xl font-bold text-[#8c1d35] flex items-center">
									<FaCogs className="mr-2" /> Notifications
								</h3>
							</div>
							<div className="p-6"></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
