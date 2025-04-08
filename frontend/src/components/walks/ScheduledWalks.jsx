import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {
	FaUserCircle,
	FaCalendarAlt,
	FaCheckCircle,
	FaHistory,
	FaMapMarkerAlt,
	FaUserClock,
	FaPaw,
	FaArrowRight,
} from "react-icons/fa";

const ScheduledWalks = () => {
	const [walksWithUsers, setWalksWithUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [refresh, setRefresh] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchWalks = async () => {
			try {
				setLoading(true);
				const response = await axios.get(
					`${import.meta.env.VITE_BACKEND_URL}/scheduledWalks`,
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem("token")}`,
						},
					}
				);

				// Filter walks that have at least one walker
				const filteredWalks = response.data.filter(
					(walk) => walk.walker.length > 0
				);

				// Sort walks by date (most recent first)
				filteredWalks.sort((a, b) => new Date(a.date) - new Date(b.date));

				setWalksWithUsers(filteredWalks);
				setLoading(false);
			} catch (error) {
				console.error("Error fetching walks:", error);
				setError("Failed to load scheduled walks. Please try again.");
				setLoading(false);
			}
		};

		fetchWalks();
	}, [refresh]);

	// Trigger a re-fetch
	const triggerRefresh = () => {
		setRefresh((prev) => !prev);
	};

	// Format date for better display
	const formatDate = (dateString) => {
		const options = {
			weekday: "short",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		};
		return new Date(dateString).toLocaleDateString("en-US", options);
	};

	// Check if walk is today
	const isToday = (dateString) => {
		const today = new Date().toLocaleDateString("en-US", {
			timeZone: "America/Chicago",
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		});
		const walkDate = new Date(dateString).toLocaleDateString("en-US", {
			timeZone: "America/Chicago",
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		});
		return today === walkDate;
	};

	// Group walks by date
	const groupWalksByDate = () => {
		const groups = {};
		walksWithUsers.forEach((walk) => {
			const localDateKey = new Date(walk.date).toLocaleDateString("en-US", {
				timeZone: "America/Chicago",
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
			});
			groups[localDateKey] = groups[localDateKey] || [];
			groups[localDateKey].push(walk);
		});
		return groups;
	};

	const walkGroups = groupWalksByDate();

	return (
		<div className="min-h-screen bg-[#f8f5f0]">
			{/* Header */}
			<div className="bg-[#8c1d35] text-white py-8 px-4 mb-8">
				<div className="max-w-7xl mx-auto">
					<h1 className="text-4xl font-bold text-center mb-2">
						Scheduled Walks
					</h1>
					<p className="text-center text-lg max-w-3xl mx-auto opacity-90">
						View all upcoming dog walks and their assigned walkers
					</p>
				</div>
			</div>

			<div className="container mx-auto px-4 pb-12">
				{/* Action Buttons */}
				<div className="flex flex-wrap gap-4 mb-8">
					<button
						className="flex items-center gap-2 bg-[#8c1d35] text-white px-5 py-3 rounded-lg shadow hover:bg-[#7c1025] transition-colors font-medium"
						onClick={() => navigate("/checkin")}
					>
						<FaCheckCircle />
						Check In
					</button>
					<button
						className="flex items-center gap-2 bg-[#f5b82e] text-[#8c1d35] px-5 py-3 rounded-lg shadow hover:bg-[#e5a81e] transition-colors font-medium"
						onClick={() => navigate("/completedwalks")}
					>
						<FaHistory />
						Past Walks
					</button>
					<button
						className="flex items-center gap-2 bg-white border border-[#8c1d35] text-[#8c1d35] px-5 py-3 rounded-lg shadow hover:bg-[#f8f5f0] transition-colors font-medium ml-auto"
						onClick={triggerRefresh}
					>
						<FaArrowRight className="rotate-45" />
						Refresh
					</button>
				</div>

				{/* Loading and Error States */}
				{loading ? (
					<div className="flex justify-center items-center h-64">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8c1d35]"></div>
					</div>
				) : error ? (
					<div className="bg-white rounded-xl shadow-md p-8 text-center">
						<div className="text-red-500 mb-4 text-xl">{error}</div>
						<button
							className="bg-[#8c1d35] text-white px-4 py-2 rounded-lg"
							onClick={triggerRefresh}
						>
							Try Again
						</button>
					</div>
				) : walksWithUsers.length === 0 ? (
					<div className="bg-white rounded-xl shadow-md p-8 text-center">
						<FaPaw className="text-[#e8d3a9] text-5xl mx-auto mb-4" />
						<h2 className="text-2xl font-bold text-[#8c1d35] mb-2">
							No Scheduled Walks
						</h2>
						<p className="text-gray-600 mb-4">
							There are no walks scheduled at this time.
						</p>
						<button
							className="bg-[#8c1d35] text-white px-4 py-2 rounded-lg"
							onClick={() => navigate("/walkdogs")}
						>
							Schedule a Walk
						</button>
					</div>
				) : (
					<>
						{/* Walks by Date */}
						{Object.keys(walkGroups)
							.sort()
							.map((date) => (
								<div key={date} className="mb-8">
									{/* Date Header */}
									<div className="bg-[#e8d3a9] rounded-xl p-4 mb-4 flex items-center">
										<FaCalendarAlt className="text-[#8c1d35] text-xl mr-3" />
										<h2 className="text-xl font-semibold text-[#8c1d35]">
											{new Date(date).toLocaleDateString("en-US", {
												timeZone: "America/Chicago",
												weekday: "long",
												year: "numeric",
												month: "long",
												day: "numeric",
											})}
											{isToday(date) && (
												<span className="ml-2 bg-[#8c1d35] text-white text-sm px-2 py-1 rounded-full">
													Today
												</span>
											)}
										</h2>
									</div>

									{/* Walks Grid */}
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
										{walkGroups[date].map((walk) => (
											<div
												key={walk._id}
												className="bg-white rounded-xl shadow-md overflow-hidden border border-[#e8d3a9] hover:shadow-lg transition"
											>
												{/* Card Header */}
												<div className="bg-[#e8d3a9] px-5 py-3 border-b border-[#d9c59a]">
													<div className="flex justify-between items-center">
														<div className="flex items-center">
															<FaUserClock className="text-[#8c1d35] mr-2" />
															<span className="text-[#8c1d35] font-bold">
																{new Date(walk.date).toLocaleTimeString(
																	"en-US",
																	{
																		timeZone: "America/Chicago",
																		hour: "2-digit",
																		minute: "2-digit",
																	}
																)}
															</span>
														</div>
														{walk.location && (
															<div className="flex items-center text-[#8c1d35] text-sm">
																<FaMapMarkerAlt className="mr-1" />
																<span>{walk.location}</span>
															</div>
														)}
													</div>
												</div>

												{/* Card Body */}
												<div className="p-5">
													{/* Marshal Info (if available) */}
													{Array.isArray(walk.marshal) &&
														walk.marshal.length > 0 && (
															<div className="mb-4 bg-[#f8f5f0] p-3 rounded-lg">
																<p className="text-sm text-gray-500 mb-1">
																	Marshal(s)
																</p>
																<div className="flex flex-wrap gap-3">
																	{walk.marshal.map((marshal) => (
																		<div
																			key={marshal._id}
																			className="flex items-center"
																		>
																			{marshal.picture ? (
																				<img
																					src={marshal.picture}
																					alt="Marshal"
																					className="w-8 h-8 rounded-full mr-2 border-2 border-[#8c1d35]"
																				/>
																			) : (
																				<div className="w-8 h-8 rounded-full bg-[#8c1d35] text-white flex items-center justify-center mr-2">
																					<FaUserCircle />
																				</div>
																			)}
																			<span className="font-medium text-[#8c1d35]">
																				{marshal.firstName} {marshal.lastName}
																			</span>
																		</div>
																	))}
																</div>
															</div>
														)}

													{/* Walkers List */}
													<div>
														<div className="flex items-center mb-3">
															<FaPaw className="text-[#8c1d35] mr-2" />
															<h3 className="font-bold text-[#8c1d35]">
																Walkers ({walk.walker.length})
															</h3>
														</div>
														<ul className="space-y-2">
															{walk.walker.map((user) => (
																<li
																	key={user._id}
																	className="bg-[#f8f5f0] px-4 py-3 rounded-lg flex items-center gap-3 hover:bg-[#e8d3a9] transition-colors"
																>
																	{user.picture ? (
																		<img
																			src={user.picture || "/placeholder.svg"}
																			alt="Profile"
																			className="w-10 h-10 rounded-full border-2 border-white"
																		/>
																	) : (
																		<div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
																			<FaUserCircle className="w-6 h-6" />
																		</div>
																	)}
																	<div className="flex-grow">
																		<Link
																			to={`/user/${user._id}`}
																			className="font-medium text-[#8c1d35] hover:underline"
																		>
																			{user.firstName} {user.lastName}
																		</Link>
																		{user.email && (
																			<p className="text-xs text-gray-500">
																				{user.email}
																			</p>
																		)}
																	</div>
																	{isToday(walk.date) && (
																		<Link
																			to="/checkin"
																			className="text-sm bg-[#8c1d35] text-white px-3 py-1 rounded-lg hover:bg-[#7c1025] transition-colors"
																		>
																			Check In
																		</Link>
																	)}
																</li>
															))}
														</ul>
													</div>

													{/* Dogs Info (if available) */}
													{walk.dogId && walk.dogId.length > 0 && (
														<div className="mt-4 pt-4 border-t border-gray-100">
															<div className="flex items-center mb-3">
																<FaPaw className="text-[#f5b82e] mr-2" />
																<h3 className="font-bold text-[#8c1d35]">
																	Assigned Dogs
																</h3>
															</div>
															<div className="flex flex-wrap gap-2">
																{walk.dogId.map((dog) => (
																	<span
																		key={dog._id}
																		className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#e8d3a9] text-[#8c1d35]"
																	>
																		{dog.name}
																	</span>
																))}
															</div>
														</div>
													)}
												</div>

												{/* Card Footer */}
												{isToday(walk.date) && (
													<div className="bg-[#f8f5f0] px-5 py-3 border-t border-[#e8d3a9] flex justify-end">
														<Link
															to="/checkin"
															className="flex items-center gap-2 text-[#8c1d35] font-medium hover:underline"
														>
															Go to Check-in{" "}
															<FaArrowRight className="text-sm" />
														</Link>
													</div>
												)}
											</div>
										))}
									</div>
								</div>
							))}
					</>
				)}
			</div>
		</div>
	);
};

export default ScheduledWalks;
