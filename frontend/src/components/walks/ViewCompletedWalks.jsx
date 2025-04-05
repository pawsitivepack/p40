"use client";

import { useState, useEffect, useRef } from "react";
import api from "../../api/axios";
import { jwtDecode } from "jwt-decode";
import {
	FaFilter,
	FaPrint,
	FaCalendarAlt,
	FaChevronLeft,
	FaChevronRight,
	FaSearch,
	FaDownload,
	FaPaw,
	FaSpinner,
} from "react-icons/fa";

const ViewCompletedWalks = () => {
	const [completedWalks, setCompletedWalks] = useState([]);
	const [filteredWalks, setFilteredWalks] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [filterPeriod, setFilterPeriod] = useState("all");
	const [customDateRange, setCustomDateRange] = useState({
		start: "",
		end: "",
	});
	const [showFilterOptions, setShowFilterOptions] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [walksPerPage, setWalksPerPage] = useState(10);
	const [totalPages, setTotalPages] = useState(0);
	const [role, setRole] = useState("");

	const [sortConfig, setSortConfig] = useState({
		key: "date",
		direction: "desc",
	});

	const tableRef = useRef();
	const filterRef = useRef();

	// Fetch completed walks from backend
	useEffect(() => {
		const fetchCompletedWalks = async () => {
			try {
				setLoading(true);
				const response = await api.get(`/completedwalk`);
				setCompletedWalks(response.data);
				setFilteredWalks(response.data);
				setLoading(false);
			} catch (err) {
				setError("Error fetching completed walks");
				setLoading(false);
			}
		};

		fetchCompletedWalks();
	}, []);
	useEffect(() => {
		const token = localStorage.getItem("token");
		if (token) {
			try {
				const decodedToken = jwtDecode(token);
				const userRole = decodedToken.role;
				setRole(userRole);
			} catch (error) {
				console.error("Failed to decode token:", error);
			}
		} else {
			console.warn("no token in the local storage");
		}
	}, []);

	// Handle outside click for filter dropdown
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (filterRef.current && !filterRef.current.contains(event.target)) {
				setShowFilterOptions(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	// Apply filters when filter period changes
	useEffect(() => {
		applyFilters();
	}, [filterPeriod, customDateRange, searchTerm, completedWalks, sortConfig]);

	// Calculate total pages when filtered walks or walks per page changes
	useEffect(() => {
		setTotalPages(Math.ceil(filteredWalks.length / walksPerPage));
		// Reset to first page when filters change
		setCurrentPage(1);
	}, [filteredWalks, walksPerPage]);

	// Apply all filters and sorting
	const applyFilters = () => {
		let filtered = [...completedWalks];

		// Apply date filter
		const currentDate = new Date();

		if (filterPeriod === "week") {
			const oneWeekAgo = new Date();
			oneWeekAgo.setDate(currentDate.getDate() - 7);
			filtered = filtered.filter((walk) => new Date(walk.date) >= oneWeekAgo);
		} else if (filterPeriod === "month") {
			const oneMonthAgo = new Date();
			oneMonthAgo.setMonth(currentDate.getMonth() - 1);
			filtered = filtered.filter((walk) => new Date(walk.date) >= oneMonthAgo);
		} else if (filterPeriod === "year") {
			const oneYearAgo = new Date();
			oneYearAgo.setFullYear(currentDate.getFullYear() - 1);
			filtered = filtered.filter((walk) => new Date(walk.date) >= oneYearAgo);
		} else if (
			filterPeriod === "custom" &&
			customDateRange.start &&
			customDateRange.end
		) {
			const startDate = new Date(customDateRange.start);
			const endDate = new Date(customDateRange.end);
			endDate.setHours(23, 59, 59, 999); // Include the entire end day

			filtered = filtered.filter((walk) => {
				const walkDate = new Date(walk.date);
				return walkDate >= startDate && walkDate <= endDate;
			});
		}

		// Apply search filter
		if (searchTerm.trim()) {
			const term = searchTerm.toLowerCase();
			filtered = filtered.filter(
				(walk) =>
					(walk.userId &&
						`${walk.userId.firstName} ${walk.userId.lastName}`
							.toLowerCase()
							.includes(term)) ||
					(walk.marshalId &&
						`${walk.marshalId.firstName} ${walk.marshalId.lastName}`
							.toLowerCase()
							.includes(term)) ||
					(walk.dogs &&
						walk.dogs.some((dog) => dog.name.toLowerCase().includes(term)))
			);
		}

		// Apply sorting
		if (sortConfig.key) {
			filtered.sort((a, b) => {
				let aValue, bValue;

				if (sortConfig.key === "walker") {
					aValue = a.userId ? `${a.userId.firstName} ${a.userId.lastName}` : "";
					bValue = b.userId ? `${b.userId.firstName} ${b.userId.lastName}` : "";
				} else if (sortConfig.key === "marshal") {
					aValue = a.marshalId
						? `${a.marshalId.firstName} ${a.marshalId.lastName}`
						: "";
					bValue = b.marshalId
						? `${b.marshalId.firstName} ${b.marshalId.lastName}`
						: "";
				} else if (sortConfig.key === "date") {
					aValue = new Date(a.date);
					bValue = new Date(b.date);
				} else if (sortConfig.key === "status") {
					aValue = a.status;
					bValue = b.status;
				} else if (sortConfig.key === "dogs") {
					aValue = a.dogs ? a.dogs.length : 0;
					bValue = b.dogs ? b.dogs.length : 0;
				} else {
					aValue = a[sortConfig.key];
					bValue = b[sortConfig.key];
				}

				if (aValue < bValue) {
					return sortConfig.direction === "asc" ? -1 : 1;
				}
				if (aValue > bValue) {
					return sortConfig.direction === "asc" ? 1 : -1;
				}
				return 0;
			});
		}

		setFilteredWalks(filtered);
	};

	// Handle sorting
	const requestSort = (key) => {
		let direction = "asc";
		if (sortConfig.key === key && sortConfig.direction === "asc") {
			direction = "desc";
		}
		setSortConfig({ key, direction });
	};

	// Get current walks for pagination
	const getCurrentWalks = () => {
		const indexOfLastWalk = currentPage * walksPerPage;
		const indexOfFirstWalk = indexOfLastWalk - walksPerPage;
		return filteredWalks.slice(indexOfFirstWalk, indexOfLastWalk);
	};

	// Function to print the table
	const handlePrint = () => {
		const currentWalks = getCurrentWalks();
		// Create a table with only the filtered and paginated data
		let printTable = `<table border="1" cellpadding="10" cellspacing="0" style="width: 100%; border-collapse: collapse;">
      <thead style="background-color: #8c1d35; color: white;">
        <tr>
          <th>Walker</th>
          <th>Marshal</th>
          <th>Date</th>
          <th>Status</th>
          <th>Dogs Walked</th>
        </tr>
      </thead>
      <tbody>`;
		currentWalks.forEach((walk) => {
			const walker = walk.userId
				? `${walk.userId.firstName} ${walk.userId.lastName}`
				: "Anonymous";
			const marshal =
				Array.isArray(walk.marshalId) && walk.marshalId.length > 0
					? walk.marshalId.map((m) => `${m.firstName} ${m.lastName}`).join(", ")
					: "Anonymous";
			const date = new Date(walk.date).toLocaleDateString();
			const status = walk.status;
			const dogs =
				walk.dogs.length > 0
					? walk.dogs.map((dog) => dog.name).join(", ")
					: "No dogs walked";
			printTable += `
        <tr style="background-color: #f8f5f0;">
          <td>${walker}</td>
          <td>${marshal}</td>
          <td>${date}</td>
          <td style="color: ${
						status === "completed" ? "#8c1d35" : "#f5b82e"
					};">${status}</td>
          <td>${dogs}</td>
        </tr>`;
		});
		printTable += `</tbody></table>`;
		// Get filter description
		let filterDescription = "All walks";
		if (filterPeriod === "week") {
			filterDescription = "Walks from the last 7 days";
		} else if (filterPeriod === "month") {
			filterDescription = "Walks from the last 30 days";
		} else if (filterPeriod === "year") {
			filterDescription = "Walks from the last year";
		} else if (
			filterPeriod === "custom" &&
			customDateRange.start &&
			customDateRange.end
		) {
			filterDescription = `Walks from ${new Date(
				customDateRange.start
			).toLocaleDateString()} to ${new Date(
				customDateRange.end
			).toLocaleDateString()}`;
		}
		if (searchTerm) {
			filterDescription += ` (Search: "${searchTerm}")`;
		}
		// Create print content
		const originalContent = document.body.innerHTML;
		document.body.innerHTML = `
      <style>
        @media print {
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            color: #8c1d35;
            margin-bottom: 5px;
          }
          .subtitle {
            font-size: 14px;
            color: #666;
            margin-bottom: 15px;
          }
          .filter-info {
            font-size: 12px;
            color: #666;
            font-style: italic;
            margin-bottom: 15px;
            text-align: left;
          }
          .pagination-info {
            font-size: 12px;
            color: #666;
            margin-top: 10px;
            text-align: right;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th {
            background-color: #8c1d35 !important;
            color: white !important;
            font-weight: bold;
            text-align: left;
            padding: 10px;
          }
          td {
            padding: 8px 10px;
            border: 1px solid #ddd;
          }
          tr:nth-child(even) {
            background-color: #f8f5f0;
          }
          .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #666;
            text-align: center;
          }
        }
      </style>
      <div class="header">
        <div class="title">ULM P40 UNDERDOGS - Walk Logs</div>
        <div class="subtitle">Completed Walks Report</div>
      </div>
      <div class="filter-info">
        ${filterDescription} | Generated on ${new Date().toLocaleString()}
      </div>
      ${printTable}
      <div class="pagination-info">
        Page ${currentPage} of ${totalPages} | Showing ${
			getCurrentWalks().length
		} of ${filteredWalks.length} walks
      </div>
      <div class="footer">
        ULM P40 UNDERDOGS © ${new Date().getFullYear()} | This is an official record of dog walking activities.
      </div>
    `;
		window.print();
		document.body.innerHTML = originalContent;
	};

	// Function to export current walks as CSV
	const handleExportCSV = () => {
		const currentWalks = getCurrentWalks();
		const csvHeader = ["Walker", "Marshal", "Date", "Status", "Dogs Walked"];
		const csvRows = currentWalks.map((walk) => {
			const walker = walk.userId
				? `${walk.userId.firstName} ${walk.userId.lastName}`
				: "Anonymous";
			const marshal =
				Array.isArray(walk.marshalId) && walk.marshalId.length > 0
					? walk.marshalId.map((m) => `${m.firstName} ${m.lastName}`).join(", ")
					: "Anonymous";
			const date = new Date(walk.date).toLocaleDateString();
			const status = walk.status;
			const dogs =
				walk.dogs.length > 0
					? walk.dogs.map((dog) => dog.name).join(", ")
					: "No dogs walked";
			return [walker, marshal, date, status, dogs];
		});
		const csvContent =
			"data:text/csv;charset=utf-8," +
			[csvHeader, ...csvRows]
				.map((e) => e.map((v) => `"${v}"`).join(","))
				.join("\n");
		const encodedUri = encodeURI(csvContent);
		const link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", "completed_walks.csv");
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	// Get sort direction indicator
	const getSortDirectionIndicator = (key) => {
		if (sortConfig.key !== key) return null;
		return sortConfig.direction === "asc" ? " ↑" : " ↓";
	};

	// Format date for display
	const formatDate = (dateString) => {
		const options = {
			weekday: "short",
			year: "numeric",
			month: "short",
			day: "numeric",
		};
		return new Date(dateString).toLocaleDateString(undefined, options);
	};

	if (loading)
		return (
			<div className="flex justify-center items-center h-64">
				<div className="flex flex-col items-center">
					<FaSpinner className="animate-spin text-[#8c1d35] text-4xl mb-4" />
					<p className="text-[#8c1d35] font-medium">Loading walk logs...</p>
				</div>
			</div>
		);

	if (error)
		return (
			<div className="text-center py-10">
				<p className="text-red-500 text-lg">{error}</p>
				<button
					onClick={() => window.location.reload()}
					className="mt-4 px-4 py-2 rounded-lg text-white bg-[#8c1d35] hover:bg-[#7c1025] transition-colors"
				>
					Try Again
				</button>
			</div>
		);

	if (role !== "admin" && role !== "marshal") {
		return (
			<div className="text-center py-10">
				<p className="text-[#8c1d35] text-lg font-semibold">
					You do not have permission to view this page.
				</p>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 my-auto mt-10 bg-[#f8f5f0]">
			{/* Header with title and actions */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
				<h1 className="text-3xl md:text-4xl font-extrabold text-[#8c1d35]">
					View Walk Logs
				</h1>

				<div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
					{/* Search input */}
					<div className="relative flex-grow">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<FaSearch className="text-gray-400" />
						</div>
						<input
							type="text"
							placeholder="Search walker, marshal, or dog..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 bg-white border-[#e8d3a9] text-gray-700 focus:ring-[#8c1d35]"
						/>
					</div>

					{/* Filter dropdown */}
					<div className="relative" ref={filterRef}>
						<button
							onClick={() => setShowFilterOptions(!showFilterOptions)}
							className="flex items-center gap-2 px-4 py-2 rounded-lg shadow transition"
							style={{
								backgroundColor: filterPeriod !== "all" ? "#8c1d35" : "#e8d3a9",
								color: filterPeriod !== "all" ? "white" : "#8c1d35",
							}}
						>
							<FaFilter />
							<span>
								{filterPeriod === "all" && "All Time"}
								{filterPeriod === "week" && "Last Week"}
								{filterPeriod === "month" && "Last Month"}
								{filterPeriod === "year" && "Last Year"}
								{filterPeriod === "custom" && "Custom Range"}
							</span>
						</button>

						{showFilterOptions && (
							<div className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg z-10 border border-[#e8d3a9] bg-white">
								<div className="p-3">
									<h3 className="font-semibold mb-2 text-[#8c1d35]">
										Filter by Date
									</h3>
									<div className="space-y-2">
										<label className="flex items-center cursor-pointer">
											<input
												type="radio"
												name="filterPeriod"
												checked={filterPeriod === "all"}
												onChange={() => setFilterPeriod("all")}
												className="mr-2"
											/>
											<span className="text-gray-700">All Time</span>
										</label>
										<label className="flex items-center cursor-pointer">
											<input
												type="radio"
												name="filterPeriod"
												checked={filterPeriod === "week"}
												onChange={() => setFilterPeriod("week")}
												className="mr-2"
											/>
											<span className="text-gray-700">Last 7 Days</span>
										</label>
										<label className="flex items-center cursor-pointer">
											<input
												type="radio"
												name="filterPeriod"
												checked={filterPeriod === "month"}
												onChange={() => setFilterPeriod("month")}
												className="mr-2"
											/>
											<span className="text-gray-700">Last 30 Days</span>
										</label>
										<label className="flex items-center cursor-pointer">
											<input
												type="radio"
												name="filterPeriod"
												checked={filterPeriod === "year"}
												onChange={() => setFilterPeriod("year")}
												className="mr-2"
											/>
											<span className="text-gray-700">Last Year</span>
										</label>
										<label className="flex items-center cursor-pointer">
											<input
												type="radio"
												name="filterPeriod"
												checked={filterPeriod === "custom"}
												onChange={() => setFilterPeriod("custom")}
												className="mr-2"
											/>
											<span className="text-gray-700">Custom Range</span>
										</label>

										{filterPeriod === "custom" && (
											<div className="mt-3 space-y-2">
												<div>
													<label className="block text-sm mb-1 text-gray-600">
														Start Date
													</label>
													<input
														type="date"
														value={customDateRange.start}
														onChange={(e) =>
															setCustomDateRange({
																...customDateRange,
																start: e.target.value,
															})
														}
														className="w-full p-2 border rounded bg-[#f8f5f0] border-[#e8d3a9] text-gray-700"
													/>
												</div>
												<div>
													<label className="block text-sm mb-1 text-gray-600">
														End Date
													</label>
													<input
														type="date"
														value={customDateRange.end}
														onChange={(e) =>
															setCustomDateRange({
																...customDateRange,
																end: e.target.value,
															})
														}
														className="w-full p-2 border rounded bg-[#f8f5f0] border-[#e8d3a9] text-gray-700"
													/>
												</div>
											</div>
										)}
									</div>
								</div>
							</div>
						)}
					</div>

					{/* Print button */}
					<button
						onClick={handlePrint}
						className="flex items-center gap-2 px-4 py-2 text-white font-medium rounded-lg shadow transition bg-[#8c1d35] hover:bg-[#7c1025]"
						disabled={filteredWalks.length === 0}
					>
						<FaPrint />
						Print Logs
					</button>
					<button
						onClick={handleExportCSV}
						className="flex items-center gap-2 px-4 py-2 text-[#8c1d35] font-medium rounded-lg shadow transition bg-[#f5b82e] hover:bg-[#e5a81e]"
						disabled={filteredWalks.length === 0}
					>
						<FaDownload /> Export CSV
					</button>
				</div>
			</div>

			{/* Filter summary */}
			{(filterPeriod !== "all" || searchTerm) && (
				<div className="mb-4 p-3 rounded-lg flex flex-wrap items-center gap-2 bg-white border border-[#e8d3a9]">
					<FaCalendarAlt className="text-[#8c1d35]" />
					<span className="text-gray-600">Filtered by:</span>

					{filterPeriod !== "all" && (
						<span className="px-2 py-1 rounded-full text-sm bg-[#8c1d35] text-white">
							{filterPeriod === "week" && "Last 7 Days"}
							{filterPeriod === "month" && "Last 30 Days"}
							{filterPeriod === "year" && "Last Year"}
							{filterPeriod === "custom" &&
								`${customDateRange.start} to ${customDateRange.end}`}
						</span>
					)}

					{searchTerm && (
						<span className="px-2 py-1 rounded-full text-sm bg-[#e8d3a9] text-[#8c1d35]">
							Search: "{searchTerm}"
						</span>
					)}

					<button
						onClick={() => {
							setFilterPeriod("all");
							setSearchTerm("");
							setCustomDateRange({ start: "", end: "" });
						}}
						className="ml-auto text-sm underline text-[#8c1d35]"
					>
						Clear Filters
					</button>
				</div>
			)}

			{/* Results count and pagination size selector */}
			<div className="flex flex-col sm:flex-row justify-between items-center mb-4">
				<p className="text-gray-600">
					Showing {getCurrentWalks().length} of {filteredWalks.length} walks
				</p>

				<div className="flex items-center gap-2">
					<span className="text-gray-600">Rows per page:</span>
					<select
						value={walksPerPage}
						onChange={(e) => setWalksPerPage(Number(e.target.value))}
						className="border rounded p-1 bg-white border-[#e8d3a9] text-gray-700"
					>
						<option value={5}>5</option>
						<option value={10}>10</option>
						<option value={25}>25</option>
						<option value={50}>50</option>
					</select>
				</div>
			</div>

			{filteredWalks.length === 0 ? (
				<div className="text-center py-10 rounded-lg bg-white border border-[#e8d3a9]">
					<FaPaw className="text-[#e8d3a9] text-5xl mx-auto mb-4" />
					<p className="text-gray-600 mb-2">
						No completed walks available for the selected filters.
					</p>
					<button
						onClick={() => {
							setFilterPeriod("all");
							setSearchTerm("");
						}}
						className="text-sm underline text-[#8c1d35]"
					>
						Clear filters to see all walks
					</button>
				</div>
			) : (
				<>
					<div
						ref={tableRef}
						className="overflow-x-auto shadow-lg rounded-lg border mb-6 bg-white border-[#e8d3a9]"
					>
						<table className="min-w-full border-collapse">
							<thead>
								<tr>
									<th
										className="border px-6 py-3 text-left font-bold uppercase cursor-pointer bg-[#e8d3a9] text-[#8c1d35] border-[#d9c59a]"
										onClick={() => requestSort("walker")}
									>
										Walker {getSortDirectionIndicator("walker")}
									</th>
									<th
										className="border px-6 py-3 text-left font-bold uppercase cursor-pointer bg-[#e8d3a9] text-[#8c1d35] border-[#d9c59a]"
										onClick={() => requestSort("marshal")}
									>
										Marshal {getSortDirectionIndicator("marshal")}
									</th>
									<th
										className="border px-6 py-3 text-left font-bold uppercase cursor-pointer bg-[#e8d3a9] text-[#8c1d35] border-[#d9c59a]"
										onClick={() => requestSort("date")}
									>
										Date {getSortDirectionIndicator("date")}
									</th>
									<th
										className="border px-6 py-3 text-left font-bold uppercase cursor-pointer bg-[#e8d3a9] text-[#8c1d35] border-[#d9c59a]"
										onClick={() => requestSort("status")}
									>
										Status {getSortDirectionIndicator("status")}
									</th>
									<th
										className="border px-6 py-3 text-left font-bold uppercase cursor-pointer bg-[#e8d3a9] text-[#8c1d35] border-[#d9c59a]"
										onClick={() => requestSort("dogs")}
									>
										Dogs Walked {getSortDirectionIndicator("dogs")}
									</th>
								</tr>
							</thead>
							<tbody>
								{getCurrentWalks().map((walk) => (
									<tr
										key={walk._id}
										className="border-b hover:bg-[#f8f5f0] transition-colors border-[#e8d3a9]"
									>
										<td className="border px-6 py-3 text-gray-700 border-[#e8d3a9]">
											{walk.userId
												? `${walk.userId.firstName} ${walk.userId.lastName}`
												: "Anonymous"}
										</td>
										<td className="border px-6 py-3 text-gray-700 border-[#e8d3a9]">
											{Array.isArray(walk.marshalId) &&
											walk.marshalId.length > 0
												? walk.marshalId
														.map((m) => `${m.firstName} ${m.lastName}`)
														.join(", ")
												: "Anonymous"}
										</td>
										<td className="border px-6 py-3 text-gray-700 border-[#e8d3a9]">
											{formatDate(walk.date)}
										</td>
										<td className="border px-6 py-3 border-[#e8d3a9]">
											<span
												className="px-2 py-1 rounded-full text-sm font-medium"
												style={{
													backgroundColor:
														walk.status === "completed"
															? "rgba(140, 29, 53, 0.1)"
															: "rgba(245, 184, 46, 0.1)",
													color:
														walk.status === "completed" ? "#8c1d35" : "#f5b82e",
												}}
											>
												{walk.status}
											</span>
										</td>
										<td className="border px-6 py-3 text-gray-700 border-[#e8d3a9]">
											{walk.dogs.length > 0 ? (
												<div>
													{walk.dogs.map((dog) => (
														<span
															key={dog._id}
															className="inline-block px-2 py-1 rounded-full text-xs mr-1 mb-1 bg-[#f8f5f0] text-[#8c1d35]"
														>
															{dog.name}
														</span>
													))}
													<div className="text-xs mt-1 text-gray-500">
														{walk.dogs.length}{" "}
														{walk.dogs.length === 1 ? "dog" : "dogs"} total
													</div>
												</div>
											) : (
												<span className="text-gray-500">No dogs walked</span>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="flex justify-between items-center">
							<div className="text-gray-600">
								Page {currentPage} of {totalPages}
							</div>
							<div className="flex gap-2">
								<button
									onClick={() => setCurrentPage(1)}
									disabled={currentPage === 1}
									className="px-3 py-1 rounded-lg disabled:opacity-50"
									style={{
										backgroundColor: currentPage === 1 ? "#e8d3a9" : "#8c1d35",
										color: currentPage === 1 ? "#8c1d35" : "white",
									}}
								>
									First
								</button>
								<button
									onClick={() =>
										setCurrentPage((prev) => Math.max(prev - 1, 1))
									}
									disabled={currentPage === 1}
									className="px-3 py-1 rounded-lg flex items-center disabled:opacity-50"
									style={{
										backgroundColor: currentPage === 1 ? "#e8d3a9" : "#8c1d35",
										color: currentPage === 1 ? "#8c1d35" : "white",
									}}
								>
									<FaChevronLeft className="mr-1" /> Prev
								</button>

								{/* Page numbers */}
								<div className="flex gap-1">
									{[...Array(Math.min(5, totalPages))].map((_, index) => {
										let pageNumber;
										if (totalPages <= 5) {
											pageNumber = index + 1;
										} else if (currentPage <= 3) {
											pageNumber = index + 1;
										} else if (currentPage >= totalPages - 2) {
											pageNumber = totalPages - 4 + index;
										} else {
											pageNumber = currentPage - 2 + index;
										}

										if (pageNumber <= totalPages) {
											return (
												<button
													key={pageNumber}
													onClick={() => setCurrentPage(pageNumber)}
													className="w-8 h-8 rounded-lg flex items-center justify-center"
													style={{
														backgroundColor:
															currentPage === pageNumber
																? "#8c1d35"
																: "#e8d3a9",
														color:
															currentPage === pageNumber ? "white" : "#8c1d35",
													}}
												>
													{pageNumber}
												</button>
											);
										}
										return null;
									})}
								</div>

								<button
									onClick={() =>
										setCurrentPage((prev) => Math.min(prev + 1, totalPages))
									}
									disabled={currentPage === totalPages}
									className="px-3 py-1 rounded-lg flex items-center disabled:opacity-50"
									style={{
										backgroundColor:
											currentPage === totalPages ? "#e8d3a9" : "#8c1d35",
										color: currentPage === totalPages ? "#8c1d35" : "white",
									}}
								>
									Next <FaChevronRight className="ml-1" />
								</button>
								<button
									onClick={() => setCurrentPage(totalPages)}
									disabled={currentPage === totalPages}
									className="px-3 py-1 rounded-lg disabled:opacity-50"
									style={{
										backgroundColor:
											currentPage === totalPages ? "#e8d3a9" : "#8c1d35",
										color: currentPage === totalPages ? "#8c1d35" : "white",
									}}
								>
									Last
								</button>
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default ViewCompletedWalks;
