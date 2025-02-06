import React from 'react';
import MyCalendar from './MyCalendar'; // Import the reusable calendar component

const Walkdogs = () => {
  return (
    <div>
      <h1 style={{ textAlign: 'center', margin: '20px 0' }}>Dog Walking Events</h1>
      <MyCalendar /> {/* Render the calendar */}
    </div>
  );
};

export default Walkdogs;
