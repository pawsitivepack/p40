import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa"

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const [step, setStep] = useState("verify");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resendDisabled, setResendDisabled] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleOtpVerify = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("OTP verified. Please set your new password.");
        setStep("reset");
      } else {
        toast.error(data.message || "Invalid OTP");
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      toast.error("Something went wrong.");
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Password reset successful");
        navigate("/login");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error("Reset password error:", err);
      toast.error("Something went wrong.");
    }
  };

  const handleResendOtp = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("OTP resent to your email.");
        setResendDisabled(true);
        setTimeout(() => setResendDisabled(false), 60000);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      toast.error("Failed to resend OTP.");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-amber-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-red-900 mb-4 text-center">
          {step === "verify" ? "Verify OTP" : "Reset Password"}
        </h2>

        {step === "verify" ? (
          <>
            <form onSubmit={handleOtpVerify} className="space-y-4">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                placeholder="Enter OTP"
                className="w-full p-2 border border-amber-200 rounded text-black"
              />
              <button
                type="submit"
                className="w-full bg-red-900 text-white py-2 rounded hover:bg-red-800"
              >
                Verify OTP
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">Didn't receive the code?</p>
              <button
                onClick={handleResendOtp}
                disabled={resendDisabled}
                className={`text-sm font-medium mt-1 ${
                  resendDisabled
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-red-900 hover:underline"
                }`}
              >
                {resendDisabled ? "Please wait..." : "Resend OTP"}
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="New Password"
                className="w-full p-2 border border-amber-200 rounded text-black"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-2 text-sm text-gray-600"
              >
                {showNewPassword ?  <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
              </button>
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm New Password"
                className="w-full p-2 border border-amber-200 rounded text-black"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2 text-sm text-gray-600"
              >
                {showConfirmPassword ?  <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-red-900 text-white py-2 rounded hover:bg-red-800"
            >
              Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
