// BookingForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import { init, send } from '@emailjs/browser';
import '../../buttons/datepicker/datepicker.css';
import './BookingForm.css';
import SocialLinks from '../../buttons/social-links/social-links';
import Crumbs from '../../buttons/crumbs/crumbs'; // you can remove if unused
import TimeSliderModal from '../../buttons/slider/slider';
import '../../buttons/slider/slider.css'; // import your slider styles here
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../../firebase'; // Adjust if your firebase.js path is different
import Footer from '../../buttons/footer/footer'; // Import the Footer component


const BookingForm = () => {
  useEffect(() => {
    init("0fqk3GFHeuZ3SHdGz");
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    event: '',
    location: '',
    details: '',
    eventDate: null,
    startTime: '',
    duration: '',
  });

  // Remove old states related to startTime/duration UI
  // Keep dateConfirmed & hasConfirmedOnce for form submission control
  const [dateConfirmed, setDateConfirmed] = useState(false);
  const [hasConfirmedOnce, setHasConfirmedOnce] = useState(false);

  const [costEstimate, setCostEstimate] = useState('Estimated Cost: R0');
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  // New state to toggle slider modal
  const [showSliderModal, setShowSliderModal] = useState(false);

  // Helper to parse duration string to hours (e.g. "1hr 30min")
  const parseDurationToHours = (duration) => {
    let totalHours = 0;
    const hrMatch = duration.match(/(\d+)hr/);
    if (hrMatch) totalHours += parseInt(hrMatch[1], 10);
    if (duration.includes('30min') || duration.includes('30m')) totalHours += 0.5;
    return totalHours;
  };

  // Helper to add hours (including fractions) to HH:mm time string
  const addHoursToTime = (timeStr, hoursToAdd) => {
    let [hour, minute] = timeStr.split(':').map(Number);
    let totalMinutes = hour * 60 + minute + hoursToAdd * 60;
    totalMinutes = totalMinutes % (24 * 60);
    const newHour = Math.floor(totalMinutes / 60);
    const newMinute = totalMinutes % 60;
    return `${newHour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`;
  };

  // Format date like "5 August 2025"
  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Update cost estimate anytime duration changes
  useEffect(() => {
    if (formData.duration) {
      const cost = parseDurationToHours(formData.duration) * 1000;
      setCostEstimate(`Estimated Cost: R${cost}`);
    } else {
      setCostEstimate('Estimated Cost: R0');
    }
  }, [formData.duration]);

  // Handle input changes for form fields
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  // Handle form submission with EmailJS
  const handleSubmit = async (e) => {
  e.preventDefault();

  // ⛔ Check for required fields
  if (!formData.eventDate || !formData.startTime || !formData.duration) {
    setConfirmationMessage('❌ Please select date, time and duration before submitting.');
    return;
  }

  try {
    const durationHours = parseDurationToHours(formData.duration);
    const endTime = addHoursToTime(formData.startTime, durationHours);
    const token = Math.random().toString(36).substring(2, 12);

    // Calendar URL generation
const pad = (n) => n.toString().padStart(2, '0');

const toISODateTime = (dateObj, timeStr) => {
  const [hour, minute] = timeStr.split(':').map(Number);
  const year = dateObj.getFullYear();
  const month = pad(dateObj.getMonth() + 1);
  const day = pad(dateObj.getDate());
  return `${year}${month}${day}T${pad(hour)}${pad(minute)}00`;
};

const startISO = toISODateTime(formData.eventDate, formData.startTime);
const endISO = toISODateTime(formData.eventDate, endTime);

const eventTitle = `DJ Phee at ${formData.event}`;
const eventDescription = `Booking request: ${formData.details || 'No additional details'}`;
const location = formData.location;

const calendar_url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startISO}%2F${endISO}&details=${encodeURIComponent(eventDescription)}&location=${encodeURIComponent(location)}`;

    const templateParams = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      event: formData.event,
      location: formData.location,
      details: formData.details,
      event_date: formatDate(formData.eventDate),
      start_time: formData.startTime,
      end_time: endTime,
      duration: formData.duration,
      token: token,
      calendar_url,
    };

    // 🔥 Save booking to Firestore
    await addDoc(collection(db, 'bookings'), {
      ...templateParams,
      timestamp: new Date(),
    });

    // 📧 Send to EmailJS (to DJ)
    await send('service_qekby5l', 'template_b27p846', templateParams);

    // ✅ Success state
    setConfirmationMessage('✅ Booking request received by PHEE. PHEE will get back to you via email promptly');
    setFormSubmitted(true);
    setFormData({
      name: '', email: '', phone: '', event: '', location: '',
      details: '', eventDate: null, startTime: '', duration: ''
    });
    setDateConfirmed(false);
    setHasConfirmedOnce(false);
    setCostEstimate('Estimated Cost: R0');

  } catch (error) {
    console.error('Booking Error:', error);
    setConfirmationMessage('❌ Booking failed. Please try again.');
  }
};


  const handleNewBookingClick = () => {
    setFormSubmitted(false);
    setConfirmationMessage('');
  };

  // Format the date/time summary string
  let selectedDateTimeString = '';
  if (formData.eventDate && formData.startTime && formData.duration) {
    const endTime = addHoursToTime(formData.startTime, parseDurationToHours(formData.duration));
    selectedDateTimeString = `${formatDate(formData.eventDate)} @ ${formData.startTime} – ${endTime} (${formData.duration})`;
  }

  return (
    <section id="booking">
      <h2>BOOK DJ PHEE</h2>

      {formSubmitted ? (
        <div className="confirmation-section">
          <div className="confirmation-message">{confirmationMessage}</div>
          <button onClick={handleNewBookingClick} className="new-booking-button cta-button">
            New Booking Form
          </button>
        </div>
      ) : (
        <form id="booking-form" onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="Your Name" value={formData.name} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Your Email" value={formData.email} onChange={handleChange} required />
          <input type="tel" name="phone" placeholder="Your Phone Number (optional)" value={formData.phone} onChange={handleChange} />
          <input type="text" name="event" placeholder="Event Type (e.g. Wedding, Club)" value={formData.event} onChange={handleChange} />

          <label className="clickable-label" onClick={() => setShowSliderModal(true)}>Select Event Date</label>
          <input
            type="text"
            readOnly
            value={formData.eventDate ? formatDate(formData.eventDate) : ''}
            placeholder="Click to select a date"
            onClick={() => setShowSliderModal(true)}
            className="read-only-input"
            required
          />

          {selectedDateTimeString && (
            <p className="event-summary clickable-summary" onClick={() => setShowSliderModal(true)}>
              {selectedDateTimeString}
            </p>
          )}

          <p id="cost-estimate">{costEstimate}</p>

          <input type="text" name="location" placeholder="Event Location" value={formData.location} onChange={handleChange} required />
          <textarea name="details" placeholder="Tell us about your event..." rows="5" value={formData.details} onChange={handleChange}></textarea>

          <button type="submit" disabled={!formData.eventDate || !formData.startTime || !formData.duration}>Submit Booking Request</button>
        </form>
      )}

      {/* Show slider modal only when triggered */}
      {showSliderModal && (
        <TimeSliderModal
          selectedDate={formData.eventDate || new Date()}
          initialStartTime={formData.startTime || '19:00'}
          initialDuration={formData.duration || '1hr'}
          onCancel={() => setShowSliderModal(false)}
          onConfirm={({ date, startTime, duration }) => {
            setFormData(prev => ({
              ...prev,
              eventDate: date,
              startTime,
              duration,
            }));
            setDateConfirmed(true);
            setHasConfirmedOnce(true);
            setShowSliderModal(false);
          }}
        />
      )}

      <Footer />
    </section>
  );
};

export default BookingForm;
