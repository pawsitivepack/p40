import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import api from "../../api/axios"; // Import custom Axios instance
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./MyCalendar.css";
import ScheduleWalkForm from "./ScheduleWalkForm";
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router-dom";
import {
	FaCalendarAlt,
	FaPlus,
	FaClock,
	FaMapMarkerAlt,
	FaUserShield,
	FaTicketAlt,
	FaCheck,
	FaTimes,
	FaUsers,
	FaPaw,
	FaSpinner,
} from "react-icons/fa";

const MyCalendar = () => {
	const [date, setDate] = useState(null);
	const [view, setView] = useState("month");
	const [showForm, setShowForm] = useState(false);
	const [role, setRole] = useState("");
	const [userID, setUserID] = useState("");
	const [availableWalks, setAvailableWalks] = useState([]);
	const [selectedWalk, setSelectedWalk] = useState(null);
	const [filteredWalks, setFilteredWalks] = useState([]);
	const [newEvent, setNewEvent] = useState({
		marshal: "",
		start: date,
		end: date,
		location: "920 F Drive Monroe LA",
	});
	const [isBulk, setIsBulk] = useState(false); // Added isBulk state
	const [selectedWalkId, setSelectedWalkId] = useState(null);
	const [slotSelections, setSlotSelections] = useState({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (token) {
			try {
				const decodedToken = jwtDecode(token);
				setRole(decodedToken.role);
				setUserID(decodedToken.id);

				// Auto-assign marshal for marshals
				if (decodedToken.role === "marshal") {
					setNewEvent((prevEvent) => ({
						...prevEvent,
						marshal: decodedToken.id,
					}));
				}
			} catch (error) {
				console.error("Failed to decode token:", error);
			}
		}
	}, []);

	useEffect(() => {
		if (date) {
			const selectedDateStr = date.toLocaleDateString();
			const filtered = availableWalks.filter((walk) => {
				const walkDate = new Date(walk.date);
				walkDate.setHours(0, 0, 0, 0);
				return walkDate.toLocaleDateString() === selectedDateStr;
			});
			setFilteredWalks(filtered);
		}
	}, [date, availableWalks]);

	const fetchAvailableWalks = async () => {
		try {
			setLoading(true);
			const response = await api.get("/scheduledwalks");
			setAvailableWalks(response.data);
			setLoading(false);
		} catch (error) {
			console.error("Error fetching available walks:", error);
			setError("Failed to load scheduled walks. Please try again.");
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchAvailableWalks();
	}, []);

	const handleDateChange = (selectedDate) => {
		setDate(selectedDate);
		const selectedDateStr = selectedDate.toLocaleDateString();

		setNewEvent((prevEvent) => ({
			...prevEvent,
			start: selectedDate,
			end: selectedDate,
		}));

		const filtered = availableWalks.filter((walk) => {
			const walkDate = new Date(walk.date);
			walkDate.setHours(0, 0, 0, 0);
			return walkDate.toLocaleDateString() === selectedDateStr;
		});

		setFilteredWalks(filtered);
		setShowForm(false); // Hide form when a new date is selected
	};

	const handleSelectWalk = (walkId) => {
		setSelectedWalkId(walkId);
		setSlotSelections((prev) => ({
			...prev,
			[walkId]: prev[walkId] || 1,
		}));
	};

	const handleConfirmWalk = async (walk) => {
		const slotsSelected = slotSelections[walk._id] || 1;

		const confirm = window.confirm(
			`Confirm ${slotsSelected} slot${
				slotsSelected > 1 ? "s" : ""
			} for walk on ${new Date(walk.date).toLocaleString()}?`
		);

		if (!confirm) return;

		try {
			const token = localStorage.getItem("token");
			if (!token) {
				toast.error("You must be logged in to confirm a walk.");
				return;
			}

			const decodedToken = jwtDecode(token);
			const userId = decodedToken.id;

			const response = await api.post(`/scheduledWalks/confirm`, {
				walkId: walk._id,
				userId: userId,
				slots: slotsSelected,
			});

			toast.success("Walk confirmed successfully!");
			await fetchAvailableWalks();
			setSelectedWalkId(null);
		} catch (error) {
			console.error("Error confirming walk:", error);
			toast.error(
				error.response?.data?.message ||
					"Failed to confirm the walk. Please try again."
			);
		}
	};

	const handleAddEvent = async (e, repeatUntil, selectedTimes) => {
		e.preventDefault();
		const schedulingToastId = toast.loading("Scheduling...");

		if (
			!newEvent.marshal ||
			(!isBulk && !newEvent.start) ||
			(isBulk && (!repeatUntil || selectedTimes.length === 0))
		) {
			toast.dismiss(schedulingToastId);
			toast.error("Please fill out all required fields.");
			return;
		}

		try {
			if (isBulk) {
				const start = new Date(newEvent.start);
				const end = new Date(
					new Date(repeatUntil).setDate(new Date(repeatUntil).getDate() + 1)
				);
				end.setHours(0, 0, 0, 0); // Set to the start of the next day to ensure inclusion

				let currentDate = new Date(start);
				while (currentDate <= end) {
					const day = currentDate.getDay();
					if (day !== 0 && day !== 1 && day !== 6) {
						// Only schedule on weekdays
						for (const time of selectedTimes) {
							const [hours, minutes] = time.split(":").map(Number);
							const newDate = new Date(currentDate);
							newDate.setHours(hours, minutes, 0, 0);

							await api.post(`/scheduledWalks/newWalk`, {
								marshal: newEvent.marshal,
								date: newDate,
								location: newEvent.location,
								status: "Scheduled",
							});
						}
					}
					currentDate.setDate(currentDate.getDate() + 1);
				}
				toast.dismiss(schedulingToastId);
				toast.success("Walk scheduled successfully!");
			} else {
				await api.post(`/scheduledWalks/newWalk`, {
					marshal: newEvent.marshal,
					date: newEvent.start,
					location: newEvent.location,
					status: "Scheduled",
				});
				toast.dismiss(schedulingToastId);
				toast.success("Walk scheduled successfully!");
			}

			setShowForm(false);
			await fetchAvailableWalks();
		} catch (error) {
			toast.dismiss(schedulingToastId);
			toast.error(
				error.response?.data?.error || "Failed to schedule the walk."
			);
		}
	};

	// Format date for better display
	const formatDate = (dateString) => {
		const options = {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		};
		return new Date(dateString).toLocaleDateString("en-US", options);
	};

	return (
		<div className="min-h-screen bg-[#f8f5f0]">
			{/* Header */}
			<div className="bg-[#8c1d35] text-white py-8 px-4 mb-8">
				<div className="max-w-7xl mx-auto">
					<h1 className="text-4xl font-bold text-center mb-2">
						Dog Walking Calendar
					</h1>
					<p className="text-center text-lg max-w-3xl mx-auto opacity-90">
						Schedule and manage dog walking appointments
					</p>
				</div>
			</div>

			<div className="container mx-auto px-4 pb-12">
				<ToastContainer
					position="top-right"
					autoClose={5000}
					hideProgressBar={false}
					newestOnTop
					closeOnClick
					rtl={false}
					pauseOnFocusLoss
					draggable
					pauseOnHover
					theme="light"
				/>

				{loading ? (
					<div className="flex justify-center items-center h-64">
						<div className="flex flex-col items-center">
							<FaSpinner className="animate-spin text-[#8c1d35] text-4xl mb-4" />
							<p className="text-[#8c1d35] font-medium">Loading calendar...</p>
						</div>
					</div>
				) : error ? (
					<div className="bg-white rounded-xl shadow-md p-8 text-center">
						<FaTimes className="text-[#8c1d35] text-5xl mx-auto mb-4" />
						<h2 className="text-2xl font-bold text-[#8c1d35] mb-2">Error</h2>
						<p className="text-gray-600 mb-4">{error}</p>
						<button
							onClick={() => fetchAvailableWalks()}
							className="bg-[#8c1d35] text-white px-4 py-2 rounded-lg hover:bg-[#7c1025] transition-colors"
						>
							Try Again
						</button>
					</div>
				) : (
					<div className="flex flex-col md:flex-row gap-6">
						{/* Calendar Section */}
						<div
							className={`bg-white shadow-md rounded-xl overflow-hidden ${
								date ? "md:w-1/2 lg:w-1/2" : "w-full"
							}`}
						>
							<div className="bg-[#e8d3a9] px-5 py-3 border-b border-[#d9c59a]">
							<div className="flex items-center justify-between">
								{/* Left: Calendar + Text */}
								<div className="flex items-center">
								<FaCalendarAlt className="text-[#8c1d35] mr-2" />
								<h2 className="text-xl font-semibold text-[#8c1d35]">
									Select a Date
								</h2>
								</div>

								{/* Right: Paw Icon + Link */}
								<div className="flex items-center gap-2">
								<FaPaw className="text-[#8c1d35] text-lg" />
								<Link
									to="/mywalks"
									className="text-[#8c1d35] hover:underline font-medium"
								>
									Go to MyWalks
								</Link>
								</div>
							</div>
							</div>

							<div className="p-4">
								<Calendar
									onChange={handleDateChange}
									value={date}
									view={view}
									onViewChange={setView}
									className="custom-calendar w-full h-full"
									tileDisabled={({ date }) => {
										// Disable Saturday (6), Sunday (0), and Monday (1)
										const day = date.getDay();
										return day === 0 || day === 1 || day === 6;
									}}
									tileContent={({ date }) => {
										const today = new Date();
										today.setHours(0, 0, 0, 0);

										const walksForDate = availableWalks.some((walk) => {
											const walkDate = new Date(walk.date);
											walkDate.setHours(0, 0, 0, 0);
											return (
												walkDate.toLocaleDateString() ===
													date.toLocaleDateString() && walkDate >= today
											);
										});

										return walksForDate ? (
											<div className="flex justify-center items-center mt-1">
												<FaPaw className="text-[#8c1d35] text-lg" />
											</div>
										) : null;
									}}
								/>
							</div>
						</div>

						{/* Walks Section */}
						{date && (
							<div className="md:w-1/2 lg:w-1/2 bg-white rounded-xl shadow-md overflow-hidden border border-[#e8d3a9]">
								<div className="bg-[#e8d3a9] px-5 py-3 border-b border-[#d9c59a]">
									<div className="flex justify-between items-center">
										<div className="flex items-center">
											<FaCalendarAlt className="text-[#8c1d35] mr-2" />
											<h2 className="text-xl font-semibold text-[#8c1d35]">
												{formatDate(date)}
											</h2>
										</div>
										{["marshal", "admin"].includes(role) && (
											<button
												onClick={() => setShowForm(true)}
												className="flex items-center gap-2 bg-[#8c1d35] text-white px-3 py-1 rounded-lg hover:bg-[#7c1025] transition-colors text-sm"
											>
												<FaPlus />
												Add Walk
											</button>
										)}
									</div>
								</div>

								<div className="p-5 max-h-[600px] overflow-y-auto">
									{/* Show message if no walks are available */}
									{filteredWalks.length === 0 ? (
										<div className="bg-[#f8f5f0] rounded-lg p-8 text-center">
											<FaPaw className="text-[#e8d3a9] text-5xl mx-auto mb-4" />
											<h3 className="text-xl font-bold text-[#8c1d35] mb-2">
												No Walks Available
											</h3>
											<p className="text-gray-600">
												There are no walks scheduled for this date.
											</p>
											{["marshal", "admin"].includes(role) && (
												<button
													onClick={() => setShowForm(true)}
													className="mt-4 flex items-center gap-2 bg-[#8c1d35] text-white px-4 py-2 rounded-lg hover:bg-[#7c1025] transition-colors mx-auto"
												>
													<FaPlus />
													Schedule a Walk
												</button>
											)}
										</div>
									) : (
										<div className="grid grid-cols-1 gap-4">
											{filteredWalks.map((walk) => {
												const isAlreadyWalked = walk.walker.some(
													(walker) => walker._id === userID
												);

												return (
													<div
														key={walk._id}
														className="border border-[#e8d3a9] rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all"
													>
														{/* Walk Header */}
														<div className="bg-[#f8f5f0] px-4 py-3 border-b border-[#e8d3a9]">
															<div className="flex justify-between items-center">
																<div className="flex items-center">
																	<FaClock className="text-[#8c1d35] mr-2" />
																	<span className="font-bold text-[#8c1d35]">
																		{new Date(walk.date).toLocaleTimeString(
																			[],
																			{
																				hour: "2-digit",
																				minute: "2-digit",
																			}
																		)}
																	</span>
																</div>
																<span
																	className={`px-2 py-1 rounded-full text-xs font-medium ${
																		walk.slots > 0
																			? "bg-green-100 text-green-800"
																			: "bg-red-100 text-red-800"
																	}`}
																>
																	{walk.slots > 0 ? (
																		<>
																			<FaTicketAlt className="inline mr-1" />
																			{walk.slots} slots available
																		</>
																	) : (
																		<>
																			<FaTimes className="inline mr-1" />
																			Full
																		</>
																	)}
																</span>
															</div>
														</div>

														{/* Walk Details */}
														<div className="p-4">
															<div className="space-y-3">
																{/* Location */}
																<div className="flex">
																	<div className="w-8 flex-shrink-0">
																		<div className="w-6 h-6 rounded-full bg-[#f8f5f0] flex items-center justify-center">
																			<FaMapMarkerAlt className="text-[#8c1d35] text-sm" />
																		</div>
																	</div>
																	<div>
																		<p className="text-xs text-gray-500">
																			Location
																		</p>
																		<p className="font-medium text-gray-800">
																			{walk.location}
																		</p>
																	</div>
																</div>

																{/* Marshal */}
																<div className="flex">
																	<div className="w-8 flex-shrink-0">
																		<div className="w-6 h-6 rounded-full bg-[#f8f5f0] flex items-center justify-center">
																			<FaUserShield className="text-[#8c1d35] text-sm" />
																		</div>
																	</div>
																	<div>
																		<p className="text-xs text-gray-500">
																			Marshal
																		</p>
																		<p className="font-medium text-gray-800">
																			{walk.marshal.firstName}{" "}
																			{walk.marshal.lastName}
																		</p>
																	</div>
																</div>

																{/* Walkers (for admin) */}
																{role === "admin" && walk.walker.length > 0 && (
																	<div className="flex">
																		<div className="w-8 flex-shrink-0">
																			<div className="w-6 h-6 rounded-full bg-[#f8f5f0] flex items-center justify-center">
																				<FaUsers className="text-[#8c1d35] text-sm" />
																			</div>
																		</div>
																		<div>
																			<p className="text-xs text-gray-500">
																				Walkers
																			</p>
																			<ul className="space-y-1 mt-1">
																				{walk.walker.map((walker) => (
																					<li
																						key={walker._id}
																						className="text-gray-800 text-sm"
																					>
																						{walker.firstName} {walker.lastName}
																					</li>
																				))}
																			</ul>
																		</div>
																	</div>
																)}
															</div>

															{/* Action Buttons */}
															{walk.slots === 0 ? (
																<div className="mt-4 bg-red-50 border border-red-100 rounded-lg p-2 text-center">
																	<p className="text-red-600 text-sm font-medium">
																		This walk is full
																	</p>
																</div>
															) : (
																role === "user" && (
																	<>
																		{selectedWalkId === walk._id ? (
																			<div className="mt-4 space-y-3">
																				<div className="flex items-center justify-center gap-2 bg-[#f8f5f0] rounded-lg p-2">
																					<button
																						className="w-8 h-8 flex items-center justify-center bg-white rounded-full border border-[#8c1d35] text-[#8c1d35]"
																						onClick={() =>
																							setSlotSelections((prev) => ({
																								...prev,
																								[walk._id]: Math.max(
																									1,
																									(prev[walk._id] || 1) - 1
																								),
																							}))
																						}
																					>
																						−
																					</button>
																					<span className="text-lg font-bold text-[#8c1d35] w-8 text-center">
																						{slotSelections[walk._id] || 1}
																					</span>
																					<button
																						className="w-8 h-8 flex items-center justify-center bg-white rounded-full border border-[#8c1d35] text-[#8c1d35]"
																						onClick={() =>
																							setSlotSelections((prev) => ({
																								...prev,
																								[walk._id]: Math.min(
																									walk.slots,
																									(prev[walk._id] || 1) + 1
																								),
																							}))
																						}
																					>
																						＋
																					</button>
																				</div>
																				<button
																					onClick={() =>
																						handleConfirmWalk(walk)
																					}
																					className="w-full py-2 rounded-lg bg-[#8c1d35] hover:bg-[#7c1025] text-white font-medium flex items-center justify-center gap-2"
																				>
																					<FaCheck />
																					Confirm{" "}
																					{slotSelections[walk._id] || 1} Slot
																					{slotSelections[walk._id] > 1
																						? "s"
																						: ""}
																				</button>
																			</div>
																		) : (
																			<button
																				onClick={() =>
																					handleSelectWalk(walk._id)
																				}
																				disabled={isAlreadyWalked}
																				className={`mt-4 w-full py-2 rounded-lg text-white font-medium transition-colors ${
																					isAlreadyWalked
																						? "bg-gray-400 cursor-not-allowed"
																						: "bg-[#f5b82e] hover:bg-[#e5a81e] text-[#8c1d35]"
																				}`}
																			>
																				{isAlreadyWalked
																					? "Already Selected"
																					: "Select Walk"}
																			</button>
																		)}
																	</>
																)
															)}
														</div>
													</div>
												);
											})}
										</div>
									)}
								</div>
							</div>
						)}
					</div>
				)}

				{showForm && ["marshal", "admin"].includes(role) && (
					<ScheduleWalkForm
						newEvent={newEvent}
						setNewEvent={setNewEvent}
						setShowForm={setShowForm}
						handleAddEvent={handleAddEvent}
						isBulk={isBulk}
						setIsBulk={setIsBulk}
					/>
				)}
			</div>
		</div>
	);
};

export default MyCalendar;
