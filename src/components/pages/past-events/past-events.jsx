'use client';

import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Mousewheel, FreeMode } from 'swiper/modules';
import MarqueeBanner from '../../buttons/marquee-banner/marquee-banner';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase'; // adjust path to your firebase config
import LazySoundCloudEmbed from './LazySoundCloudEmbed';

function PastEvents() {
  const [pastEvents, setPastEvents] = useState([]);

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
          const latestPoster = {
            image:
              'https://res.cloudinary.com/dea6wzxd8/image/upload/v1761147324/Phee_poster_rage_inmpxh.jpg',
            alt: 'DJ Phee Rage event poster'
          };
          const featuredEvent = {
            image:
              'https://res.cloudinary.com/dea6wzxd8/image/upload/v1759157514/phee_poster_red_bull_tfospb.jpg',
            alt: 'DJ Phee Red Bull event poster'
          };
          const dedupedEvents = events.filter(
            (event) =>
              event?.image !== featuredEvent.image &&
              event?.image !== latestPoster.image
          );
          setPastEvents([latestPoster, featuredEvent, ...dedupedEvents]);
        } else {
          console.error('No document found!');
        }
      } catch (error) {
        console.error('Error fetching past events:', error);
      }
    };

    fetchPastEvents();
  }, []);

  const getOptimizedCloudinaryUrl = (url, { width, height }) => {
    if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
    const transformation = `f_auto,q_auto,dpr_auto${width ? `,w_${width}` : ''}${height ? `,h_${height}` : ''},c_limit`;
    return url.replace('/upload/', `/upload/${transformation}/`);
  };

  return (
    <section id="past-events" className="reveal-scope">
      <h2 data-reveal data-reveal-order="0">PAST EVENTS</h2>

      <p className="past-events-lead" data-reveal data-reveal-order="1">
        PHEE has performed at a wide range of Cape Town clubs, festivals and special events, including some of the city’s most recognised nightlife venues. His past sets span intimate club nights, large event productions and private celebrations, showcasing his ability to deliver across multiple environments.
      </p>
      <p className="past-events-lead" data-reveal data-reveal-order="2">
        From late-night club energy to high-profile festival stages and corporate gatherings, these past events highlight his versatility as a Cape Town DJ for hire.
      </p>

      <p className="past-events-lead" data-reveal data-reveal-order="3">
        Two of PHEE&apos;s most recent recorded sets capture the range well. The SOULSHAKER SET at The Village Idiot in March 2025 leaned into deep, groove-heavy Afro House that built slowly over the night. The kind of set that rewards a crowd that stays in the room. The CLOUD 9 SET at Fools Gold Social in April 2025 moved at a higher tempo, with Afrotech energy that pushed the dance floor from the first track. Both mixes are available to stream in the Live Sets section below.
      </p>
      <p className="past-events-lead" data-reveal data-reveal-order="4">
        Other regular PHEE venues include Halo Nightclub, where the production scale calls for peak-time sets built around high-energy Afrotech transitions; Cabo Beach Club, which rewards a warmer, more coastal-leaning sound that holds a crowd through longer grooves; and Modular, a venue with a technically astute crowd that demands precision in the mix and curation in the selection. Each of these spaces has shaped how PHEE approaches a set in a specific environment, and that experience carries directly into every booking, whether that is a club night, corporate function or private event.
      </p>

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
          data-reveal-order="5"
        >
          {pastEvents.map((event, index) => (
            <SwiperSlide key={index}>
              <img
                src={getOptimizedCloudinaryUrl(event.image, { width: 1100, height: 1600 })}
                srcSet={`${getOptimizedCloudinaryUrl(event.image, { width: 360, height: 540 })} 360w, ${getOptimizedCloudinaryUrl(event.image, { width: 540, height: 810 })} 540w, ${getOptimizedCloudinaryUrl(event.image, { width: 720, height: 1080 })} 720w, ${getOptimizedCloudinaryUrl(event.image, { width: 1100, height: 1600 })} 1100w`}
                sizes="(max-width: 480px) 82vw, (max-width: 900px) 60vw, 320px"
                alt={event.alt}
                loading="lazy"
                width="640"
                height="960"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <p className="past-events-loading" data-reveal data-reveal-order="3">
          Loading past events...
        </p>
      )}

      <div data-reveal data-reveal-order="6">
        <MarqueeBanner />
      </div>

      <h3 id="live-mixes" className="past-events-subheading" data-reveal data-reveal-order="7">
        LIVE SETS
      </h3>

      <p className="past-events-lead" data-reveal data-reveal-order="8">
        Explore PHEE’s latest live sets recorded at Cape Town clubs, festivals and private events. His Afrotech sound blends deep rhythms with high-energy transitions, creating dynamic sets built for both nightlife and large-scale events. These mixes capture the same performance style he brings to corporate functions, club nights and festival appearances across the city.
      </p>

      <div className="past-events-streams" data-reveal data-reveal-order="9">
        {liveStreams.map((stream) => (
          <LazySoundCloudEmbed
            key={stream.id}
            embedUrl={stream.embedSrc}
            title={stream.title}
            profileHref={stream.profileHref}
            trackHref={stream.trackHref}
          />
        ))}
      </div>
    </section>
  );
}

export default PastEvents;
