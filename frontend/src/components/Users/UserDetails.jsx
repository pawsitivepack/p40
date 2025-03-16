import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import { FaUserCircle } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";

const ViewUserDetails = () => {
	const { id } = useParams();
	const [user, setUser] = useState(null);
	const [walks, setWalks] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchUserDetails = async () => {
			try {
				const response = await api.get(`/users/viewUser/${id}`);
				setUser(response.data.user);
				setWalks(response.data.walks);
			} catch (err) {
				console.error("Failed to fetch user details:", err);
				setError("Failed to fetch user details.");
			} finally {
				setLoading(false);
			}
		};

		fetchUserDetails();
	}, [id]);

	if (loading) {
		return (
			<div className="flex justify-center items-center h-screen bg-gray-100">
				<p className="text-lg text-blue-600">Loading...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex justify-center items-center h-screen bg-gray-100">
				<p className="text-red-600 text-xl">{error}</p>
			</div>
		);
	}

	return (
		<div className="max-w-3xl mx-auto mt-10 p-6 pb-10 bg-white shadow-lg rounded-lg">
			<div className="flex items-center space-x-6 mb-6">
				{user?.picture ? (
					<img
						src={user.picture}
						alt="User Profile"
						className="w-24 h-24 rounded-full shadow-md border border-gray-300"
					/>
				) : (
					<FaUserCircle className="w-24 h-24 text-gray-400" />
				)}
				<div>
					<h1 className="text-3xl font-bold text-indigo-800">
						{user?.firstName} {user?.lastName}
					</h1>
					<p className="text-gray-600">{user?.email}</p>
					<p className="text-gray-600">Phone: {user?.phone}</p>
					<p className="text-gray-600">Points: {user?.userPoints}</p>
					<p className="text-gray-600">
						Last Login:{" "}
						{user?.lastLogin
							? formatDistanceToNow(new Date(user.lastLogin), {
									addSuffix: true,
							  })
							: user?.createdAt
							? formatDistanceToNow(new Date(user.createdAt), {
									addSuffix: true,
							  })
							: "Never"}
					</p>
					<p className="text-gray-600">
						Account Created: {new Date(user?.createdAt).toLocaleDateString()}
					</p>
				</div>
			</div>

			<div className="mt-6">
				<h2 className="text-2xl font-semibold text-indigo-800 mb-4">
					Upcoming Walks
				</h2>
				{walks?.length > 0 ? (
					<div className="space-y-4">
						{walks.map((walk, index) => (
							<div
								key={index}
								className="p-4 border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition"
							>
								<p className="text-gray-800">
									<strong>Date:</strong>{" "}
									{new Date(walk.date).toLocaleDateString()}
								</p>
								<p className="text-gray-800">
									<strong>Location:</strong> {walk.location}
								</p>
								<p className="text-gray-800">
									<strong>Status:</strong> {walk.status}
								</p>
								<p className="text-gray-800">
									<strong>Duration:</strong> {walk.duration}
								</p>
							</div>
						))}
					</div>
				) : (
					<p className="text-gray-600">No upcoming walks scheduled.</p>
				)}
			</div>

			<div className="mt-6">
				<h2 className="text-2xl font-semibold text-indigo-800 mb-4">
					Completed Walks
				</h2>
				{user?.completedWalks?.length > 0 ? (
					<div className="space-y-4">
						{user.completedWalks.map((walk, index) => (
							<div
								key={index}
								className="p-4 border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition"
							>
								<p className="text-gray-800">
									<strong>Date:</strong>{" "}
									{new Date(walk.date).toLocaleDateString()}
								</p>
								<p className="text-gray-800">
									<strong>Status:</strong> {walk.status}
								</p>
								<p className="text-gray-800">
									<strong>Dogs Involved:</strong>{" "}
									{walk.dogId?.join(", ") || "N/A"}
								</p>
							</div>
						))}
					</div>
				) : (
					<p className="text-gray-600">No completed walks yet.</p>
				)}
			</div>
		</div>
	);
};

export default ViewUserDetails;
