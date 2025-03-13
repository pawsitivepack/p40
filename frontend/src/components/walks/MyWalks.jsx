import React, { useEffect, useState } from "react";
import axios from "axios";

const MyWalks = () => {
	const [walks, setWalks] = useState([]);

	useEffect(() => {
		const fetchMyWalks = async () => {
			try {
				const response = await axios.get(
					`${
						import.meta.env.VITE_BACKEND_URL
					}/scheduledWalks/${localStorage.getItem("userId")}`,
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem("token")}`,
						},
					}
				);
				setWalks(response.data);
			} catch (error) {
				console.error("Error fetching walks:", error);
			}
		};

		fetchMyWalks();
	}, []);

	// Function to cancel a walk
	const handleCancelWalk = async (walkId) => {
		if (!window.confirm("Are you sure you want to cancel this walk?")) return;

		try {
			await axios.delete(
				`${import.meta.env.VITE_BACKEND_URL}/scheduledWalks/cancel/${walkId}`,
				{
					headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
				}
			);

			// ✅ Remove only the cancelled walk from the UI
			setWalks((prevWalks) => prevWalks.filter((walk) => walk._id !== walkId));

			toast.success("Walk appointment cancelled successfully!");
		} catch (error) {
			console.error("Error cancelling walk:", error);
			toast.error("Failed to cancel walk.");
		}
	};

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold mb-6">My Scheduled Walks</h1>
			{walks.length === 0 ? (
				<p className="text-gray-600">No scheduled walks found.</p>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
					{walks.map((walk) => (
						<div
							key={walk._id}
							className="bg-white border rounded-lg p-4 shadow-md"
						>
							<p className="text-blue-700">
								Date:{" "}
								<span className="text-gray-800">
									{new Date(walk.date).toLocaleString([], {
										dateStyle: "medium",
										timeStyle: "short",
									})}
								</span>
							</p>
							<p className="text-blue-700">
								Location: <span className="text-gray-800">{walk.location}</span>
							</p>
							<p className="text-blue-700">
								Marshal:{" "}
								<span className="text-gray-800">{walk.marshal.firstName}</span>
							</p>
							<p className="text-blue-700">
								Duration: <span className="text-gray-800">{walk.duration}</span>
							</p>
							{/* Cancel Button */}
							<button
								onClick={() => handleCancelWalk(walk._id)}
								className="mt-4 w-half bg-red-500 text-white py-2 px-2 rounded-md hover:bg-red-700 transition-all"
							>
								Cancel Walk
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default MyWalks;
