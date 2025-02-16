import React, { useEffect, useState } from "react";
import axios from "axios";

const MyWalks = () => {
	const [walks, setWalks] = useState([]);

	useEffect(() => {
		const fetchMyWalks = async () => {
			try {
				const response = await axios.get(
					`${import.meta.env.VITE_BACKEND_URL}/users/MyWalks`,
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

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold mb-6">My Scheduled Walks</h1>
			{walks.length === 0 ? (
				<p className="text-gray-600">No scheduled walks found.</p>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default MyWalks;
