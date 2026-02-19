'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { sendResponseEmail } from '../../buttons/emailjs/emailjs';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebase';

const CELEBRATION_IMAGES = [
  'https://res.cloudinary.com/dea6wzxd8/image/upload/v1771491718/br_1_i4qppm.jpg',
  'https://res.cloudinary.com/dea6wzxd8/image/upload/v1771491718/br_12_anunyr.jpg',
  'https://res.cloudinary.com/dea6wzxd8/image/upload/v1771491717/br_6_jgjjke.jpg',
  'https://res.cloudinary.com/dea6wzxd8/image/upload/v1771491718/br_11_swbpgr.jpg',
  'https://res.cloudinary.com/dea6wzxd8/image/upload/v1771491717/br_5_goqhnc.jpg',
  'https://res.cloudinary.com/dea6wzxd8/image/upload/v1771491717/br_4_khgvmt.jpg',
  'https://res.cloudinary.com/dea6wzxd8/image/upload/v1771491717/br_3_fkpva4.jpg',
  'https://res.cloudinary.com/dea6wzxd8/image/upload/v1771491717/br_8_phve69.jpg',
  'https://res.cloudinary.com/dea6wzxd8/image/upload/v1771491717/br_7_s2eroj.jpg',
  'https://res.cloudinary.com/dea6wzxd8/image/upload/v1771491717/br_10_eddnrm.jpg',
  'https://res.cloudinary.com/dea6wzxd8/image/upload/v1771491717/br_2_fvmtyb.jpg',
  'https://res.cloudinary.com/dea6wzxd8/image/upload/v1771491717/br_9_kjzz2a.jpg'
];

const BookingResponse = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [fetchState, setFetchState] = useState('loading');
  const [status, setStatus] = useState('idle');
  const [booking, setBooking] = useState(null);
  const [confettiPieces, setConfettiPieces] = useState([]);

  const heroImage = useMemo(() => {
    const index = Math.floor(Math.random() * CELEBRATION_IMAGES.length);
    return CELEBRATION_IMAGES[index];
  }, []);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!token) {
        setFetchState('invalid');
        return;
      }

      try {
        const q = query(collection(db, 'bookings'), where('token', '==', token));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          setFetchState('invalid');
          return;
        }

        setBooking(snapshot.docs[0].data());
        setFetchState('ready');
      } catch (error) {
        console.error('Failed to load booking details:', error);
        setFetchState('error');
      }
    };

    fetchBooking();
  }, [token]);

  useEffect(() => {
    if (status !== 'accepted') return;

    const palette = ['#ff4d6d', '#ffd166', '#06d6a0', '#4cc9f0', '#f77f00', '#e63946'];
    const pieces = Array.from({ length: 44 }, (_, index) => ({
      id: index,
      left: Math.random() * 100,
      duration: 2.2 + Math.random() * 2.4,
      delay: Math.random() * 0.6,
      rotate: Math.floor(Math.random() * 360),
      color: palette[index % palette.length]
    }));
    setConfettiPieces(pieces);
  }, [status]);

  const parseDurationToHours = (duration) => {
    if (!duration) return 0;
    let totalHours = 0;
    const hrMatch = duration.match(/(\d+)hr/);
    if (hrMatch) totalHours += parseInt(hrMatch[1], 10);
    if (duration.includes('30min') || duration.includes('30m')) totalHours += 0.5;
    return totalHours;
  };

  const estimatedAmount = booking ? parseDurationToHours(booking.duration) * 1500 : 0;

  const handleAccept = () => {
    if (status === 'sending' || fetchState !== 'ready' || !token) return;

    setStatus('sending');

    sendResponseEmail(token, 'accept')
      .then(() => {
        setStatus('accepted');
      })
      .catch(() => {
        setStatus('error');
      });
  };

  return (
    <section className="booking-response">
      <header className="booking-response__heading">
        <p className="booking-response__eyebrow">DJ Booking Control</p>
        <h2>New Booking Request</h2>
      </header>

      <figure className="booking-response__hero">
        <img
          src={heroImage}
          alt="Celebration moment"
          className="booking-response__hero-image"
          loading="eager"
        />
        <div className="booking-response__hero-overlay" />
      </figure>

      <div className="booking-response__panel">
        {fetchState === 'loading' && <p className="booking-response__state">Loading booking details...</p>}
        {fetchState === 'invalid' && (
          <p className="booking-response__state booking-response__state--error">
            This booking token is invalid or has expired.
          </p>
        )}
        {fetchState === 'error' && (
          <p className="booking-response__state booking-response__state--error">
            Booking details could not be loaded. Please try again.
          </p>
        )}

        {fetchState === 'ready' && booking && (
          <>
            <div className="booking-response__card">
              <h3>Event Summary</h3>
              <dl className="booking-response__details">
                <div><dt>Name</dt><dd>{booking.name || 'N/A'}</dd></div>
                <div><dt>Email</dt><dd>{booking.email || 'N/A'}</dd></div>
                <div><dt>Phone</dt><dd>{booking.phone || 'N/A'}</dd></div>
                <div><dt>Event Type</dt><dd>{booking.event || 'N/A'}</dd></div>
                <div><dt>Date</dt><dd>{booking.event_date || 'N/A'}</dd></div>
                <div><dt>Start Time</dt><dd>{booking.start_time || 'N/A'}</dd></div>
                <div><dt>End Time</dt><dd>{booking.end_time || 'N/A'}</dd></div>
                <div><dt>Duration</dt><dd>{booking.duration || 'N/A'}</dd></div>
                <div><dt>Location</dt><dd>{booking.location || 'N/A'}</dd></div>
                <div><dt>Estimate</dt><dd>{`R${estimatedAmount}`}</dd></div>
              </dl>
              {booking.details && <p className="booking-response__notes">{booking.details}</p>}
            </div>

            <div className="booking-response__actions">
              <button
                onClick={handleAccept}
                className="booking-response-btn"
                disabled={status === 'sending' || status === 'accepted'}
              >
                {status === 'sending' ? 'SENDING CONFIRMATION...' : 'ACCEPT BOOKING HERE BOSS'}
              </button>
            </div>
          </>
        )}

        {status === 'accepted' && (
          <p className="booking-response__state booking-response__state--success">
            Booking accepted. Client has been notified.
          </p>
        )}
        {status === 'error' && (
          <p className="booking-response__state booking-response__state--error">
            Something went wrong while sending the confirmation.
          </p>
        )}
      </div>

      {status === 'accepted' && (
        <div className="booking-response__confetti" aria-hidden="true">
          {confettiPieces.map((piece) => (
            <span
              key={piece.id}
              className="booking-response__confetti-piece"
              style={{
                left: `${piece.left}%`,
                animationDelay: `${piece.delay}s`,
                animationDuration: `${piece.duration}s`,
                transform: `rotate(${piece.rotate}deg)`,
                background: piece.color
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default BookingResponse;
