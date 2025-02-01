import React from 'react';

function DogCard({ dog }) {
  return (
    <div className="bg-white rounded-lg shadow-lg hover:scale-105 transform transition-all cursor-pointer">
      <img src={dog.imageURL} alt={dog.name} className="w-full h-48 object-cover rounded-t-lg" />
      <div className="p-4 text-center">
        <h2 className="text-xl font-semibold text-gray-800">{dog.name}</h2>
        <p className="text-gray-600 mt-2"><strong>Breed:</strong> {dog.breed}</p>
        <p className="text-gray-600"><strong>Age:</strong> {dog.age} years</p>
        <p className="text-gray-600"><strong>Color:</strong> {dog.color}</p>
        <p className="text-gray-600"><strong>Owner:</strong> {dog.owner}</p>
        <p className="text-gray-600"><strong>Adopted:</strong> {dog.adopted ? 'Yes' : 'No'}</p>
        {dog.adopted && <p className="text-gray-600"><strong>Adopted Date:</strong> {dog.adoptedDate}</p>}
      </div>
    </div>
  );
}

export default DogCard;
