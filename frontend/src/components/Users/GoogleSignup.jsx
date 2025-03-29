import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function GoogleSignup() {
	const location = useLocation();
	const navigate = useNavigate();
	const { firstName, lastName, email, picture } = location.state;

	const [birthdate, setBirthdate] = useState("");
	const [userAge, setUserAge] = useState(null);
	const [isOldEnough, setIsOldEnough] = useState(true);
	const [formData, setFormData] = useState({ phone: "", dob: "" });

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleBirthdateChange = (e) => {
		const birthdateValue = e.target.value;
		setBirthdate(birthdateValue);

		const today = new Date();
		const birthDate = new Date(birthdateValue);
		let age = today.getFullYear() - birthDate.getFullYear();
		const monthDiff = today.getMonth() - birthDate.getMonth();
		if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}

		setUserAge(age);
		setIsOldEnough(age >= 12);
		setFormData({ ...formData, dob: birthdateValue });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!isOldEnough) {
			toast.error("You must be at least 12 years old to register.");
			return;
		}

		try {
			const response = await fetch(
				`${import.meta.env.VITE_BACKEND_URL}/users/google-signup`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						...formData,
						firstName,
						lastName,
						email,
						picture,
					}),
				}
			);

			const data = await response.json();
			if (response.ok) {
				toast.success("Signup successful");
				localStorage.setItem("token", data.token);
				navigate("/myprofile");
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			console.error("Signup Error:", error);
			toast.error("Signup failed. Please try again.");
		}
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-[#f8f5f0] px-4">
			<div className="bg-white shadow-md border border-[#e8d3a9] rounded-xl w-full max-w-md p-8">
				<h2 className="text-2xl font-bold text-center text-[#8c1d35] mb-6">
					Complete Your Signup
				</h2>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Birthdate
						</label>
						<input
							type="date"
							value={birthdate}
							onChange={handleBirthdateChange}
							className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8c1d35] text-gray-900"
							required
						/>
						<p className="text-sm text-gray-600 mt-1">Age: {userAge || "N/A"}</p>
						{!isOldEnough && (
							<p className="text-sm text-red-600">
								You must be at least 12 years old to register.
							</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Phone Number
						</label>
						<input
							type="text"
							name="phone"
							value={formData.phone}
							onChange={handleChange}
							placeholder="Enter your phone number"
							className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8c1d35] text-gray-900"
							required
						/>
					</div>

					<button
						type="submit"
						className="w-full bg-[#8c1d35] hover:bg-[#7a162c] text-white font-semibold py-2 rounded-md transition-colors"
					>
						Complete Signup
					</button>
				</form>
			</div>
		</div>
	);
}

export default GoogleSignup;
