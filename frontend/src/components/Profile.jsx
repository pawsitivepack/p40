import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      alert("You are not logged in! Redirecting to login...");
      navigate("/login");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold">User Profile</h2>
      {user ? (
        <div>
          <p className="text-gray-700">Name: {user.name}</p>
          <p className="text-gray-700">Email: {user.email}</p>

          {/* Edit Profile Button */}
          <button
            onClick={() => alert("Edit Profile Feature Coming Soon!")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
