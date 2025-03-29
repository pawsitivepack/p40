import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();

  const sendOtp = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("OTP sent to your email");
        setOtpSent(true);
        setTimeout(() => setOtpSent(false), 60000); // Resend available after 60s
        navigate("/reset-password", { state: { email } });
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.warning("Please enter a valid email");
      return;
    }
    sendOtp();
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("OTP resent to your email");
        setOtpSent(true);
        setTimeout(() => setOtpSent(false), 60000); // Disable resend again for 60s
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      toast.error("Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-amber-50 px-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md border border-[#e8d3a9]">
        <h2 className="text-2xl font-bold text-red-900 mb-4 text-center">Enter your email</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            className="w-full p-2 border border-amber-200 rounded text-black"
          />
          <button
            type="submit"
            className="w-full bg-red-900 text-white py-2 rounded hover:bg-red-800 transition-colors"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>

        {otpSent && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 mb-2">Didn't get the code?</p>
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className={`text-sm font-semibold ${
                resendLoading ? "text-gray-400" : "text-red-900 hover:underline"
              }`}
            >
              {resendLoading ? "Resending..." : "Resend OTP"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
