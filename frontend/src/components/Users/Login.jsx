import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import "react-toastify/dist/ReactToastify.css";
import logo from "../../assets/underdogs.png";
import dogBackground from "../../assets/paw.png";

export default function Login() {
	const [isRegistering, setIsRegistering] = useState(false);
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		dob: "",
		phone: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [birthdate, setBirthdate] = useState("");
	const [userAge, setUserAge] = useState(null);
	const [isOldEnough, setIsOldEnough] = useState(true);
	const [rememberMe, setRememberMe] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const navigate = useNavigate();

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
		setFormData({ ...formData, dob: birthdateValue }); // Store dob in formData
	};

	const isPasswordValid = (password) =>
		/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);
	

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!isOldEnough) {
			toast.error("You must be at least 12 years old to create an account.");
			return;
		}

		if (isRegistering && formData.password !== formData.confirmPassword) {
			toast.error("Passwords do not match!");
			return;
		}
		
        if (isRegistering && !isPasswordValid(formData.password)) {
			toast.error(
				"Password must be at least 8 characters long, include uppercase, lowercase, a number, and a special character."
			);
			return;
		}
		const endpoint = isRegistering ? "/signup" : "/login";

		try {
			const response = await fetch(
				`${import.meta.env.VITE_BACKEND_URL}/users${endpoint}`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(
						isRegistering
							? {
									firstName: formData.firstName,
									lastName: formData.lastName,
									dob: formData.dob,
									phone: formData.phone,
									email: formData.email,
									password: formData.password,
							  }
							: {
									email: formData.email,
									password: formData.password,
							  }
					),
				}
			);

			const data = await response.json();

			if (response.ok) {
				toast.success(data.message);

				if (isRegistering) {
					// ✅ Redirect to OTP page after signup
					navigate("/verify-otp", { state: { email: formData.email } });
				} else {
					localStorage.setItem("token", data.token);
					window.dispatchEvent(new Event("storage"));

					if (rememberMe) {
						localStorage.setItem("rememberedEmail", formData.email);
					} else {
						localStorage.removeItem("rememberedEmail");
					}

					navigate("/myprofile");
				}
			} else if (
				response.status === 403 &&
				data.message?.includes("verify") &&
				data.email
			) {
				toast.info("Please verify your email.");
				navigate("/verify-otp", { state: { email: data.email } });
			} else if (
				isRegistering &&
				data.message?.includes("already registered") &&
				data.email
			) {
				// If email is already registered but not verified, backend sends status 400 + email
				toast.info("Account exists but is not verified. Please check your email.");
				navigate("/verify-otp", { state: { email: data.email } });
			} else {
				toast.error(data.message || "Invalid password or email");
			}
			
		} catch (error) {
			console.error("Error:", error);
			toast.error("Server error. Please try again later.");
		}
	};

	const handleGoogleSuccess = async (credentialResponse) => {
		try {
			const token = credentialResponse.credential;
			const response = await fetch(
				`${import.meta.env.VITE_BACKEND_URL}/users/google-login`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ token }),
				}
			);

			const data = await response.json();
			if (response.status === 302) {
				navigate("/google-signup", { state: data.user });
			} else if (response.ok) {
				toast.success("Google Login Successful");
				localStorage.setItem("token", data.token);
				window.dispatchEvent(new Event("storage"));
				navigate("/myprofile");
			} else {
				toast.error(data.message || "Google Login failed");
			}
		} catch (error) {
			console.error("Google Login Error:", error);
			toast.error("Google Login Error. Please try again.");
		}
	};

	useEffect(() => {
		const rememberedEmail = localStorage.getItem("rememberedEmail");
		if (rememberedEmail) {
			setFormData((prev) => ({ ...prev, email: rememberedEmail }));
			setRememberMe(true);
		}
	}, []);

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	const toggleConfirmPasswordVisibility = () => {
		setShowConfirmPassword(!showConfirmPassword);
	};

	return (
		<div className="relative flex justify-center items-center min-h-screen bg-gray-100 overflow-hidden">
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
								{["firstName", "lastName", "phone"].map((field) => (
									<div key={field}>
										<label className="block text-gray-600 mb-1 capitalize">
											{field.replace(/([A-Z])/g, " $1")}
										</label>
										<input
											type="text"
											name={field}
											value={formData[field]}
											onChange={handleChange}
											placeholder={`Enter your ${field}`}
											className="w-full p-2 border border-gray-300 text-gray-500 rounded-md mb-4"
											required
										/>
									</div>
								))}
								<label className="block text-gray-600 mb-1">Birthdate</label>
								<input
									type="date"
									value={birthdate}
									onChange={handleBirthdateChange}
									className="w-full p-2 border border-gray-300 text-gray-500 rounded-md mb-2"
									required
								/>
								<p className="text-gray-500 mb-4">Age: {userAge || "N/A"}</p>
								{!isOldEnough && (
									<p className="text-red-600 text-sm">
										You must be at least 12 years old to register.
									</p>
								)}
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
							{isRegistering && formData.password && !isPasswordValid(formData.password) && (
								<p className="text-sm text-red-500 mb-4">
									Password must be at least 8 characters, contain uppercase, lowercase, a number, and a special character.
								</p>
)}

							<button
								type="button"
								className="absolute right-2 top-2 text-blue-600"
								onClick={togglePasswordVisibility}
							>
								{showPassword ? "Hide" : "Show"}
							</button>
						</div>

						{isRegistering && (
							<>
								<label className="block text-gray-600 mb-1">Confirm Password</label>
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
										onClick={toggleConfirmPasswordVisibility}
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
						<div className="text-center mt-2">
							<button
								type="button"
								onClick={() => setIsRegistering(!isRegistering)}
								className="text-blue-600 hover:underline text-sm"
							>
								{isRegistering
									? "Already have an account? Login"
									: "Don't have an account? Create one"}
							</button>
						</div>
					</form>
					<div className="text-center my-4">
						<span className="text-gray-500">OR</span>
					</div>
					<div className="flex justify-center">
						<GoogleLogin
							onSuccess={handleGoogleSuccess}
							onError={() => toast.error("Google Login failed")}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
