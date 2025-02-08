import React, { useState } from "react";

const AvailableWalks = () => {
	const [selectedWalk, setSelectedWalk] = useState(null);

	const walks = [
		{
			id: 1,
			dog: "Max",
			date: "Feb 10, 2025",
			time: "10:00 AM",
			marshal: "John",
			duration: "1 hour",
		},
		{
			id: 2,
			dog: "Bella",
			date: "Feb 12, 2025",
			time: "1:30 PM",
			marshal: "Alice",
			duration: "1 hour",
		},
		{
			id: 3,
			dog: "Charlie",
			date: "Feb 15, 2025",
			time: "9:00 AM",
			marshal: "Robert",
			duration: "1 hour",
		},
		{
			id: 4,
			dog: "Luna",
			date: "Feb 18, 2025",
			time: "3:00 PM",
			marshal: "Sophia",
			duration: "1 hour",
		},
		{
			id: 5,
			dog: "Rocky",
			date: "Feb 20, 2025",
			time: "11:00 AM",
			marshal: "Tom",
			duration: "1 hour",
		},
		{
			id: 6,
			dog: "Daisy",
			date: "Feb 22, 2025",
			time: "2:00 PM",
			marshal: "Emma",
			duration: "1 hour",
		},
	];

	const handleSelectWalk = (id) => {
		setSelectedWalk(id);
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{walks.map((walk) => (
				<div
					key={walk.id}
					className={`border rounded-md p-3 shadow-md ${
						selectedWalk === walk.id ? "border-maroon-600 bg-gray-200" : ""
					}`}
				>
					<p className="font-semibold text-maroon-700">
						Dog: <span className="text-gray-800">{walk.dog}</span>
					</p>
					<p className="text-maroon-700">
						Date: <span className="text-gray-800">{walk.date}</span>
					</p>
					<p className="text-maroon-700">
						Time: <span className="text-gray-800">{walk.time}</span>
					</p>
					<p className="text-maroon-700">
						Marshal: <span className="text-gray-800">{walk.marshal}</span>
					</p>
					<p className="text-maroon-700">
						Duration: <span className="text-gray-800">{walk.duration}</span>
					</p>
					<button
						onClick={() => handleSelectWalk(walk.id)}
						className="mt-2 w-full bg-maroon-600 text-white py-1 rounded-md hover:bg-maroon-700"
					>
						{selectedWalk === walk.id ? "Selected" : "Select Walk"}
					</button>
				</div>
			))}
		</div>
	);
};

export default AvailableWalks;
