import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import {
	FaCheckCircle,
	FaTimesCircle,
	FaPaw,
	FaUserClock,
	FaCalendarCheck,
	FaExclamationTriangle,
} from "react-icons/fa";

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
				console.log(response.data.data);
				setWalksWithUsers(response.data.data.walks);

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
				const response = await api.get(`/dogs/filtered`);

				setDogs(response.data);
			} catch (error) {
				console.error("Error fetching dogs:", error);
			}
		};

		fetchDogs();
	}, [selectedDog, refresh]);

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

	// Format date for better display
	const formatDate = (dateString) => {
		const options = {
			weekday: "short",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		};
		return new Date(dateString).toLocaleDateString("en-US", options);
	};

	return (
		<div className="min-h-screen bg-[#f8f5f0]">
			{/* Header */}
			<div className="bg-[#8c1d35] text-white py-8 px-4 mb-8">
				<div className="max-w-7xl mx-auto">
					<h1 className="text-4xl font-bold text-center mb-2">
						Today's Scheduled Walks
					</h1>
					<p className="text-center text-lg max-w-3xl mx-auto opacity-90">
						Check in walkers and assign dogs for today's scheduled walks
					</p>
				</div>
			</div>

			<div className="container mx-auto px-4 pb-12">
				{role !== "admin" && role !== "marshal" ? (
					<div className="bg-white rounded-xl shadow-md p-8 text-center">
						<FaExclamationTriangle className="text-[#8c1d35] text-5xl mx-auto mb-4" />
						<h2 className="text-2xl font-bold text-[#8c1d35] mb-2">
							Access Restricted
						</h2>
						<p className="text-gray-600">
							You do not have permission to view this page. Only marshals and
							administrators can access the check-in system.
						</p>
					</div>
				) : (
					<>
						{/* Today's date display */}
						<div className="bg-[#e8d3a9] rounded-xl p-4 mb-6 flex items-center justify-between">
							<div className="flex items-center">
								<FaCalendarCheck className="text-[#8c1d35] text-xl mr-3" />
								<h2 className="text-xl font-semibold text-[#8c1d35]">
									{new Date().toLocaleDateString("en-US", {
										weekday: "long",
										year: "numeric",
										month: "long",
										day: "numeric",
									})}
								</h2>
							</div>
							{(() => {
								const totalWalkersToday = walksWithUsers.reduce(
									(total, walk) => total + (walk.walker?.length || 0),
									0
								);
								return (
									<div className="text-[#8c1d35] font-medium">
										{totalWalkersToday}{" "}
										{totalWalkersToday === 1 ? "walker" : "walkers"} scheduled
									</div>
								);
							})()}
						</div>

						{walksWithUsers.length === 0 ||
						walksWithUsers.every(
							(walk) => !walk.walker || walk.walker.length === 0
						) ? (
							<div className="bg-white rounded-xl shadow-md p-8 text-center">
								<FaPaw className="text-[#e8d3a9] text-5xl mx-auto mb-4" />
								<h2 className="text-2xl font-bold text-[#8c1d35] mb-2">
									No Walks Today
								</h2>
								<p className="text-gray-600">
									There are no walks scheduled for today. Check back later or
									schedule new walks.
								</p>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{walksWithUsers.map((walk) =>
									walk.walker.map((user) => {
										// Check if user is already checked in
										const isCheckedIn = checkedInUsers.find((data) => {
											const userData = data?.userId;
											const walkData = data?.walkId;
											return (
												userData?._id === user._id && walkData === walk._id
											);
										});

										// Get completed dog walks for this user
										const userCompletedWalks = checkedInUsers.find(
											(data) =>
												data?.userId?._id === user._id &&
												data?.walkId === walk._id
										);

										const dogsWalked = userCompletedWalks?.dogs?.length || 0;
										const dogWalkStatus =
											dogsWalked >= 3 ? "completed" : "in-progress";

										return (
											<div
												key={`${walk._id}-${user._id}`}
												className="bg-white rounded-xl shadow-md overflow-hidden border border-[#e8d3a9]"
											>
												{/* Card Header */}
												<div className="bg-[#e8d3a9] px-5 py-3 border-b border-[#d9c59a]">
													<div className="flex justify-between items-center">
														<h2 className="text-xl font-bold text-[#8c1d35]">
															{user.firstName} {user.lastName}
														</h2>
														<div className="flex items-center">
															<FaUserClock className="text-[#8c1d35] mr-1" />
															<span className="text-[#8c1d35] text-sm font-medium">
																{formatDate(walk.date)}
															</span>
														</div>
													</div>
												</div>

												{/* Card Body */}
												<div className="p-5">
													{/* Marshal Info */}
													<div className="flex items-center mb-4 bg-[#f8f5f0] p-3 rounded-lg">
														<div className="mr-3 bg-[#8c1d35] text-white p-2 rounded-full">
															<FaUserClock className="text-lg" />
														</div>
														<div>
															<p className="text-sm text-gray-500">Marshal</p>
															<p className="font-medium text-[#8c1d35]">
																{Array.isArray(walk.marshal) &&
																walk.marshal.length > 0
																	? walk.marshal
																			.map(
																				(m) => `${m.firstName} ${m.lastName}`
																			)
																			.join(", ")
																	: "Not Assigned"}
															</p>
														</div>
													</div>

													{/* Dog Walking Progress */}
													<div className="mb-4">
														<div className="flex justify-between items-center mb-2">
															<span className="text-sm font-medium text-gray-700">
																Dogs Walked
															</span>
															<span className="text-sm font-bold text-[#8c1d35]">
																{dogsWalked}/3
															</span>
														</div>
														<div className="w-full bg-gray-200 rounded-full h-2.5">
															<div
																className={`h-2.5 rounded-full ${
																	dogWalkStatus === "completed"
																		? "bg-green-500"
																		: "bg-[#f5b82e]"
																}`}
																style={{ width: `${(dogsWalked / 3) * 100}%` }}
															></div>
														</div>
													</div>

													{/* Show dogs walked */}
													{dogsWalked > 0 && (
														<div className="mt-2 flex flex-wrap gap-2">
															{userCompletedWalks?.dogs?.map((dogId) => {
																const dog = dogs.find((d) => d._id === dogId);
																return (
																	<span
																		key={dogId}
																		className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#e8d3a9] text-[#8c1d35]"
																	>
																		<FaPaw className="mr-1" />
																		{dog?.name || "Unknown Dog"}
																	</span>
																);
															})}
														</div>
													)}

													{/* Check-In and Did Not Show Up Buttons (only if not already checked in) */}
													{!isCheckedIn && (
														<div className="grid grid-cols-2 gap-3 mb-4">
															<button
																className="flex items-center justify-center gap-2 bg-[#8c1d35] text-white px-4 py-3 rounded-lg hover:bg-[#7c1025] transition-colors"
																onClick={() =>
																	handleCheckIn(
																		walk._id,
																		user._id,
																		walk.marshal._id,
																		walk.date
																	)
																}
															>
																<FaCheckCircle />
																Check In
															</button>
															<button
																className="flex items-center justify-center gap-2 bg-white border border-[#8c1d35] text-[#8c1d35] px-4 py-3 rounded-lg hover:bg-[#f8f5f0] transition-colors"
																onClick={() =>
																	handleDidNotShow(walk._id, user._id)
																}
															>
																<FaTimesCircle />
																No Show
															</button>
														</div>
													)}

													{/* Show remaining actions only after Check-In */}
													{isCheckedIn && (
														<>
															{/* Status Badge */}
															<div className="flex items-center mb-4">
																<span
																	className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
																		dogWalkStatus === "completed"
																			? "bg-green-100 text-green-800"
																			: "bg-yellow-100 text-yellow-800"
																	}`}
																>
																	{dogWalkStatus === "completed" ? (
																		<>
																			<FaCheckCircle className="mr-1" />
																			Walk Completed
																		</>
																	) : (
																		<>
																			<FaPaw className="mr-1" />
																			In Progress
																		</>
																	)}
																</span>
															</div>

															{/* Show already walked dogs */}
															{dogsWalked > 0 && (
																<div className="mb-4 bg-[#f8f5f0] p-3 rounded-lg">
																	<p className="text-[#8c1d35] text-sm font-semibold mb-2">
																		Dogs Already Walked:
																	</p>
																	<div className="flex flex-wrap gap-2">
																		{userCompletedWalks?.dogs?.map((dogId) => {
																			const dog = dogs.find(
																				(d) => d._id === dogId
																			);
																			return (
																				<span
																					key={dogId}
																					className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#e8d3a9] text-[#8c1d35]"
																				>
																					<FaPaw className="mr-1" />
																					{dog?.name || "Unknown dog"}
																				</span>
																			);
																		})}
																	</div>
																</div>
															)}

															{/* Dog Selection */}
															<div className="mb-4">
																<label className="block text-[#8c1d35] font-medium mb-2">
																	Select a dog to assign:
																</label>
																<select
																	className="w-full p-3 border border-[#e8d3a9] rounded-lg focus:ring-[#8c1d35] focus:border-[#8c1d35] bg-white text-gray-700"
																	onChange={(e) =>
																		handleDogChange(
																			walk._id,
																			user._id,
																			e.target.value
																		)
																	}
																	value={
																		selectedDog[`${walk._id}-${user._id}`] || ""
																	}
																>
																	<option value="">Select a dog</option>
																	{dogs.map((dog) => (
																		<option key={dog._id} value={dog._id}>
																			{dog.demeanor === "Red" && "🔴 "}
																			{dog.demeanor === "Yellow" && "🟡 "}
																			{dog.demeanor === "Gray" && "⚪ "}
																			{dog.name}
																		</option>
																	))}
																</select>
															</div>

															{/* Action Buttons */}
															<div className="grid grid-cols-2 gap-3">
																<button
																	className="flex items-center justify-center gap-2 bg-[#f5b82e] text-[#8c1d35] px-4 py-3 rounded-lg hover:bg-[#e5a81e] transition-colors font-medium"
																	onClick={() =>
																		handleCompleteDogWalk(walk._id, user._id)
																	}
																>
																	<FaPaw />
																	Record Dog Walk
																</button>
																<button
																	className="flex items-center justify-center gap-2 bg-[#8c1d35] text-white px-4 py-3 rounded-lg hover:bg-[#7c1025] transition-colors font-medium"
																	onClick={() =>
																		handleCompleteUserWalk(walk._id, user._id)
																	}
																>
																	<FaCheckCircle />
																	Complete Walk
																</button>
															</div>
														</>
													)}
												</div>
											</div>
										);
									})
								)}
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
};

export default CheckIn;
