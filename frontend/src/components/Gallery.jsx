import React, { useEffect, useState } from 'react';
import DogCard from './DogCard';

function Gallery() {
    const [dogs, setDogs] = useState([]);

        useEffect(() => {
            fetch('http://localhost:5001') 
            .then((response) => response.json())
            .then((data) => setDogs(data))
            .catch((error) => console.error('Error fetching dog data:', error));
        }, []);
    
        return (
            <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-center text-red-800 mb-8">Gallery</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
             {dogs.map((dog) => (
            <DogCard key={dog._id} dog={dog} />
        ))}
      </div>
    </div>
        )
}
export default Gallery;