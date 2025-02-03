import React, { useState } from 'react';
import axios from 'axios';
import { XMarkIcon } from '@heroicons/react/24/solid';

const EditDog = ({ setFormVisible, setDogs }) => {
    const [newDog, setNewDog] = useState({
        name: '',
        breed: '',
        age: '',
        color: '',
        owner: '',
        adopted: false,
        adoptedDate: '',
        imageURL: '', // New field for image link
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewDog((prevDog) => ({
            ...prevDog,
            [name]: value,
        }));
    };

    const handleAddDog = async (e) => {
        e.preventDefault();

        if (!newDog.imageURL.startsWith('http')) {
            alert('Please enter a valid image URL');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5001/dogs', newDog);

            setDogs((prevDogs) => [...prevDogs, response.data]); // Add new dog to state
            setNewDog({
                name: '',
                breed: '',
                age: '',
                color: '',
                owner: '',
                adopted: false,
                adoptedDate: '',
                imageURL: '',
            });
            setFormVisible(false);
        } catch (error) {
            console.error('Error adding dog:', error.response ? error.response.data : error.message);
        }
    };

    return (
        <div className="fixed bg-white p-8 rounded-lg shadow-lg w-96 z-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-semibold text-gray-800">Add a New Dog</h3>
                <XMarkIcon 
                    className="h-6 w-6 cursor-pointer text-gray-600 hover:text-gray-800"
                    onClick={() => setFormVisible(false)}
                />
            </div>

            <form onSubmit={handleAddDog}>
                {['name', 'breed', 'age', 'color', 'owner', 'imageURL'].map((field) => (
                    <div className="relative mb-4" key={field}>
                        <input
                            autoComplete="off"
                            id={field}
                            name={field}
                            type={field === 'age' ? 'number' : 'text'}
                            className="peer placeholder-transparent h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500"
                            placeholder={`Dog's ${field.charAt(0).toUpperCase() + field.slice(1)}`}
                            value={newDog[field]}
                            onChange={handleInputChange}
                            required
                        />
                        <label
                            htmlFor={field}
                            className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
                        >
                            Dog's {field.charAt(0).toUpperCase() + field.slice(1)}
                        </label>
                    </div>
                ))}

                <button className="w-full bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600 focus:outline-none">
                    Add Dog
                </button>
            </form>
        </div>
    );
};

export default EditDog;