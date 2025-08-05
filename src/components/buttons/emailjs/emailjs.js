// src/components/buttons/emailjs/emailjs.js
import { init, send } from '@emailjs/browser';

// ✅ EmailJS Public Key
init("0fqk3GFHeuZ3SHdGz");

// ✅ TEMPORARY: Test data mapped to token
const mockBookings = {
  abcd1234: {
    name: 'Lebo Mo',
    email: 'lebo@example.com',
    event: 'Wedding',
    location: 'Cape Town',
    event_date: '5 August 2025',
    start_time: '18:00',
    end_time: '21:00',
    duration: '3hr',
    rate_per_hour: '1000',
    total_amount: '3000'
  }
};

// ✅ Function to send CONFIRMATION email to client
export const sendResponseEmail = async (token, type) => {
  if (type !== 'accept') {
    throw new Error('Only accept responses are supported at this time.');
  }

  const booking = mockBookings[token];

  if (!booking) {
    throw new Error('No booking found for this token.');
  }

  return send('service_qekby5l', 'template_kedes7q', booking); // To client with invoice
};
