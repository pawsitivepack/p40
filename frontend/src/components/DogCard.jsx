import React, { useState, useRef, useEffect } from 'react';

function DogCard({ dog, onDelete, onUpdate }) {
  const [showMenu, setShowMenu] = useState(false);
  const cardRef = useRef(null); // Reference to the entire card
  const menuRef = useRef(null); // Reference to the menu

  // This function toggles the menu visibility when the three dots are clicked
  const toggleMenu = () => {
    setShowMenu((prev) => !prev); // Toggle the menu
  };

  // This function will handle clicks outside the card or menu
  const handleClickOutside = (e) => {
    // If the click is outside the card or the menu, close the menu
    if (
      cardRef.current && !cardRef.current.contains(e.target) && // Clicked outside the card
      menuRef.current && !menuRef.current.contains(e.target) // Clicked outside the menu
    ) {
      setShowMenu(false); // Close the menu
    }
  };

  // Add event listener when the component mounts
  useEffect(() => {
    // Listen for clicks outside
    document.addEventListener('click', handleClickOutside);
    
    // Cleanup the listener when component unmounts
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={cardRef} // Attach the ref to the card
      className="bg-white rounded-lg shadow-lg hover:scale-105 transform transition-all cursor-pointer relative"
    >
      <img
        src={dog.imageURL}
        alt={dog.name}
        className="w-full h-48 object-cover rounded-t-lg"
      />

      {/* Three vertical dots */}
      <div
        className="absolute top-4 right-4 cursor-pointer"
        onClick={toggleMenu} // Toggle the menu on click
      >
        <div className="h-2 w-2 bg-gray-800 rounded-full mb-1"></div>
        <div className="h-2 w-2 bg-gray-800 rounded-full mb-1"></div>
        <div className="h-2 w-2 bg-gray-800 rounded-full"></div>
      </div>

      {/* Dropdown menu */}
      {showMenu && (
        <div
          ref={menuRef} // Attach the ref to the menu
          className="absolute top-12 right-4 bg-white shadow-lg rounded-lg w-36 p-2 z-10"
        >
          <button
            onClick={() => {
              onUpdate(dog); // Update the dog
              setShowMenu(false); // Close the menu after update
            }}
            className="w-full text-left text-gray-700 hover:bg-gray-200 py-1 px-2 rounded"
          >
            Update
          </button>
          <button
            onClick={() => {
              onDelete(dog._id); // Delete the dog
              setShowMenu(false); // Close the menu after delete
            }}
            className="w-full text-left text-red-500 hover:bg-gray-200 py-1 px-2 rounded"
          >
            Delete
          </button>
        </div>
      )}

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