import { useEffect, useState } from "react";
import api from "../../api/axios";
import { FaSearch, FaDog, FaWalking, FaSpinner, FaPaw } from "react-icons/fa";
import { Link } from "react-router-dom";

const WalkMeNow = () => {
	const [dogs, setDogs] = useState([]);
	const [filteredDogs, setFilteredDogs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		setLoading(true);
		api
			.get("/dogs/filtered")
			.then((res) => {
				setDogs(res.data);
				setFilteredDogs(res.data);
				setLoading(false);
			})
			.catch((err) => {
				console.error(err);
				setLoading(false);
			});
	}, []);

	useEffect(() => {
		// Filter dogs based on search term
		const filtered = dogs
			.filter(
				(dog) =>
					dog.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					dog.breed.toLowerCase().includes(searchTerm.toLowerCase())
			)
			.sort((a, b) => {
				const dateA = a.lastWalk ? new Date(a.lastWalk) : null;
				const dateB = b.lastWalk ? new Date(b.lastWalk) : null;

				if (!dateA && !dateB) return 0;
				if (!dateA) return -1;
				if (!dateB) return 1;

				return dateA - dateB; // Oldest walk first
			});

		setFilteredDogs(filtered);
	}, [dogs, searchTerm]);

	const getDaysAgo = (date) => {
		if (!date) return "Never walked";
		const now = new Date();
		const last = new Date(date);
		const diffTime = Math.abs(now - last);
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
	};

	return (
		<div className="min-h-screen bg-[#f8f5f0] py-6 px-4">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="bg-[#8c1d35] text-white p-5 rounded-xl shadow-md mb-6">
					<div className="flex flex-col md:flex-row justify-between items-center">
						<h2 className="text-2xl font-bold flex items-center mb-4 md:mb-0">
							<FaDog className="mr-3" /> Dogs Desperate for Walks
						</h2>
						<Link
							to="/dog-walk-summary"
							className="bg-white text-[#8c1d35] px-4 py-2 rounded-lg flex items-center hover:bg-[#e8d3a9] transition-colors"
						>
							<FaWalking className="mr-2" /> View Walk Logs
						</Link>
					</div>
				</div>

				{/* Search Bar */}
				<div className="bg-white p-4 rounded-xl shadow-md mb-6 border border-[#e8d3a9]">
					<div className="relative">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<FaSearch className="text-[#8c1d35]" />
						</div>
						<input
							type="text"
							placeholder="Search by name or breed..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10 pr-4 py-2 w-full border border-[#8c1d35] text-gray-800 bg-[#fdf7f2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e8d3a9] focus:border-[#e8d3a9] placeholder:text-[#b89e9e]"
						/>
					</div>
				</div>

				{/* Dog List */}
				{loading ? (
					<div className="flex justify-center items-center py-12">
						<FaSpinner className="animate-spin text-[#8c1d35] text-4xl" />
					</div>
				) : filteredDogs.length > 0 ? (
					<div className="bg-white rounded-xl shadow-md overflow-hidden border border-[#e8d3a9]">
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-[#e8d3a9]">
								<thead className="bg-[#f8f5f0]">
									<tr>
										<th
											scope="col"
											className="px-4 py-3 text-left text-xs font-medium text-[#8c1d35] uppercase tracking-wider"
										>
											Dog
										</th>
										<th
											scope="col"
											className="px-4 py-3 text-left text-xs font-medium text-[#8c1d35] uppercase tracking-wider"
										>
											Breed & Age
										</th>
										<th
											scope="col"
											className="px-4 py-3 text-left text-xs font-medium text-[#8c1d35] uppercase tracking-wider"
										>
											Last Walked
										</th>
										<th
											scope="col"
											className="px-4 py-3 text-left text-xs font-medium text-[#8c1d35] uppercase tracking-wider"
										>
											Recent Walks
										</th>
										<th
											scope="col"
											className="px-4 py-3 text-right text-xs font-medium text-[#8c1d35] uppercase tracking-wider"
										>
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-[#e8d3a9]">
									{filteredDogs.slice(0, 20).map((dog) => (
										<tr
											key={dog._id}
											className={`transition-colors ${
												dog.demeanor === "Red"
													? "bg-red-100 hover:bg-red-200"
													: dog.demeanor === "Yellow"
													? "bg-yellow-100 hover:bg-yellow-200"
													: dog.demeanor === "Gray"
													? "bg-gray-100 hover:bg-gray-200"
													: "bg-white hover:bg-[#f8f5f0]"
											}`}
										>
											<td className="px-4 py-3 whitespace-nowrap">
												<div className="flex items-center">
													<div className="h-10 w-10 rounded-full overflow-hidden border-2 border-[#8c1d35] flex-shrink-0">
														<img
															src={dog.imageURL || "/placeholder.svg"}
															alt={dog.name}
															className="h-full w-full object-cover"
														/>
													</div>
													<div className="ml-3">
														<div className="text-sm font-medium text-[#8c1d35]">
															{dog.name}
														</div>
													</div>
												</div>
											</td>
											<td className="px-4 py-3 whitespace-nowrap">
												<div className="text-sm text-gray-700">{dog.breed}</div>
												<div className="text-sm text-gray-500">
													{dog.age} years old
												</div>
											</td>
											<td className="px-4 py-3 whitespace-nowrap">
												<span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#f8f5f0] text-gray-800">
													{getDaysAgo(dog.lastWalk)}
												</span>
											</td>
											<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
												<span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#f8f5f0] text-gray-800">
													{dog.walks?.length ?? 0} in 7 days
												</span>
											</td>
											<td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
												<Link
													to={`/dog/${dog._id}`}
													className="text-[#8c1d35] hover:text-[#7c1025] bg-[#e8d3a9] hover:bg-[#d9c59a] px-3 py-1 rounded-lg transition-colors"
												>
													View
												</Link>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				) : (
					<div className="bg-white p-8 rounded-xl shadow-md text-center border border-[#e8d3a9]">
						<FaPaw className="text-[#8c1d35] text-5xl mx-auto mb-4 opacity-50" />
						<p className="text-gray-600 text-lg mb-2">
							No dogs urgently need walks right now 🎉
						</p>
						<p className="text-gray-500">
							All our furry friends are well exercised!
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default WalkMeNow;
