// src/App.jsx
import React, { useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import About from './components/About';
import Footer from './components/Footer';
import Gallery from './components/Gallery';
import Home from './components/Home';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Donate from './components/Donate';

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
    <div className="bg-red-950 text-gray-100 min-h-screen flex flex-col">
      {/* Navbar */}
      <Navbar />
      {/* Main Content - Takes Remaining Space */}
      <main className="flex-grow">
        <Router>
          <Routes>
            <Route path='/home' element={<Home />} />
            <Route path='/' element={<Home />} />
            <Route path='/about' element={<About />} />
            <Route path='/gallery' element={<Gallery />} />
            <Route path='/login' element={<Login />} />
            <Route path='/donate' element={<Donate />} />
          </Routes>
        </Router>
      </main>

      {/* Footer Sticks to Bottom */}
      <Footer />
    </div>
  
  );
}

export default App;