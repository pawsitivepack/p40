// src/App.jsx
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Home from './components/Home';
import About from './components/About';
import Gallery from './components/Gallery';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  const [dogs, setDogs] = useState([]); 
  const [isLoggedIn, setIsLoggedIn] = useState(false); 

  
  useEffect(() => {
    if (isLoggedIn) {
      fetch('http://localhost:5001') 
        .then((response) => response.json())
        .then((data) => setDogs(data))
        .catch((error) => console.error('Error fetching data:', error));
    }
  }, [isLoggedIn]);

  return (
    <div className="bg-red-950 text-gray-100 min-h-screen py-10">
      <Navbar />
      <Router>
        <Routes>
          {/* Route for Dogs component */}
          <Route path='/home' element={<Home />} />
          <Route path='/about' element={<About />} />
          <Route path='/gallery' element={<Gallery />} />
          <Route path='/login' element={<Login />} />
        </Routes>
      </Router>
      </div>
  );
}

export default App;