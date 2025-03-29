"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import api from "../../api/axios";
import {
	FaUserCircle,
	FaPen,
	FaPhone,
	FaUserTag,
	FaDog,
	FaCalendarAlt,
	FaCalendarCheck,
	FaSpinner,
	FaEnvelope,
	FaMapMarkerAlt,
	FaBirthdayCake,
	FaMedal,
	FaHistory,
} from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const MyProfile = () => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [walks, setWalks] = useState({ upcoming: [], past: [] });
	const [activeTab, setActiveTab] = useState("profile");
	const fileInputRef = useRef(null);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				setLoading(true);
				const response = await api.get("/users/myprofile");
				console.log("Profile data:", response.data);
				if (response.data && response.data.user) {
					setUser(response.data.user);
					setWalks({
						upcoming: response.data.user.dogsWalked || [],
						past: response.data.user.completedWalks || [],
					});
				} else {
					throw new Error("Invalid user data received");
				}
			} catch (err) {
				console.error("Failed to fetch profile:", err);
				setError("Failed to fetch profile. Please log in again.");
			} finally {
				setLoading(false);
			}
		};

		fetchProfile();
	}, []);

	const handlePictureChange = async (event) => {
		const file = event.target.files[0];
		if (!file) return;

		const formData = new FormData();
		formData.append("picture", file);

		try {
			toast.info("Uploading profile picture...");
			const response = await api.put("/users/updateProfilePicture", formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});

			setUser((prev) => ({ ...prev, picture: response.data.picture }));

			if (response.data.token) {
				localStorage.setItem("token", response.data.token);
			}

			toast.success("Profile picture updated successfully!");

			// Force reload to ensure Navbar reflects the change
			window.location.reload();
		} catch (error) {
			console.error("Failed to update profile picture:", error);
			toast.error("Failed to update profile picture.");
		}
	};

	const handleLogout = () => {
		localStorage.removeItem("token");
		toast.success("You have been logged out successfully!");
		setTimeout(() => {
			window.location.href = "/login";
		}, 1500);
	};

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

	if (loading) {
		return (
			<div className="flex items-center justify-center h-screen bg-[#f8f5f0]">
				<div className="text-center">
					<FaSpinner className="animate-spin text-[#8c1d35] text-4xl mx-auto mb-4" />
					<p className="text-lg text-gray-700">Loading your profile...</p>
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
						onClick={() => navigate("/login")}
						className="bg-[#8c1d35] text-white px-4 py-2 rounded-lg hover:bg-[#7c1025] transition-colors"
					>
						Go to Login
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
						<h1 className="text-2xl font-bold text-white flex items-center">
							<FaUserCircle className="mr-3" /> My Profile
						</h1>
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
							{user.role !== "admin" && (
								<>
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
								</>
							)}
						</div>
					</div>

					{/* Content */}
					<div className="p-6">
						{activeTab === "profile" && (
							<div className="flex flex-col lg:flex-row gap-8">
								{/* Profile Picture Section */}
								<div className="lg:w-1/3">
									<div className="relative mx-auto lg:mx-0 w-64 h-64">
										{user.picture ? (
											<img
												src={user.picture || "/placeholder.svg"}
												alt="Profile"
												className="w-64 h-64 object-cover rounded-full shadow-md border-4 border-[#e8d3a9]"
												onClick={() => fileInputRef.current.click()}
											/>
										) : (
											<div
												className="w-64 h-64 rounded-full bg-[#e8d3a9] flex items-center justify-center cursor-pointer"
												onClick={() => fileInputRef.current.click()}
											>
												<FaUserCircle className="w-48 h-48 text-[#8c1d35]" />
											</div>
										)}

										{/* Points Badge */}
										<div className="absolute -top-2 -right-2">
											<div className="relative">
												<svg
													viewBox="0 0 24 24"
													className="w-16 h-16 drop-shadow-lg"
													fill={getPointsColor(user.userPoints || 0)}
												>
													<path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
												</svg>
												<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-lg font-bold">
													{user.userPoints || 0}
												</div>
											</div>
										</div>

										{/* Change Picture Button */}
										<input
											type="file"
											ref={fileInputRef}
											onChange={handlePictureChange}
											accept="image/*"
											className="hidden"
										/>
										<div
											className="absolute bottom-3 right-3 bg-[#8c1d35] text-white p-3 rounded-full cursor-pointer hover:bg-[#7c1025] transition-colors shadow-md"
											onClick={() => fileInputRef.current.click()}
											title="Change profile picture"
										>
											<FaPen size={16} />
										</div>
									</div>

									{/* Points Info */}
									<div className="mt-6 bg-[#f8f5f0] rounded-lg p-4 border border-[#e8d3a9]">
										<h3 className="text-lg font-semibold text-[#8c1d35] flex items-center mb-3">
											<FaMedal className="mr-2" /> Points & Achievements
										</h3>
										<div className="flex items-center justify-between mb-2">
											<span className="text-gray-700">Total Points:</span>
											<span className="font-bold text-[#8c1d35]">
												{user.userPoints || 0}
											</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-gray-700">Rank:</span>
											<span
												className="px-2 py-1 rounded-full text-sm font-medium"
												style={{
													backgroundColor: getPointsColor(user.userPoints || 0),
													color: "white",
												}}
											>
												{getPointsBadge(user.userPoints || 0)}
											</span>
										</div>
									</div>
								</div>

								{/* Profile Details Section */}
								<div className="lg:w-2/3">
									<div className="bg-white rounded-lg border border-[#e8d3a9] shadow-sm p-6">
										<h2 className="text-xl font-bold text-[#8c1d35] mb-4">
											Personal Information
										</h2>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											<div className="space-y-4">
												<div>
													<label className="block text-sm font-medium text-gray-500 mb-1">
														Full Name
													</label>
													<p className="text-lg font-medium text-[#8c1d35]">
														{user.firstName} {user.lastName}
													</p>
												</div>

												<div>
													<label className="block text-sm font-medium text-gray-500 mb-1">
														<FaEnvelope className="inline mr-1" /> Email
													</label>
													<p className="text-gray-800">{user.email}</p>
												</div>

												<div>
													<label className="block text-sm font-medium text-gray-500 mb-1">
														<FaUserTag className="inline mr-1" /> Role
													</label>
													<p className="text-gray-800 capitalize">
														{user.role}
													</p>
												</div>
											</div>

											<div className="space-y-4">
												{user.phone && (
													<div>
														<label className="block text-sm font-medium text-gray-500 mb-1">
															<FaPhone className="inline mr-1" /> Phone
														</label>
														<p className="text-gray-800">{user.phone}</p>
													</div>
												)}

												{user.dob && (
													<div>
														<label className="block text-sm font-medium text-gray-500 mb-1">
															<FaBirthdayCake className="inline mr-1" /> Date of
															Birth
														</label>
														<p className="text-gray-800">
															{new Date(user.dob).toLocaleDateString()}
														</p>
													</div>
												)}

												{user.location && (
													<div>
														<label className="block text-sm font-medium text-gray-500 mb-1">
															<FaMapMarkerAlt className="inline mr-1" />{" "}
															Location
														</label>
														<p className="text-gray-800">{user.location}</p>
													</div>
												)}
											</div>
										</div>

										{/* Dogs Walked Section */}
										{user.role !== "admin" && (
											<div className="mt-8">
												<h3 className="text-lg font-semibold text-[#8c1d35] flex items-center mb-3">
													<FaDog className="mr-2" /> Dogs Walked
												</h3>
												<div className="flex flex-wrap gap-2">
													{(() => {
														const seen = new Set();
														const allDogs = walks.past
															.flatMap((walk) => walk.dogId || [])
															.filter((dog) => {
																if (!dog || seen.has(dog._id)) return false;
																seen.add(dog._id);
																return true;
															});

														return allDogs.length > 0 ? (
															allDogs.map((dog) => (
																<span
																	key={dog._id}
																	onClick={() => navigate(`/dog/${dog._id}`)}
																	className="bg-[#e8d3a9] text-[#8c1d35] px-3 py-1 rounded-lg cursor-pointer hover:bg-[#d9c59a] transition-colors font-medium"
																>
																	{dog.name || "Unknown Dog"}
																</span>
															))
														) : (
															<p className="text-gray-500 italic">
																No dogs walked yet.
															</p>
														);
													})()}
												</div>
											</div>
										)}

										{/* Logout Button */}
										<div className="mt-8 flex justify-end">
											<button
												onClick={handleLogout}
												className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
											>
												<FiLogOut /> Logout
											</button>
										</div>
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

								{walks.upcoming.length > 0 ? (
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
										{walks.upcoming.map((walk) => (
											<div
												key={walk._id}
												className="bg-white border border-[#e8d3a9] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200"
											>
												<div className="flex justify-between items-start mb-3">
													<div className="bg-[#e8d3a9] text-[#8c1d35] px-3 py-1 rounded-lg font-medium text-sm">
														Upcoming
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

													<div className="flex items-center">
														<FaUserTag className="text-[#8c1d35] mr-2" />
														<span className="text-gray-800">
															Marshal: {walk.marshal?.firstName || "Unassigned"}
														</span>
													</div>

													{walk.dogId && (
														<div className="flex items-center">
															<FaDog className="text-[#8c1d35] mr-2" />
															<span className="text-gray-800">
																Dog: {walk.dogId.name || "Unspecified"}
															</span>
														</div>
													)}

													{walk.location && (
														<div className="flex items-center">
															<FaMapMarkerAlt className="text-[#8c1d35] mr-2" />
															<span className="text-gray-800">
																{walk.location}
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
										<p className="text-gray-700 mb-4">
											You don't have any upcoming walks scheduled.
										</p>
										<button
											onClick={() => navigate("/schedule-walk")}
											className="bg-[#8c1d35] text-white px-4 py-2 rounded-lg hover:bg-[#7c1025] transition-colors"
										>
											Schedule a Walk
										</button>
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

								{walks.past.length > 0 ? (
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
										{walks.past.map((walk) => (
											<div
												key={walk._id}
												className="bg-white border border-[#e8d3a9] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200"
											>
												<div className="flex justify-between items-start mb-3">
													<div className="bg-green-100 text-green-800 px-3 py-1 rounded-lg font-medium text-sm">
														Completed
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

													<div className="flex items-center">
														<FaUserTag className="text-[#8c1d35] mr-2" />
														<span className="text-gray-800">
															Marshal: {walk.marshalId?.firstName || "N/A"}
														</span>
													</div>

													<div className="flex items-start">
														<FaDog className="text-[#8c1d35] mr-2 mt-1" />
														<span className="text-gray-800">
															{walk.dogId && walk.dogId.length > 0
																? walk.dogId.map((dog) => dog.name).join(", ")
																: "No dogs recorded"}
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
										<p className="text-gray-700">
											You haven't completed any walks yet.
										</p>
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

export default MyProfile;