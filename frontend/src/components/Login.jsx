import React, { useState } from 'react';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isRegistering && parseInt(formData.age) < 12) {
      alert('You must be at least 12 years old to create an account.');
      return;
    }

    const endpoint = isRegistering ? '/register' : '/login';

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      alert(result.message);
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-red-950 p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {isRegistering ? 'Create Account' : 'Login'}
        </h2>

        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full p-2 mb-2 border rounded"
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full p-2 mb-2 border rounded"
                required
              />
              <input
                type="number"
                name="age"
                placeholder="Age (12 or older)"
                value={formData.age}
                onChange={handleChange}
                className="w-full p-2 mb-2 border rounded"
                required
                min="13"
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-2 mb-2 border rounded"
                required
              />
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 mb-2 border rounded"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 mb-2 border rounded"
            required
          />

          {isRegistering && (
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-2 mb-2 border rounded"
              required
            />
          )}

          <button
            type="submit"
            className="w-full bg-yellow-500 text-black py-2 rounded hover:bg-blue-600"
          >
            {isRegistering ? 'Create Account' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-center">
          {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            className="text-blue-500 hover:underline"
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering ? 'Login' : 'Create Account'}
          </button>
        </p>
      </div>
    </div>
  );
}
