import React, { useState } from "react";
import axios from "axios";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./MyCalendar.css";
import ScheduleWalkForm from "./ScheduleWalkForm"; // Import the new component

const localizer = momentLocalizer(moment);

const MyCalendar = () => {
	const [events, setEvents] = useState([]);
	const [showForm, setShowForm] = useState(false);
	const [newEvent, setNewEvent] = useState({
		dog: "",
		walker: "",
		marshal: "",
		start: new Date(),
		end: new Date(),
		location: "Monroe",
	});

	const handleAddEvent = async (e) => {
		e.preventDefault();

		if (
			!newEvent.start ||
			!newEvent.end ||
			!newEvent.dog ||
			!newEvent.marshal
		) {
			toast.error("Please fill out all required fields.");
			return;
		}

		try {
			const response = await axios.post(
				"http://localhost:5001/scheduledWalks/newWalk",
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
				title: "",
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
			<div
				className={`bg-white shadow-md rounded-md p-4 transition-all duration-200 ${
					showForm ? "blur-sm" : ""
				}`}
			>
				<Calendar
					localizer={localizer}
					events={events}
					startAccessor="start"
					endAccessor="end"
					defaultView="month"
					selectable
					onSelectSlot={({ start, end }) => {
						setNewEvent({ ...newEvent, start, end });
						setShowForm(true);
					}}
					style={{ height: "500px" }}
					className="rounded-md border-2 border-maroon-600 bg-white mb-4"
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
