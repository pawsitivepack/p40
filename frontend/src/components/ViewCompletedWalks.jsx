import React, { useState, useEffect } from "react";
import axios from "axios";

const ViewCompletedWalks = () => {
	const [completedWalks, setCompletedWalks] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Fetch completed walks from backend
	useEffect(() => {
		const fetchCompletedWalks = async () => {
			try {
				const response = await axios.get(
					`${import.meta.env.VITE_BACKEND_URL}/completedwalk`, // Using env variable
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem("token")}`, // Token authentication
						},
					}
				);
				setCompletedWalks(response.data);
				setLoading(false);
			} catch (err) {
				setError("Error fetching completed walks");
				setLoading(false);
			}
		};

		fetchCompletedWalks();
	}, []);

	if (loading) return <p className="text-center">Loading...</p>;
	if (error) return <p className="text-center text-red-500">{error}</p>;

	return (
		<div className="container mx-auto p-6">
			<h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
				Completed Walks
			</h1>

			{completedWalks.length === 0 ? (
				<p className="text-gray-600 text-center">
					No completed walks available.
				</p>
			) : (
				<div className="overflow-x-auto">
					<table className="min-w-full border text-black border-gray-300 bg-gray-200 shadow-md rounded-lg">
						<thead className="bg-gray-200">
							<tr>
								<th className="border border-gray-300 px-4 py-2 text-left">
									Walker
								</th>
								<th className="border border-gray-300 px-4 py-2 text-left">
									Marshal
								</th>
								<th className="border border-gray-300 px-4 py-2 text-left">
									Date
								</th>
								<th className="border border-gray-300 px-4 py-2 text-left">
									Status
								</th>
								<th className="border border-gray-300 px-4 py-2 text-left">
									Dogs Walked
								</th>
							</tr>
						</thead>
						<tbody>
							{completedWalks.map((walk) => (
								<tr key={walk._id} className="border-b border-gray-300">
									<td className="border border-gray-300 px-4 py-2">
										{walk.userId?.firstName} {walk.userId?.lastName}
									</td>
									<td className="border border-gray-300 px-4 py-2">
										{walk.marshalId?.firstName} {walk.marshalId?.lastName}
									</td>
									<td className="border border-gray-300 px-4 py-2">
										{new Date(walk.date).toLocaleDateString()}
									</td>
									<td className="border border-gray-300 px-4 py-2 text-green-600">
										{walk.status}
									</td>
									<td className="border border-gray-300 px-4 py-2">
										{walk.dogId.length > 0 ? (
											walk.dogId.map((dog, index) => (
												<span key={index} className="mr-2">
													{dog.name},
												</span>
											))
										) : (
											<span className="text-gray-500">No dogs walked</span>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
};

export default ViewCompletedWalks;
