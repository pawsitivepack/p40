import React, { useState, useEffect } from "react";
import axios from "axios";

const ScheduledWalks = () => {
	const [walksWithUsers, setWalksWithUsers] = useState([]);
    
	const [refresh, setRefresh] = useState(false);

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
				
				// Update dynamically based on the latest walker list
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

	// Function to trigger a re-fetch
	const triggerRefresh = () => {
		setRefresh((prev) => !prev);
	};

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold mb-6">Scheduled Walks with Users</h1>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{walksWithUsers.length === 0 ? (
					<p className="text-gray-600">No walks with users available.</p>
				) : (
					walksWithUsers.map((walk) => (
						<div
							key={walk._id}
							className="bg-white border border-gray-200 rounded-lg shadow-md p-4"
						>
							<p className="text-blue-600 font-bold">
								Date & Time:{" "}
								<span className="text-gray-800">
									{new Date(walk.date).toLocaleString([], {
										dateStyle: "medium",
										timeStyle: "short",
									})}
								</span>
							</p>
							<p className="text-blue-600">
								Location: <span className="text-gray-800">{walk.location}</span>
							</p>
							<p className="text-blue-600">
								Duration: <span className="text-gray-800">{walk.duration}</span>
							</p>
							<p className="text-blue-600">
								Slots Remaining:{" "}
								<span className="text-gray-800">{walk.slots}</span>
							</p>
							<p className="text-blue-600 font-semibold mt-2">Walkers:</p>
							<ul className="list-disc list-inside">
								{walk.walker.map((user) => (
									<li key={user._id} className="text-gray-800">
										{user.firstName} {user.lastName}
									</li>
								))}
							</ul>
						</div>
					))
				)}
			</div>
		</div>
	);
};

export default ScheduledWalks;