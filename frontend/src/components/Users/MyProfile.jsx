import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import api from "../../api/axios"; // Import custom Axios instance
import { FaUserCircle, FaPen, FaPhone, FaUserTag, FaDog } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi"; // Import logout icon
import { StarIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";

const MyProfile = () => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [walks, setWalks] = useState({ upcoming: [], past: [] });
	const fileInputRef = useRef(null);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const response = await api.get("/users/myprofile");
				console.log("Profile data:", response.data);
				if (response.data && response.data.user) {
					setUser(response.data.user);
					setWalks({
						upcoming: response.data.user.dogsWalked || [],
						past: response.data.user.completedWalks || [],
					});
				} else {
					throw new Error("Invalid user data received");
				}
			} catch (err) {
				console.error("Failed to fetch profile:", err);
				setError("Failed to fetch profile. Please log in again.");
			} finally {
				setLoading(false);
			}
		};

		fetchProfile();
	}, []);

	const handlePictureChange = async (event) => {
		const file = event.target.files[0];
		if (!file) return;

		const formData = new FormData();
		formData.append("picture", file);

		try {
			const response = await api.put("/users/updateProfilePicture", formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});

			setUser((prev) => ({ ...prev, picture: response.data.picture }));

			if (response.data.token) {
				localStorage.setItem("token", response.data.token); // Save updated token
			}

			toast.success("Profile picture updated successfully!");

			// Force reload to ensure Navbar reflects the change
			window.location.reload();
		} catch (error) {
			console.error("Failed to update profile picture:", error);
			toast.error("Failed to update profile picture.");
		}
	};

	const handleLogout = () => {
		localStorage.removeItem("token");
		toast.success("You have been logged out successfully!");
		setTimeout(() => {
			window.location.href = "/login";
		}, 1500);
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<p className="text-lg text-gray-600">Loading...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center h-screen">
				<p className="text-red-500 text-xl">{error}</p>
			</div>
		);
	}

	return (
		<div
			className="max-w-4xl mx-auto mt-10 p-6 shadow-lg rounded-lg"
			style={{ backgroundColor: "var(--bg-100)" }}
		>
			{/* Profile Section */}
			<div
				className="flex flex-col md:flex-row items-start md:space-x-6 gap-10 p-6 rounded-lg border"
				style={{ backgroundColor: "var(--bg-200)" }}
			>
				<div className="relative mb-4 md:mb-0">
					{user.picture ? (
						<img
							src={user.picture}
							alt="Profile"
							className="w-72 h-72 object-cover rounded-full shadow-md border border-gray-300"
							onClick={() => fileInputRef.current.click()}
						/>
					) : (
						<FaUserCircle
							className="w-72 h-72 text-gray-400 cursor-pointer"
							onClick={() => fileInputRef.current.click()}
						/>
					)}
					{/* Points Star in Top-Right */}
					<div className="absolute top-0 right-0 w-14 h-14">
						<StarIcon
							className="w-14 h-14 drop-shadow-md"
							style={{
								fill:
									user.userPoints === 0
										? "#ef4444"
										: user.userPoints <= 20
										? "#f97316"
										: user.userPoints <= 50
										? "#facc15"
										: user.userPoints <= 100
										? "#22c55e"
										: "#3b82f6",
							}}
						/>
						<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-sm font-bold">
							{user.userPoints || 0}
						</div>
					</div>
					{/* Restore Change Profile Picture Functionality */}
					<input
						type="file"
						ref={fileInputRef}
						onChange={handlePictureChange}
						accept="image/*"
						className="hidden"
					/>
					<div
						className="absolute bottom-3 right-3 bg-gray-800 text-white p-2 rounded-full cursor-pointer hover:bg-gray-700"
						onClick={() => fileInputRef.current.click()}
					>
						<FaPen size={14} />
					</div>
				</div>
				<div
					className="p-4 rounded-lg w-full flex-1 text-center md:text-left h-72 flex flex-col justify-between"
					style={{ backgroundColor: "var(--accent-200)" }}
				>
					<div>
						<p
							className="text-2xl font-bold"
							style={{ color: "var(--text-100)" }}
						>
							{user.firstName} {user.lastName}
						</p>
						<hr className="my-2 border-gray-400" />
						<p className="text-gray-800">{user.email}</p>
						<p className="text-gray-800">
							<FaUserTag className="inline mr-1" />
							{user?.role}
						</p>
						{user.phone && (
							<p className="text-gray-800">
								<FaPhone className="inline mr-1" />
								{user?.phone}
							</p>
						)}
						{user.dob && <p className="text-gray-800">{user.dob}</p>}
					</div>
					<div className="flex justify-center mt-auto">
						<button
							onClick={handleLogout}
							className="text-red-600 hover:font-bold hover:scale-110 transition p-2 rounded-full duration-200 ease-in-out"
						>
							<FiLogOut />
							Logout
						</button>
					</div>
				</div>
			</div>
			{/* Dogs Walked Section */}
			{user.role !== "admin" && (
				<div
					className="mt-6 p-4 rounded-lg border"
					style={{ backgroundColor: "var(--bg-300)" }}
				>
					<h3
						className="text-lg font-semibold mb-2 flex items-center gap-2"
						style={{ color: "var(--text-100)" }}
					>
						<FaDog /> Dogs Walked
					</h3>
					<div className="flex flex-wrap gap-2">
						{(() => {
							const seen = new Set();
							const allDogs = walks.past
								.flatMap((walk) => walk.dogId || [])
								.filter((dog) => {
									if (!dog || seen.has(dog._id)) return false;
									seen.add(dog._id);
									return true;
								});

							return allDogs.length > 0 ? (
								allDogs.map((dog) => (
									<span
										key={dog._id}
										onClick={() => navigate(`/dog/${dog._id}`)}
										className="text-white px-3 py-1 rounded-lg cursor-pointer hover:underline"
										style={{ backgroundColor: "var(--accent-100)" }}
									>
										{dog.name || "Unknown Dog"}
									</span>
								))
							) : (
								<p className="text-gray-700">No dogs walked yet.</p>
							);
						})()}
					</div>
				</div>
			)}

			{/* Upcoming Walks Section */}
			{user.role !== "admin" && (
				<div
					className="mt-6 p-4 rounded-lg border"
					style={{ backgroundColor: "var(--bg-200)" }}
				>
					<h3
						className="text-lg font-semibold mb-2"
						style={{ color: "var(--text-100)" }}
					>
						Upcoming Walks
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
						{walks.upcoming.map((walk) => (
							<div
								key={walk._id}
								className="bg-white border rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow duration-200"
							>
								<p className="text-gray-900">
									Date: {new Date(walk.date).toLocaleDateString()}
								</p>
								<p className="text-gray-900">
									Time:{" "}
									{new Date(walk.date).toLocaleTimeString([], {
										hour: "2-digit",
										minute: "2-digit",
									})}
								</p>
								<p className="text-gray-900">
									Marshal: {walk.marshal.firstName}
								</p>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Completed Walks Section */}
			{user.role !== "admin" && (
				<div
					className="mt-6 p-4 rounded-lg border"
					style={{ backgroundColor: "var(--bg-300)" }}
				>
					<h3
						className="text-lg font-semibold mb-2"
						style={{ color: "var(--text-100)" }}
					>
						Completed Walks
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
						{walks.past.map((walk) => (
							<div
								key={walk._id}
								className="bg-white border rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow duration-200"
							>
								<p className="text-gray-900">
									{new Date(walk.date).toLocaleDateString()}
								</p>
								<p className="text-gray-900">
									Marshal: {walk.marshalId?.firstName || "N/A"}
								</p>
								<p className="text-gray-900">
									Dogs Walked:{" "}
									{walk.dogId && walk.dogId.length > 0
										? walk.dogId.map((dog) => dog.name).join(", ")
										: "N/A"}
								</p>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default MyProfile;
