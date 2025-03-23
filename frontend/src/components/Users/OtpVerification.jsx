import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const OtpVerification = () => {
	const location = useLocation();
	const navigate = useNavigate();

	const [email, setEmail] = useState(location.state?.email || "");
	const [otp, setOtp] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			const response = await fetch(
				`${import.meta.env.VITE_BACKEND_URL}/users/verify-otp`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email, otp }),
				}
			);

			const data = await response.json();
			if (response.ok) {
				toast.success(data.message);
				navigate("/login");
			} else {
				toast.error(data.message || "OTP verification failed");
			}
		} catch (error) {
			console.error("Error verifying OTP:", error);
			toast.error("Server error. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleResendOtp = async () => {
		try {
			const response = await fetch(
				`${import.meta.env.VITE_BACKEND_URL}/users/resend-otp`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email }),
				}
			);
			const data = await response.json();
			if (response.ok) {
				toast.success("OTP resent successfully!");
			} else {
				toast.error(data.message || "Failed to resend OTP");
			}
		} catch (error) {
			console.error("Resend OTP Error:", error);
			toast.error("Something went wrong. Try again.");
		}
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100 text-black">
			<div className="bg-white p-8 rounded shadow-md w-full max-w-sm text-center">
				<h2 className="text-2xl font-bold mb-2">Email Verification</h2>
				<p className="mb-4 text-sm">
					An OTP has been sent to your email{" "}
					<span className="font-semibold text-blue-700">{email}</span>
				</p>

				<form onSubmit={handleSubmit}>
					{/* Only show email input if email is not passed in */}
					{!location.state?.email && (
						<div className="mb-4 text-left">
							<label className="block mb-1">Email</label>
							<input
								type="email"
								className="w-full px-3 py-2 border rounded-md"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>
					)}

					<div className="mb-4 text-left">
						<label className="block mb-1">Enter OTP</label>
						<input
							type="text"
							className="w-full px-3 py-2 border rounded-md"
							value={otp}
							onChange={(e) => setOtp(e.target.value)}
							required
							placeholder="Enter the 6-digit code"
						/>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
					>
						{loading ? "Verifying..." : "Verify OTP"}
					</button>
				</form>

				<div className="mt-4">
					<p className="text-sm">
						Didn't receive the code?{" "}
						<button
							type="button"
							className="text-blue-600 hover:underline"
							onClick={handleResendOtp}
						>
							Resend OTP
						</button>
					</p>
				</div>
			</div>
		</div>
	);
};

export default OtpVerification;
