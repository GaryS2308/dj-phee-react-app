// src/components/buttons/emailjs/emailjs.js
import { send } from '@emailjs/browser';
import { db } from '../../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export const sendResponseEmail = async (token, type) => {
  console.log("📨 sendResponseEmail called with token:", token, "type:", type);

  if (type !== 'accept') {
    console.error("❌ Unsupported type:", type);
    throw new Error('Only accept responses are supported at this time.');
  }

  console.log("🔍 Querying Firestore for token...");
  const q = query(collection(db, 'bookings'), where('token', '==', token));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    console.error("❌ No booking found for token:", token);
    throw new Error('Booking not found for this token.');
  }

  const booking = snapshot.docs[0].data();
  console.log("✅ Booking found:", booking);

  const rate_per_hour = 1000;
  const parseDurationToHours = (duration) => {
    let totalHours = 0;
    const hrMatch = duration.match(/(\d+)hr/);
    if (hrMatch) totalHours += parseInt(hrMatch[1], 10);
    if (duration.includes('30min')) totalHours += 0.5;
    return totalHours || 1;
  };

  const total_amount = parseDurationToHours(booking.duration) * rate_per_hour;

  // Convert "13 August 2025" + "19:00" into ISO UTC format for Google Calendar
  const parseToISO = (dateStr, timeStr) => {
    const [day, monthName, year] = dateStr.split(' ');
    const months = {
      January: '01', February: '02', March: '03', April: '04',
      May: '05', June: '06', July: '07', August: '08',
      September: '09', October: '10', November: '11', December: '12'
    };
    const month = months[monthName];
    const [hour, minute] = timeStr.split(':');
    return `${year}${month}${day.padStart(2, '0')}T${hour}${minute}00Z`;
  };

  const startISO = parseToISO(booking.event_date, booking.start_time);
  const endISO = parseToISO(booking.event_date, booking.end_time);

  const calendar_url = `https://www.google.com/calendar/render?action=TEMPLATE&text=DJ+Phee+at+${encodeURIComponent(booking.event)}&dates=${startISO}/${endISO}&details=${encodeURIComponent('Booking confirmed: ' + booking.details)}&location=${encodeURIComponent(booking.location)}`;

  const templateParams = {
    name: booking.name,
    to_email: booking.email,
    event_date: booking.event_date,
    start_time: booking.start_time,
    end_time: booking.end_time,
    duration: booking.duration,
    event: booking.event,
    location: booking.location,
    rate_per_hour,
    total_amount,
    calendar_url, // 👈 This is the new value for your EmailJS template
  };

  console.log("📤 Sending email with params:", templateParams);

  return send('service_qekby5l', 'template_kedes7q', templateParams, '0fqk3GFHeuZ3SHdGz')
    .then((res) => {
      console.log("✅ Email sent successfully:", res);
    })
    .catch((err) => {
      console.error("❌ Email sending failed:", err);
      throw err;
    });
};
