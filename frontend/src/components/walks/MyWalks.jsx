import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";

const MyWalks = () => {
	const [walks, setWalks] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchMyWalks = async () => {
			try {
				const response = await api.get(
					`/scheduledWalks/${localStorage.getItem("userId")}`
				);
				setWalks(response.data);
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
			setWalks((prevWalks) => prevWalks.filter((walk) => walk._id !== walkId));
			toast.success("Walk appointment cancelled successfully!");
		} catch (err) {
			console.error("Error cancelling walk:", err);
			toast.error("Failed to cancel walk.");
		}
	};

	if (loading) {
		return <p className="text-center text-gray-600">Loading your walks...</p>;
	}

	if (error) {
		return <p className="text-center text-red-600">{error}</p>;
	}

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-3xl font-bold mb-6 text-center">
				My Scheduled Walks
			</h1>

			{walks.length === 0 ? (
				<p className="text-center text-gray-600">No scheduled walks found.</p>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{walks.map((walk) => (
						<div
							key={walk._id}
							className="bg-white border rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow duration-300"
						>
							<div className="mb-3">
								<p className="text-blue-700 font-semibold">Date:</p>
								<p className="text-gray-800">
									{new Date(walk.date).toLocaleString([], {
										dateStyle: "medium",
										timeStyle: "short",
									})}
								</p>
							</div>

							<div className="mb-3">
								<p className="text-blue-700 font-semibold">Location:</p>
								<p className="text-gray-800">{walk.location}</p>
							</div>

							<div className="mb-3">
								<p className="text-blue-700 font-semibold">Marshal:</p>
								<p className="text-gray-800">{walk.marshal.firstName}</p>
							</div>

							<div className="mb-4">
								<p className="text-blue-700 font-semibold">Duration:</p>
								<p className="text-gray-800">{walk.duration}</p>
							</div>

							<button
								onClick={() => handleCancelWalk(walk._id)}
								className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-all"
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
