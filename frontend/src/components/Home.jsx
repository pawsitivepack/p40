import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import dogBackground from "../assets/dog.png";
import {
	FaUserShield,
	FaDog,
	FaWalking,
	FaDonate,
	FaUsers,
} from "react-icons/fa";
export default function Home() {
	const [role, setRole] = useState("");
	const [walks, setWalks] = useState([]);

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (token) {
			try {
				const decoded = jwtDecode(token);
				setRole(decoded.role);
				fetchWalks(decoded.id, decoded.role);
			} catch (error) {
				console.error("Invalid token:", error);
				setRole("");
			}
		}
	}, []);

	const fetchWalks = async (userId, userRole) => {
		try {
			let response;
			if (userRole === "user") {
				response = await axios.get(
					`${import.meta.env.VITE_BACKEND_URL}/scheduledWalks/${userId}`,
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem("token")}`,
						},
					}
				);
			} else {
				response = await axios.get(
					`${import.meta.env.VITE_BACKEND_URL}/scheduledWalks`,
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem("token")}`,
						},
					}
				);
			}
			setWalks(response.data);
		} catch (error) {
			console.error("Error fetching walks:", error);
		}
	};

	return (
		<div className="relative min-h-screen flex flex-col items-center justify-center bg-gray-100">
			{/* Background Image */}
			<div
				className="absolute inset-0 bg-center bg-cover blur-md opacity-40"
				style={{ backgroundImage: `url(${dogBackground})` }}
			></div>

			{/* Foreground Content */}
			<div className="relative  text-red-950 text-center max-w-6xl mx-auto">
				{/* Welcome Text */}
				<h1 className="text-5xl font-bold mb-6">Welcome to P40-Dog!</h1>
				<p className="text-2xl mb-10">Your best companion is waiting!</p>

				{/* Management Sections */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{/* Section 1: Quick Links */}
					<div className="p-4 bg-white shadow rounded-lg">
						<h2 className="text-lg font-semibold mb-4 text-gray-800">
							Quick Links
						</h2>

						<div className="grid grid-cols-1 gap-3">
							{/* Admin Links */}
							{role === "admin" && (
								<>
									<Link
										to="/marshal-application"
										className="flex items-center gap-3 p-3 border rounded hover:bg-blue-100 transition"
									>
										<FaUserShield className="text-blue-600 text-xl" />
										<span className="text-gray-800 font-medium">
											Marshal Application
										</span>
									</Link>

									<Link
										to="/adoption-board"
										className="flex items-center gap-3 p-3 border rounded hover:bg-green-100 transition"
									>
										<FaDog className="text-green-600 text-xl" />
										<span className="text-gray-800 font-medium">
											Adoption Board
										</span>
									</Link>

									<Link
										to="/users"
										className="flex items-center gap-3 p-3 border rounded hover:bg-purple-100 transition"
									>
										<FaUsers className="text-purple-600 text-xl" />
										<span className="text-gray-800 font-medium">
											Manage Users
										</span>
									</Link>

									<Link
										to="/donate"
										className="flex items-center gap-3 p-3 border rounded hover:bg-red-100 transition"
									>
										<FaDonate className="text-red-600 text-xl" />
										<span className="text-gray-800 font-medium">
											Donate & Support
										</span>
									</Link>
								</>
							)}

							{/* Marshal Links */}
							{role === "marshal" && (
								<>
									<Link
										to="/adoption-board"
										className="flex items-center gap-3 p-3 border rounded hover:bg-green-100 transition"
									>
										<FaDog className="text-green-600 text-xl" />
										<span className="text-gray-800 font-medium">
											Adoption Board
										</span>
									</Link>

									<Link
										to="/donate"
										className="flex items-center gap-3 p-3 border rounded hover:bg-red-100 transition"
									>
										<FaDonate className="text-red-600 text-xl" />
										<span className="text-gray-800 font-medium">
											Donate & Support
										</span>
									</Link>

									<Link
										to="/walkdogs"
										className="flex items-center gap-3 p-3 border rounded hover:bg-yellow-100 transition"
									>
										<FaWalking className="text-yellow-600 text-xl" />
										<span className="text-gray-800 font-medium">Walk Dogs</span>
									</Link>
								</>
							)}

							{/* User Links */}
							{role === "user" && (
								<>
									<Link
										to="/marshal-application"
										className="flex items-center gap-3 p-3 border rounded hover:bg-blue-100 transition"
									>
										<FaUserShield className="text-blue-600 text-xl" />
										<span className="text-gray-800 font-medium">
											Apply for Marshal
										</span>
									</Link>
									<Link
										to="/adoption-board"
										className="flex items-center gap-3 p-3 border rounded hover:bg-green-100 transition"
									>
										<FaDog className="text-green-600 text-xl" />
										<span className="text-gray-800 font-medium">
											Adoption Board
										</span>
									</Link>

									<Link
										to="/mywalks"
										className="flex items-center gap-3 p-3 border rounded hover:bg-yellow-100 transition"
									>
										<FaWalking className="text-yellow-600 text-xl" />
										<span className="text-gray-800 font-medium">My Walks</span>
									</Link>

									<Link
										to="/donate"
										className="flex items-center gap-3 p-3 border rounded hover:bg-red-100 transition"
									>
										<FaDonate className="text-red-600 text-xl" />
										<span className="text-gray-800 font-medium">
											Donate & Support
										</span>
									</Link>
								</>
							)}
						</div>
					</div>

					{/* Section 2: Upcoming Walks */}
					<div className="p-4 bg-white shadow rounded">
						<a href="/scheduledwalk">
							<h2 className="text-lg font-semibold mb-3">Upcoming Walks</h2>
						</a>
						{walks.length > 0 ? (
							walks
								.filter((walk) => walk.walker && walk.walker.length > 0) // Filter out walks without a walker
								.slice(0, 3) // Show only the first 3 walks
								.map((walk) => (
									<div key={walk._id} className="mb-2">
										<p className="text-sm">
											{new Date(walk.date).toLocaleDateString()} -{" "}
											{new Date(walk.date).toLocaleTimeString([], {
												hour: "2-digit",
												minute: "2-digit",
											})}
											{(role === "admin" || role === "marshal") && (
												<> | User: {walk.walker[0].firstName}</>
											)}
										</p>
									</div>
								))
						) : (
							<p className="text-sm">No upcoming walks available.</p>
						)}

						{walks.filter((walk) => walk.walker && walk.walker.length > 0)
							.length >= 2 && (
							<Link
								to={role === "user" ? "/mywalks" : "/scheduledwalk"}
								className="text-blue-500 text-sm underline hover:text-blue-700"
							>
								More Walks
							</Link>
						)}
					</div>

					{/* Section 3: Past Walks */}
					<div className="p-6 bg-white shadow-md rounded-lg">
						<h2 className="text-xl font-bold mb-4">Past Walks</h2>
						<p>Coming Soon...</p>
					</div>

					{/* Section 4: Management (Placeholder for future) */}
					<div className="p-6 bg-white shadow-md rounded-lg">
						<h2 className="text-xl font-bold mb-4">Management</h2>
						<p>More management tools coming soon...</p>
					</div>
				</div>
			</div>
		</div>
	);
}
