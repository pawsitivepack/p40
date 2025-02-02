import { XMarkIcon } from '@heroicons/react/24/solid';
import React, { useEffect, useState } from 'react';
import DogCard from './DogCard';

function Gallery() {
    const [dogs, setDogs] = useState([]);
    const [formVisible, setFormVisible] = useState(false);
    const [newDog, setNewDog] = useState({
        name: '',
        breed: '',
        age: '',
        color: '',
        owner: '',
        adopted: false,
        adoptedDate: '',
    });

    useEffect(() => {
        fetch('http://localhost:5001') 
            .then((response) => response.json())
            .then((data) => setDogs(data))
            .catch((error) => console.error('Error fetching dog data:', error));
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewDog((prevDog) => ({
            ...prevDog,
            [name]: value,
        }));
    };

    const handleAddDog = (e) => {
        e.preventDefault();

        const dogToAdd = {
            ...newDog,
            adopted: false, 
        };

        fetch('http://localhost:5001/dogs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dogToAdd),
        })
        .then((response) => response.json())
        .then((newDogData) => {
            setDogs((prevDogs) => [...prevDogs, newDogData]);
            setNewDog({
                name: '',
                breed: '',
                age: '',
                color: '',
                owner: '',
                adopted: false,
                adoptedDate: '',
            });
            setFormVisible(false);
        })
        .catch((error) => console.error('Error adding dog:', error));
    };

    return (
        <div className="relative min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-center text-red-800 mb-8">Gallery</h1>

            {/* Add Dog Card */}
            <div 
                className={`bg-red-800 text-white p-6 rounded-lg shadow-lg w-64 flex flex-col justify-center items-center mb-6 cursor-pointer hover:bg-red-900 transition-all ${formVisible ? 'blur-sm' : ''}`}
                onClick={() => setFormVisible(true)}
            >
                <h3 className="text-lg font-semibold">Add a New Dog</h3>
                <p className="mt-2 text-center">Click to add a new dog</p>
                <button className="mt-4 bg-white text-blue-500 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all">
                    Add Dog
                </button>
            </div>

            {/* Dog Gallery */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ${formVisible ? 'blur-sm' : ''}`}>
                {dogs.map((dog) => (
                    <DogCard key={dog._id} dog={dog} />
                ))}
            </div>

            {/* Floating Add Dog Form */}
            {formVisible && (
                <div className="fixed bg-white p-8 rounded-lg shadow-lg w-96 z-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-semibold text-gray-800">Add a New Dog</h3>
                        <XMarkIcon 
                            className="h-6 w-6 cursor-pointer text-gray-600 hover:text-gray-800"
                            onClick={() => setFormVisible(false)}
                        />
                    </div>

                    <form onSubmit={handleAddDog}>
                        <div className="relative mb-4">
                            <input
                                autoComplete="off"
                                id="name"
                                name="name"
                                type="text"
                                className="peer placeholder-transparent h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500"
                                placeholder="Dog's Name"
                                value={newDog.name}
                                onChange={handleInputChange}
                                required
                            />
                            <label
                                htmlFor="name"
                                className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
                            >
                                Dog's Name
                            </label>
                        </div>

                        <div className="relative mb-4">
                            <input
                                autoComplete="off"
                                id="breed"
                                name="breed"
                                type="text"
                                className="peer placeholder-transparent h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500"
                                placeholder="Dog's Breed"
                                value={newDog.breed}
                                onChange={handleInputChange}
                                required
                            />
                            <label
                                htmlFor="breed"
                                className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
                            >
                                Dog's Breed
                            </label>
                        </div>

                        <div className="relative mb-4">
                            <input
                                autoComplete="off"
                                id="age"
                                name="age"
                                type="number"
                                className="peer placeholder-transparent h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500"
                                placeholder="Dog's Age"
                                value={newDog.age}
                                onChange={handleInputChange}
                                required
                            />
                            <label
                                htmlFor="age"
                                className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
                            >
                                Dog's Age
                            </label>
                        </div>

                        <div className="relative mb-4">
                            <input
                                autoComplete="off"
                                id="color"
                                name="color"
                                type="text"
                                className="peer placeholder-transparent h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500"
                                placeholder="Dog's Color"
                                value={newDog.color}
                                onChange={handleInputChange}
                                required
                            />
                            <label
                                htmlFor="color"
                                className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
                            >
                                Dog's Color
                            </label>
                        </div>

                        <div className="relative mb-4">
                            <input
                                autoComplete="off"
                                id="owner"
                                name="owner"
                                type="text"
                                className="peer placeholder-transparent h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500"
                                placeholder="Dog's Owner"
                                value={newDog.owner}
                                onChange={handleInputChange}
                                required
                            />
                            <label
                                htmlFor="owner"
                                className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
                            >
                                Dog's Owner
                            </label>
                        </div>

                        <button className="w-full bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600 focus:outline-none">
                            Add Dog
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default Gallery;