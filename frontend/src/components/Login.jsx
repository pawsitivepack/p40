import React, { useState, useEffect } from "react";
import logo from "../assets/underdogs.png";
import dogBackground from "../assets/paw.png"; // Ensure this path is correct

export default function Login() {
	const [isRegistering, setIsRegistering] = useState(false);
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		age: "",
		phone: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [rememberMe, setRememberMe] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	// Handle input change
	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	// Handle form submission
	const handleSubmit = async (e) => {
		e.preventDefault();

		if (isRegistering && formData.password !== formData.confirmPassword) {
			alert("Passwords do not match!");
			return;
		}

		const endpoint = isRegistering ? "/signup" : "/login";
		try {
			const response = await fetch(`http://localhost:5001/users${endpoint}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(
					isRegistering
						? {
								firstName: formData.firstName,
								lastName: formData.lastName,
								age: formData.age,
								phone: formData.phone,
								email: formData.email,
								password: formData.password,
						  }
						: {
								email: formData.email,
								password: formData.password,
						  }
				),
				credentials: "include", // Ensures cookies are sent with the request
			});

			const data = await response.json();

			if (response.ok) {
				alert(data.message); // Show success message
				if (!isRegistering && rememberMe) {
					localStorage.setItem("rememberedEmail", formData.email);
				} else {
					localStorage.removeItem("rememberedEmail");
				}
			} else {
				alert(data.message || "Something went wrong");
			}
		} catch (error) {
			console.error("Error:", error);
			alert("Server error. Please try again later.");
		}
	};

	useEffect(() => {
		const rememberedEmail = localStorage.getItem("rememberedEmail");
		if (rememberedEmail) {
			setFormData((prev) => ({ ...prev, email: rememberedEmail }));
			setRememberMe(true);
		}
	}, []);

	// Toggle Password Visibility with Timer
	const togglePasswordVisibility = (type) => {
		if (type === "password") {
			setShowPassword(true);
			setTimeout(() => setShowPassword(false), 4000);
		} else if (type === "confirmPassword") {
			setShowConfirmPassword(true);
			setTimeout(() => setShowConfirmPassword(false), 4000);
		}
	};

	return (
		<div className="relative flex justify-center items-center min-h-screen bg-gray-100 overflow-hidden">
			{/* Blurred Background Image */}
			<div
				className="absolute inset-0 bg-center bg-no-repeat bg-contain blur-md opacity-50"
				style={{ backgroundImage: `url(${dogBackground})` }}
			></div>

			<div className="relative bg-white shadow-lg rounded-md w-96 z-10">
				<div className="bg-red-950">
					<div className="bg-maroon-800 p-2 text-center rounded-t-md">
						<img src={logo} alt="Dog Logo" className="h-12 mx-auto mt-3 mb-2" />
					</div>
				</div>
				<div className="p-6">
					<h2 className="text-xl font-bold text-gray-700 mb-2 text-center">
						{isRegistering ? "Create Account" : "Login"}
					</h2>

					<form onSubmit={handleSubmit}>
						{isRegistering && (
							<>
								{["firstName", "lastName", "age", "phone"].map((field) => (
									<div key={field}>
										<label className="block text-gray-600 mb-1 capitalize">
											{field.replace(/([A-Z])/g, " $1")}
										</label>
										<input
											type={field === "age" ? "number" : "text"}
											name={field}
											value={formData[field]}
											onChange={handleChange}
											placeholder={`Enter your ${field
												.replace(/([A-Z])/g, " $1")
												.toLowerCase()}`}
											className="w-full p-2 border border-gray-300 text-gray-500 rounded-md mb-4"
											required
										/>
									</div>
								))}
							</>
						)}

						<label className="block text-gray-600 mb-1">Email</label>
						<input
							type="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							placeholder="Enter your email"
							className="w-full p-2 border border-gray-300 text-gray-500 rounded-md mb-4"
							required
						/>

						<label className="block text-gray-600 mb-1">Password</label>
						<div className="relative">
							<input
								type={showPassword ? "text" : "password"}
								name="password"
								value={formData.password}
								onChange={handleChange}
								placeholder="Enter your password"
								className="w-full p-2 border border-gray-300 text-gray-500 rounded-md mb-4 pr-16"
								required
							/>
							<button
								type="button"
								className="absolute right-2 top-2 text-blue-600"
								onClick={() => togglePasswordVisibility("password")}
							>
								{showPassword ? "Hide" : "Show"}
							</button>
						</div>

						{!isRegistering && (
							<div className="flex items-center mb-4">
								<input
									type="checkbox"
									id="rememberMe"
									checked={rememberMe}
									onChange={(e) => setRememberMe(e.target.checked)}
									className="mr-2"
								/>
								<label htmlFor="rememberMe" className="text-gray-700">
									Remember Me
								</label>
							</div>
						)}

						{isRegistering && (
							<>
								<label className="block text-gray-600 mb-1">
									Confirm Password
								</label>
								<div className="relative">
									<input
										type={showConfirmPassword ? "text" : "password"}
										name="confirmPassword"
										value={formData.confirmPassword}
										onChange={handleChange}
										placeholder="Re-enter your password"
										className="w-full p-2 border border-gray-300 text-gray-500 rounded-md mb-4 pr-16"
										required
									/>
									<button
										type="button"
										className="absolute right-2 top-2 text-blue-600"
										onClick={() => togglePasswordVisibility("confirmPassword")}
									>
										{showConfirmPassword ? "Hide" : "Show"}
									</button>
								</div>
							</>
						)}

						<button
							type="submit"
							className="w-full bg-gray-700 text-white py-2 rounded-md hover:bg-gray-800 transition"
						>
							{isRegistering ? "Create Account" : "Login"}
						</button>

						{!isRegistering && (
							<div className="text-center mt-2">
								<a href="#" className="text-blue-600 hover:underline text-sm">
									Forgot Password?
								</a>
							</div>
						)}

						<div className="text-center mt-2">
							<button
								onClick={() => setIsRegistering(!isRegistering)}
								className="text-blue-600 hover:underline text-sm"
							>
								{isRegistering
									? "Already have an account? Login"
									: "Don't have an account? Create one"}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
