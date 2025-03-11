import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const ViewCompletedWalks = () => {
	const [completedWalks, setCompletedWalks] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const tableRef = useRef();

	// Fetch completed walks from backend
	useEffect(() => {
		const fetchCompletedWalks = async () => {
			try {
				const response = await axios.get(
					`${import.meta.env.VITE_BACKEND_URL}/completedwalk`,
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem("token")}`,
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

	// Function to print the table
	const handlePrint = () => {
		const printContent = tableRef.current.innerHTML;
		const originalContent = document.body.innerHTML;
		document.body.innerHTML = printContent;
		window.print();
		document.body.innerHTML = originalContent;
	};

	if (loading) return <p className="text-center">Loading...</p>;
	if (error) return <p className="text-center text-red-500">{error}</p>;

	return (
		<div className="container mx-auto p-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-4xl font-extrabold text-blue-800">
					View Walk Logs
				</h1>
				<button
					onClick={handlePrint}
					className="px-5 py-2 bg-green-600 text-white font-medium rounded-lg shadow hover:bg-green-700 transition"
				>
					Print Logs
				</button>
			</div>

			{completedWalks.length === 0 ? (
				<p className="text-gray-600 text-center">
					No completed walks available.
				</p>
			) : (
				<div
					ref={tableRef}
					className="overflow-x-auto shadow-lg rounded-lg border border-gray-300 bg-white"
				>
					<table className="min-w-full border-collapse">
						<thead className="bg-blue-600 text-white">
							<tr>
								<th className="border border-gray-300 px-6 py-3 text-left font-semibold">
									Walker
								</th>
								<th className="border border-gray-300 px-6 py-3 text-left font-semibold">
									Marshal
								</th>
								<th className="border border-gray-300 px-6 py-3 text-left font-semibold">
									Date
								</th>
								<th className="border border-gray-300 px-6 py-3 text-left font-semibold">
									Status
								</th>
								<th className="border border-gray-300 px-6 py-3 text-left font-semibold">
									Dogs Walked
								</th>
							</tr>
						</thead>
						<tbody>
							{completedWalks.map((walk) => (
								<tr key={walk._id} className="border-b hover:bg-gray-100">
									<td className="text-black border border-gray-300 px-6 py-2">
										{walk.userId?.firstName} {walk.userId?.lastName}
									</td>
									<td className="text-black border border-gray-300 px-6 py-2">
										{walk.marshalId?.firstName} {walk.marshalId?.lastName}
									</td>
									<td className="text-black border border-gray-300 px-6 py-2">
										{new Date(walk.date).toLocaleDateString()}
									</td>
									<td
										className={`border border-gray-300 px-6 py-2 ${
											walk.status === "completed"
												? "text-green-600"
												: "text-red-600"
										}`}
									>
										{walk.status}
									</td>
									<td className="text-black border border-gray-300 px-6 py-2">
										{walk.dogId.length > 0 ? (
											walk.dogId.map((dog, index) => (
												<span key={index} className="mr-2">
													{dog.name}
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
