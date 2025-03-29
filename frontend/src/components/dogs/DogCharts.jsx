import { useEffect, useState } from "react";
import {
	BarChart,
	Bar,
	LineChart,
	Line,
	PieChart,
	Pie,
	Cell,
	XAxis,
	YAxis,
	Tooltip,
	Legend,
	CartesianGrid,
	ResponsiveContainer,
} from "recharts";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";
import {
	FaChartBar,
	FaChartLine,
	FaChartPie,
	FaCalendarAlt,
	FaFilter,
	FaWalking,
	FaArrowLeft,
	FaSpinner,
	FaPrint,
	FaDownload,
	FaExclamationTriangle,
	FaPaw,
} from "react-icons/fa";

function DogCharts() {
	const { dogId } = useParams();
	const navigate = useNavigate();
	const [data, setData] = useState([]);
	const [dog, setDog] = useState(null);
	const [chartType, setChartType] = useState("bar");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [groupBy, setGroupBy] = useState("day");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [statusData, setStatusData] = useState([]);
	const [timeData, setTimeData] = useState([]);

	// Colors for the charts
	const COLORS = ["#8c1d35", "#e8d3a9", "#a83c54", "#d1b77e", "#c05a70"];

	// Status colors
	const STATUS_COLORS = {
		completed: "#22c55e", // green
		scheduled: "#3b82f6", // blue
		cancelled: "#ef4444", // red
		pending: "#f59e0b", // amber
		default: "#6b7280", // gray
	};

	useEffect(() => {
		const fetchWalkData = async () => {
			try {
				setLoading(true);
				const res = await api.get(`/dogs/logs/${dogId}`);

				if (!res.data || !res.data.walks) {
					setError("No walk data available for this dog");
					setLoading(false);
					return;
				}

				setDog(res.data);

				// Filter walks based on date range
				const filteredWalks = res.data.walks.filter((walk) => {
					const date = new Date(walk.date);
					return (
						(!startDate || date >= new Date(startDate)) &&
						(!endDate || date <= new Date(endDate))
					);
				});

				// Process data for different chart types
				processWalkData(filteredWalks);
			} catch (err) {
				console.error("Failed to fetch walk data", err);
				setError("Failed to load walk data. Please try again later.");
			} finally {
				setLoading(false);
			}
		};

		if (dogId) fetchWalkData();
	}, [dogId, startDate, endDate, groupBy]);

	// Process walk data for different visualizations
	const processWalkData = (walks) => {
		// Process data for bar/line chart based on groupBy
		const walksByDate = walks.reduce((acc, walk) => {
			const date = new Date(walk.date);
			let key;

			if (groupBy === "day") {
				key = date.toLocaleDateString();
			} else if (groupBy === "week") {
				// Get the week number
				const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
				const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
				const weekNum = Math.ceil(
					(pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7
				);
				key = `Week ${weekNum}, ${date.getFullYear()}`;
			} else if (groupBy === "month") {
				key = date.toLocaleDateString("en-US", {
					month: "long",
					year: "numeric",
				});
			}

			if (!acc[key]) {
				acc[key] = 0;
			}
			acc[key]++;
			return acc;
		}, {});

		// Convert to array format for charts
		const formattedData = Object.keys(walksByDate)
			.map((date) => ({
				date,
				count: walksByDate[date],
			}))
			.sort((a, b) => {
				// Sort by date
				if (groupBy === "day") {
					return new Date(a.date) - new Date(b.date);
				}
				return 0; // Default sorting for week and month
			});

		setData(formattedData);

		// Process data for status pie chart
		const walksByStatus = walks.reduce((acc, walk) => {
			const status = walk.status || "unknown";
			if (!acc[status]) {
				acc[status] = 0;
			}
			acc[status]++;
			return acc;
		}, {});

		const statusChartData = Object.keys(walksByStatus).map((status) => ({
			name: status.charAt(0).toUpperCase() + status.slice(1),
			value: walksByStatus[status],
		}));

		setStatusData(statusChartData);

		// Process data for time of day distribution
		const walksByHour = walks.reduce((acc, walk) => {
			const date = new Date(walk.date);
			const hour = date.getHours();

			// Group into time periods
			let timePeriod;
			if (hour >= 5 && hour < 12) {
				timePeriod = "Morning (5AM-12PM)";
			} else if (hour >= 12 && hour < 17) {
				timePeriod = "Afternoon (12PM-5PM)";
			} else if (hour >= 17 && hour < 21) {
				timePeriod = "Evening (5PM-9PM)";
			} else {
				timePeriod = "Night (9PM-5AM)";
			}

			if (!acc[timePeriod]) {
				acc[timePeriod] = 0;
			}
			acc[timePeriod]++;
			return acc;
		}, {});

		const timeChartData = Object.keys(walksByHour).map((time) => ({
			name: time,
			value: walksByHour[time],
		}));

		setTimeData(timeChartData);
	};

	const getStatusColor = (status) => {
		switch (status?.toLowerCase()) {
			case "completed":
				return "bg-green-100 text-green-800";
			case "scheduled":
				return "bg-blue-100 text-blue-800";
			case "cancelled":
				return "bg-red-100 text-red-800";
			case "pending":
				return "bg-amber-100 text-amber-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const handlePrint = () => {
		window.print();
	};

	const handleExportCSV = () => {
		if (!dog || !dog.walks) return;

		// Create CSV content
		let csvContent = "Date,Time,Status,Walker\n";

		dog.walks.forEach((walk) => {
			const date = new Date(walk.date);
			const dateStr = date.toLocaleDateString();
			const timeStr = date.toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
			});
			const status = walk.status || "Unknown";
			const walker = walk.walker || "Unassigned";

			csvContent += `"${dateStr}","${timeStr}","${status}","${walker}"\n`;
		});

		// Create download link
		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.setAttribute("href", url);
		link.setAttribute("download", `${dog.name}_walk_history.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	// Custom tooltip for charts
	const CustomTooltip = ({ active, payload, label }) => {
		if (active && payload && payload.length) {
			return (
				<div className="bg-white p-3 border border-gray-200 rounded-lg shadow-md">
					<p className="font-medium text-gray-800">{label}</p>
					<p className="text-[#8c1d35]">
						<span className="font-medium">Walks:</span> {payload[0].value}
					</p>
				</div>
			);
		}
		return null;
	};

	// Custom tooltip for pie charts
	const PieCustomTooltip = ({ active, payload }) => {
		if (active && payload && payload.length) {
			return (
				<div className="bg-white p-3 border border-gray-200 rounded-lg shadow-md">
					<p className="font-medium text-gray-800">{payload[0].name}</p>
					<p className="text-[#8c1d35]">
						<span className="font-medium">Count:</span> {payload[0].value}
					</p>
					<p className="text-gray-600">
						<span className="font-medium">Percentage:</span>{" "}
						{`${((payload[0].value / dog.walks.length) * 100).toFixed(1)}%`}
					</p>
				</div>
			);
		}
		return null;
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-[#f8f5f0] flex items-center justify-center">
				<div className="text-center">
					<FaSpinner className="animate-spin text-[#8c1d35] text-4xl mx-auto mb-4" />
					<p className="text-gray-700">Loading walk data...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-[#f8f5f0] p-6">
				<div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
					<div className="bg-[#8c1d35] px-6 py-4">
						<div className="flex justify-between items-center">
							<h1 className="text-2xl font-bold text-white flex items-center">
								<FaExclamationTriangle className="mr-3" /> Error Loading Data
							</h1>
							<button
								onClick={() => navigate(-1)}
								className="bg-white text-[#8c1d35] px-3 py-1 rounded-lg flex items-center hover:bg-[#f8f5f0] transition-colors"
							>
								<FaArrowLeft className="mr-2" /> Back
							</button>
						</div>
					</div>
					<div className="p-6">
						<div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
							<p className="text-red-700">{error}</p>
						</div>
						<button
							onClick={() => window.location.reload()}
							className="mt-4 bg-[#8c1d35] text-white px-4 py-2 rounded-lg hover:bg-[#7c1025] transition-colors"
						>
							Try Again
						</button>
					</div>
				</div>
			</div>
		);
	}

	if (!dog || !dog.walks || dog.walks.length === 0) {
		return (
			<div className="min-h-screen bg-[#f8f5f0] p-6">
				<div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
					<div className="bg-[#8c1d35] px-6 py-4">
						<div className="flex justify-between items-center">
							<h1 className="text-2xl font-bold text-white flex items-center">
								<FaPaw className="mr-3" /> Dog Walk Analytics
							</h1>
							<button
								onClick={() => navigate(-1)}
								className="bg-white text-[#8c1d35] px-3 py-1 rounded-lg flex items-center hover:bg-[#f8f5f0] transition-colors"
							>
								<FaArrowLeft className="mr-2" /> Back
							</button>
						</div>
					</div>
					<div className="p-6 text-center">
						<FaPaw className="text-[#8c1d35] text-5xl mx-auto mb-4 opacity-50" />
						<h2 className="text-2xl font-bold text-gray-800 mb-2">
							No Walk Data Available
						</h2>
						<p className="text-gray-600 mb-6">
							This dog doesn't have any recorded walks yet.
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#f8f5f0] p-6 print:bg-white print:p-0">
			<div className="max-w-6xl mx-auto">
				{/* Back Button - Hidden in print */}
				<button
					onClick={() => navigate(-1)}
					className="mb-6 text-[#8c1d35] hover:text-[#7c1025] font-medium flex items-center print:hidden"
				>
					<FaArrowLeft className="mr-2" /> Back
				</button>

				<div className="bg-white rounded-xl shadow-md overflow-hidden print:shadow-none">
					{/* Header */}
					<div className="bg-[#8c1d35] px-6 py-4 print:bg-white print:border-b-2 print:border-[#8c1d35]">
						<div className="flex justify-between items-center">
							<h1 className="text-2xl md:text-3xl font-bold text-white flex items-center print:text-[#8c1d35]">
								<FaChartBar className="mr-3" /> {dog.name}'s Walk Analytics
							</h1>

							{/* Action Buttons */}
							<div className="hidden sm:flex gap-2 print:hidden">
								<button
									onClick={handlePrint}
									className="bg-white text-[#8c1d35] px-3 py-1 rounded-lg flex items-center hover:bg-[#f8f5f0] transition-colors"
								>
									<FaPrint className="mr-1" /> Print
								</button>
								<button
									onClick={handleExportCSV}
									className="bg-[#e8d3a9] text-[#8c1d35] px-3 py-1 rounded-lg flex items-center hover:bg-[#d9c59a] transition-colors"
								>
									<FaDownload className="mr-1" /> Export
								</button>
								<Link
									to={`/dog/${dog._id}`}
									className="bg-[#e8d3a9] text-[#8c1d35] px-3 py-1 rounded-lg flex items-center hover:bg-[#d9c59a] transition-colors"
								>
									<FaPaw className="mr-1" /> View Dog Detail
								</Link>
							</div>
							<div className="flex sm:hidden mt-2 print:hidden">
								<Link
									to={`/dog/${dog._id}`}
									className="bg-[#e8d3a9] text-[#8c1d35] px-3 py-1 rounded-lg flex items-center hover:bg-[#d9c59a] transition-colors"
								>
									<FaPaw className="mr-1" /> View Dog Detail
								</Link>
							</div>
						</div>
					</div>

					{/* Content */}
					<div className="p-6">
						{/* Summary Stats */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
							<div className="bg-[#f8f5f0] rounded-lg p-4 border border-[#e8d3a9] text-center">
								<h3 className="text-lg font-semibold text-[#8c1d35] mb-2">
									Total Walks
								</h3>
								<p className="text-3xl font-bold text-gray-800">
									{dog.walks.length}
								</p>
							</div>

							<div className="bg-[#f8f5f0] rounded-lg p-4 border border-[#e8d3a9] text-center">
								<h3 className="text-lg font-semibold text-[#8c1d35] mb-2">
									Completed Walks
								</h3>
								<p className="text-3xl font-bold text-gray-800">
									{
										dog.walks.filter(
											(walk) => walk.status?.toLowerCase() === "completed"
										).length
									}
								</p>
							</div>

							<div className="bg-[#f8f5f0] rounded-lg p-4 border border-[#e8d3a9] text-center">
								<h3 className="text-lg font-semibold text-[#8c1d35] mb-2">
									Upcoming Walks
								</h3>
								<p className="text-3xl font-bold text-gray-800">
									{
										dog.walks.filter(
											(walk) => walk.status?.toLowerCase() === "scheduled"
										).length
									}
								</p>
							</div>
						</div>

						{/* Filters */}
						<div className="bg-[#f8f5f0] rounded-lg p-4 border border-[#e8d3a9] mb-8 print:hidden">
							<div className="flex items-center mb-4">
								<FaFilter className="text-[#8c1d35] mr-2" />
								<h3 className="text-lg font-semibold text-gray-800">
									Filters & Options
								</h3>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
										<FaCalendarAlt className="mr-1 text-[#8c1d35]" /> Start Date
									</label>
									<input
										type="date"
										value={startDate}
										onChange={(e) => setStartDate(e.target.value)}
										className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-[#8c1d35] focus:border-transparent"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
										<FaCalendarAlt className="mr-1 text-[#8c1d35]" /> End Date
									</label>
									<input
										type="date"
										value={endDate}
										onChange={(e) => setEndDate(e.target.value)}
										className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-[#8c1d35] focus:border-transparent"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
										<FaChartBar className="mr-1 text-[#8c1d35]" /> Chart Type
									</label>
									<select
										value={chartType}
										onChange={(e) => setChartType(e.target.value)}
										className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-[#8c1d35] focus:border-transparent"
									>
										<option value="bar">Bar Chart</option>
										<option value="line">Line Chart</option>
										<option value="pie">Pie Charts</option>
									</select>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
										<FaWalking className="mr-1 text-[#8c1d35]" /> Group By
									</label>
									<select
										value={groupBy}
										onChange={(e) => setGroupBy(e.target.value)}
										className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-[#8c1d35] focus:border-transparent"
									>
										<option value="day">Day</option>
										<option value="week">Week</option>
										<option value="month">Month</option>
									</select>
								</div>
							</div>

							<div className="mt-4 flex justify-end">
								<button
									onClick={() => {
										setStartDate("");
										setEndDate("");
										setChartType("bar");
										setGroupBy("day");
									}}
									className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
								>
									Reset Filters
								</button>
							</div>
						</div>

						{/* Charts */}
						{chartType === "pie" ? (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
								{/* Status Distribution Pie Chart */}
								<div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
									<h3 className="text-xl font-bold text-[#8c1d35] mb-4 text-center">
										Walk Status Distribution
									</h3>
									<div className="h-80">
										<ResponsiveContainer width="100%" height="100%">
											<PieChart>
												<Pie
													data={statusData}
													cx="50%"
													cy="50%"
													labelLine={false}
													outerRadius={80}
													fill="#8884d8"
													dataKey="value"
													label={({ name, percent }) =>
														`${name} ${(percent * 100).toFixed(0)}%`
													}
												>
													{statusData.map((entry, index) => {
														const status = entry.name.toLowerCase();
														const color =
															STATUS_COLORS[status] || STATUS_COLORS.default;
														return <Cell key={`cell-${index}`} fill={color} />;
													})}
												</Pie>
												<Tooltip content={<PieCustomTooltip />} />
												<Legend />
											</PieChart>
										</ResponsiveContainer>
									</div>
								</div>

								{/* Time of Day Distribution Pie Chart */}
								<div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
									<h3 className="text-xl font-bold text-[#8c1d35] mb-4 text-center">
										Time of Day Distribution
									</h3>
									<div className="h-80">
										<ResponsiveContainer width="100%" height="100%">
											<PieChart>
												<Pie
													data={timeData}
													cx="50%"
													cy="50%"
													labelLine={false}
													outerRadius={80}
													fill="#8884d8"
													dataKey="value"
													label={({ name, percent }) =>
														`${name.split(" ")[0]} ${(percent * 100).toFixed(
															0
														)}%`
													}
												>
													{timeData.map((entry, index) => (
														<Cell
															key={`cell-${index}`}
															fill={COLORS[index % COLORS.length]}
														/>
													))}
												</Pie>
												<Tooltip content={<PieCustomTooltip />} />
												<Legend />
											</PieChart>
										</ResponsiveContainer>
									</div>
								</div>
							</div>
						) : (
							<div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm mb-8">
								<h3 className="text-xl font-bold text-[#8c1d35] mb-4 text-center">
									Walk Frequency by{" "}
									{groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}
								</h3>
								<div className="h-80">
									<ResponsiveContainer width="100%" height="100%">
										{chartType === "bar" ? (
											<BarChart data={data}>
												<CartesianGrid strokeDasharray="3 3" />
												<XAxis
													dataKey="date"
													tick={{ fill: "#4b5563" }}
													tickLine={{ stroke: "#4b5563" }}
													axisLine={{ stroke: "#4b5563" }}
												/>
												<YAxis
													allowDecimals={false}
													tick={{ fill: "#4b5563" }}
													tickLine={{ stroke: "#4b5563" }}
													axisLine={{ stroke: "#4b5563" }}
												/>
												<Tooltip content={<CustomTooltip />} />
												<Legend />
												<Bar
													dataKey="count"
													name="Number of Walks"
													fill="#8c1d35"
													radius={[4, 4, 0, 0]}
													barSize={30}
												/>
											</BarChart>
										) : (
											<LineChart data={data}>
												<CartesianGrid strokeDasharray="3 3" />
												<XAxis
													dataKey="date"
													tick={{ fill: "#4b5563" }}
													tickLine={{ stroke: "#4b5563" }}
													axisLine={{ stroke: "#4b5563" }}
												/>
												<YAxis
													allowDecimals={false}
													tick={{ fill: "#4b5563" }}
													tickLine={{ stroke: "#4b5563" }}
													axisLine={{ stroke: "#4b5563" }}
												/>
												<Tooltip content={<CustomTooltip />} />
												<Legend />
												<Line
													type="monotone"
													dataKey="count"
													name="Number of Walks"
													stroke="#8c1d35"
													strokeWidth={3}
													dot={{ fill: "#8c1d35", r: 6 }}
													activeDot={{
														r: 8,
														fill: "#e8d3a9",
														stroke: "#8c1d35",
													}}
												/>
											</LineChart>
										)}
									</ResponsiveContainer>
								</div>
							</div>
						)}

						{/* Walk History Table */}
						<div className="mb-8">
							<div className="flex items-center mb-4">
								<FaWalking className="text-[#8c1d35] mr-2" />
								<h3 className="text-xl font-bold text-gray-800">
									Walk History
								</h3>
							</div>

							<div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
								<table className="min-w-full divide-y divide-gray-200">
									<thead className="bg-[#f8f5f0]">
										<tr>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
												Date
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
												Time
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
												Status
											</th>
											{dog.walks[0].walker && (
												<th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
													Walker
												</th>
											)}
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{dog.walks
											.filter((walk) => {
												const date = new Date(walk.date);
												return (
													(!startDate || date >= new Date(startDate)) &&
													(!endDate || date <= new Date(endDate))
												);
											})
											.sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date, newest first
											.map((walk, index) => {
												const walkDate = new Date(walk.date);
												return (
													<tr key={index} className="hover:bg-[#f8f5f0]">
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
															{walkDate.toLocaleDateString()}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
															{walkDate.toLocaleTimeString([], {
																hour: "2-digit",
																minute: "2-digit",
															})}
														</td>
														<td className="px-6 py-4 whitespace-nowrap">
															<span
																className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
																	walk.status
																)}`}
															>
																{walk.status || "Unknown"}
															</span>
														</td>
														{dog.walks[0].walker && (
															<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
																{walk.walker || "Unassigned"}
															</td>
														)}
													</tr>
												);
											})}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default DogCharts;
