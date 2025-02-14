import React, { useState, useEffect } from "react";
import axios from "axios";

const AvailableWalks = () => {
	const [walks, setWalks] = useState([]);
	const [selectedWalk, setSelectedWalk] = useState(null);

	// Fetch walks from the backend
	useEffect(() => {
		const fetchWalks = async () => {
			try {
				const response = await axios.get(
					"http://localhost:5001/scheduledwalks/"
				);
				setWalks(response.data);
			} catch (error) {
				console.error("Error fetching walks:", error);
			}
		};

		fetchWalks();
	}, []);

	const handleSelectWalk = (id) => {
		setSelectedWalk(id);
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
			{walks.length === 0 ? (
				<p className="text-gray-700 text-center col-span-full">
					No walks available.
				</p>
			) : (
				walks.map((walk) => (
					<div
						key={walk._id}
						className={`border rounded-md p-3 shadow-md ${
							selectedWalk === walk._id ? "border-maroon-600 bg-gray-200" : ""
						}`}
					>
						<p className="font-semibold text-maroon-700">
							Dog: <span className="text-gray-800">{walk.dog.name}</span>
						</p>
						<p className="text-maroon-700">
							Date:{" "}
							<span className="text-gray-800">
								{new Date(walk.date).toLocaleDateString()}
							</span>
						</p>
						<p className="text-maroon-700">
							Time:{" "}
							<span className="text-gray-800">
								{new Date(walk.date).toLocaleTimeString()}
							</span>
						</p>
						<p className="text-maroon-700">
							Marshal:{" "}
							<span className="text-gray-800">
								{walk.marshal.firstName} {walk.marshal.lastName}
							</span>
						</p>
						<p className="text-maroon-700">
							Duration:{" "}
							<span className="text-gray-800">{walk.duration || "1 hour"}</span>
						</p>
						<button
							onClick={() => handleSelectWalk(walk._id)}
							className="mt-2 w-full bg-maroon-600 text-white py-1 rounded-md hover:bg-maroon-700"
						>
							{selectedWalk === walk._id ? "Selected" : "Select Walk"}
						</button>
					</div>
				))
			)}
		</div>
	);
};

export default AvailableWalks;
