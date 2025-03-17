import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import api from "../../api/axios"; // Import custom Axios instance
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./MyCalendar.css";
import ScheduleWalkForm from "./ScheduleWalkForm";
import { jwtDecode } from "jwt-decode";
import { CheckBadgeIcon, PlusCircleIcon } from "@heroicons/react/24/solid";

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
				const walkDateStr = new Date(walk.date).toLocaleDateString();
				return walkDateStr === selectedDateStr;
			});
			setFilteredWalks(filtered);
		}
	}, [date, availableWalks]);

	const fetchAvailableWalks = async () => {
		try {
			const response = await api.get("/scheduledwalks");
			setAvailableWalks(response.data);
		} catch (error) {
			console.error("Error fetching available walks:", error);
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
			const walkDateStr = new Date(walk.date).toLocaleDateString();
			return walkDateStr === selectedDateStr;
		});

		setFilteredWalks(filtered);
		setShowForm(false); // Hide form when a new date is selected
	};
	const handleConfirmWalk = async (walk) => {
		const confirm = window.confirm(
			`Do you want to confirm the walk on ${new Date(
				walk.date
			).toLocaleDateString()} at ${new Date(walk.date).toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
			})}?`
		);

		if (confirm) {
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
					userId: userId, // Send userId along with walkId
				});
				toast.success("Walk confirmed successfully!");
				await fetchAvailableWalks(); // Refresh data after confirmation
			} catch (error) {
				console.error("Error confirming walk:", error);
				toast.error(
					error.response?.data?.message ||
						"Failed to confirm the walk. Please try again."
				);
			}
		}
	};

	const handleSelectWalk = (walk) => {
		setSelectedWalk(walk._id);
		handleConfirmWalk(walk); // Confirm the walk immediately
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

	return (
		<div className="container mx-auto px-4">
			<ToastContainer />

			<div className="flex flex-col md:flex-row gap-6">
				<div
					className={`bg-white shadow-md rounded-lg p-4 
    ${date ? "md:w-1/2 lg:w-1/2" : "w-full"}`}
				>
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
									walkDate.toLocaleDateString() === date.toLocaleDateString() &&
									walkDate >= today
								);
							});

							return walksForDate ? (
								<div className="flex justify-center items-center mt-1">
									<CheckBadgeIcon className="w-8 h-8 text-green-500" />
								</div>
							) : null;
						}}
					/>
				</div>

				{date && (
					<div className="md:w-1/2 lg:w-1/2 bg-gray-100 shadow-lg rounded-lg p-6 border border-gray-300 overflow-y-auto h-[600px]">
						<h2 className="text-3xl font-extrabold mb-6 text-gray-900 text-center">
							{`Walks on ${date.toLocaleDateString()}`}
						</h2>

						{["marshal", "admin"].includes(role) && (
							<button
								onClick={() => setShowForm(true)}
								className="mb-4 flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg text-lg font-bold hover:bg-green-700 transition-all duration-300 shadow-md"
							>
								<PlusCircleIcon className="w-6 h-6" />
								<span>Add Walk</span>
							</button>
						)}

						{/* Show message if no walks are available */}
						{filteredWalks.length === 0 ? (
							<p className="text-gray-700 bg-gray-200 rounded-lg text-center col-span-full p-6 shadow-md">
								🚫 No walks available for this date.
							</p>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{filteredWalks.map((walk) => {
									const isAlreadyWalked = walk.walker.some(
										(walker) => walker._id === userID
									);

									return (
										<div
											key={walk._id}
											className="border border-gray-300 rounded-lg p-5 shadow-lg bg-white hover:shadow-2xl transform hover:scale-105 transition-all"
										>
											<div className="space-y-2">
												<p className="text-gray-800">
													<span className="font-bold">📅 Date:</span>{" "}
													{new Date(walk.date).toLocaleDateString()}
												</p>
												<p className="text-gray-800">
													<span className="font-bold">⏰ Time:</span>{" "}
													{new Date(walk.date).toLocaleTimeString([], {
														hour: "2-digit",
														minute: "2-digit",
													})}
												</p>

												{role === "admin" && walk.walker.length > 0 && (
													<>
														<p className="text-gray-800">👥 Walkers:</p>
														<ul className="list-disc list-inside text-gray-700">
															{walk.walker.map((walker) => (
																<li key={walker._id}>
																	{walker.firstName} {walker.lastName}
																</li>
															))}
														</ul>
													</>
												)}
												<p className="text-gray-800">
													<span className="font-bold">🚶 Marshal:</span>{" "}
													{walk.marshal.firstName} {walk.marshal.lastName}
												</p>
												<p className="text-gray-800">
													<span className="font-bold">🎟️ Slots Available:</span>{" "}
													{walk.slots}
												</p>
											</div>

											{walk.slots === 0 ? (
												<p className="mt-4 w-full text-center text-red-600 font-bold bg-red-100 p-2 rounded-md">
													❌ This walk is full
												</p>
											) : (
												role === "user" && (
													<button
														onClick={() => handleSelectWalk(walk)}
														disabled={isAlreadyWalked}
														className={`mt-4 w-full py-2 rounded-md text-white font-semibold transition-colors duration-300 ${
															isAlreadyWalked
																? "bg-gray-400 cursor-not-allowed"
																: "bg-blue-600 hover:bg-blue-700"
														}`}
													>
														{isAlreadyWalked ? "Selected" : "Select Walk"}
													</button>
												)
											)}
										</div>
									);
								})}
							</div>
						)}
					</div>
				)}
			</div>

			{showForm && ["marshal", "admin"].includes(role) && (
				<ScheduleWalkForm
					newEvent={newEvent}
					setNewEvent={setNewEvent}
					setShowForm={setShowForm}
					handleAddEvent={handleAddEvent}
					isBulk={isBulk} // Pass isBulk as a prop
					setIsBulk={setIsBulk} // Pass setIsBulk as a prop
				/>
			)}
		</div>
	);
};

export default MyCalendar;
