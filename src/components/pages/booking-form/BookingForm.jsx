// BookingForm.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { init, send } from '@emailjs/browser';
import TimeSliderModal from '../../buttons/slider/slider';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase'; // Adjust if your firebase.js path is different
import TermsModal from '../../modals/TermsModal';
import CancellationModal from '../../modals/CancellationModal';
import { VscPass } from 'react-icons/vsc';
import { BOOKING_FAQS } from '../../shared/bookingFaqData';

const BookingForm = () => {
  useEffect(() => {
  // Initialize EmailJS once
  init("0fqk3GFHeuZ3SHdGz");
}, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.hash !== '#booking') return;
    const section = document.getElementById('booking');
    if (!section) return;
    window.setTimeout(() => {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
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
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState({ terms: false, cancel: false });

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

  const pushBookingSubmitEvent = (bookingDetails) => {
    if (typeof window === 'undefined') return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'booking_request_submitted',
      bookingDetails,
    });
  };

  useEffect(() => {
    if (formData.duration) {
      const cost = parseDurationToHours(formData.duration) * 2000;
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
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp(),
      });

      // Send to EmailJS (to DJ)
      await send('service_qekby5l', 'template_b27p846', templateParams);

      const bookingEventData = {
        eventType: formData.event || 'unspecified',
        eventDate: formatDate(formData.eventDate),
        startTime: formData.startTime,
        duration: formData.duration,
        location: formData.location || 'unspecified',
      };
      pushBookingSubmitEvent(bookingEventData);

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
      setTermsAccepted({ terms: false, cancel: false });

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
    setTermsAccepted({ terms: false, cancel: false });
  };

  let selectedDateTimeString = '';
  if (formData.eventDate && formData.startTime && formData.duration) {
    const endTime = addHoursToTime(formData.startTime, parseDurationToHours(formData.duration));
    selectedDateTimeString = `${formatDate(formData.eventDate)} @ ${formData.startTime} – ${endTime} (${formData.duration})`;
  }

  return (
    <section id="booking" className="reveal-scope">
      <h2 data-reveal data-reveal-order="1">BOOK DJ PHEE</h2>

      <p className="booking-subheading" data-reveal data-reveal-order="2">
        Use the form below to check availability, estimate pricing, and share the details of your event for a quick and personal response.
      </p>
      <p className="booking-lead" data-reveal data-reveal-order="3">
        Book DJ Phee for your next event in Cape Town: corporate functions, year-end parties, weddings, private celebrations, club nights, and festivals. Known for his high-energy Afro tech sound and versatile DJ style, Phee tailors every set to the crowd, venue, and occasion.
      </p>
      <p className="booking-lead" data-reveal data-reveal-order="4">
        If you’re looking to hire a DJ in Cape Town who knows how to read the room and deliver the right energy at the right time, complete the form below to request availability and receive a tailored quote.
      </p>

      {formSubmitted ? (
        <div className="confirmation-section" data-reveal data-reveal-order="5">
          <div className="confirmation-message">
            <VscPass style={{ color: '#d6d6d6ff', verticalAlign: 'middle', marginRight: '8px', fontSize: '1.5rem' }} />
            {confirmationMessage}
          </div>
          <button onClick={handleNewBookingClick} className="new-booking-button cta-button">
            New Booking Form
          </button>
        </div>
      ) : (
        <form id="booking-form" onSubmit={handleSubmit} data-reveal data-reveal-order="5">
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

      <div className="terms-consent" data-reveal data-reveal-order="3">
        <p className="terms-intro">I agree to the:</p>
        <label htmlFor="terms-checkbox" className="terms-checkbox">
          <input
            id="terms-checkbox"
            type="checkbox"
            checked={termsAccepted.terms}
            onChange={(e) => setTermsAccepted((prev) => ({ ...prev, terms: e.target.checked }))}
            required
          />
          <button type="button" className="inline-link" onClick={() => setShowTermsModal(true)}>
            Terms & Conditions
          </button>
        </label>
        <label htmlFor="cancel-checkbox" className="terms-checkbox">
          <input
            id="cancel-checkbox"
            type="checkbox"
            checked={termsAccepted.cancel}
            onChange={(e) => setTermsAccepted((prev) => ({ ...prev, cancel: e.target.checked }))}
            required
          />
          <button type="button" className="inline-link" onClick={() => setShowCancelModal(true)}>
            Cancellation Policy
          </button>
        </label>
      </div>

      <button
        type="submit"
        disabled={
          !formData.eventDate ||
          !formData.startTime ||
          !formData.duration ||
          !termsAccepted.terms ||
          !termsAccepted.cancel ||
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

      {showTermsModal && <TermsModal onClose={() => setShowTermsModal(false)} />}
      {showCancelModal && <CancellationModal onClose={() => setShowCancelModal(false)} />}

      <section className="booking-faq" aria-labelledby="booking-faq-heading">
        <p className="booking-faq-kicker">Need help before submitting?</p>
        <h3 id="booking-faq-heading">PHEE's Booking FAQs</h3>
        <div className="booking-faq-list">
          {BOOKING_FAQS.map((item, index) => (
            <details key={item.question} className="booking-faq-item" open={index === 0}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="booking-content-block">
        <h2>Book an Afrotech DJ in Cape Town</h2>
        <p>
          DJ PHEE specialises in Afrotech, Electronic and House, high-energy genres rooted in African identity and built for dance floors. Whether you need deep grooves for a cocktail hour or peak-time Afrotech for a club set, PHEE reads the room and adapts the mix to your crowd.
        </p>
      </section>

      <section className="booking-content-block">
        <h2>DJ Services Across Cape Town &amp; the Western Cape</h2>
        <p>
          DJ PHEE is based in Cape Town and available for bookings across the Western Cape, including Stellenbosch, Franschhoek, Paarl, Hermanus and the Cape Winelands. Travel to other South African cities and international destinations is available by arrangement.
        </p>
      </section>

      <section className="booking-packages">
        <h2 className="booking-packages__heading">Event Packages</h2>
        <p className="booking-packages__intro">
          Whether you need a DJ for a few hours or a full-day event, PHEE offers flexible bookings tailored to your occasion. All packages are quoted based on duration, venue and requirements. Rates start from R2,000 per hour.
        </p>
        <div className="booking-packages__grid">
          <div className="booking-packages__card">
            <h3>Wedding</h3>
            <ul>
              <li>Ceremony, cocktail hour and reception</li>
              <li>Pre-event consultation included</li>
              <li>First dance and special request handling</li>
              <li>Afrotech, Afro House, Deep House and Top 40</li>
              <li>Professional equipment provided</li>
            </ul>
            <a href="/wedding-dj-cape-town" className="booking-packages__link">Learn more about wedding DJ</a>
          </div>
          <div className="booking-packages__card">
            <h3>Corporate</h3>
            <ul>
              <li>Year-end functions, brand launches and activations</li>
              <li>Music policy briefing and clean edits as standard</li>
              <li>Formal-to-floor energy management</li>
              <li>In-house or provided equipment</li>
              <li>Punctual setup, no management required on the night</li>
            </ul>
            <a href="/corporate-dj-cape-town" className="booking-packages__link">Learn more about corporate DJ</a>
          </div>
          <div className="booking-packages__card">
            <h3>Private Party</h3>
            <ul>
              <li>Birthdays, celebrations and intimate functions</li>
              <li>Custom genre requests and playlist guidance</li>
              <li>Flexible duration from 2 hours</li>
              <li>Available across Cape Town and the Western Cape</li>
              <li>Fully tailored to the guest list</li>
            </ul>
            <a href="/booking#booking" className="booking-packages__link">Get a quote</a>
          </div>
        </div>
      </section>
    </section>
  );
};

export default BookingForm;
