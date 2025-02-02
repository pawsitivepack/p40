import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DogCard from './DogCard';
import AddDogForm from './AddDogForm';
import { PlusCircleIcon } from '@heroicons/react/24/solid';

function Gallery() {
    const [dogs, setDogs] = useState([]);
    const [formVisible, setFormVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDogs = async () => {
            try {
                const response = await axios.get('http://localhost:5001/dogs');
                setDogs(response.data);
            } catch (error) {
                setError('Failed to load dog data');
                console.error('Error fetching dogs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDogs();
    }, []);

    return (
        <div className="relative min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-center text-red-800 mb-8">Gallery</h1>

            {loading && <p className="text-center text-gray-600">Loading dogs...</p>}
            {error && <p className="text-center text-red-600">{error}</p>}

            {/* Dog Gallery */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ${formVisible ? 'blur-sm' : ''}`}>
                {/* Add Dog Card */}
                <div
                    className="bg-red-800 text-white p-6 rounded-lg shadow-lg w-full flex flex-col justify-center items-center cursor-pointer hover:bg-red-900 transition-all"
                    onClick={() => setFormVisible(true)}
                >
                    <PlusCircleIcon className="h-12 w-12 text-white mb-2" />
                    <h3 className="text-lg font-semibold">Add a New Dog</h3>
                    <p className="mt-1 text-center text-sm">Click to add a new dog</p>
                    <button className="mt-4 flex items-center bg-white text-red-700 font-semibold px-4 py-2 rounded-lg hover:bg-gray-200 transition-all">
                        <PlusCircleIcon className="h-5 w-5 text-red-700 mr-2" />
                        Add Dog
                    </button>
                </div>

                {/* Display Dog Cards */}
                {dogs.length > 0 ? (
                    dogs.map((dog) => <DogCard key={dog._id} dog={dog} />)
                ) : (
                    !loading && <p className="text-center text-gray-600 col-span-full">No dogs available.</p>
                )}
            </div>

            {/* Floating Add Dog Form */}
            {formVisible && <AddDogForm setFormVisible={setFormVisible} setDogs={setDogs} />}
        </div>
    );
}

export default Gallery;