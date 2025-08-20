// BookingForm.jsx
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { init, send } from '@emailjs/browser';
import '../../buttons/datepicker/datepicker.css';
import './BookingForm.css';
import SocialLinks from '../../buttons/social-links/social-links';
import Crumbs from '../../buttons/crumbs/crumbs'; // you can remove if unused
import TimeSliderModal from '../../buttons/slider/slider';
import '../../buttons/slider/slider.css'; // import your slider styles here
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase'; // Adjust if your firebase.js path is different
import Footer from '../../buttons/footer/footer'; // Import the Footer component
import { VscPass } from 'react-icons/vsc';
import { Helmet } from 'react-helmet-async';


const BookingForm = () => {
  useEffect(() => {
  // Initialize EmailJS once
  init("0fqk3GFHeuZ3SHdGz");
}, []);

useEffect(() => {
  const fetchBookings = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'bookings'));
      const ranges = snapshot.docs.map(doc => {
        const data = doc.data();
        const dateParts = data.event_date?.split(' ');
        if (!dateParts || dateParts.length < 3) return null;

        const day = parseInt(dateParts[0]);
        const month = new Date(`${dateParts[1]} 1, 2000`).getMonth();
        const year = parseInt(dateParts[2]);

        const startTimeParts = data.start_time?.split(':');
        const endTimeParts = data.end_time?.split(':');
        if (!startTimeParts || !endTimeParts) return null;

        const start = new Date(year, month, day, startTimeParts[0], startTimeParts[1]);
        const end = new Date(year, month, day, endTimeParts[0], endTimeParts[1]);

        return { start, end };
      }).filter(Boolean);

      setBookedRanges(ranges);
    } catch (err) {
      console.error('❌ Failed to fetch bookings from Firebase:', err);
    }
  };

  fetchBookings();
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

  // Submission states
  const [dateConfirmed, setDateConfirmed] = useState(false);
  const [hasConfirmedOnce, setHasConfirmedOnce] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // <-- added isSubmitting

  const [costEstimate, setCostEstimate] = useState('Estimated Cost: R0');
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [showSliderModal, setShowSliderModal] = useState(false);


  const parseDurationToHours = (duration) => {
    let totalHours = 0;
    const hrMatch = duration.match(/(\d+)hr/);
    if (hrMatch) totalHours += parseInt(hrMatch[1], 10);
    if (duration.includes('30min') || duration.includes('30m')) totalHours += 0.5;
    return totalHours;
  };

  const addHoursToTime = (timeStr, hoursToAdd) => {
    let [hour, minute] = timeStr.split(':').map(Number);
    let totalMinutes = hour * 60 + minute + hoursToAdd * 60;
    totalMinutes = totalMinutes % (24 * 60);
    const newHour = Math.floor(totalMinutes / 60);
    const newMinute = totalMinutes % 60;
    return `${newHour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`;
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  useEffect(() => {
    if (formData.duration) {
      const cost = parseDurationToHours(formData.duration) * 1000;
      setCostEstimate(`Estimated Cost: R${cost}`);
    } else {
      setCostEstimate('Estimated Cost: R0');
    }
  }, [formData.duration]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return; // <-- prevent multiple clicks

    if (!formData.eventDate || !formData.startTime || !formData.duration) {
      setConfirmationMessage(' Please select date, time and duration before submitting.');
      return;
    }

    try {
      setIsSubmitting(true); // lock form immediately on submit start

      const durationHours = parseDurationToHours(formData.duration);
      const endTime = addHoursToTime(formData.startTime, durationHours);
      const token = Math.random().toString(36).substring(2, 12);

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

      // Save booking to Firestore
      await addDoc(collection(db, 'bookings'), {
        ...templateParams,
        timestamp: new Date(),
      });

      // Send to EmailJS (to DJ)
      await send('service_qekby5l', 'template_b27p846', templateParams);

      // Success
      setConfirmationMessage('Booking request received. PHEE will get back to you via email promptly');
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
      setConfirmationMessage('Booking failed. Please try again.');
    } finally {
      setIsSubmitting(false); // unlock form after submission (success or fail)
    }
  };

  const handleNewBookingClick = () => {
    setFormSubmitted(false);
    setIsSubmitting(false);
    setConfirmationMessage('');
  };

  let selectedDateTimeString = '';
  if (formData.eventDate && formData.startTime && formData.duration) {
    const endTime = addHoursToTime(formData.startTime, parseDurationToHours(formData.duration));
    selectedDateTimeString = `${formatDate(formData.eventDate)} @ ${formData.startTime} – ${endTime} (${formData.duration})`;
  }

  return (
    <section id="booking">
      <Helmet>
        <title>Book DJ Phee — Professional DJ Booking</title>
        <meta
          name="description"
          content="Book DJ Phee for your event — weddings, clubs, festivals, and private parties. Use the form to select date, time, and details to get started."
        />
      </Helmet>

      <h2>BOOK DJ PHEE</h2>

      {formSubmitted ? (
        <div className="confirmation-section">
          <div className="confirmation-message">
            <VscPass style={{ color: '#d6d6d6ff', verticalAlign: 'middle', marginRight: '8px', fontSize: '1.5rem' }} />
            {confirmationMessage}
          </div>
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

          <button
            type="submit"
            disabled={
              !formData.eventDate ||
              !formData.startTime ||
              !formData.duration ||
              isSubmitting ||   // disable while submitting
              formSubmitted     // disable after success until reset
            }
          >
            {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
          </button>
        </form>
      )}

      {showSliderModal && (
        <TimeSliderModal
          selectedDate={formData.eventDate || new Date()}
          initialStartTime={formData.startTime || '19:00'}
          initialDuration={formData.duration || '1hr'}
          bookedRanges={bookedRanges} 
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
