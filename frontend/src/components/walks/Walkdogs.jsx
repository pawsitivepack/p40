import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; // Import toast from react-toastify
import "react-toastify/dist/ReactToastify.css"; // Import toast styles
import MyCalendar from "./MyCalendar";

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
			<div className="w-full px-0 py-4 shadow-md rounded-md">
				<MyCalendar />
			</div>
		</div>
	);
};

export default Walkdogs;
