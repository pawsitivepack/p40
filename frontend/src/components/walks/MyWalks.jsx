"use client";

import { useEffect, useState } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import {
	FaCalendarAlt,
	FaMapMarkerAlt,
	FaUserShield,
	FaClock,
	FaTimes,
	FaPaw,
	FaExclamationTriangle,
	FaArrowRight,
	FaSpinner,
	FaCalendarCheck,
	FaHistory,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const MyWalks = () => {
	const [walks, setWalks] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [activeTab, setActiveTab] = useState("upcoming");

	useEffect(() => {
		const fetchMyWalks = async () => {
			try {
				const token = localStorage.getItem("token");
				if (!token) {
					setError("User is not logged in.");
					setLoading(false);
					return;
				}

				const decoded = jwtDecode(token);
				const userId = decoded.id;

				const response = await api.get(`/completedWalk/upcomingWalks`);
				console.log("Walks from backend:", response.data.map(w => w._id));
				console.log("Walks Data:", response.data);

				// Sort walks by date
				const sortedWalks = response.data.sort(
					(a, b) => new Date(a.date) - new Date(b.date)
				);
				setWalks(sortedWalks);
			} catch (err) {
				console.error("Error fetching walks:", err);
				setError("Failed to load scheduled walks. Please try again later.");
			} finally {
				setLoading(false);
			}
		};

		fetchMyWalks();
	}, []);

	// Cancel walk function
	const handleCancelWalk = async (walkId) => {
		if (!window.confirm("Are you sure you want to cancel this walk?")) return;
	
		try {
			await api.delete(`/completedWalk/cancel/${walkId}`); // ✅ Fixed endpoint
			setWalks((prevWalks) => prevWalks.filter((walk) => walk._id !== walkId));
			toast.success("Walk appointment cancelled successfully!");
		} catch (err) {
			console.error("Error cancelling walk:", err);
			toast.error("Failed to cancel walk.");
		}
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
		const today = new Date();
		const walkDate = new Date(dateString);
		return (
			walkDate.getDate() === today.getDate() &&
			walkDate.getMonth() === today.getMonth() &&
			walkDate.getFullYear() === today.getFullYear()
		);
	};

	// Check if walk is in the next 24 hours
	const isUpcoming = (dateString) => {
		const now = new Date();
		const walkDate = new Date(dateString);
		const diffTime = walkDate - now;
		const diffHours = diffTime / (1000 * 60 * 60);
		return diffHours <= 24 && diffHours > 0;
	};

	// Filter walks based on tab and sort by date
	const filteredWalks = walks
		.filter((walk) => {
			const now = new Date();
			const walkDate = new Date(walk.date);
			const isPast = walkDate < now;

			// Filter by tab (upcoming or past)
			if (activeTab === "upcoming" && isPast) return false;
			if (activeTab === "past" && !isPast) return false;

			return true;
		})
		.sort((a, b) => {
			// Sort by date (ascending for upcoming, descending for past)
			const dateA = new Date(a.date);
			const dateB = new Date(b.date);
			return activeTab === "upcoming" ? dateA - dateB : dateB - dateA;
		});

	if (loading) {
		return (
			<div className="min-h-screen bg-[#f8f5f0] flex justify-center items-center">
				<div className="flex flex-col items-center">
					<FaSpinner className="animate-spin text-[#8c1d35] text-4xl mb-4" />
					<p className="text-[#8c1d35] font-medium">Loading your walks...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-[#f8f5f0] flex justify-center items-center">
				<div className="bg-white rounded-xl shadow-md p-8 text-center max-w-md">
					<FaExclamationTriangle className="text-[#8c1d35] text-5xl mx-auto mb-4" />
					<h2 className="text-2xl font-bold text-[#8c1d35] mb-2">Error</h2>
					<p className="text-gray-600 mb-4">{error}</p>
					<button
						onClick={() => window.location.reload()}
						className="bg-[#8c1d35] text-white px-4 py-2 rounded-lg hover:bg-[#7c1025] transition-colors"
					>
						Try Again
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#f8f5f0]">
			{/* Header */}
			<div className="bg-[#8c1d35] text-white py-8 px-4">
				<div className="max-w-7xl mx-auto">
					<h1 className="text-4xl font-bold text-center mb-2">My Dog Walks</h1>
					<p className="text-center text-lg max-w-3xl mx-auto opacity-90">
						View and manage your dog walking appointments
					</p>
				</div>
			</div>

			<div className="container mx-auto px-4 py-8">
				{/* Tabs */}
				<div className="flex flex-wrap items-center justify-between gap-4 mb-6">
					<div className="flex bg-white rounded-lg p-1 shadow-sm border border-[#e8d3a9]">
						<button
							onClick={() => setActiveTab("upcoming")}
							className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
								activeTab === "upcoming"
									? "bg-[#8c1d35] text-white"
									: "text-gray-700 hover:bg-[#f8f5f0]"
							}`}
						>
							<FaCalendarAlt />
							<span>Upcoming</span>
							<span className="ml-1 bg-white text-[#8c1d35] rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
								{
									walks.filter((walk) => new Date(walk.date) >= new Date())
										.length
								}
							</span>
						</button>
						<button
							onClick={() => setActiveTab("past")}
							className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
								activeTab === "past"
									? "bg-[#8c1d35] text-white"
									: "text-gray-700 hover:bg-[#f8f5f0]"
							}`}
						>
							<FaHistory />
							<span>Past</span>
							<span className="ml-1 bg-white text-[#8c1d35] rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
								{
									walks.filter((walk) => new Date(walk.date) < new Date())
										.length
								}
							</span>
						</button>
					</div>

					<Link
						to="/walkdogs"
						className="flex items-center gap-2 px-4 py-2 bg-[#e8d3a9] text-[#8c1d35] rounded-lg hover:bg-[#d9c59a] transition-colors font-medium"
					>
						<FaCalendarCheck />
						<span>Schedule Walk</span>
					</Link>
				</div>

				{/* Walks List */}
				{filteredWalks.length === 0 ? (
					<div className="bg-white rounded-xl shadow-md p-8 text-center">
						<FaPaw className="text-[#e8d3a9] text-5xl mx-auto mb-4" />
						<h2 className="text-2xl font-bold text-[#8c1d35] mb-2">
							No {activeTab === "upcoming" ? "Upcoming" : "Past"} Walks
						</h2>
						<p className="text-gray-600 mb-4">
							{activeTab === "upcoming"
								? "You don't have any scheduled walks at this time."
								: "You don't have any past walks on record."}
						</p>
						{activeTab === "upcoming" && (
							<Link
								to="/walkdogs"
								className="inline-flex items-center gap-2 bg-[#8c1d35] text-white px-5 py-2 rounded-lg hover:bg-[#7c1025] transition-colors"
							>
								Schedule a Walk <FaArrowRight className="text-sm" />
							</Link>
						)}
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{filteredWalks.map((walk) => {
							const walkDate = new Date(walk.date);
							const isPast = walkDate < new Date();

							return (
								<div
									key={walk._id}
									className="bg-white rounded-xl shadow-md overflow-hidden border border-[#e8d3a9] hover:shadow-lg transition-shadow"
								>
									{/* Status Badge - Absolute positioned */}
									<div className="absolute top-3 right-3 z-10">
										{isPast ? (
											<span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
												Completed
											</span>
										) : isToday(walk.date) ? (
											<span className="bg-[#8c1d35] text-white text-xs px-2 py-1 rounded-full">
												Today
											</span>
										) : isUpcoming(walk.date) ? (
											<span className="bg-[#f5b82e] text-[#8c1d35] text-xs px-2 py-1 rounded-full">
												Soon
											</span>
										) : null}
									</div>

									{/* Card Header */}
									<div
										className={`px-5 py-3 border-b relative ${
											isPast ? "bg-gray-100" : "bg-[#e8d3a9] border-[#d9c59a]"
										}`}
									>
										<div className="flex items-center">
											<FaCalendarAlt className="text-[#8c1d35] mr-2" />
											<span className="text-[#8c1d35] font-bold">
												{formatDate(walk.date)}
											</span>
										</div>
									</div>

									{/* Card Body */}
									<div className="p-5">
										<div className="space-y-4">
											{/* Location */}
											<div className="flex">
												<div className="w-10 flex-shrink-0">
													<div className="w-8 h-8 rounded-full bg-[#f8f5f0] flex items-center justify-center">
														<FaMapMarkerAlt className="text-[#8c1d35]" />
													</div>
												</div>
												<div>
													<p className="text-sm text-gray-500">Location</p>
													<p className="font-medium text-gray-800">
														{walk.location || "Not specified"}
													</p>
												</div>
											</div>

											{/* Marshal */}
											<div className="flex">
												<div className="w-10 flex-shrink-0">
													<div className="w-8 h-8 rounded-full bg-[#f8f5f0] flex items-center justify-center">
														<FaUserShield className="text-[#8c1d35]" />
													</div>
												</div>
												<div>
													<p className="text-sm text-gray-500">Marshal</p>
													<p className="font-medium text-gray-800">
														{Array.isArray(walk.marshalId) &&
														walk.marshalId.length > 0
															? walk.marshalId
																	.map((m) => `${m.firstName} ${m.lastName}`)
																	.join(", ")
															: "Unassigned"}
													</p>
												</div>
											</div>

											{/* Duration and Slots */}
											<div className="flex">
												<div className="w-10 flex-shrink-0">
													<div className="w-8 h-8 rounded-full bg-[#f8f5f0] flex items-center justify-center">
														<FaClock className="text-[#8c1d35]" />
													</div>
												</div>
												<div>
													<p className="text-sm text-gray-500">Duration</p>
													<p className="font-medium text-gray-800">
														{walk.duration || "1 hour"}
														{walk.slots && (
															<span className="ml-2 text-xs bg-[#f8f5f0] text-[#8c1d35] px-2 py-1 rounded-full">
																{walk.slots} slots
															</span>
														)}
													</p>
												</div>
											</div>

											{/* Dogs (if available) */}
											{walk.dogId && walk.dogId.length > 0 && (
												<div className="flex">
													<div className="w-10 flex-shrink-0">
														<div className="w-8 h-8 rounded-full bg-[#f8f5f0] flex items-center justify-center">
															<FaPaw className="text-[#8c1d35]" />
														</div>
													</div>
													<div>
														<p className="text-sm text-gray-500">Dogs</p>
														<div className="flex flex-wrap gap-2 mt-1">
															{walk.dogId.map((dog) => (
																<span
																	key={dog._id}
																	className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#e8d3a9] text-[#8c1d35]"
																>
																	{dog.name}
																</span>
															))}
														</div>
													</div>
												</div>
											)}
										</div>

										{/* Action Button - Only show cancel for upcoming walks */}
										{!isPast && (
											<button
												onClick={() => handleCancelWalk(walk._id)}
												className="w-full mt-5 flex items-center justify-center gap-2 bg-white border border-[#8c1d35] text-[#8c1d35] py-2 rounded-lg hover:bg-[#f8f5f0] transition-colors font-medium"
											>
												<FaTimes />
												Cancel Walk
											</button>
										)}
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
};

export default MyWalks;
