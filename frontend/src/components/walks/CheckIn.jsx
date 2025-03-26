import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import api from "../../api/axios"; //test

const CheckIn = () => {
	const [walksWithUsers, setWalksWithUsers] = useState([]);
	const [checkedInUsers, setCheckedInUsers] = useState([]);
	const [dogs, setDogs] = useState([]);
	const [selectedDog, setSelectedDog] = useState({});
	const [completedDogWalks, setCompletedDogWalks] = useState({});
	const [refresh, setRefresh] = useState(false);
	const [role, setRole] = useState("");

	// Fetch today's walks
	useEffect(() => {
		const fetchWalks = async () => {
			try {
				const response = await api.get(`/scheduledWalks/checkInSchedules`);
				console.log("THE RESPONSE IN FETCH WALKS IS ", response.data.data);
				// Filter only today's walks
				const today = new Date().toISOString().split("T")[0];
				const filteredWalks = response.data.data.walks.filter(
					(walk) => new Date(walk.date).toISOString().split("T")[0] === today
				);
				setWalksWithUsers(filteredWalks);

				setCheckedInUsers(response.data.data.completedWalks);
			} catch (error) {
				console.error("Error fetching walks:", error);
			}
		};

		fetchWalks();
	}, [refresh]);

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (token) {
			try {
				const decodedToken = jwtDecode(token);
				const userRole = decodedToken.role;
				setRole(userRole);
			} catch (error) {
				console.error("Failed to decode token:", error);
			}
		} else {
			console.warn("no token in the local storage");
		}
	}, []);

	// Fetch available dogs
	useEffect(() => {
		const fetchDogs = async () => {
			try {
				const response = await api.get(`/dogs`);
				setDogs(response.data);
			} catch (error) {
				console.error("Error fetching dogs:", error);
			}
		};

		fetchDogs();
	}, []);

	// Handle check-in
	const handleCheckIn = async (walkId, walkerId, marshalId, date) => {
		try {
			const response = await api.post(`/completedWalk`, {
				userId: walkerId,
				walkId,
				marshalId,
				date,
			});
			alert("Check-in successful!");
			setCheckedInUsers((prev) => [...prev, walkerId]);
			setRefresh((prev) => !prev);
		} catch (error) {
			alert(error);
			console.error("Error checking in:", error);
		}
	};
	const handleCompleteDogWalk = async (walkId, walkerId) => {
		const key = `${walkId}-${walkerId}`;
		const dogId = selectedDog[key];

		if (!dogId) {
			alert("Please select a dog first.");
			return;
		}

		try {
			const response = await api.put(`/completedWalk/dogadded`, {
				userId: walkerId,
				walkId,
				dogId,
			});

			alert("Dog walk recorded successfully!");

			// Update completed dog walk count for UI
			setCompletedDogWalks((prev) => ({
				...prev,
				[walkerId]: response.data.completedDogCount,
			}));

			// Reset the selected dog for next selection
			setSelectedDog((prev) => ({
				...prev,
				[key]: "",
			}));

			setRefresh((prev) => !prev);
		} catch (error) {
			console.error("Error completing dog walk:", error);
		}
	};

	const handleCompleteUserWalk = async (walkId, walkerId) => {
		try {
			await api.put(`/completedWalk/completedUserWalk`, {
				userId: walkerId,
				walkId,
			});

			alert("User's full walk completed!");

			// Refresh UI
			setRefresh((prev) => !prev);
		} catch (error) {
			console.error("Error completing user walk:", error);
		}
	};

	const handleDidNotShow = async (walkId, walkerId) => {
		try {
			await api.put(`/completedWalk/didnotShowup`, {
				userId: walkerId,
				walkId,
			});

			alert("User marked as 'Did Not Show Up'. Points deducted.");

			// Refresh UI
			setRefresh((prev) => !prev);
		} catch (error) {
			console.error("Error marking as 'Did Not Show Up':", error);
		}
	};

	// Handle dropdown selection for assigning a single dog
	const handleDogChange = (walkId, walkerId, dogId) => {
		const key = `${walkId}-${walkerId}`;
		setSelectedDog({ ...selectedDog, [key]: dogId });
	};

	return (
		<div className="container mx-auto p-6">
			{role !== "admin" && role !== "marshal" ? (
				<div className="text-center text-red-600 text-2xl font-bold mt-20">
					You do not have permission to view this page.
				</div>
			) : (
				<>
					<h1 className="text-3xl font-bold text-gray-800 mb-6">
						Today's Scheduled Walks
					</h1>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{walksWithUsers.length === 0 ? (
							<p className="text-gray-600 text-center">
								No walks scheduled for today.
							</p>
						) : (
							walksWithUsers.map((walk) =>
								walk.walker.map((user) => (
									<div
										key={`${walk._id}-${user._id}`}
										className="bg-white border border-gray-300 rounded-lg shadow-md p-5 relative"
									>
										{/* Header: User & Walk Date */}
										<div className="flex justify-between">
											<h2 className="text-xl font-semibold text-blue-600">
												{user.firstName} {user.lastName}
											</h2>
											<p className="text-gray-500 text-sm">
												{new Date(walk.date).toLocaleDateString()}
											</p>
											<p className="absolute top-2 right-3 text-sm font-medium text-gray-600">
												Dogs Walked: {completedDogWalks[user._id] || 0}/3
											</p>
										</div>

										{/* Marshal Info */}
										<p className="text-gray-700 text-sm mb-3">
											<b>Marshal:</b>{" "}
											{walk.marshal ? walk.marshal.firstName : "Not Assigned"}
										</p>

										{/* Check-In and Did Not Show Up Buttons (only if not already checked in) */}
										{!checkedInUsers.find((data) => {
											const userData = data?.userId;
											const walkData = data?.walkId;
											return (
												userData?._id === user._id && walkData === walk._id
											);
										}) && (
											<div className="flex justify-between">
												<button
													className="bg-blue-500 text-white px-4 py-2 rounded-md"
													onClick={() =>
														handleCheckIn(
															walk._id,
															user._id,
															walk.marshal._id,
															walk.date
														)
													}
												>
													Check In
												</button>
												<button
													className="bg-red-500 text-white px-4 py-2 rounded-md"
													onClick={() => handleDidNotShow(walk._id, user._id)}
												>
													Did Not Show Up
												</button>
											</div>
										)}

										{/* Show remaining actions only after Check-In */}
										{checkedInUsers.find((data) => {
											const userData = data?.userId;
											const walkData = data?.walkId;
											return (
												userData?._id === user._id && walkData === walk._id
											);
										}) && (
											<>
												{/* Show already walked dogs */}
												{(() => {
													const matched = checkedInUsers.find(
														(data) =>
															data?.userId?._id === user._id &&
															data?.walkId === walk._id
													);
													return matched?.dogId?.length > 0 ? (
														<div className="mt-3">
															<p className="text-green-700 text-sm font-semibold">
																Dogs Already Walked:
															</p>
															<ul className="list-disc list-inside text-sm text-gray-700">
																{matched.dogId.map((dog) => (
																	<li key={dog._id}>
																		{dog?.name || "Unknown Dog"}
																	</li>
																))}
															</ul>
														</div>
													) : null;
												})()}
												{/* Dog Selection */}
												<p className="text-blue-600 font-medium mt-3">
													Select a dog to assign:
												</p>
												<select
													className="border border-gray-300 rounded-md p-2 w-full text-black"
													onChange={(e) =>
														handleDogChange(walk._id, user._id, e.target.value)
													}
													value={selectedDog[`${walk._id}-${user._id}`] || ""}
												>
													<option value="">Select a dog</option>
													{dogs.map((dog) => (
														<option key={dog._id} value={dog._id}>
															{dog.name}
														</option>
													))}
												</select>

												{/* Buttons */}
												<div className="flex flex-wrap mt-4 gap-3">
													<button
														className="bg-green-500 text-white px-4 py-2 rounded-md"
														onClick={() =>
															handleCompleteDogWalk(walk._id, user._id)
														}
													>
														Complete Dog Walk
													</button>
													<button
														className="bg-purple-500 text-white px-4 py-2 rounded-md"
														onClick={() =>
															handleCompleteUserWalk(walk._id, user._id)
														}
													>
														Complete User Walk
													</button>
												</div>
											</>
										)}
									</div>
								))
							)
						)}
					</div>
				</>
			)}
		</div>
	);
};

export default CheckIn;
