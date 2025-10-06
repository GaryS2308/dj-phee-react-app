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

  const liveStreams = [
    {
      id: 'soulshaker-village-idiot',
      title: 'SOULSHAKER SET @ VILLAGE IDIOT (19/03/2025)',
      embedSrc:
        'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2059987416&color=%234d4a41&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false',
      profileHref: 'https://soundcloud.com/phemelo-ramatlotlo-122152686',
      trackHref:
        'https://soundcloud.com/phemelo-ramatlotlo-122152686/soulshaker-setvillage-idiot19032025'
    },
    {
      id: 'cloud-9-fools-gold',
      title: 'CLOUD 9 SET @ FOOLS GOLD SOCIAL (18/04/2025)',
      embedSrc:
        'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2094318828&color=%234c4c4c&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false',
      profileHref: 'https://soundcloud.com/phemelo-ramatlotlo-122152686',
      trackHref:
        'https://soundcloud.com/phemelo-ramatlotlo-122152686/cloud-9-set-fools-gold-social18042025'
    }
  ];

  useEffect(() => {
    const fetchPastEvents = async () => {
      try {
        const docRef = doc(db, 'siteContent', 'phee');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const events = data.pastEvents || [];
          const featuredEvent = {
            image:
              'https://res.cloudinary.com/dea6wzxd8/image/upload/v1759157514/phee_poster_red_bull_tfospb.jpg',
            alt: 'DJ Phee Red Bull event poster'
          };
          const dedupedEvents = events.filter(
            (event) => event?.image !== featuredEvent.image
          );
          setPastEvents([featuredEvent, ...dedupedEvents]);
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

  return (
    <section id="past-events">
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
      </Helmet>

      <h2 data-reveal data-reveal-order="0">PAST EVENTS</h2>

      {pastEvents.length ? (
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
          data-reveal
          data-reveal-order="1"
        >
          {pastEvents.map((event, index) => (
            <SwiperSlide key={index}>
              <img src={event.image} alt={event.alt} loading="lazy" />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <p className="past-events-loading" data-reveal data-reveal-order="1">
          Loading past events...
        </p>
      )}

      <div data-reveal data-reveal-order="2">
        <MarqueeBanner />
      </div>

      <h3 className="past-events-subheading" data-reveal data-reveal-order="3">
        LIVE SETS
      </h3>

      <div className="past-events-streams" data-reveal data-reveal-order="4">
        {liveStreams.map((stream) => (
          <div key={stream.id} className="past-events-stream">
            <iframe
              className="past-events-stream__player"
              title={stream.title}
              width="100%"
              height="166"
              scrolling="no"
              frameBorder="no"
              allow="autoplay"
              loading="lazy"
              src={stream.embedSrc}
            ></iframe>
            <div className="past-events-stream__links">
              <a
                href={stream.profileHref}
                title="Phemelo Ramatlotlo on SoundCloud"
                target="_blank"
                rel="noopener noreferrer"
              >
                SoundCloud Profile
              </a>
              <span>·</span>
              <a
                href={stream.trackHref}
                title={stream.title}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Track
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default PastEvents;
