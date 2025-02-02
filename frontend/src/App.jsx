// src/App.jsx
import React, { useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import About from './components/About';
import Footer from './components/Footer';
import Gallery from './components/Gallery';
import Home from './components/Home';
import Login from './components/Login';
import Navbar from './components/Navbar';

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
    <div className="bg-red-950 text-gray-100 min-h-screen py-10 flex flex-col">
      <Navbar />
     <main className='flex-grow'>
      <Router>
        <Routes>
          {/* Route for Dogs component */}
          <Route path='/home' element={<Home />} />
          <Route path='/' element={<Home />} />
          <Route path='/about' element={<About />} />
          <Route path='/gallery' element={<Gallery />} />
          <Route path='/login' element={<Login />} />
        </Routes>
      </Router>
      </main>
     <div> <Footer/> </div>
      </div>
  );
}

export default App;