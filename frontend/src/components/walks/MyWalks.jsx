import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";
import {
	FaCalendarAlt,
	FaMapMarkerAlt,
	FaUserShield,
	FaClock,
	FaTimes,
	FaPaw,
	FaExclamationTriangle,
	FaArrowRight,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const MyWalks = () => {
	const [upcomingWalks, setUpcomingWalks] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchMyWalks = async () => {
			try {
				const response = await api.get(
					`/scheduledWalks/${localStorage.getItem("userId")}`
				);

				// Filter to only include upcoming walks
				const now = new Date();
				const upcoming = response.data.filter(
					(walk) => new Date(walk.date) >= now
				);

				// Sort upcoming walks by date (earliest first)
				upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));

				setUpcomingWalks(upcoming);
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
			await api.delete(`/scheduledWalks/cancel/${walkId}`);
			setUpcomingWalks((prevWalks) =>
				prevWalks.filter((walk) => walk._id !== walkId)
			);
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

	if (loading) {
		return (
			<div className="min-h-screen bg-[#f8f5f0] flex justify-center items-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8c1d35]"></div>
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
			<div className="bg-[#8c1d35] text-white py-8 px-4 mb-8">
				<div className="max-w-7xl mx-auto">
					<h1 className="text-4xl font-bold text-center mb-2">
						My Scheduled Walks
					</h1>
					<p className="text-center text-lg max-w-3xl mx-auto opacity-90">
						View and manage your upcoming dog walking appointments
					</p>
				</div>
			</div>

			<div className="container mx-auto px-4 pb-12">
				{/* Upcoming Walks Section */}
				<div className="bg-[#e8d3a9] rounded-xl p-4 mb-6 flex items-center justify-between">
					<div className="flex items-center">
						<FaCalendarAlt className="text-[#8c1d35] text-xl mr-3" />
						<h2 className="text-xl font-semibold text-[#8c1d35]">
							Upcoming Walks
						</h2>
					</div>
					<span className="bg-[#8c1d35] text-white text-sm px-3 py-1 rounded-full">
						{upcomingWalks.length}{" "}
						{upcomingWalks.length === 1 ? "walk" : "walks"}
					</span>
				</div>

				{upcomingWalks.length === 0 ? (
					<div className="bg-white rounded-xl shadow-md p-8 text-center">
						<FaPaw className="text-[#e8d3a9] text-5xl mx-auto mb-4" />
						<h2 className="text-2xl font-bold text-[#8c1d35] mb-2">
							No Upcoming Walks
						</h2>
						<p className="text-gray-600 mb-4">
							You don't have any scheduled walks at this time.
						</p>
						<Link
							to="/walkdogs"
							className="inline-flex items-center gap-2 bg-[#8c1d35] text-white px-5 py-2 rounded-lg hover:bg-[#7c1025] transition-colors"
						>
							Schedule a Walk <FaArrowRight className="text-sm" />
						</Link>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{upcomingWalks.map((walk) => (
							<div
								key={walk._id}
								className="bg-white rounded-xl shadow-md overflow-hidden border border-[#e8d3a9] hover:shadow-lg transition-shadow"
							>
								{/* Card Header */}
								<div className="bg-[#e8d3a9] px-5 py-3 border-b border-[#d9c59a] relative">
									<div className="flex justify-between items-center">
										<div className="flex items-center">
											<FaCalendarAlt className="text-[#8c1d35] mr-2" />
											<span className="text-[#8c1d35] font-bold">
												{formatDate(walk.date)}
											</span>
										</div>
										{isToday(walk.date) && (
											<span className="bg-[#8c1d35] text-white text-xs px-2 py-1 rounded-full">
												Today
											</span>
										)}
										{!isToday(walk.date) && isUpcoming(walk.date) && (
											<span className="bg-[#f5b82e] text-[#8c1d35] text-xs px-2 py-1 rounded-full">
												Soon
											</span>
										)}
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
													{walk.marshal?.firstName}{" "}
													{walk.marshal?.lastName || ""}
												</p>
											</div>
										</div>

										{/* Duration */}
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

									{/* Cancel Button */}
									<button
										onClick={() => handleCancelWalk(walk._id)}
										className="w-full mt-5 flex items-center justify-center gap-2 bg-white border border-[#8c1d35] text-[#8c1d35] py-2 rounded-lg hover:bg-[#f8f5f0] transition-colors font-medium"
									>
										<FaTimes />
										Cancel Walk
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default MyWalks;
