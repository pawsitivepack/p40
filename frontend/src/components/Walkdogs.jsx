import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; // Import toast from react-toastify
import "react-toastify/dist/ReactToastify.css"; // Import toast styles
import MyCalendar from "./MyCalendar";
import AvailableWalks from "./AvailableWalks";

const Walkdogs = () => {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) {
			// Show toast message and redirect after a short delay
			toast.error("Please log in to access this page.");
			setTimeout(() => {
				navigate("/login");
			}, 1500); // Delay of 1.5 seconds to allow the toast to display
		} else {
			setIsLoggedIn(true);
		}
	}, [navigate]);

	if (!isLoggedIn) {
		return null; // Return nothing while redirecting
	}

	return (
		<div className="flex flex-col lg:flex-row gap-4 p-4">
			{/* Calendar Section */}
			<div className="lg:w-3/4 w-full p-4 shadow-md rounded-md">
				<h2 className="text-center font-bold text-xl mb-4">Calendar</h2>
				<MyCalendar />
			</div>

			{/* Available Walks Section */}
			<div className="lg:w-1/4 w-full bg-gray-200 shadow-md rounded-md p-4">
				<h2 className="text-center font-bold text-maroon-600 text-xl mb-4">
					Available Walks
				</h2>
				<AvailableWalks />
			</div>
		</div>
	);
};

export default Walkdogs;
