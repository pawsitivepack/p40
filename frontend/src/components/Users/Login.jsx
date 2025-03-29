"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { GoogleLogin } from "@react-oauth/google"
import "react-toastify/dist/ReactToastify.css"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import logo from "../../assets/dog.png"
import dogBackground from "../../assets/paw.png"
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router-dom";


export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [birthdate, setBirthdate] = useState("")
  const [userAge, setUserAge] = useState(null)
  const [isOldEnough, setIsOldEnough] = useState(true)
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleBirthdateChange = (e) => {
    const birthdateValue = e.target.value
    setBirthdate(birthdateValue)

    const today = new Date()
    const birthDate = new Date(birthdateValue)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    setUserAge(age)
    setIsOldEnough(age >= 12)
    setFormData({ ...formData, dob: birthdateValue }) // Store dob in formData
  }

  const isPasswordValid = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isOldEnough) {
      toast.error("You must be at least 12 years old to create an account.")
      return
    }

    if (isRegistering && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!")
      return
    }

    if (isRegistering && !isPasswordValid(formData.password)) {
      toast.error(
        "Password must be at least 8 characters long, include uppercase, lowercase, a number, and a special character.",
      )
      return
    }
    const endpoint = isRegistering ? "/signup" : "/login"

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users${endpoint}`, {
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
              },
        ),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
		localStorage.setItem("token", data.token);


        if (isRegistering) {
          // ✅ Redirect to OTP page after signup
          navigate("/verify-otp", { state: { email: formData.email } })
        } else {
          localStorage.setItem("token", data.token)

		  const decoded = jwtDecode(data.token)
          localStorage.setItem("userId", decoded.id)
          window.dispatchEvent(new Event("storage"))

          if (rememberMe) {
            localStorage.setItem("rememberedEmail", formData.email)
          } else {
            localStorage.removeItem("rememberedEmail")
          }

          navigate("/myprofile")
        }
      } else if (response.status === 403 && data.message?.includes("verify") && data.email) {
        toast.info("Please verify your email.")
        navigate("/verify-otp", { state: { email: data.email } })
      } else if (isRegistering && data.message?.includes("already registered") && data.email) {
        // If email is already registered but not verified, backend sends status 400 + email
        toast.info("Account exists but is not verified. Please check your email.")
        navigate("/verify-otp", { state: { email: data.email } })
      } else {
        toast.error(data.message || "Invalid password or email")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Server error. Please try again later.")
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()
      if (response.status === 302) {
        navigate("/google-signup", { state: data.user })
      } else if (response.ok) {
        toast.success("Google Login Successful")
        localStorage.setItem("token", data.token)
        window.dispatchEvent(new Event("storage"))
        navigate("/myprofile")
      } else {
        toast.error(data.message || "Google Login failed")
      }
    } catch (error) {
      console.error("Google Login Error:", error)
      toast.error("Google Login Error. Please try again.")
    }
  }

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail")
    if (rememberedEmail) {
      setFormData((prev) => ({ ...prev, email: rememberedEmail }))
      setRememberMe(true)
    }
  }, [])

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
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
          <h2 className="text-2xl font-bold text-amber-50 mt-2">{isRegistering ? "Create Account" : "Welcome Back"}</h2>
        </div>

        <div className="p-6 bg-white">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-red-900 font-medium mb-1">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Enter first name"
                      className="w-full p-2 border border-amber-200 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-red-900 font-medium mb-1">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Enter last name"
                      className="w-full p-2 border border-amber-200 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-900"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-red-900 font-medium mb-1">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    className="w-full p-2 border border-amber-200 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-red-900 font-medium mb-1">Birthdate</label>
                  <input
                    type="date"
                    value={birthdate}
                    onChange={handleBirthdateChange}
                    className="w-full p-2 border border-amber-200 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-900"
                    required
                  />
                  <p className="text-gray-600 text-sm mt-1">Age: {userAge || "N/A"}</p>
                  {!isOldEnough && (
                    <p className="text-red-600 text-sm mt-1">You must be at least 12 years old to register.</p>
                  )}
                </div>
              </>
            )}

            <div>
              <label className="block text-red-900 font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full p-2 border border-amber-200 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-900"
                required
              />
            </div>

            <div>
              <label className="block text-red-900 font-medium mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full p-2 border border-amber-200 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-900 pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-2 text-red-900"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
              </div>
              {isRegistering && formData.password && !isPasswordValid(formData.password) && (
                <p className="text-sm text-red-600 mt-1">
                  Password must be at least 8 characters, contain uppercase, lowercase, a number, and a special
                  character.
                </p>
              )}
            </div>

            {isRegistering && (
              <div>
                <label className="block text-red-900 font-medium mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    className="w-full p-2 border border-amber-200 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-900 pr-10"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-2 text-red-900"
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    {showConfirmPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            )}

            {!isRegistering && (
			<>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="mr-2 h-4 w-4 text-red-900 focus:ring-red-900 border-amber-200 rounded"
                />
                <label htmlFor="rememberMe" className="text-gray-700">
                  Remember me
                </label>
              </div>

				<div className="text-right mt-1">
					<Link to="/forgot-password" className="text-sm text-red-800 hover:underline">
					Forgot Password?
					</Link>
				</div>
			</>
				)}


            <button
              type="submit"
              className="w-full bg-red-900 text-white py-3 rounded-md hover:bg-red-800 transition font-medium"
            >
              {isRegistering ? "Create Account" : "Login"}
			  
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-red-900 hover:underline font-medium"
            >
              {isRegistering ? "Already have an account? Login" : "Don't have an account? Create one"}
            </button>
          </div>

          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-amber-200"></div>
            <span className="px-3 text-gray-500 text-sm">OR</span>
            <div className="flex-grow border-t border-amber-200"></div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error("Google Login failed")} />
          </div>
        </div>
      </div>
    </div>
  )
}

