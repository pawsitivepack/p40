import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import {
	FaUserCircle,
	FaSearch,
	FaEdit,
	FaTrash,
	FaCheck,
	FaTimes,
	FaSpinner,
	FaUserPlus,
	FaFilter,
	FaDownload,
	FaPrint,
	FaEye,
	FaEyeSlash,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const Users = () => {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [editingUser, setEditingUser] = useState(null);
	const [editedUserData, setEditedUserData] = useState({});
	const [confirmDeleteUser, setConfirmDeleteUser] = useState(null);
	const [sortBy, setSortBy] = useState("name");
	const [sortOrder, setSortOrder] = useState("asc");
	const [searchTerm, setSearchTerm] = useState("");
	const [roleFilter, setRoleFilter] = useState("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [showPassword, setShowPassword] = useState(false);
	const [newUserData, setNewUserData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		role: "user",
		password: "",
	});
	const [showAddUserForm, setShowAddUserForm] = useState(false);
	const [addingUser, setAddingUser] = useState(false);

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				setLoading(true);
				const response = await api.get(`/users/getAllUsers`);
				setUsers(response.data);
			} catch (err) {
				if (err.response && err.response.status === 403) {
					setError("You are not authorized for this.");
				} else {
					setError("Failed to fetch users. Try logging back in again.");
				}
			} finally {
				setLoading(false);
			}
		};

		fetchUsers();
	}, []);

	// Filter users based on search term and role filter
	const filteredUsers = users.filter((user) => {
		const matchesSearch =
			searchTerm === "" ||
			`${user.firstName} ${user.lastName}`
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(user.phone && user.phone.includes(searchTerm));

		const matchesRole = roleFilter === "all" || user.role === roleFilter;

		return matchesSearch && matchesRole;
	});

	// Sorting Function
	const sortedUsers = [...filteredUsers].sort((a, b) => {
		let valA, valB;

		switch (sortBy) {
			case "role":
				valA = a.role.toLowerCase();
				valB = b.role.toLowerCase();
				break;
			case "email":
				valA = a.email.toLowerCase();
				valB = b.email.toLowerCase();
				break;
			case "lastLogin":
				valA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
				valB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
				break;
			default: // name
				valA = `${a.firstName} ${a.lastName}`.toLowerCase();
				valB = `${b.firstName} ${b.lastName}`.toLowerCase();
		}

		if (valA < valB) return sortOrder === "asc" ? -1 : 1;
		if (valA > valB) return sortOrder === "asc" ? 1 : -1;

		// Secondary sort by name if primary sort is equal
		if (sortBy !== "name") {
			const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
			const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
			return sortOrder === "asc"
				? nameA.localeCompare(nameB)
				: nameB.localeCompare(nameA);
		}

		return 0;
	});

	// Handle Sorting Toggle
	const handleSort = (field) => {
		if (sortBy === field) {
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			setSortBy(field);
			setSortOrder("asc");
		}
	};

	// Handle Edit Button Click
	const handleEditUser = (user) => {
		setEditingUser(user._id);
		setEditedUserData({ ...user });
	};

	// Handle Field Change
	const handleFieldChange = (e, field) => {
		setEditedUserData({ ...editedUserData, [field]: e.target.value });
	};

	// Handle Save Changes
	const handleConfirmEdit = async () => {
		try {
			await api.put(`/users/editUser/${editingUser}`, editedUserData);
			setUsers((prevUsers) =>
				prevUsers.map((user) =>
					user._id === editingUser ? { ...editedUserData } : user
				)
			);
			setEditingUser(null);
		} catch (error) {
			console.error("Error updating user:", error);
		}
	};

	// Handle Delete Confirmation
	const handleDeleteUser = async (userId) => {
		try {
			await api.delete(`/users/deleteUser/${userId}`);
			setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
			setConfirmDeleteUser(null);
		} catch (error) {
			console.error("Error deleting user:", error);
		}
	};

	// Handle Add User
	const handleAddUser = async (e) => {
		e.preventDefault();
		setAddingUser(true);

		try {
			const response = await api.post("/users/register", newUserData);
			setUsers([...users, response.data]);
			setShowAddUserForm(false);
			setNewUserData({
				firstName: "",
				lastName: "",
				email: "",
				phone: "",
				role: "user",
				password: "",
			});
		} catch (error) {
			console.error("Error adding user:", error);
			alert("Failed to add user. Please try again.");
		} finally {
			setAddingUser(false);
		}
	};

	// Handle new user field change
	const handleNewUserChange = (e) => {
		const { name, value } = e.target;
		setNewUserData({ ...newUserData, [name]: value });
	};

	// Export to CSV
	const exportToCSV = () => {
		const headers = ["Name", "Email", "Phone", "Role", "Last Login"];
		const csvData = [
			headers.join(","),
			...sortedUsers.map((user) =>
				[
					`"${user.firstName} ${user.lastName}"`,
					`"${user.email}"`,
					`"${user.phone || ""}"`,
					`"${user.role}"`,
					`"${
						user.updatedAt
							? formatDistanceToNow(new Date(user.updatedAt)) + " ago"
							: "n/a"
					}"`,
				].join(",")
			),
		].join("\n");

		const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.setAttribute("href", url);
		link.setAttribute("download", "users.csv");
		link.style.visibility = "hidden";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	// Print user list
	const handlePrint = () => {
		window.print();
	};

	// Pagination
	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentUsers = sortedUsers.slice(indexOfFirstItem, indexOfLastItem);
	const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);

	const paginate = (pageNumber) => setCurrentPage(pageNumber);

	// Get role badge color
	const getRoleBadgeColor = (role) => {
		switch (role) {
			case "admin":
				return "bg-red-100 text-red-800";
			case "marshal":
				return "bg-blue-100 text-blue-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	return (
		<div className="p-4 bg-[#f8f5f0] min-h-screen print:bg-white print:p-0">
			<div className="max-w-7xl mx-auto">
				<div className="bg-white rounded-xl shadow-md overflow-hidden print:shadow-none">
					{/* Header */}
					<div className="bg-[#8c1d35] px-6 py-4 print:bg-white print:border-b-2 print:border-[#8c1d35]">
						<div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
							<h1 className="text-2xl font-bold text-white flex items-center print:text-[#8c1d35]">
								<FaUserCircle className="mr-3" /> Users Management
							</h1>
							<div className="flex items-center text-white print:text-[#8c1d35]">
								<span className="bg-white text-[#8c1d35] px-3 py-1 rounded-lg font-medium print:bg-[#f8f5f0]">
									Total Users: {users.length}
								</span>
							</div>
						</div>
					</div>

					{/* Toolbar */}
					<div className="bg-[#f8f5f0] border-b border-[#e8d3a9] p-4 print:hidden">
						<div className="flex flex-col md:flex-row gap-4 justify-between">
							{/* Search */}
							<div className="flex-1 max-w-md">
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<FaSearch className="text-gray-400" />
									</div>
									<input
										type="text"
										placeholder="Search users..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-[#8c1d35] focus:border-[#8c1d35] text-[#8c1d35]"
									/>
								</div>
							</div>

							{/* Role Filter */}
							<div className="flex items-center gap-2">
								<FaFilter className="text-[#8c1d35]" />
								<select
									value={roleFilter}
									onChange={(e) => setRoleFilter(e.target.value)}
									className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-[#8c1d35] focus:border-[#8c1d35] text-[#8c1d35]"
								>
									<option value="all">All Roles</option>
									<option value="user">Users</option>
									<option value="marshal">Marshals</option>
									<option value="admin">Admins</option>
								</select>
							</div>

							{/* Action Buttons */}
							<div className="flex gap-2">
								<button
									onClick={() => setShowAddUserForm(true)}
									className="bg-[#8c1d35] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#7c1025] transition-colors flex items-center"
								>
									<FaUserPlus className="mr-2" /> Add User
								</button>
								<button
									onClick={exportToCSV}
									className="bg-[#e8d3a9] text-[#8c1d35] px-4 py-2 rounded-lg font-medium hover:bg-[#d9c59a] transition-colors flex items-center"
								>
									<FaDownload className="mr-2" /> Export
								</button>
								<button
									onClick={handlePrint}
									className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center"
								>
									<FaPrint className="mr-2" /> Print
								</button>
							</div>
						</div>
					</div>

					{/* Content */}
					<div className="p-4">
						{loading ? (
							<div className="flex justify-center items-center py-12">
								<FaSpinner className="animate-spin text-[#8c1d35] text-3xl" />
							</div>
						) : error ? (
							<div className="bg-red-100 text-red-700 p-4 rounded-lg">
								{error}
							</div>
						) : (
							<>
								<div className="overflow-x-auto">
									<table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
										<thead className="bg-[#f8f5f0]">
											<tr>
												<th className="py-3 px-4 text-left text-[#8c1d35] font-semibold border-b border-[#e8d3a9]">
													Picture
												</th>
												<th
													className="py-3 px-4 text-left text-[#8c1d35] font-semibold border-b border-[#e8d3a9] cursor-pointer hover:bg-[#e8d3a9]/30 transition-colors"
													onClick={() => handleSort("name")}
												>
													<div className="flex items-center">
														Name
														{sortBy === "name" && (
															<span className="ml-1">
																{sortOrder === "asc" ? "▲" : "▼"}
															</span>
														)}
													</div>
												</th>
												<th
													className="py-3 px-4 text-left text-[#8c1d35] font-semibold border-b border-[#e8d3a9] cursor-pointer hover:bg-[#e8d3a9]/30 transition-colors"
													onClick={() => handleSort("email")}
												>
													<div className="flex items-center">
														Email
														{sortBy === "email" && (
															<span className="ml-1">
																{sortOrder === "asc" ? "▲" : "▼"}
															</span>
														)}
													</div>
												</th>
												<th className="py-3 px-4 text-left text-[#8c1d35] font-semibold border-b border-[#e8d3a9]">
													Phone
												</th>
												<th
													className="py-3 px-4 text-left text-[#8c1d35] font-semibold border-b border-[#e8d3a9] cursor-pointer hover:bg-[#e8d3a9]/30 transition-colors"
													onClick={() => handleSort("role")}
												>
													<div className="flex items-center">
														Role
														{sortBy === "role" && (
															<span className="ml-1">
																{sortOrder === "asc" ? "▲" : "▼"}
															</span>
														)}
													</div>
												</th>
												<th
													className="py-3 px-4 text-left text-[#8c1d35] font-semibold border-b border-[#e8d3a9] cursor-pointer hover:bg-[#e8d3a9]/30 transition-colors"
													onClick={() => handleSort("lastLogin")}
												>
													<div className="flex items-center">
														Last Login
														{sortBy === "lastLogin" && (
															<span className="ml-1">
																{sortOrder === "asc" ? "▲" : "▼"}
															</span>
														)}
													</div>
												</th>
												<th className="py-3 px-4 text-left text-[#8c1d35] font-semibold border-b border-[#e8d3a9] print:hidden">
													Actions
												</th>
											</tr>
										</thead>
										<tbody>
											{currentUsers.map((user) => (
												<tr
													key={user._id}
													className="hover:bg-[#f8f5f0] transition-colors"
												>
													<td className="py-3 px-4 border-b border-gray-200">
														{user.picture ? (
															<img
																src={user.picture || "/placeholder.svg"}
																alt="Profile"
																className="w-10 h-10 rounded-full object-cover"
															/>
														) : (
															<div className="w-10 h-10 rounded-full bg-[#e8d3a9] flex items-center justify-center text-[#8c1d35]">
																<FaUserCircle className="w-6 h-6" />
															</div>
														)}
													</td>
													{editingUser === user._id ? (
														<>
															<td className="py-3 px-4 border-b border-gray-200">
																<div className="flex flex-col gap-2">
																	<input
																		type="text"
																		value={editedUserData.firstName}
																		onChange={(e) =>
																			handleFieldChange(e, "firstName")
																		}
																		className="border border-gray-300 rounded px-2 py-1 w-full focus:ring-[#8c1d35] focus:border-[#8c1d35]"
																		placeholder="First Name"
																	/>
																	<input
																		type="text"
																		value={editedUserData.lastName}
																		onChange={(e) =>
																			handleFieldChange(e, "lastName")
																		}
																		className="border border-gray-300 rounded px-2 py-1 w-full focus:ring-[#8c1d35] focus:border-[#8c1d35]"
																		placeholder="Last Name"
																	/>
																</div>
															</td>
															<td className="py-3 px-4 border-b border-gray-200">
																<input
																	type="email"
																	value={editedUserData.email}
																	onChange={(e) =>
																		handleFieldChange(e, "email")
																	}
																	className="border border-gray-300 rounded px-2 py-1 w-full focus:ring-[#8c1d35] focus:border-[#8c1d35]"
																/>
															</td>
															<td className="py-3 px-4 border-b border-gray-200">
																<input
																	type="text"
																	value={editedUserData.phone || ""}
																	onChange={(e) =>
																		handleFieldChange(e, "phone")
																	}
																	className="border border-gray-300 rounded px-2 py-1 w-full focus:ring-[#8c1d35] focus:border-[#8c1d35]"
																/>
															</td>
															<td className="py-3 px-4 border-b border-gray-200">
																<select
																	value={editedUserData.role}
																	onChange={(e) => handleFieldChange(e, "role")}
																	className="border border-gray-300 rounded px-2 py-1 w-full focus:ring-[#8c1d35] focus:border-[#8c1d35]"
																>
																	<option value="user">User</option>
																	<option value="admin">Admin</option>
																	<option value="marshal">Marshal</option>
																</select>
															</td>
															<td className="py-3 px-4 border-b border-gray-200">
																{user.updatedAt
																	? `${formatDistanceToNow(
																			new Date(user.updatedAt)
																	  ).toLowerCase()} ago`
																	: "n/a"}
															</td>
															<td className="py-3 px-4 border-b border-gray-200 print:hidden">
																<div className="flex gap-2">
																	<button
																		onClick={handleConfirmEdit}
																		className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors"
																		title="Save"
																	>
																		<FaCheck />
																	</button>
																	<button
																		onClick={() => setEditingUser(null)}
																		className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition-colors"
																		title="Cancel"
																	>
																		<FaTimes />
																	</button>
																</div>
															</td>
														</>
													) : (
														<>
															<td className="py-3 px-4 border-b border-gray-200 font-medium">
																<Link
																	to={`/user/${user._id}`}
																	className="text-[#8c1d35] hover:underline"
																>
																	{`${user.firstName} ${user.lastName}`}
																</Link>
															</td>
															<td className="py-3 px-4 border-b border-gray-200">
																<a
																	href={`mailto:${user.email}`}
																	className="text-[#8c1d35] hover:underline"
																>
																	{user.email}
																</a>
															</td>
															<td className="py-3 px-4 border-b border-gray-200">
																{user.phone ? (
																	<a
																		href={`tel:${user.phone}`}
																		className="text-[#8c1d35] hover:underline"
																	>
																		{user.phone}
																	</a>
																) : (
																	<span className="text-gray-400 italic">
																		Not provided
																	</span>
																)}
															</td>
															<td className="py-3 px-4 border-b border-gray-200">
																<span
																	className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
																		user.role
																	)}`}
																>
																	{user.role}
																</span>
															</td>
															<td className="py-3 px-4 border-b border-gray-200 text-gray-600">
																{user.updatedAt
																	? `${formatDistanceToNow(
																			new Date(user.updatedAt)
																	  ).toLowerCase()} ago`
																	: "n/a"}
															</td>
															<td className="py-3 px-4 border-b border-gray-200 print:hidden">
																<div className="flex gap-2">
																	<button
																		onClick={() => handleEditUser(user)}
																		className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
																		title="Edit"
																	>
																		<FaEdit />
																	</button>
																	<button
																		onClick={() =>
																			setConfirmDeleteUser(user._id)
																		}
																		className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
																		title="Delete"
																	>
																		<FaTrash />
																	</button>
																</div>
															</td>
														</>
													)}
												</tr>
											))}
										</tbody>
									</table>
								</div>

								{/* Pagination */}
								{sortedUsers.length > itemsPerPage && (
									<div className="mt-4 flex flex-col sm:flex-row justify-between items-center print:hidden">
										<div className="mb-2 sm:mb-0">
											<span className="text-sm text-gray-700">
												Showing{" "}
												<span className="font-medium">
													{indexOfFirstItem + 1}
												</span>{" "}
												to{" "}
												<span className="font-medium">
													{Math.min(indexOfLastItem, sortedUsers.length)}
												</span>{" "}
												of{" "}
												<span className="font-medium">
													{sortedUsers.length}
												</span>{" "}
												users
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

											{Array.from(
												{ length: Math.min(5, totalPages) },
												(_, i) => {
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
												}
											)}

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
												className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-[#8c1d35] focus:border-[#8c1d35] text-[#8c1d35]"
											>
												<option value={5}>5</option>
												<option value={10}>10</option>
												<option value={25}>25</option>
												<option value={50}>50</option>
											</select>
										</div>
									</div>
								)}
							</>
						)}
					</div>
				</div>
			</div>

			{/* Add User Modal */}
			{showAddUserForm && (
				<>
					<div
						className="fixed inset-0 backdrop-blur-sm bg-black/30 z-10"
						onClick={() => setShowAddUserForm(false)}
					></div>
					<div className="fixed bg-white rounded-xl shadow-xl z-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md overflow-hidden">
						<div className="bg-[#8c1d35] px-6 py-4">
							<div className="flex justify-between items-center">
								<h3 className="text-xl font-bold text-white flex items-center">
									<FaUserPlus className="mr-2" /> Add New User
								</h3>
								<button
									onClick={() => setShowAddUserForm(false)}
									className="text-white hover:bg-[#7c1025] p-1 rounded-full transition-colors"
								>
									<FaTimes className="w-5 h-5" />
								</button>
							</div>
						</div>
						<div className="p-6">
							<form onSubmit={handleAddUser} className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											First Name
										</label>
										<input
											type="text"
											name="firstName"
											value={newUserData.firstName}
											onChange={handleNewUserChange}
											className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[#8c1d35] focus:border-[#8c1d35]"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Last Name
										</label>
										<input
											type="text"
											name="lastName"
											value={newUserData.lastName}
											onChange={handleNewUserChange}
											className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[#8c1d35] focus:border-[#8c1d35]"
											required
										/>
									</div>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Email
									</label>
									<input
										type="email"
										name="email"
										value={newUserData.email}
										onChange={handleNewUserChange}
										className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[#8c1d35] focus:border-[#8c1d35]"
										required
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Phone
									</label>
									<input
										type="text"
										name="phone"
										value={newUserData.phone}
										onChange={handleNewUserChange}
										className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[#8c1d35] focus:border-[#8c1d35]"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Role
									</label>
									<select
										name="role"
										value={newUserData.role}
										onChange={handleNewUserChange}
										className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[#8c1d35] focus:border-[#8c1d35]"
										required
									>
										<option value="user">User</option>
										<option value="marshal">Marshal</option>
										<option value="admin">Admin</option>
									</select>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Password
									</label>
									<div className="relative">
										<input
											type={showPassword ? "text" : "password"}
											name="password"
											value={newUserData.password}
											onChange={handleNewUserChange}
											className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[#8c1d35] focus:border-[#8c1d35]"
											required
										/>
										<button
											type="button"
											className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
											onClick={() => setShowPassword(!showPassword)}
										>
											{showPassword ? <FaEyeSlash /> : <FaEye />}
										</button>
									</div>
								</div>
								<div className="flex justify-end gap-3 mt-6">
									<button
										type="button"
										onClick={() => setShowAddUserForm(false)}
										className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
									>
										Cancel
									</button>
									<button
										type="submit"
										disabled={addingUser}
										className="px-4 py-2 rounded-lg text-white font-medium transition-colors bg-[#8c1d35] hover:bg-[#7c1025]"
									>
										{addingUser ? (
											<>
												<FaSpinner className="inline animate-spin mr-2" />
												Adding...
											</>
										) : (
											"Add User"
										)}
									</button>
								</div>
							</form>
						</div>
					</div>
				</>
			)}

			{/* Delete Confirmation Modal */}
			{confirmDeleteUser && (
				<>
					<div
						className="fixed inset-0 backdrop-blur-sm bg-black/30 z-10"
						onClick={() => setConfirmDeleteUser(null)}
					></div>
					<div className="fixed bg-white rounded-xl shadow-xl z-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md overflow-hidden">
						<div className="bg-red-600 px-6 py-4">
							<div className="flex justify-between items-center">
								<h3 className="text-xl font-bold text-white flex items-center">
									<FaTrash className="mr-2" /> Confirm Deletion
								</h3>
								<button
									onClick={() => setConfirmDeleteUser(null)}
									className="text-white hover:bg-red-700 p-1 rounded-full transition-colors"
								>
									<FaTimes className="w-5 h-5" />
								</button>
							</div>
						</div>
						<div className="p-6">
							<p className="text-gray-700 mb-6">
								Are you sure you want to delete this user? This action cannot be
								undone.
							</p>
							<div className="flex justify-end gap-3">
								<button
									onClick={() => setConfirmDeleteUser(null)}
									className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
								>
									Cancel
								</button>
								<button
									onClick={() => handleDeleteUser(confirmDeleteUser)}
									className="px-4 py-2 rounded-lg text-white font-medium transition-colors bg-red-600 hover:bg-red-700"
								>
									Delete User
								</button>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
};

export default Users;