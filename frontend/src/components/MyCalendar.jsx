import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
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
	const [dogswalked, setDogsWalked] = useState([]);
	const [availableWalks, setAvailableWalks] = useState([]);
	const [selectedWalk, setSelectedWalk] = useState(null);
	const [filteredWalks, setFilteredWalks] = useState([]);
	const [newEvent, setNewEvent] = useState({
		marshal: "",
		start: date,
		end: date,
		location: "920 F Drive Monroe LA",
	});

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (token) {
			try {
				const decodedToken = jwtDecode(token);
				setRole(decodedToken.role);
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
			const response = await axios.get(
				`${import.meta.env.VITE_BACKEND_URL}/scheduledwalks`,
				{
					headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
				}
			);
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

				const response = await axios.post(
					`${import.meta.env.VITE_BACKEND_URL}/scheduledWalks/confirm`,
					{
						walkId: walk._id,
						userId: userId, // Send userId along with walkId
					},
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);
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
		console.log("Walk selected:", walk);
		setSelectedWalk(walk._id);
		handleConfirmWalk(walk); // Confirm the walk immediately
	};

	const handleAddEvent = async (e) => {
		e.preventDefault();
		if (!newEvent.marshal || !newEvent.start) {
			toast.error("Please fill out all required fields.");
			return;
		}

		try {
			await axios.post(
				`${import.meta.env.VITE_BACKEND_URL}/scheduledWalks/newWalk`,
				{
					marshal: newEvent.marshal,
					date: newEvent.start,
					location: newEvent.location,
					status: "Scheduled",
				},
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				}
			);

			toast.success("Walk scheduled successfully!");
			setShowForm(false);
			setNewEvent({
				marshal: "",
				start: new Date(),
				end: new Date(),
				location: "920 F Drive Monroe LA",
			});

			// Refresh available walks
			await fetchAvailableWalks();
		} catch (error) {
			console.error("Error adding walk:", error);
			toast.error("Failed to schedule the walk.");
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
							{date
								? `Walks on ${date.toLocaleDateString()}`
								: "Select a date to view walks"}
						</h2>

						{!date ? (
							<p className="text-gray-700 bg-gray-200 rounded-lg text-center col-span-full p-6 shadow-md">
								📅 Please select a date on the calendar to view available walks.
							</p>
						) : (
							<>
								{["marshal", "admin"].includes(role) && (
									<button
										onClick={() => setShowForm(true)}
										className="mb-4 flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg text-lg font-bold hover:bg-green-700 transition-all duration-300 shadow-md"
									>
										<PlusCircleIcon className="w-6 h-6" />
										<span>Add Walk</span>
									</button>
								)}

								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									{filteredWalks.length === 0 ? (
										<p className="text-gray-700 bg-gray-200 rounded-lg text-center col-span-full p-6 shadow-md">
											No walks available for this date.
										</p>
									) : (
										filteredWalks.map((walk) => (
											<div
												key={walk._id}
												className="border border-gray-300 rounded-lg p-5 shadow-lg bg-white hover:shadow-2xl transform hover:scale-105 transition-all"
											>
												<div className="space-y-2">
													<p className="text-gray-800">
														<span className="font-bold">🐶 Dog:</span>{" "}
														{walk.dog.name}
													</p>
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
													<p className="text-gray-800">
														<span className="font-bold">🚶 Marshal:</span>{" "}
														{walk.marshal.firstName} {walk.marshal.lastName}
													</p>
													<p className="text-gray-800">
														<span className="font-bold">
															🎟️ Slots Available:
														</span>{" "}
														{walk.slots}
													</p>
													<p className="text-gray-800">
														<span className="font-bold">⏳ Duration:</span>{" "}
														{walk.duration || "1 hour"}
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
															className={`mt-4 w-full py-2 rounded-md text-white font-semibold transition-colors duration-300 ${
																selectedWalk === walk._id
																	? "bg-green-600 hover:bg-green-700"
																	: "bg-blue-600 hover:bg-blue-700"
															}`}
														>
															{selectedWalk === walk._id
																? "Selected"
																: "Select Walk"}
														</button>
													)
												)}
											</div>
										))
									)}
								</div>
							</>
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
				/>
			)}
		</div>
	);
};

export default MyCalendar;
