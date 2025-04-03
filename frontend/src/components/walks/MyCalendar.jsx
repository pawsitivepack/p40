"use client";

import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import api from "../../api/axios"; // Import custom Axios instance
import { toast } from "react-toastify";
import "./MyCalendar.css";
import ScheduleWalkForm from "./ScheduleWalkForm";
import { jwtDecode } from "jwt-decode";
import { Link, useNavigate } from "react-router-dom";
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
	FaSave,
	FaCog,
	FaInfoCircle,
} from "react-icons/fa";

const MyCalendar = () => {
	const [date, setDate] = useState(null);
	const [view, setView] = useState("month");
	const [showForm, setShowForm] = useState(false);
	const [role, setRole] = useState("");
	const [userID, setUserID] = useState("");
	const [waiverSigned, setWaiverSigned] = useState(false);
	const [availableWalks, setAvailableWalks] = useState([]);
	const [selectedWalk, setSelectedWalk] = useState(null);
	const [showSettings, setShowSettings] = useState(false);
	const [restrictedDays, setRestrictedDays] = useState([0, 1]); // Closed: Sunday, Monday
	const [filteredWalks, setFilteredWalks] = useState([]);
	const [restrictedDates, setRestrictedDates] = useState([]);
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
	const [newRestrictedDate, setNewRestrictedDate] = useState("");
	const [newWeeklyHourDay, setNewWeeklyHourDay] = useState("2");
	const [newStartHour, setNewStartHour] = useState("08:00");
	const [newEndHour, setNewEndHour] = useState("17:00");

	const navigate = useNavigate();

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (token) {
			try {
				const decodedToken = jwtDecode(token);
				setRole(decodedToken.role);
				setUserID(decodedToken.id);

				// Auto-assign marshal
				if (decodedToken.role === "marshal") {
					setNewEvent((prevEvent) => ({
						...prevEvent,
						marshal: decodedToken.id,
					}));
				}

				// 🛡️ Check waiver status for users
				if (decodedToken.role === "user") {
					api
						.get("/waiver/status", {
							headers: { Authorization: `Bearer ${token}` },
						})
						.then((res) => {
							setWaiverSigned(res.data.waiverSigned);
						})
						.catch((err) => {
							console.error("Error fetching waiver status:", err);
						});
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

	const saveDateSettings = async () => {
		try {
			await api.put("/settings/restrictions", {
				daysClosed: restrictedDays,
				specificDates: restrictedDates,
				weeklyHours: newEvent.weeklyHours || {},
			});
			toast.success("Settings saved successfully!");
		} catch (error) {
			console.error("Failed to save settings:", error);
			toast.error("Failed to save settings.");
		}
	};

	useEffect(() => {
		fetchAvailableWalks();
		const fetchDateSettings = async () => {
			try {
				const response = await api.get("/settings/restrictions");
				const { daysClosed, specificDates, weeklyHours } = response.data;
				setRestrictedDays(daysClosed || []);
				setRestrictedDates(specificDates || []);
				if (weeklyHours) {
					setNewStartHour(weeklyHours.start);
					setNewEndHour(weeklyHours.end);
				} else {
					setNewStartHour("10:00");
					setNewEndHour("15:00");
				}
			} catch (err) {
				console.error("Failed to fetch calendar restrictions:", err);
			}
		};
		fetchDateSettings();
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

		if (!waiverSigned) {
			toast.warning("Please sign the waiver before booking a walk.");
			return (window.location.href = "/waiver");
		}

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
			setTimeout(() => {
				navigate("/walkdogs");
			}, 1500);
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

				const currentDate = new Date(start);
				while (currentDate <= end) {
					const day = currentDate.getDay();
					const isDayBlocked = restrictedDays.includes(day);
					const isDateBlocked = restrictedDates.some(
						(d) => new Date(d).toDateString() === currentDate.toDateString()
					);
					if (!isDayBlocked && !isDateBlocked) {
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
						{role === "admin" && (
							<div className="flex justify-end">
								<button
									onClick={() => setShowSettings(!showSettings)}
									className="text-white text-xl hover:text-yellow-200 transition"
								>
									<FaCog />
								</button>
							</div>
						)}
						Dog Walking Calendar
					</h1>
					<p className="text-center text-lg max-w-3xl mx-auto opacity-90">
						Schedule and manage dog walking appointments
					</p>
				</div>
			</div>

			<div className="container mx-auto px-4 pb-12">
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
										const day = date.getDay();
										const isDayBlocked = restrictedDays.includes(day);
										const isDateBlocked = restrictedDates.some(
											(d) => new Date(d).toDateString() === date.toDateString()
										);
										return isDayBlocked || isDateBlocked;
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
																			{walk.marshal
																				.map(
																					(m) => `${m.firstName} ${m.lastName}`
																				)
																				.join(", ")}
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
			{showSettings && role === "admin" && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-lg">
					<div className="bg-white rounded-xl shadow-xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col">
						{/* Header */}
						<div className="bg-[#8c1d35] px-6 py-4 flex justify-between items-center sticky top-0 z-10">
							<div className="flex items-center">
								<FaCog className="text-white mr-3 text-xl" />
								<h3 className="text-xl font-bold text-white">
									Calendar Settings
								</h3>
							</div>
							<button
								onClick={() => setShowSettings(false)}
								className="text-white hover:text-gray-200 transition-colors"
								aria-label="Close settings"
							>
								<FaTimes className="text-xl" />
							</button>
						</div>

						{/* Content */}
						<div className="overflow-y-auto p-6 flex-grow">
							{/* Tabs */}
							<div className="flex border-b border-gray-200 mb-6">
								<button className="px-4 py-2 border-b-2 border-[#8c1d35] text-[#8c1d35] font-medium relative">
									Availability
									<span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#8c1d35] transform scale-x-100 transition-transform origin-left"></span>
								</button>
							</div>
							{/* Closed Days Section */}
							<div className="mb-8 transition-all duration-300 hover:shadow-md rounded-lg p-4 border border-transparent hover:border-[#e8d3a9]">
								<h4 className="text-lg font-medium text-[#8c1d35] mb-4 flex items-center">
									<FaCalendarAlt className="mr-2" /> Closed Days
								</h4>
								<div className="bg-[#f8f5f0] p-5 rounded-lg border border-[#e8d3a9]">
									<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
										{[0, 1, 2, 3, 4, 5, 6].map((day) => (
											<div
												key={day}
												className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
													restrictedDays.includes(day)
														? "bg-[#8c1d35] text-white"
														: "bg-white text-gray-700 hover:bg-gray-100"
												}`}
												onClick={() =>
													setRestrictedDays((prev) =>
														prev.includes(day)
															? prev.filter((d) => d !== day)
															: [...prev, day]
													)
												}
											>
												<div
													className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
														restrictedDays.includes(day)
															? "bg-white text-[#8c1d35]"
															: "bg-gray-200"
													}`}
												>
													{restrictedDays.includes(day) && (
														<FaCheck className="text-xs" />
													)}
												</div>
												<span className="font-medium">
													{
														[
															"Sunday",
															"Monday",
															"Tuesday",
															"Wednesday",
															"Thursday",
															"Friday",
															"Saturday",
														][day]
													}
												</span>
											</div>
										))}
									</div>
									<div className="mt-4 text-sm text-gray-500 italic">
										Click on a day to toggle it as closed or open
									</div>
								</div>
							</div>
							{/* Restricted Dates Section */}
							{/* Restricted Dates Section */}
							<div className="mb-8 transition-all duration-300 hover:shadow-md rounded-lg p-4 border border-transparent hover:border-[#e8d3a9]">
								<h4 className="text-lg font-medium text-[#8c1d35] mb-4 flex items-center">
									<FaCalendarAlt className="mr-2" /> Specific Closed Dates
								</h4>
								<div className="bg-[#f8f5f0] p-5 rounded-lg border border-[#e8d3a9]">
									<div className="flex flex-col md:flex-row gap-6">
										<div className="flex-1">
											<label className="block font-medium text-sm mb-2 text-gray-700">
												Add Restricted Date:
											</label>
											<div className="flex gap-2">
												<input
													type="date"
													value={newRestrictedDate}
													onChange={(e) => setNewRestrictedDate(e.target.value)}
													className="border border-gray-300 rounded-lg px-4 py-2 flex-1 text-gray-700 focus:border-[#8c1d35] focus:ring focus:ring-[#8c1d35] focus:ring-opacity-50 transition-all"
												/>
												<button
													onClick={() => {
														if (
															newRestrictedDate &&
															!restrictedDates.includes(newRestrictedDate)
														) {
															setRestrictedDates([
																...restrictedDates,
																newRestrictedDate,
															]);
															setNewRestrictedDate("");
														} else if (
															restrictedDates.includes(newRestrictedDate)
														) {
															toast.warning("This date is already restricted");
														} else {
															toast.error("Please select a date");
														}
													}}
													className="bg-[#8c1d35] text-white px-4 py-2 rounded-lg hover:bg-[#7c1025] transition-colors flex items-center gap-2 min-w-[100px] justify-center"
												>
													<FaPlus className="text-sm" /> Add
												</button>
											</div>
										</div>

										<div className="flex-1">
											<label className="block font-medium text-sm mb-2 text-gray-700">
												Current Restricted Dates:
											</label>
											<div className="bg-white border border-gray-200 rounded-lg p-4 min-h-[120px] max-h-[200px] overflow-y-auto">
												{restrictedDates.length > 0 ? (
													<div className="flex flex-wrap gap-2">
														{restrictedDates.map((date, index) => (
															<div
																key={index}
																className="bg-[#f8f5f0] px-3 py-2 rounded-lg flex items-center gap-2 border border-[#e8d3a9] group hover:bg-[#e8d3a9] transition-colors"
															>
																<span className="text-sm text-gray-700">
																	{date}
																</span>
																<button
																	onClick={() => {
																		const newDates = [...restrictedDates];
																		newDates.splice(index, 1);
																		setRestrictedDates(newDates);
																		toast.info("Date removed");
																	}}
																	className="text-gray-400 hover:text-[#8c1d35] transition-colors group-hover:text-[#8c1d35]"
																	aria-label="Remove date"
																>
																	<FaTimes size={14} />
																</button>
															</div>
														))}
													</div>
												) : (
													<div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm italic">
														<FaCalendarAlt className="text-gray-300 text-3xl mb-2" />
														<p>No restricted dates added</p>
													</div>
												)}
											</div>
										</div>
									</div>
								</div>
							</div>{" "}
							{/* Added missing closing div for Restricted Dates Section */}
							{/* Office Hours Section */}
							<div className="mb-6 transition-all duration-300 hover:shadow-md rounded-lg p-4 border border-transparent hover:border-[#e8d3a9]">
								<h4 className="text-lg font-medium text-[#8c1d35] mb-4 flex items-center">
									<FaClock className="mr-2" /> Office Hours
								</h4>
								<div className="bg-[#f8f5f0] p-5 rounded-lg border border-[#e8d3a9]">
									<label className="block font-medium text-sm mb-3 text-gray-700">
										Set Default Hours for All Days:
									</label>
									<div className="flex flex-wrap gap-4 items-center bg-white p-5 rounded-lg border border-gray-200">
										<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
											<div className="flex items-center">
												<span className="text-gray-700 mr-3 font-medium">
													From:
												</span>
												<input
													type="time"
													value={newStartHour}
													onChange={(e) => setNewStartHour(e.target.value)}
													className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:border-[#8c1d35] focus:ring focus:ring-[#8c1d35] focus:ring-opacity-50 transition-all"
												/>
											</div>
											<div className="flex items-center">
												<span className="text-gray-700 mr-3 font-medium">
													To:
												</span>
												<input
													type="time"
													value={newEndHour}
													onChange={(e) => setNewEndHour(e.target.value)}
													className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:border-[#8c1d35] focus:ring focus:ring-[#8c1d35] focus:ring-opacity-50 transition-all"
												/>
											</div>
										</div>

										<button
											onClick={() => {
												setNewEvent((prev) => ({
													...prev,
													weeklyHours: {
														0: { start: newStartHour, end: newEndHour },
														1: { start: newStartHour, end: newEndHour },
														2: { start: newStartHour, end: newEndHour },
														3: { start: newStartHour, end: newEndHour },
														4: { start: newStartHour, end: newEndHour },
														5: { start: newStartHour, end: newEndHour },
														6: { start: newStartHour, end: newEndHour },
													},
												}));
												toast.success("Hours applied to all days");
											}}
											className="bg-[#8c1d35] text-white px-4 py-2 rounded-lg hover:bg-[#7c1025] transition-colors flex items-center gap-2"
										>
											<FaCheck className="text-sm" /> Apply to All Days
										</button>
									</div>

									<div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
										<div className="flex items-start">
											<FaInfoCircle className="text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
											<p>
												These hours will apply to all days that are not marked
												as closed. Walks can only be scheduled during these
												hours.
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Footer with actions */}
						<div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end gap-3 sticky bottom-0">
							<button
								onClick={() => setShowSettings(false)}
								className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
							>
								Cancel
							</button>
							<button
								onClick={() => {
									saveDateSettings();
									// Don't close the modal immediately to allow the user to see the success message
									setTimeout(() => setShowSettings(false), 1500);
								}}
								className="px-6 py-2 bg-[#8c1d35] text-white rounded-lg hover:bg-[#7c1025] transition-colors flex items-center gap-2 font-medium"
							>
								<FaSave className="text-sm" /> Save Settings
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default MyCalendar;
