import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import {
	FaCalendarAlt,
	FaSearch,
	FaDog,
	FaPlus,
	FaTimes,
	FaSpinner,
	FaFilter,
	FaCalendarCheck,
	FaPrint,
	FaFileDownload,
} from "react-icons/fa";

function DogWalkSummary() {
	const [dogLogs, setDogLogs] = useState([]);
	const [filteredLogs, setFilteredLogs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [showWalkinForm, setShowWalkinForm] = useState(false);
	const [walkinDogName, setWalkinDogName] = useState("");
	const [walkinDate, setWalkinDate] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [filterPeriod, setFilterPeriod] = useState("all");
	const [customStartDate, setCustomStartDate] = useState("");
	const [customEndDate, setCustomEndDate] = useState("");
	const [showCustomDateFilter, setShowCustomDateFilter] = useState(false);
	const [sortColumn, setSortColumn] = useState("name");
	const [sortDirection, setSortDirection] = useState("asc");
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const printRef = useRef();

	const fetchDogLogs = async () => {
		try {
			setLoading(true);
			const response = await api.get("/dogs/logs");
			setDogLogs(response.data);
			setFilteredLogs(response.data);
		} catch (err) {
			console.error(err);
			setError("Failed to fetch dog logs.");
		} finally {
			setLoading(false);
		}
	};

	const handleWalkinSubmit = async (e) => {
		e.preventDefault();
		try {
			await api.post("/completedWalk/addManualWalk", {
				dogId: walkinDogName,
				date: walkinDate,
			});
			setWalkinDogName("");
			setWalkinDate("");
			setShowWalkinForm(false);
			fetchDogLogs(); // Refresh data
		} catch (err) {
			console.error("Error logging walk-in:", err);
			alert("Failed to record walk-in");
		}
	};

	// Apply filters based on selected period and search term
	const applyFilters = () => {
		let filtered = [...dogLogs];

		// Apply date filter
		if (filterPeriod !== "all") {
			const now = new Date();
			let startDate;

			if (filterPeriod === "week") {
				startDate = new Date(now);
				startDate.setDate(now.getDate() - 7);
			} else if (filterPeriod === "month") {
				startDate = new Date(now);
				startDate.setMonth(now.getMonth() - 1);
			} else if (
				filterPeriod === "custom" &&
				customStartDate &&
				customEndDate
			) {
				startDate = new Date(customStartDate);
				const endDate = new Date(customEndDate);
				endDate.setHours(23, 59, 59, 999); // End of the day

				filtered = filtered.map((dog) => ({
					...dog,
					walks:
						dog.walks?.filter((walk) => {
							const walkDate = new Date(walk.date);
							return walkDate >= startDate && walkDate <= endDate;
						}) || [],
				}));
			}

			if (filterPeriod !== "custom") {
				filtered = filtered.map((dog) => ({
					...dog,
					walks:
						dog.walks?.filter((walk) => {
							const walkDate = new Date(walk.date);
							return walkDate >= startDate;
						}) || [],
				}));
			}
		}

		// Apply search filter
		if (searchTerm.trim() !== "") {
			filtered = filtered.filter((dog) =>
				dog.name.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		setFilteredLogs(filtered);
		setCurrentPage(1); // Reset to first page when filters change
	};

	// Reset all filters
	const resetFilters = () => {
		setFilterPeriod("all");
		setSearchTerm("");
		setCustomStartDate("");
		setCustomEndDate("");
		setShowCustomDateFilter(false);
		setFilteredLogs(dogLogs);
		setCurrentPage(1);
	};

	// Handle filter period change
	const handleFilterChange = (period) => {
		setFilterPeriod(period);
		if (period === "custom") {
			setShowCustomDateFilter(true);
		} else {
			setShowCustomDateFilter(false);
		}
	};

	// Apply filters when filter settings change
	useEffect(() => {
		applyFilters();
	}, [filterPeriod, searchTerm, customStartDate, customEndDate, dogLogs]);

	useEffect(() => {
		fetchDogLogs();
	}, []);

	// Format date for display
	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleString("en-US", {
			dateStyle: "medium",
			timeStyle: "short",
		});
	};

	const handleSort = (column) => {
		// If clicking the same column, toggle direction
		if (sortColumn === column) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			// If clicking a new column, set it as the sort column with ascending direction
			setSortColumn(column);
			setSortDirection("asc");
		}
	};

	const sortData = (data) => {
		return [...data].sort((a, b) => {
			// Sort direction multiplier (1 for ascending, -1 for descending)
			const direction = sortDirection === "asc" ? 1 : -1;

			if (sortColumn === "name") {
				return direction * a.name.localeCompare(b.name);
			} else if (sortColumn === "walkCount") {
				return direction * ((a.walks?.length || 0) - (b.walks?.length || 0));
			} else if (sortColumn === "recentDate") {
				// Get the most recent walk date for each dog
				const aRecentDate =
					a.walks && a.walks.length > 0
						? Math.max(...a.walks.map((w) => new Date(w.date).getTime()))
						: 0;
				const bRecentDate =
					b.walks && b.walks.length > 0
						? Math.max(...b.walks.map((w) => new Date(w.date).getTime()))
						: 0;
				return direction * (aRecentDate - bRecentDate);
			}
			return 0;
		});
	};

	// Pagination
	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const sortedData = sortData(filteredLogs);
	const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
	const totalPages = Math.ceil(sortedData.length / itemsPerPage);

	const paginate = (pageNumber) => setCurrentPage(pageNumber);

	// Print functionality
	const handlePrint = () => {
		const printContent = document.getElementById("printable-content");
		const originalContents = document.body.innerHTML;

		document.body.innerHTML = `
      <div style="padding: 20px;">
        <h1 style="color: #8c1d35; margin-bottom: 20px;">Dog Walk Summary</h1>
        ${printContent.innerHTML}
      </div>
    `;

		window.print();
		document.body.innerHTML = originalContents;
		window.location.reload();
	};

	// Export to CSV
	const exportToCSV = () => {
		// Create CSV header
		let csv = "Dog Name,Walk Count,Walk Dates\n";

		// Add data rows
		sortedData.forEach((dog) => {
			const dogName = `"${dog.name}"`;
			const walkCount = dog.walks?.length || 0;
			const walkDates =
				dog.walks && dog.walks.length > 0
					? dog.walks.map((walk) => formatDate(walk.date)).join("; ")
					: "No walks";

			csv += `${dogName},${walkCount},"${walkDates}"\n`;
		});

		// Create download link
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.setAttribute("href", url);
		link.setAttribute("download", "dog_walk_summary.csv");
		link.style.visibility = "hidden";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	return (
		<div className="p-4 text-gray-800 max-w-7xl mx-auto">
			<div className="bg-white rounded-xl shadow-md overflow-hidden">
				{/* Header */}
				<div className="bg-[#8c1d35] px-6 py-4">
					<div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
						<h2 className="text-xl font-bold text-white flex items-center">
							<FaDog className="mr-2" /> Dog Walk Summary
						</h2>
						<div className="flex flex-wrap gap-2">
							<button
								onClick={() => setShowWalkinForm(!showWalkinForm)}
								className="bg-white text-[#8c1d35] hover:bg-[#f8f5f0] px-4 py-2 rounded-lg font-medium flex items-center justify-center transition-colors"
							>
								{showWalkinForm ? (
									<>
										<FaTimes className="mr-2" /> Cancel
									</>
								) : (
									<>
										<FaPlus className="mr-2" /> Add Walk-In
									</>
								)}
							</button>
							<button
								onClick={handlePrint}
								className="bg-white text-[#8c1d35] hover:bg-[#f8f5f0] px-4 py-2 rounded-lg font-medium flex items-center justify-center transition-colors"
							>
								<FaPrint className="mr-2" /> Print
							</button>
							<button
								onClick={exportToCSV}
								className="bg-white text-[#8c1d35] hover:bg-[#f8f5f0] px-4 py-2 rounded-lg font-medium flex items-center justify-center transition-colors"
							>
								<FaFileDownload className="mr-2" /> Export CSV
							</button>
						</div>
					</div>
				</div>

				{/* Filters Section */}
				<div className="bg-[#f8f5f0] border-b border-[#e8d3a9] p-4">
					<div className="flex flex-col md:flex-row gap-4">
						{/* Search */}
						<div className="flex-1">
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<FaSearch className="text-gray-400" />
								</div>
								<input
									type="text"
									placeholder="Search by dog name..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-[#8c1d35] focus:border-[#8c1d35]"
								/>
							</div>
						</div>

						{/* Time Period Filter */}
						<div className="flex flex-wrap gap-2">
							<div className="flex items-center mr-2">
								<FaFilter className="text-[#8c1d35] mr-2" />
								<span className="text-gray-700 font-medium">Filter:</span>
							</div>
							<button
								onClick={() => handleFilterChange("all")}
								className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
									filterPeriod === "all"
										? "bg-[#8c1d35] text-white"
										: "bg-white text-gray-700 border border-gray-300 hover:bg-[#f8f5f0]"
								}`}
							>
								All Time
							</button>
							<button
								onClick={() => handleFilterChange("week")}
								className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
									filterPeriod === "week"
										? "bg-[#8c1d35] text-white"
										: "bg-white text-gray-700 border border-gray-300 hover:bg-[#f8f5f0]"
								}`}
							>
								Last Week
							</button>
							<button
								onClick={() => handleFilterChange("month")}
								className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
									filterPeriod === "month"
										? "bg-[#8c1d35] text-white"
										: "bg-white text-gray-700 border border-gray-300 hover:bg-[#f8f5f0]"
								}`}
							>
								Last Month
							</button>
							<button
								onClick={() => handleFilterChange("custom")}
								className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
									filterPeriod === "custom"
										? "bg-[#8c1d35] text-white"
										: "bg-white text-gray-700 border border-gray-300 hover:bg-[#f8f5f0]"
								}`}
							>
								Custom Range
							</button>
							{filterPeriod !== "all" && (
								<button
									onClick={resetFilters}
									className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
								>
									Reset
								</button>
							)}
						</div>
					</div>

					{/* Custom Date Range */}
					{showCustomDateFilter && (
						<div className="mt-4 flex flex-col sm:flex-row gap-4">
							<div className="flex-1">
								<label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
									<FaCalendarAlt className="mr-1 text-[#8c1d35]" /> Start Date
								</label>
								<input
									type="date"
									value={customStartDate}
									onChange={(e) => setCustomStartDate(e.target.value)}
									className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[#8c1d35] focus:border-[#8c1d35]"
								/>
							</div>
							<div className="flex-1">
								<label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
									<FaCalendarAlt className="mr-1 text-[#8c1d35]" /> End Date
								</label>
								<input
									type="date"
									value={customEndDate}
									onChange={(e) => setCustomEndDate(e.target.value)}
									className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[#8c1d35] focus:border-[#8c1d35]"
								/>
							</div>
						</div>
					)}
				</div>

				{/* Walk-In Form */}
				{showWalkinForm && (
					<div className="p-4 border-b border-[#e8d3a9] bg-white">
						<form onSubmit={handleWalkinSubmit} className="space-y-4">
							<h3 className="text-lg font-medium text-[#8c1d35] flex items-center">
								<FaCalendarCheck className="mr-2" /> Record Walk-In
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Dog Name
									</label>
									<select
										value={walkinDogName}
										onChange={(e) => setWalkinDogName(e.target.value)}
										className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[#8c1d35] focus:border-[#8c1d35] text-black"
										required
									>
										<option value="">Select a dog</option>
										{dogLogs.map((dog) => (
											<option key={dog._id} value={dog._id}>
												{dog.name}
											</option>
										))}
									</select>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Walk Date/Time
									</label>
									<input
										type="datetime-local"
										value={walkinDate}
										onChange={(e) => setWalkinDate(e.target.value)}
										className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[#8c1d35] focus:border-[#8c1d35]"
										required
									/>
								</div>
							</div>
							<div className="flex justify-end">
								<button
									type="submit"
									className="bg-[#8c1d35] hover:bg-[#7c1025] text-white px-4 py-2 rounded-lg font-medium transition-colors"
								>
									Submit Walk-In
								</button>
							</div>
						</form>
					</div>
				)}

				{/* Content */}
				<div className="p-4" id="printable-content" ref={printRef}>
					{loading ? (
						<div className="flex justify-center items-center py-12">
							<FaSpinner className="animate-spin text-[#8c1d35] text-3xl" />
						</div>
					) : error ? (
						<div className="bg-red-100 text-red-700 p-4 rounded-lg">
							{error}
						</div>
					) : filteredLogs.length === 0 ? (
						<div className="text-center py-8 text-gray-500">
							No dog walk records found.
						</div>
					) : (
						<>
							<div className="overflow-x-auto">
								<table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
									<thead className="bg-[#f8f5f0]">
										<tr>
											<th
												className="py-3 px-4 text-left text-[#8c1d35] font-semibold border-b border-[#e8d3a9] cursor-pointer hover:bg-[#e8d3a9]/30 transition-colors"
												onClick={() => handleSort("name")}
											>
												<div className="flex items-center">
													Dog Name
													{sortColumn === "name" && (
														<span className="ml-1">
															{sortDirection === "asc" ? "▲" : "▼"}
														</span>
													)}
												</div>
											</th>
											<th
												className="py-3 px-4 text-left text-[#8c1d35] font-semibold border-b border-[#e8d3a9] cursor-pointer hover:bg-[#e8d3a9]/30 transition-colors"
												onClick={() => handleSort("walkCount")}
											>
												<div className="flex items-center">
													Walk Count
													{sortColumn === "walkCount" && (
														<span className="ml-1">
															{sortDirection === "asc" ? "▲" : "▼"}
														</span>
													)}
												</div>
											</th>
											<th
												className="py-3 px-4 text-left text-[#8c1d35] font-semibold border-b border-[#e8d3a9] cursor-pointer hover:bg-[#e8d3a9]/30 transition-colors"
												onClick={() => handleSort("recentDate")}
											>
												<div className="flex items-center">
													Walk Dates
													{sortColumn === "recentDate" && (
														<span className="ml-1">
															{sortDirection === "asc" ? "▲" : "▼"}
														</span>
													)}
												</div>
											</th>
										</tr>
									</thead>
									<tbody>
										{currentItems.map((dog) => (
											<tr
												key={dog._id}
												className="hover:bg-[#f8f5f0] transition-colors"
											>
												<td className="py-3 px-4 border-b border-gray-200 font-medium">
													<div className="space-y-1">
														<Link to={`/dog/walklog/${dog._id}`}>
															<div className="text-sm text-gray-800">
																{dog.name}
															</div>
														</Link>
													</div>
												</td>

												<td className="py-3 px-4 border-b border-gray-200">
													<span className="bg-[#e8d3a9] text-[#8c1d35] px-2 py-1 rounded-full font-medium text-sm">
														{dog.walks?.length || 0}
													</span>
												</td>
												<td className="py-3 px-4 border-b border-gray-200">
													{dog.walks && dog.walks.length > 0 ? (
														<ul className="space-y-1">
															{dog.walks.map((walk, idx) => (
																<li
																	key={idx}
																	className="flex items-center text-sm"
																>
																	<FaCalendarAlt className="text-[#8c1d35] mr-2" />
																	{formatDate(walk.date)}
																</li>
															))}
														</ul>
													) : (
														<span className="text-gray-500 italic">
															No walks
														</span>
													)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							{/* Pagination */}
							<div className="mt-4 flex flex-col sm:flex-row justify-between items-center">
								<div className="mb-2 sm:mb-0">
									<span className="text-sm text-gray-700">
										Showing{" "}
										<span className="font-medium">{indexOfFirstItem + 1}</span>{" "}
										to{" "}
										<span className="font-medium">
											{Math.min(indexOfLastItem, filteredLogs.length)}
										</span>{" "}
										of{" "}
										<span className="font-medium">{filteredLogs.length}</span>{" "}
										entries
									</span>
								</div>
								<div className="flex items-center space-x-1">
									<button
										onClick={() => paginate(Math.max(1, currentPage - 1))}
										disabled={currentPage === 1}
										className={`px-3 py-1 rounded-md ${
											currentPage === 1
												? "bg-gray-200 text-gray-500 cursor-not-allowed"
												: "bg-white text-[#8c1d35] border border-[#8c1d35] hover:bg-[#f8f5f0]"
										}`}
									>
										Previous
									</button>

									{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
										// Calculate page numbers to show (centered around current page)
										let pageNum;
										if (totalPages <= 5) {
											pageNum = i + 1;
										} else if (currentPage <= 3) {
											pageNum = i + 1;
										} else if (currentPage >= totalPages - 2) {
											pageNum = totalPages - 4 + i;
										} else {
											pageNum = currentPage - 2 + i;
										}

										return (
											<button
												key={i}
												onClick={() => paginate(pageNum)}
												className={`px-3 py-1 rounded-md ${
													pageNum === currentPage
														? "bg-[#8c1d35] text-white"
														: "bg-white text-[#8c1d35] border border-[#8c1d35] hover:bg-[#f8f5f0]"
												}`}
											>
												{pageNum}
											</button>
										);
									})}

									<button
										onClick={() =>
											paginate(Math.min(totalPages, currentPage + 1))
										}
										disabled={currentPage === totalPages}
										className={`px-3 py-1 rounded-md ${
											currentPage === totalPages
												? "bg-gray-200 text-gray-500 cursor-not-allowed"
												: "bg-white text-[#8c1d35] border border-[#8c1d35] hover:bg-[#f8f5f0]"
										}`}
									>
										Next
									</button>
								</div>

								<div className="mt-2 sm:mt-0 flex items-center">
									<label className="text-sm text-gray-700 mr-2">
										Items per page:
									</label>
									<select
										value={itemsPerPage}
										onChange={(e) => {
											setItemsPerPage(Number(e.target.value));
											setCurrentPage(1); // Reset to first page when changing items per page
										}}
										className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-[#8c1d35] focus:border-[#8c1d35]"
									>
										<option value={5}>5</option>
										<option value={10}>10</option>
										<option value={25}>25</option>
										<option value={50}>50</option>
									</select>
								</div>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}

export default DogWalkSummary;
