import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./MyCalendar.css";
import ScheduleWalkForm from "./ScheduleWalkForm";

const MyCalendar = () => {
	const [date, setDate] = useState(new Date());
	const [view, setView] = useState("month");
	const [showForm, setShowForm] = useState(false);
	const [newEvent, setNewEvent] = useState({
		walker: "",
		marshal: "",
		start: date,
		end: date,
		location: "Monroe",
	});
	const [availableWalks, setAvailableWalks] = useState([]);
	const [selectedWalk, setSelectedWalk] = useState(null);

	// Fetch all scheduled walks
	const fetchAvailableWalks = async () => {
		try {
			const response = await axios.get(
				`${import.meta.env.VITE_BACKEND_URL}/scheduledwalks`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
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
		setNewEvent({ ...newEvent, start: selectedDate, end: selectedDate });
		setShowForm(true);
	};

	const handleAddEvent = async (e) => {
		e.preventDefault();
		if (!newEvent.marshal || !newEvent.start) {
			toast.error("Please fill out all required fields.");
			return;
		}

		try {
			const response = await axios.post(
				`${import.meta.env.VITE_BACKEND_URL}/scheduledWalks/newWalk`,

				{
					walker: newEvent.walker || null,
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
				walker: "",
				marshal: "",
				start: new Date(),
				end: new Date(),
				location: "Monroe",
			});

			// Refresh available walks to show the new one immediately
			fetchAvailableWalks();
		} catch (error) {
			console.error("Error adding walk:", error);
			toast.error("Failed to schedule the walk.");
		}
	};

	const handleSelectWalk = (id) => {
		setSelectedWalk(id);
	};

	return (
		<div className="container mx-auto px-0">
			<ToastContainer />
			<h1 className="text-2xl font-bold mb-4">Dog Walk Scheduler</h1>

			{/* Calendar Section */}
			<div className="max-w-4xl mx-auto mb-4 py-0">
				<Calendar
					onChange={handleDateChange}
					value={date}
					view={view}
					onViewChange={setView}
					className="custom-calendar"
					tileContent={({ date }) => {
						// Filter walks from availableWalks for the current date
						const walksForDate = availableWalks.filter(
							(walk) =>
								new Date(walk.date).toLocaleDateString() ===
								date.toLocaleDateString()
						);

						return walksForDate.length > 0 ? (
							<div className="bg-green-200 p-0 m-0 text-xs text-left">
								{walksForDate.map((walk, index) => {
									const walkTime = new Date(walk.date).toLocaleTimeString([], {
										hour: "2-digit",
										minute: "2-digit",
										hour12: false,
									});
									return <div key={index}>{walkTime}</div>;
								})}
							</div>
						) : null;
					}}
				/>
			</div>

			{showForm && (
				<ScheduleWalkForm
					newEvent={newEvent}
					setNewEvent={setNewEvent}
					setShowForm={setShowForm}
					handleAddEvent={handleAddEvent}
				/>
			)}

			{/* Available Walks Section */}
			<div className="mt-8 bg-gradient-to-br from-blue-100 via-indigo-200 to-purple-100 rounded-lg p-6 shadow-lg">
				<h2 className="text-2xl font-extrabold mb-6 text-gray-800">
					Available Walks
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
					{availableWalks.length === 0 ? (
						<p className="text-gray-700 bg-gray-100 rounded-lg text-center col-span-full p-6 shadow-md">
							No walks available.
						</p>
					) : (
						availableWalks.map((walk) => (
							<div
								key={walk._id}
								className={`border rounded-lg p-4 shadow-md transform transition-all duration-300 ${
									selectedWalk === walk._id
										? "border-blue-600 bg-blue-100 scale-105"
										: "hover:shadow-lg hover:bg-gray-100"
								}`}
							>
								<p className="font-bold text-blue-700">
									Dog: <span className="text-gray-800">{walk.dog.name}</span>
								</p>
								<p className="text-blue-700">
									Date:{" "}
									<span className="text-gray-800">
										{new Date(walk.date).toLocaleDateString()}
									</span>
								</p>
								<p className="text-blue-700">
									Time:{" "}
									<span className="text-gray-800">
										{new Date(walk.date).toLocaleTimeString([], {
											hour: "2-digit",
											minute: "2-digit",
										})}
									</span>
								</p>
								<p className="text-blue-700">
									Marshal:{" "}
									<span className="text-gray-800">
										{walk.marshal.firstName} {walk.marshal.lastName}
									</span>
								</p>
								<p className="text-blue-700">
									Duration:{" "}
									<span className="text-gray-800">
										{walk.duration || "1 hour"}
									</span>
								</p>
								<button
									onClick={() => handleSelectWalk(walk._id)}
									className={`mt-4 w-full py-2 rounded-md text-white font-semibold transition-colors duration-300 ${
										selectedWalk === walk._id
											? "bg-green-600 hover:bg-green-700"
											: "bg-blue-600 hover:bg-blue-700"
									}`}
								>
									{selectedWalk === walk._id ? "Selected" : "Select Walk"}
								</button>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
};

export default MyCalendar;
