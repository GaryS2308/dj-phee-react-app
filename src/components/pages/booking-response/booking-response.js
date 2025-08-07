// src/pages/BookingResponse.jsx
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { sendResponseEmail } from '../../buttons/emailjs/emailjs';

const BookingResponse = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('pending');

  const handleClick = (type) => {
    console.log("📦 handleClick called with type:", type); 
    setStatus('sending');

    sendResponseEmail(token, type)
      .then(() => {
        setStatus('accepted');
      })
      .catch(() => {
        setStatus('error');
      });
  };

  return (
    <section style={{ padding: '60px', textAlign: 'center', background: '#000', color: '#fff' }}>
      <h2>Booking Response</h2>

      {status === 'pending' && (
        <>
          <p>Would you like to accept this booking?</p>
          <button onClick={() => handleClick('accept')} style={{ margin: '10px' }}>✅ Accept Booking</button>
        </>
      )}

      {status === 'sending' && <p>Sending confirmation to the client...</p>}
      {status === 'accepted' && <p>✅ Booking accepted! The client has been notified with the invoice.</p>}
      {status === 'error' && <p>❌ Something went wrong. Please try again.</p>}
    </section>
  );
};

export default BookingResponse;
