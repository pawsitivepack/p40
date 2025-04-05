import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import {
	FaUserCircle,
	FaPhone,
	FaUserTag,
	FaCalendarAlt,
	FaCalendarCheck,
	FaSpinner,
	FaEnvelope,
	FaHistory,
	FaDog,
	FaMapMarkerAlt,
	FaClock,
	FaMedal,
	FaArrowLeft,
} from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";

const ViewUserDetails = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [user, setUser] = useState(null);
	const [walks, setWalks] = useState([]);
	const [upcomingWalks, setUpcomingWalks] = useState([]);
	const [completedWalks, setCompletedWalks] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [activeTab, setActiveTab] = useState("profile");

	useEffect(() => {
		const fetchUserDetails = async () => {
			try {
				setLoading(true);
				const response = await api.get(`/users/viewUser/${id}`);
				setUser(response.data.user);
				setWalks(response.data.walks || []);
				setUpcomingWalks(response.data.upcomingWalks || []);
				setCompletedWalks(response.data.pastWalks || []);
			} catch (err) {
				console.error("Failed to fetch user details:", err);
				setError("Failed to fetch user details.");
			} finally {
				setLoading(false);
			}
		};

		fetchUserDetails();
	}, [id]);

	// Get points color based on points value
	const getPointsColor = (points) => {
		if (points === 0) return "#ef4444"; // Red
		if (points <= 20) return "#f97316"; // Orange
		if (points <= 50) return "#facc15"; // Yellow
		if (points <= 100) return "#22c55e"; // Green
		return "#3b82f6"; // Blue
	};

	// Get badge based on points
	const getPointsBadge = (points) => {
		if (points === 0) return "Newcomer";
		if (points <= 20) return "Beginner";
		if (points <= 50) return "Regular";
		if (points <= 100) return "Expert";
		return "Master";
	};

	// Removed filtering logic as upcomingWalks and completedWalks are now set from API response

	if (loading) {
		return (
			<div className="flex items-center justify-center h-screen bg-[#f8f5f0]">
				<div className="text-center">
					<FaSpinner className="animate-spin text-[#8c1d35] text-4xl mx-auto mb-4" />
					<p className="text-lg text-gray-700">Loading user details...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center h-screen bg-[#f8f5f0]">
				<div className="bg-red-100 text-red-700 p-6 rounded-lg max-w-md text-center">
					<p className="text-xl mb-4">{error}</p>
					<button
						onClick={() => navigate(-1)}
						className="bg-[#8c1d35] text-white px-4 py-2 rounded-lg hover:bg-[#7c1025] transition-colors"
					>
						Go Back
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#f8f5f0] py-8 px-4">
			<div className="max-w-6xl mx-auto">
				<div className="bg-white rounded-xl shadow-md overflow-hidden">
					{/* Header */}
					<div className="bg-[#8c1d35] px-6 py-4">
						<div className="flex justify-between items-center">
							<h1 className="text-2xl font-bold text-white flex items-center">
								<FaUserCircle className="mr-3" /> {user?.firstName}{" "}
								{user?.lastName}'s Profile
							</h1>
							<button
								onClick={() => navigate(-1)}
								className="bg-white text-[#8c1d35] px-3 py-1 rounded-lg flex items-center hover:bg-[#f8f5f0] transition-colors"
							>
								<FaArrowLeft className="mr-2" /> Back
							</button>
						</div>
					</div>

					{/* Tabs */}
					<div className="bg-[#f8f5f0] border-b border-[#e8d3a9] px-6 py-2">
						<div className="flex space-x-4">
							<button
								onClick={() => setActiveTab("profile")}
								className={`px-4 py-2 rounded-lg font-medium transition-colors ${
									activeTab === "profile"
										? "bg-[#8c1d35] text-white"
										: "bg-white text-[#8c1d35] hover:bg-[#e8d3a9]/50"
								}`}
							>
								Profile
							</button>
							<button
								onClick={() => setActiveTab("upcoming")}
								className={`px-4 py-2 rounded-lg font-medium transition-colors ${
									activeTab === "upcoming"
										? "bg-[#8c1d35] text-white"
										: "bg-white text-[#8c1d35] hover:bg-[#e8d3a9]/50"
								}`}
							>
								Upcoming Walks
							</button>
							<button
								onClick={() => setActiveTab("completed")}
								className={`px-4 py-2 rounded-lg font-medium transition-colors ${
									activeTab === "completed"
										? "bg-[#8c1d35] text-white"
										: "bg-white text-[#8c1d35] hover:bg-[#e8d3a9]/50"
								}`}
							>
								Completed Walks
							</button>
						</div>
					</div>

					{/* Content */}
					<div className="p-6">
						{/* Profile Picture - Always Visible */}
						<div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-6">
							<div className="relative">
								{user?.picture ? (
									<img
										src={user.picture || "/placeholder.svg"}
										alt="Profile"
										className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-full shadow-md border-4 border-[#e8d3a9]"
									/>
								) : (
									<div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-[#e8d3a9] flex items-center justify-center">
										<FaUserCircle className="w-24 h-24 md:w-28 md:h-28 text-[#8c1d35]" />
									</div>
								)}

								{/* Points Badge */}
								<div className="absolute -top-2 -right-2">
									<div className="relative">
										<svg
											viewBox="0 0 24 24"
											className="w-14 h-14 drop-shadow-lg"
											fill={getPointsColor(user?.userPoints || 0)}
										>
											<path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
										</svg>
										<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-base font-bold">
											{user?.userPoints || 0}
										</div>
									</div>
								</div>
							</div>

							<div>
								<h2 className="text-xl font-bold text-[#8c1d35]">
									{user?.firstName} {user?.lastName}
								</h2>
								<p className="text-gray-700 flex items-center mt-1">
									<FaUserTag className="mr-1 text-[#8c1d35]" />
									<span className="capitalize">{user?.role || "User"}</span>
								</p>
								<p className="text-gray-700 flex items-center mt-1">
									<FaEnvelope className="mr-1 text-[#8c1d35]" /> {user?.email}
								</p>
								{user?.phone && (
									<p className="text-gray-700 flex items-center mt-1">
										<FaPhone className="mr-1 text-[#8c1d35]" /> {user?.phone}
									</p>
								)}
							</div>
						</div>

						{activeTab === "profile" && (
							<div className="flex flex-col lg:flex-row gap-8">
								{/* Profile Details Section */}
								<div className="lg:w-1/3">
									{/* Points Info */}
									<div className="bg-[#f8f5f0] rounded-lg p-4 border border-[#e8d3a9]">
										<h3 className="text-lg font-semibold text-[#8c1d35] flex items-center mb-3">
											<FaMedal className="mr-2" /> Points & Achievements
										</h3>
										<div className="flex items-center justify-between mb-2">
											<span className="text-gray-700">Total Points:</span>
											<span className="font-bold text-[#8c1d35]">
												{user?.userPoints || 0}
											</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-gray-700">Rank:</span>
											<span
												className="px-2 py-1 rounded-full text-sm font-medium"
												style={{
													backgroundColor: getPointsColor(
														user?.userPoints || 0
													),
													color: "white",
												}}
											>
												{getPointsBadge(user?.userPoints || 0)}
											</span>
										</div>
									</div>

									{/* Account Info */}
									<div className="mt-4 bg-[#f8f5f0] rounded-lg p-4 border border-[#e8d3a9]">
										<h3 className="text-lg font-semibold text-[#8c1d35] flex items-center mb-3">
											<FaHistory className="mr-2" /> Account Info
										</h3>
										<div className="space-y-2">
											<div className="flex items-center justify-between">
												<span className="text-gray-700">Last Login:</span>
												<span className="text-gray-900">
													{user?.lastLogin
														? formatDistanceToNow(new Date(user.lastLogin), {
																addSuffix: true,
														  })
														: user?.createdAt
														? formatDistanceToNow(new Date(user.createdAt), {
																addSuffix: true,
														  })
														: "Never"}
												</span>
											</div>
											<div className="flex items-center justify-between">
												<span className="text-gray-700">Account Created:</span>
												<span className="text-gray-900">
													{new Date(user?.createdAt).toLocaleDateString()}
												</span>
											</div>
										</div>
									</div>
								</div>

								{/* Walk Statistics */}
								<div className="lg:w-2/3">
									<div className="bg-white rounded-lg border border-[#e8d3a9] shadow-sm p-6">
										<h2 className="text-xl font-bold text-[#8c1d35] mb-4">
											Walk Statistics
										</h2>

										<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
											<div className="bg-[#f8f5f0] rounded-lg p-4 text-center border border-[#e8d3a9]">
												<div className="text-3xl font-bold text-[#8c1d35]">
													{upcomingWalks.length}
												</div>
												<div className="text-gray-700">Upcoming Walks</div>
											</div>

											<div className="bg-[#f8f5f0] rounded-lg p-4 text-center border border-[#e8d3a9]">
												<div className="text-3xl font-bold text-[#8c1d35]">
													{completedWalks.length}
												</div>
												<div className="text-gray-700">Completed Walks</div>
											</div>

											<div className="bg-[#f8f5f0] rounded-lg p-4 text-center border border-[#e8d3a9]">
												<div className="text-3xl font-bold text-[#8c1d35]">
													{(() => {
														// Count unique dogs walked
														const dogIds = new Set();
														completedWalks.forEach((walk) => {
															if (walk.dogId && Array.isArray(walk.dogId)) {
																walk.dogId.forEach((dog) => {
																	if (typeof dog === "object" && dog._id) {
																		dogIds.add(dog._id);
																	} else if (typeof dog === "string") {
																		dogIds.add(dog);
																	}
																});
															}
														});
														return dogIds.size;
													})()}
												</div>
												<div className="text-gray-700">Dogs Walked</div>
											</div>
										</div>

										{/* Additional user information can go here */}
										{user?.location && (
											<div className="mt-4 p-4 bg-[#f8f5f0] rounded-lg border border-[#e8d3a9]">
												<div className="flex items-center">
													<FaMapMarkerAlt className="text-[#8c1d35] mr-2" />
													<span className="text-gray-800 font-medium">
														Location: {user.location}
													</span>
												</div>
											</div>
										)}
									</div>
								</div>
							</div>
						)}

						{/* Upcoming Walks Tab */}
						{activeTab === "upcoming" && (
							<div>
								<div className="flex items-center mb-4">
									<FaCalendarAlt className="text-[#8c1d35] mr-2 text-xl" />
									<h2 className="text-xl font-bold text-[#8c1d35]">
										Upcoming Walks
									</h2>
								</div>

								{upcomingWalks.length > 0 ? (
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
										{upcomingWalks.map((walk, index) => (
											<div
												key={index}
												className="bg-white border border-[#e8d3a9] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200"
											>
												<div className="flex justify-between items-start mb-3">
													<div className="bg-[#e8d3a9] text-[#8c1d35] px-3 py-1 rounded-lg font-medium text-sm capitalize">
														{walk.status || "Scheduled"}
													</div>
													<div className="text-gray-500 text-sm">
														{new Date(walk.date).toLocaleDateString()}
													</div>
												</div>

												<div className="space-y-2">
													<div className="flex items-center">
														<FaCalendarAlt className="text-[#8c1d35] mr-2" />
														<span className="text-gray-800">
															{new Date(walk.date).toLocaleTimeString([], {
																hour: "2-digit",
																minute: "2-digit",
															})}
														</span>
													</div>

													{walk.location && (
														<div className="flex items-center">
															<FaMapMarkerAlt className="text-[#8c1d35] mr-2" />
															<span className="text-gray-800">
																{walk.location}
															</span>
														</div>
													)}

													{walk.duration && (
														<div className="flex items-center">
															<FaClock className="text-[#8c1d35] mr-2" />
															<span className="text-gray-800">
																{walk.duration}
															</span>
														</div>
													)}

													{walk.dogId && (
														<div className="flex items-center">
															<FaDog className="text-[#8c1d35] mr-2" />
															<span className="text-gray-800">
																{Array.isArray(walk.dogId)
																	? walk.dogId
																			.map((dog) =>
																				typeof dog === "object" ? dog.name : dog
																			)
																			.join(", ")
																	: typeof walk.dogId === "object"
																	? walk.dogId.name
																	: walk.dogId}
															</span>
														</div>
													)}
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="bg-[#f8f5f0] rounded-lg p-8 text-center border border-[#e8d3a9]">
										<FaCalendarAlt className="text-[#8c1d35] text-4xl mx-auto mb-3 opacity-50" />
										<p className="text-gray-700">
											No upcoming walks scheduled.
										</p>
									</div>
								)}
							</div>
						)}

						{/* Completed Walks Tab */}
						{activeTab === "completed" && (
							<div>
								<div className="flex items-center mb-4">
									<FaCalendarCheck className="text-[#8c1d35] mr-2 text-xl" />
									<h2 className="text-xl font-bold text-[#8c1d35]">
										Completed Walks
									</h2>
								</div>

								{completedWalks.length > 0 ? (
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
										{completedWalks.map((walk, index) => (
											<div
												key={index}
												className="bg-white border border-[#e8d3a9] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200"
											>
												<div className="flex justify-between items-start mb-3">
													<div className="bg-green-100 text-green-800 px-3 py-1 rounded-lg font-medium text-sm capitalize">
														{walk.status || "Completed"}
													</div>
													<div className="text-gray-500 text-sm">
														{new Date(walk.date).toLocaleDateString()}
													</div>
												</div>

												<div className="space-y-2">
													<div className="flex items-center">
														<FaHistory className="text-[#8c1d35] mr-2" />
														<span className="text-gray-800">
															{new Date(walk.date).toLocaleTimeString([], {
																hour: "2-digit",
																minute: "2-digit",
															})}
														</span>
													</div>

													{walk.location && (
														<div className="flex items-center">
															<FaMapMarkerAlt className="text-[#8c1d35] mr-2" />
															<span className="text-gray-800">
																{walk.location}
															</span>
														</div>
													)}

													<div className="flex items-start">
														<FaDog className="text-[#8c1d35] mr-2 mt-1" />
														<span className="text-gray-800">
															{(() => {
																if (!walk.dogId) return "N/A";

																if (Array.isArray(walk.dogId)) {
																	return (
																		walk.dogId
																			.map((dog) => {
																				if (
																					typeof dog === "object" &&
																					dog.name
																				) {
																					return dog.name;
																				}
																				return dog;
																			})
																			.join(", ") || "N/A"
																	);
																}

																return typeof walk.dogId === "object"
																	? walk.dogId.name
																	: walk.dogId;
															})()}
														</span>
													</div>

													{walk.notes && (
														<div className="mt-2 pt-2 border-t border-gray-200">
															<p className="text-gray-700 text-sm italic">
																{walk.notes}
															</p>
														</div>
													)}
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="bg-[#f8f5f0] rounded-lg p-8 text-center border border-[#e8d3a9]">
										<FaCalendarCheck className="text-[#8c1d35] text-4xl mx-auto mb-3 opacity-50" />
										<p className="text-gray-700">No completed walks yet.</p>
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default ViewUserDetails;
