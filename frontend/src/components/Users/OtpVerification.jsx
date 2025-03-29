"use client"

import { useState, useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { FaArrowLeft } from "react-icons/fa"
import logo from "../../assets/underdogs.png"
import dogBackground from "../../assets/paw.png"

const OtpVerification = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const hasResent = useRef(false)

  const [email, setEmail] = useState(location.state?.email || "")
  const [password] = useState(location.state?.password || "") // optional, passed from signup
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const autoResend = async () => {
      if (!email || hasResent.current) return

      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/resend-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        })
        const data = await response.json()

        if (response.ok) {
          toast.info("A new OTP has been sent to your email.")
          hasResent.current = true // ← Mark as sent
        } else {
          toast.error(data.message || "Failed to resend OTP")
        }
      } catch (error) {
        console.error("Auto resend OTP error:", error)
        toast.error("Something went wrong while resending OTP.")
      }
    }

    autoResend()
  }, [email])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      })

      const data = await response.json()
      if (response.ok) {
        toast.success(data.message)

        // ✅ Navigate to login and pass credentials
        navigate("/login", {
          state: {
            email,
            password,
            fromVerification: true,
          },
        })
      } else {
        toast.error(data.message || "OTP verification failed")
      }
    } catch (error) {
      console.error("Error verifying OTP:", error)
      toast.error("Server error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()
      if (response.ok) {
        toast.success("OTP resent successfully!")
      } else {
        toast.error(data.message || "Failed to resend OTP")
      }
    } catch (error) {
      console.error("Resend OTP Error:", error)
      toast.error("Something went wrong. Try again.")
    }
  }

  return (
    <div className="relative flex justify-center items-center min-h-screen bg-amber-50 overflow-hidden">
      {/* Background with paw prints */}
      <div
        className="absolute inset-0 bg-center bg-no-repeat bg-contain opacity-10"
        style={{ backgroundImage: `url(${dogBackground})` }}
      ></div>

      <div className="relative bg-white shadow-lg rounded-md w-full max-w-md z-10 overflow-hidden">
        {/* Header with logo */}
        <div className="bg-red-900 text-center p-4 rounded-t-md">
          <img src={logo || "/placeholder.svg"} alt="ULM P40 UNDERDOGS" className="h-16 mx-auto" />
          <h2 className="text-2xl font-bold text-amber-50 mt-2">Email Verification</h2>
        </div>

        <div className="p-6 bg-white">
          <p className="mb-6 text-gray-700 text-center">
            An OTP has been sent to your email <span className="font-semibold text-red-900">{email}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Only show email input if email was not passed */}
            {!location.state?.email && (
              <div>
                <label className="block text-red-900 font-medium mb-1">Email</label>
                <input
                  type="email"
                  className="w-full p-2 border border-amber-200 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-900"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-red-900 font-medium mb-1">Enter OTP</label>
              <input
                type="text"
                className="w-full p-2 border border-amber-200 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-900"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                placeholder="Enter the 6-digit code"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-900 text-white py-3 rounded-md hover:bg-red-800 transition font-medium"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-gray-700">
              Didn't receive the code?{" "}
              <button type="button" className="text-red-900 hover:underline font-medium" onClick={handleResendOtp}>
                Resend OTP
              </button>
            </p>
          </div>

          {/* 🔙 Back to Login (without credentials) */}
          <div className="mt-4 text-center">
            <button
              type="button"
              className="flex items-center justify-center mx-auto text-red-900 hover:underline font-medium"
              onClick={() => navigate("/login")}
            >
              <FaArrowLeft className="mr-2" /> Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OtpVerification

