import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './MyCalendar.css';

const localizer = momentLocalizer(moment);

const MyCalendar = () => {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'Dog Walk',
    dogName: '',
    walkerName: '',
    start: new Date(),
    end: new Date(),
  });

  useEffect(() => {
    const testEvents = [
      {
        id: 1,
        title: '',
        type: '',
        dogName: '',
        walkerName: '',
        start: new Date(2025, 1, 6, 10, 0),
        end: new Date(2025, 1, 6, 11, 0),
      },
    ];
    setEvents(testEvents);
  }, []);

  const handleSelectSlot = ({ start, end }) => {
    setNewEvent({ ...newEvent, start, end });
    setShowForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent({ ...newEvent, [name]: value });
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.start || !newEvent.end) {
      toast.error('Please fill out all fields.');
      return;
    }
    if (newEvent.start >= newEvent.end) {
      toast.error('End time must be after start time.');
      return;
    }
    setEvents([...events, { ...newEvent, id: events.length + 1 }]);
    setShowForm(false);
    setNewEvent({ title: '', type: 'Dog Walk', dogName: '', walkerName: '', start: new Date(), end: new Date() });
    toast.success('Walk scheduled successfully!');
  };

  return (
    <div className="calendar-container">
      <ToastContainer />
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView="month"
        selectable={true}
        onSelectSlot={handleSelectSlot}
        style={{ height: '500px', width: '100%', maxWidth: '800px' }}
      />
      <div className={`event-form ${showForm ? 'active' : ''}`}>
        <h3>Schedule a Walk</h3>
        <form onSubmit={handleAddEvent}>
          <div>
            <label>Event Title: </label>
            <input type="text" name="title" value={newEvent.title} onChange={handleInputChange} required />
          </div>
          <div>
            <label>Event Type: </label>
            <select name="type" value={newEvent.type} onChange={handleInputChange} required>
              <option value="Dog Walk">Dog Walk</option>
              <option value="Adoption Event">Adoption Event</option>
              <option value="Donation Drive">Donation Drive</option>
            </select>
          </div>
          <div>
            <label>Dog Name: </label>
            <input type="text" name="dogName" value={newEvent.dogName} onChange={handleInputChange} required />
          </div>
          <div>
            <label>Walker Name: </label>
            <input type="text" name="walkerName" value={newEvent.walkerName} onChange={handleInputChange} required />
          </div>
          <div>
            <label>Start Time: </label>
            <input
              type="datetime-local"
              name="start"
              value={moment(newEvent.start).format('YYYY-MM-DDTHH:mm')}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>End Time: </label>
            <input
              type="datetime-local"
              name="end"
              value={moment(newEvent.end).format('YYYY-MM-DDTHH:mm')}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <button type="submit">Add Event</button>
            <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MyCalendar;
