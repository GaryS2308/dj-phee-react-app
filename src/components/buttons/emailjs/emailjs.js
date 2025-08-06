// src/components/buttons/emailjs/emailjs.js
import { send } from '@emailjs/browser';
import { db } from '../../../firebase'; // adjust as needed src/firebase.js
import { collection, query, where, getDocs } from 'firebase/firestore';

export const sendResponseEmail = async (token, type) => {
  if (type !== 'accept') {
    throw new Error('Only accept responses are supported at this time.');
  }

  // 🔍 Find the booking by token
  const q = query(collection(db, 'bookings'), where('token', '==', token));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error('Booking not found for this token.');
  }

  const booking = snapshot.docs[0].data();

  // 🧮 Calculate amount
  const rate_per_hour = 1000;
  const parseDurationToHours = (duration) => {
    let totalHours = 0;
    const hrMatch = duration.match(/(\d+)hr/);
    if (hrMatch) totalHours += parseInt(hrMatch[1], 10);
    if (duration.includes('30min')) totalHours += 0.5;
    return totalHours || 1;
  };

  const total_amount = parseDurationToHours(booking.duration) * rate_per_hour;

  const templateParams = {
      name: booking.name,
      email: booking.email,
      event_date: booking.event_date,
      start_time: booking.start_time,
      end_time: booking.end_time,
      duration: booking.duration,
      event: booking.event,
      location: booking.location,
      rate_per_hour: 1000,
      total_amount: parseDurationToHours(booking.duration) * 1000,
  };

  // 📧 Send confirmation email to client
  return send('service_qekby5l', 'template_kedes7q', templateParams);
};
