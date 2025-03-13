import { useEffect, useState } from "react";
import axios from "axios";
import { FaUserCircle } from "react-icons/fa";

const Users = () => {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [editingUser, setEditingUser] = useState(null);
	const [editedUserData, setEditedUserData] = useState({});
	const [confirmDeleteUser, setConfirmDeleteUser] = useState(null);
	const [sortBy, setSortBy] = useState("name"); // Default sorting by name
	const [sortOrder, setSortOrder] = useState("asc"); // Default to ascending

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const response = await axios.get(
					`${import.meta.env.VITE_BACKEND_URL}/users/getAllUsers`,
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem("token")}`,
						},
					}
				);
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
	// Sorting Function
	const sortedUsers = [...users].sort((a, b) => {
		let valA, valB;

		if (sortBy === "role") {
			// Sort by role first
			valA = a.role.toLowerCase();
			valB = b.role.toLowerCase();

			if (valA < valB) return sortOrder === "asc" ? -1 : 1;
			if (valA > valB) return sortOrder === "asc" ? 1 : -1;

			// If roles are the same, sort by name
			const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
			const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();

			if (nameA < nameB) return sortOrder === "asc" ? -1 : 1;
			if (nameA > nameB) return sortOrder === "asc" ? 1 : -1;
			return 0;
		} else {
			// Default sorting by Name
			valA = `${a.firstName} ${a.lastName}`.toLowerCase();
			valB = `${b.firstName} ${b.lastName}`.toLowerCase();

			if (valA < valB) return sortOrder === "asc" ? -1 : 1;
			if (valA > valB) return sortOrder === "asc" ? 1 : -1;
			return 0;
		}
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
			await axios.put(
				`${import.meta.env.VITE_BACKEND_URL}/users/editUser/${editingUser}`,
				editedUserData,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				}
			);
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
			await axios.delete(
				`${import.meta.env.VITE_BACKEND_URL}/users/deleteUser/${userId}`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				}
			);
			setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
			setConfirmDeleteUser(null);
		} catch (error) {
			console.error("Error deleting user:", error);
		}
	};

	return (
		<div className="container bg-gray-700 mx-auto my-6 p-6 rounded-lg shadow-lg">
			<div className="flex justify-between items-center mb-6">
				<p className="text-2xl font-bold text-white">Users List</p>
				<p className="text-lg text-gray-200 bg-gray-800 px-4 py-2 rounded-lg">
					Total Users: {users.length}
				</p>
			</div>
			<div className="flex gap-4 mb-4">
				<button
					onClick={() => handleSort("name")}
					className={`px-4 py-2 text-white rounded-lg ${
						sortBy === "name" ? "bg-blue-500" : "bg-gray-600"
					}`}
				>
					Sort by Name {sortBy === "name" && (sortOrder === "asc" ? "▲" : "▼")}
				</button>

				<button
					onClick={() => handleSort("role")}
					className={`px-4 py-2 text-white rounded-lg ${
						sortBy === "role" ? "bg-blue-500" : "bg-gray-600"
					}`}
				>
					Sort by Role {sortBy === "role" && (sortOrder === "asc" ? "▲" : "▼")}
				</button>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full text-white border border-gray-500 rounded-lg">
					<thead>
						<tr className="bg-gray-800 text-gray-200">
							<th className="py-3 px-4 border-b border-gray-500">Picture</th>
							<th className="py-3 px-4 border-b border-gray-500">First Name</th>
							<th className="py-3 px-4 border-b border-gray-500">Last Name</th>
							<th className="py-3 px-4 border-b border-gray-500">Email</th>
							<th className="py-3 px-4 border-b border-gray-500">Phone</th>
							<th className="py-3 px-4 border-b border-gray-500">Role</th>
							<th className="py-3 px-4 border-b border-gray-500">Actions</th>
						</tr>
					</thead>
					<tbody>
						{sortedUsers.map((user) => (
							<tr
								key={user._id}
								className="text-center bg-gray-600 hover:bg-gray-500"
							>
								<td className="py-3 px-4 border-b border-gray-500">
									{user.picture ? (
										<img
											src={user.picture}
											alt="Profile"
											className="w-7 h-7 rounded-full mx-auto"
										/>
									) : (
										<FaUserCircle className="w-7 h-7 text-gray-400 mx-auto" />
									)}
								</td>
								{editingUser === user._id ? (
									<>
										<td className="py-3 px-4 border-b border-gray-500">
											<input
												type="text"
												value={editedUserData.firstName}
												onChange={(e) => handleFieldChange(e, "firstName")}
												className="bg-gray-800 text-white px-2 py-1 rounded w-full"
											/>
										</td>
										<td className="py-3 px-4 border-b border-gray-500">
											<input
												type="text"
												value={editedUserData.lastName}
												onChange={(e) => handleFieldChange(e, "lastName")}
												className="bg-gray-800 text-white px-2 py-1 rounded w-full"
											/>
										</td>
										<td className="py-3 px-4 border-b border-gray-500">
											<input
												type="email"
												value={editedUserData.email}
												onChange={(e) => handleFieldChange(e, "email")}
												className="bg-gray-800 text-white px-2 py-1 rounded w-full"
											/>
										</td>
										<td className="py-3 px-4 border-b border-gray-500">
											<input
												type="number"
												value={editedUserData.phone}
												onChange={(e) => handleFieldChange(e, "phone")}
												className="bg-gray-800 text-white px-2 py-1 rounded w-full"
											/>
										</td>
										<td className="py-3 px-4 border-b border-gray-500">
											<select
												value={editedUserData.role}
												onChange={(e) => handleFieldChange(e, "role")}
												className="bg-gray-800 text-white px-2 py-1 rounded w-full"
											>
												<option value="user">User</option>
												<option value="admin">Admin</option>
												<option value="marshal">Marshal</option>
											</select>
										</td>
										<td className="py-3 px-4 border-b border-gray-500 flex gap-2 justify-center">
											<button
												onClick={handleConfirmEdit}
												className="bg-green-500 text-white px-3 py-1 rounded"
											>
												Confirm
											</button>
											<button
												onClick={() => setEditingUser(null)}
												className="bg-gray-500 text-white px-3 py-1 rounded"
											>
												Cancel
											</button>
										</td>
									</>
								) : (
									<>
										<td className="py-3 px-4 border-b border-gray-500">
											{user.firstName}
										</td>
										<td className="py-3 px-4 border-b border-gray-500">
											{user.lastName}
										</td>
										<td className="py-3 px-4 border-b border-gray-500">
											{user.email}
										</td>
										<td className="py-3 px-4 border-b border-gray-500">
											{user.phone}
										</td>
										<td className="py-3 px-4 border-b border-gray-500">
											{user.role}
										</td>
										<td className="py-3 px-4 border-b border-gray-500 flex gap-2 justify-center">
											<button
												onClick={() => handleEditUser(user)}
												className="bg-blue-500 text-white px-3 py-1 rounded"
											>
												Edit
											</button>
											<button
												onClick={() => setConfirmDeleteUser(user._id)}
												className="bg-red-500 text-white px-3 py-1 rounded"
											>
												Delete
											</button>
										</td>
									</>
								)}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Delete Confirmation */}
			{confirmDeleteUser && (
				<div className="fixed inset-0 flex justify-center items-center  bg-opacity-50">
					<div className="bg-gray-700 p-6 rounded-lg text-white">
						<p>Are you sure you want to delete this user?</p>
						<div className="flex gap-4 mt-4">
							<button
								onClick={() => handleDeleteUser(confirmDeleteUser)}
								className="bg-red-500 px-4 py-2 rounded"
							>
								Yes, Delete
							</button>
							<button
								onClick={() => setConfirmDeleteUser(null)}
								className="bg-gray-500 px-4 py-2 rounded"
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Users;
