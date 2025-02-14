import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./MyCalendar.css";
import ScheduleWalkForm from "./ScheduleWalkForm";

const MyCalendar = () => {
	const [date, setDate] = useState(new Date());
	const [view, setView] = useState("month"); // Default to month view
	const [showForm, setShowForm] = useState(false);
	const [newEvent, setNewEvent] = useState({
		dog: "",
		walker: "",
		marshal: "",
		start: date,
		end: date,
		location: "Monroe",
	});
	const [events, setEvents] = useState([]);

	const handleDateChange = (selectedDate) => {
		setDate(selectedDate);
		setNewEvent({ ...newEvent, start: selectedDate, end: selectedDate });
		setShowForm(true);
	};

	const handleAddEvent = async (e) => {
		e.preventDefault();
		if (!newEvent.dog || !newEvent.marshal || !newEvent.start) {
			toast.error("Please fill out all required fields.");
			return;
		}

		try {
			const response = await axios.post(
				`${import.meta.env.VITE_BACKEND_URL}/scheduledWalks/newWalk`,
				{
					dog: newEvent.dog,
					walker: newEvent.walker || null,
					marshal: newEvent.marshal,
					date: newEvent.start,
					location: newEvent.location,
					status: "Scheduled",
				}
			);

			setEvents([...events, { ...newEvent, id: response.data.walk._id }]);
			setShowForm(false);
			setNewEvent({
				dog: "",
				walker: "",
				marshal: "",
				start: new Date(),
				end: new Date(),
				location: "Monroe",
			});
			toast.success("Walk scheduled successfully!");
		} catch (error) {
			console.error("Error adding walk:", error);
			toast.error("Failed to schedule the walk.");
		}
	};

	return (
		<div className="container mx-auto p-4">
			<ToastContainer />
			<h1 className="text-2xl font-bold mb-4">Dog Walk Scheduler</h1>

			<div className="max-w-4xl mx-auto mb-4">
				<Calendar
					onChange={handleDateChange}
					value={date}
					view={view} // Allow switching between month and year views
					onViewChange={setView} // Handle view change
					className="custom-calendar"
					tileContent={({ date }) =>
						events.some(
							(event) =>
								new Date(event.start).toDateString() === date.toDateString()
						) ? (
							<div className="bg-green-200 rounded-full p-1 text-xs text-center">
								Walk
							</div>
						) : null
					}
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
		</div>
	);
};

export default MyCalendar;
