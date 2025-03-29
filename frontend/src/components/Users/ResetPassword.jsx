import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const [step, setStep] = useState("verify"); // "verify" or "reset"
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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

  return (
    <div className="min-h-screen flex justify-center items-center bg-amber-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-red-900 mb-4 text-center">
          {step === "verify" ? "Verify OTP" : "Reset Password"}
        </h2>

        {step === "verify" ? (
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
        ) : (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="New Password"
              className="w-full p-2 border border-amber-200 rounded text-black"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm New Password"
              className="w-full p-2 border border-amber-200 rounded text-black"
            />
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
