import React, { useState, useEffect } from 'react';
import logo from '../assets/underdogs.png';
import dogBackground from '../assets/paw.png'; // Make sure this path is correct

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegistering && formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    alert(`${isRegistering ? 'Creating account for' : 'Logging in with'}: ${formData.email}`);
    if (!isRegistering && rememberMe) {
      localStorage.setItem('rememberedEmail', formData.email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
  };

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setFormData((prev) => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

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
            {isRegistering ? 'Create Account' : 'Login'}
          </h2>

          <form onSubmit={handleSubmit}>
            {isRegistering && (
              <>
                <label className="block text-gray-600 mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  className="w-full p-2 border border-gray-300 rounded-md mb-4"
                  required
                />
                <label className="block text-gray-600 mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  className="w-full p-2 border border-gray-300 rounded-md mb-4"
                  required
                />
                <label className="block text-gray-600 mb-1">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Enter your age"
                  className="w-full p-2 border border-gray-300 rounded-md mb-4"
                  required
                />
                <label className="block text-gray-600 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="w-full p-2 border border-gray-300 rounded-md mb-4"
                  required
                />
              </>
            )}

            <label className="block text-gray-600 mb-1">Username/Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your username or email"
              className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-maroon-600"
              required
            />

            <label className="block text-gray-600 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-maroon-600"
              required
            />

            {isRegistering && (
              <>
                <label className="block text-gray-600 mb-1">Re-enter Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className="w-full p-2 border border-gray-300 rounded-md mb-4"
                  required
                />
              </>
            )}

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

            <button
              type="submit"
              className="w-full bg-gray-700 text-white py-2 rounded-md hover:bg-gray-800 transition"
            >
              {isRegistering ? 'Create Account' : 'Login'}
            </button>
          </form>

          <div className="text-center mt-2">
            <p className="text-sm text-gray-600">
              {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-blue-600 hover:underline"
              >
                {isRegistering ? 'Login' : 'Create an account'}
              </button>
            </p>
            <a
              href="#"
              className="text-blue-600 hover:underline text-sm mt-2 inline-block"
            >
              Forgot Password
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
