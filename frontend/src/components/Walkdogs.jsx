import React from "react";
import MyCalendar from "./MyCalendar";
import AvailableWalks from "./AvailableWalks"; // Import the new AvailableWalks component

const Walkdogs = () => {
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
				<AvailableWalks /> {/* Render the AvailableWalks component */}
			</div>
		</div>
	);
};

export default Walkdogs;
