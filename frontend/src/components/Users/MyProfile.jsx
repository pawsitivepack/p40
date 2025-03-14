import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import api from "../../api/axios"; // Import custom Axios instance

import { FaUserCircle, FaPen } from "react-icons/fa";

const MyProfile = () => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const fileInputRef = useRef(null);

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const response = await api.get("/users/myprofile");
				setUser(response.data.user);
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

			// ✅ Update user state and save new token
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
		<div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
			<h1 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h1>

			<div className="relative flex flex-col items-center space-y-4">
				<div className="relative">
					{user.picture ? (
						<img
							src={user.picture}
							alt="Profile"
							className="w-32 h-32 rounded-full shadow-md border border-gray-300"
						/>
					) : (
						<FaUserCircle className="w-32 h-32 text-gray-400" />
					)}

					{/* Edit Icon on Picture */}
					<div
						className="absolute bottom-0 right-0 bg-gray-800 text-white p-2 rounded-full cursor-pointer hover:bg-gray-700"
						onClick={() => fileInputRef.current.click()}
					>
						<FaPen size={14} />
					</div>
				</div>

				{/* Hidden File Input */}
				<input
					type="file"
					ref={fileInputRef}
					onChange={handlePictureChange}
					accept="image/*"
					className="hidden"
				/>

				<div className="w-full space-y-3">
					<div className="flex justify-between border-b pb-2">
						<span className="font-medium text-gray-600">First Name:</span>
						<span className="text-gray-900">{user.firstName}</span>
					</div>
					<div className="flex justify-between border-b pb-2">
						<span className="font-medium text-gray-600">Last Name:</span>
						<span className="text-gray-900">{user.lastName}</span>
					</div>
					<div className="flex justify-between border-b pb-2">
						<span className="font-medium text-gray-600">Email:</span>
						<span className="text-gray-900">{user.email}</span>
					</div>
					<div className="flex justify-between border-b pb-2">
						<span className="font-medium text-gray-600">Phone:</span>
						<span className="text-gray-900">{user.phone || "N/A"}</span>
					</div>
					<div className="flex justify-between border-b pb-2">
						<span className="font-medium text-gray-600">Age:</span>
						<span className="text-gray-900">{user.age || "N/A"}</span>
					</div>
					<div className="flex justify-between border-b pb-2">
						<span className="font-medium text-gray-600">Role:</span>
						<span className="text-gray-900 capitalize">{user.role}</span>
					</div>
					<div className="flex justify-between border-b pb-2">
						<span className="font-medium text-gray-600">User Points:</span>
						<span className="text-gray-900">{user.userPoints || "0"}</span>
					</div>
					<div className="flex justify-between border-b pb-2">
						<span className="font-medium text-gray-600">Admin:</span>
						<span className="text-gray-900">{user.isAdmin ? "Yes" : "No"}</span>
					</div>
				</div>
			</div>

			<button
				onClick={handleLogout}
				className="mt-6 w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition duration-200"
			>
				Logout
			</button>
		</div>
	);
};

export default MyProfile;
