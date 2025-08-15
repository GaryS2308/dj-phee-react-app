import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Mousewheel, FreeMode } from 'swiper/modules';
import MarqueeBanner from '../../buttons/marquee-banner/marquee-banner';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase'; // adjust path to your firebase config
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './past-events.css';

function PastEvents() {
  const [pastEvents, setPastEvents] = useState([]);
  const [meta, setMeta] = useState({ title: '', description: '' });

  useEffect(() => {
    const fetchPastEvents = async () => {
      try {
        const docRef = doc(db, 'siteContent', 'phee');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPastEvents(data.pastEvents || []);
          setMeta({
            title: data.pastEventsMetaTitle || 'Past Events — DJ Phee',
            description:
              data.pastEventsMetaDescription ||
              'Check out the vibrant past events DJ Phee has rocked, from clubs to weddings and festivals. Experience the energy and vibe captured in these posters and photos.'
          });
        } else {
          console.error('No document found!');
        }
      } catch (error) {
        console.error('Error fetching past events:', error);
      }
    };

    fetchPastEvents();
  }, []);

  if (!pastEvents.length) {
    return <p>Loading past events...</p>; // optional
  }

  return (
    <section id="past-events">
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
      </Helmet>

      <h2>PAST EVENTS</h2>
      <Swiper
        modules={[Navigation, Pagination, Mousewheel, FreeMode]}
        navigation
        pagination={{ clickable: true }}
        loop={true}
        grabCursor={true}
        mousewheel={{ forceToAxis: true }}
        speed={600}
        freeMode={true}
        spaceBetween={20}
        slidesPerView={4}
        breakpoints={{
          0: { slidesPerView: 1, spaceBetween: 10 }, // mobile
          768: { slidesPerView: 4, spaceBetween: 20 }
        }}
        className="past-events-swiper"
      >
        {pastEvents.map((event, index) => (
          <SwiperSlide key={index}>
            <img src={event.image} alt={event.alt} />
          </SwiperSlide>
        ))}
      </Swiper>
      <MarqueeBanner />
    </section>
  );
}

export default PastEvents;
