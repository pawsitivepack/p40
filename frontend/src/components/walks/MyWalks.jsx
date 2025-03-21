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
			<h1
				className="text-3xl font-bold mb-6 text-center"
				style={{ color: "var(--text-100)" }}
			>
				My Scheduled Walks
			</h1>

			{walks.length === 0 ? (
				<p className="text-center text-gray-600">No scheduled walks found.</p>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{walks.map((walk) => (
						<div
							key={walk._id}
							className="border rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow duration-300"
							style={{ backgroundColor: "var(--bg-200)" }}
						>
							<div className="mb-3">
								<p
									className="font-semibold"
									style={{ color: "var(--primary-200)" }}
								>
									Date:
								</p>
								<p style={{ color: "var(--text-200)" }}>
									{new Date(walk.date).toLocaleString([], {
										dateStyle: "medium",
										timeStyle: "short",
									})}
								</p>
							</div>

							<div className="mb-3">
								<p
									className="font-semibold"
									style={{ color: "var(--primary-200)" }}
								>
									Location:
								</p>
								<p style={{ color: "var(--text-200)" }}>{walk.location}</p>
							</div>

							<div className="mb-3">
								<p
									className="font-semibold"
									style={{ color: "var(--primary-200)" }}
								>
									Marshal:
								</p>
								<p style={{ color: "var(--text-200)" }}>
									{walk.marshal.firstName}
								</p>
							</div>

							<div className="mb-4">
								<p
									className="font-semibold"
									style={{ color: "var(--primary-200)" }}
								>
									Duration:
								</p>
								<p style={{ color: "var(--text-200)" }}>{walk.duration}</p>
							</div>

							<button
								onClick={() => handleCancelWalk(walk._id)}
								className="w-full text-white py-2 rounded-lg transition-all"
								style={{ backgroundColor: "var(--primary-200)" }}
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
