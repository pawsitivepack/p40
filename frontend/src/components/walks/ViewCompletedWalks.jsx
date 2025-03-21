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
		document.body.innerHTML = `
        <style>
            body {
                font-family: Arial, sans-serif;
                padding: 20px;
            }
            h1 {
                font-size: 24px;
                font-weight: bold;
                text-align: center;
                margin-bottom: 20px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin: 0 auto;
                font-size: 16px;
            }
            th, td {
                border: 1px solid black;
                padding: 10px;
                text-align: left;
            }
            th {
                background-color: #ddd;
                font-size: 18px;
                font-weight: bold;
                text-align: center;
            }
            td {
                text-align: center;
            }
            tr:nth-child(even) {
                background-color: #f2f2f2;
            }
        </style>
        <h1>Completed Walk Logs</h1>
        ${printContent}
    `;
		window.print();
		document.body.innerHTML = originalContent;
	};

	if (loading) return <p className="text-center">Loading...</p>;
	if (error) return <p className="text-center text-red-500">{error}</p>;

	return (
		<div
			className="container mx-auto p-6 my-auto mt-10"
			style={{ backgroundColor: "var(--bg-100)" }}
		>
			<div className="flex justify-between items-center mb-6">
				<h1
					className="text-4xl font-extrabold"
					style={{ color: "var(--primary-300)" }}
				>
					View Walk Logs
				</h1>
				<button
					onClick={handlePrint}
					className="px-5 py-2 text-white font-medium rounded-lg shadow transition"
					style={{ backgroundColor: "var(--primary-200)" }}
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
					className="overflow-x-auto shadow-lg rounded-lg border"
					style={{
						backgroundColor: "var(--bg-200)",
						borderColor: "var(--bg-300)",
					}}
				>
					<table className="min-w-full border-collapse">
						<thead
							style={{ backgroundColor: "var(--primary-300)", color: "white" }}
						>
							<tr>
								<th
									className="border border-gray-300 px-6 py-3 text-left font-bold uppercase"
									style={{
										color: "var(--text-100)",
										backgroundColor: "var(--bg-300)",
									}}
								>
									Walker
								</th>
								<th
									className="border border-gray-300 px-6 py-3 text-left font-bold uppercase"
									style={{
										color: "var(--text-100)",
										backgroundColor: "var(--bg-300)",
									}}
								>
									Marshal
								</th>
								<th
									className="border border-gray-300 px-6 py-3 text-left font-bold uppercase"
									style={{
										color: "var(--text-100)",
										backgroundColor: "var(--bg-300)",
									}}
								>
									Date
								</th>
								<th
									className="border border-gray-300 px-6 py-3 text-left font-bold uppercase"
									style={{
										color: "var(--text-100)",
										backgroundColor: "var(--bg-300)",
									}}
								>
									Status
								</th>
								<th
									className="border border-gray-300 px-6 py-3 text-left font-bold uppercase"
									style={{
										color: "var(--text-100)",
										backgroundColor: "var(--bg-300)",
									}}
								>
									Dogs Walked
								</th>
							</tr>
						</thead>
						<tbody>
							{completedWalks.map((walk) => (
								<tr
									key={walk._id}
									className="border-b"
									style={{ backgroundColor: "var(--bg-300)" }}
								>
									<td
										className="border border-gray-300 px-6 py-2"
										style={{ color: "var(--text-100)" }}
									>
										{walk.userId
											? `${walk.userId.firstName} ${walk.userId.lastName}`
											: "Anonymous"}
									</td>
									<td
										className="border border-gray-300 px-6 py-2"
										style={{ color: "var(--text-100)" }}
									>
										{walk.marshalId
											? `${walk.marshalId.firstName} ${walk.marshalId.lastName}`
											: "Anonymous"}
									</td>
									<td
										className="border border-gray-300 px-6 py-2"
										style={{ color: "var(--text-100)" }}
									>
										{new Date(walk.date).toLocaleDateString()}
									</td>
									<td
										className="border border-gray-300 px-6 py-2"
										style={{
											color:
												walk.status === "completed"
													? "var(--primary-300)"
													: "var(--accent-100)",
										}}
									>
										{walk.status}
									</td>
									<td
										className="border border-gray-300 px-6 py-2"
										style={{ color: "var(--text-200)" }}
									>
										{walk.dogId.length > 0 ? (
											walk.dogId.map((dog) => dog.name).join(", ")
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
