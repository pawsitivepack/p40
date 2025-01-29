// src/App.jsx
import React, { useState, useEffect } from 'react';

import DogCard from './components/DogCard';

function App() {
  const [dogs, setDogs] = useState([]); // Store dog data

  // Fetch dog data from backend when the component mounts
  useEffect(() => {
    fetch('http://localhost:5001') // Replace with your backend API
      .then((response) => response.json())
      .then((data) => setDogs(data)) // Store dog data in state
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen py-10">
      <h1 className="text-4xl font-bold text-center text-yellow-500 mb-10">Dogs List</h1>

      {/* Display dogs in a responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
        {dogs.map((dog) => (
          <DogCard key={dog._id} dog={dog} /> // Render DogCard component for each dog
        ))}
      </div>
    </div>
  );
}

export default App;
