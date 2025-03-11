import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import dogBackground from "../assets/dog.png";

export default function Home() {
	const [role, setRole] = useState("");

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (token) {
			try {
				const decoded = jwtDecode(token);
				setRole(decoded.role);
			} catch (error) {
				console.error("Invalid token:", error);
				setRole("");
			}
		}
	}, []);

	return (
		<div className="relative min-h-screen flex flex-col items-center justify-center bg-gray-100">
			{/* Blurred Background Image */}
			<div
				className="absolute inset-0 bg-center bg-no-repeat bg-cover blur-md opacity-50"
				style={{ backgroundImage: `url(${dogBackground})` }}
			></div>

			{/* Foreground Content */}
			<div className="relative z-10 text-red-950 text-center">
				<h1 className="text-5xl font-bold mb-6">Welcome to P40-Dog!</h1>
				<p className="text-2xl mb-10">Your best companion is waiting!</p>

				{/* Shortcut Buttons */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{role === "user" && (
						<>
							<Link
								to="/marshal-application"
								className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition"
							>
								Apply for Marshal
							</Link>

							<Link
								to="/mywalks"
								className="px-6 py-3 bg-yellow-500 text-white rounded-lg shadow-lg hover:bg-yellow-600 transition"
							>
								My Walks
							</Link>

							<Link
								to="/adoption-board"
								className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition"
							>
								Adoption Board
							</Link>

							<Link
								to="/donate"
								className="px-6 py-3 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition"
							>
								Donate & Support
							</Link>
						</>
					)}

					{(role === "marshal" || role === "admin") && (
						<>
							<Link
								to="/marshal-application"
								className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition"
							>
								Marshal Applications
							</Link>

							<Link
								to="/adoption-board"
								className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition"
							>
								Adoption Board
							</Link>

							<Link
								to="/scheduledwalk"
								className="px-6 py-3 bg-yellow-500 text-white rounded-lg shadow-lg hover:bg-yellow-600 transition"
							>
								Scheduled Walks
							</Link>

							<Link
								to="/donate"
								className="px-6 py-3 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition"
							>
								Donate & Support
							</Link>

							<Link
								to="/completedWalks"
								className="px-6 py-3 bg-pink-500 text-white rounded-lg shadow-lg hover:bg-pink-600 transition"
							>
								Walk Logs
							</Link>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
