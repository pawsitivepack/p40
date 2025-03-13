import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

const ScheduledWalks = () => {
	const [walksWithUsers, setWalksWithUsers] = useState([]);
	const [refresh, setRefresh] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchWalks = async () => {
			try {
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
				setWalksWithUsers(filteredWalks);
			} catch (error) {
				console.error("Error fetching walks:", error);
			}
		};

		fetchWalks();
	}, [refresh]);

	// Trigger a re-fetch
	const triggerRefresh = () => {
		setRefresh((prev) => !prev);
	};

	return (
		<div className="container mx-auto p-6">
			<h1 className="text-3xl font-bold text-gray-800 mb-6">
				Scheduled Walks with Users 🐾
			</h1>
			<div className="flex gap-4 mb-6">
				<button
					className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition"
					onClick={() => navigate("/checkin")}
				>
					🚶‍♂️ Check In
				</button>
				<button
					className="bg-green-600 text-white px-5 py-2 rounded-lg shadow hover:bg-green-700 transition"
					onClick={() => navigate("/completedwalks")}
				>
					✅ Past Walks
				</button>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{walksWithUsers.length === 0 ? (
					<p className="text-gray-600">No scheduled walks available.</p>
				) : (
					walksWithUsers.map((walk) => (
						<div
							key={walk._id}
							className="bg-white border border-gray-300 rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer"
						>
							<div className="flex justify-between items-center mb-4">
								<span className="text-sm bg-blue-100 text-blue-800 font-medium px-3 py-1 rounded-full">
									{new Date(walk.date).toLocaleString([], {
										dateStyle: "medium",
										timeStyle: "short",
									})}
								</span>
							</div>
							<div>
								<p className="text-blue-700 font-semibold mb-2">Walkers:</p>
								<ul className="space-y-1">
									{walk.walker.map((user) => (
										<li
											key={user._id}
											className="text-gray-800 bg-gray-100 px-3 py-1 rounded-md flex items-center gap-2"
										>
											{user.picture ? (
												<img
													src={user.picture}
													alt="Profile"
													className="w-6 h-6 rounded-full"
												/>
											) : (
												<FaUserCircle className="w-6 h-6 text-gray-400" />
											)}
											<span>
												{user.firstName} {user.lastName}
											</span>
										</li>
									))}
								</ul>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
};

export default ScheduledWalks;
