import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Mousewheel, FreeMode } from 'swiper/modules';
import MarqueeBanner from '../../buttons/marquee-banner/marquee-banner';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './past-events.css';

function PastEvents() {
  const pastEvents = [
    { image: 'https://res.cloudinary.com/dea6wzxd8/image/upload/v1754416289/poster13_ck30fu.jpg', alt: 'Event Poster 1' },
    { image: 'https://res.cloudinary.com/dea6wzxd8/image/upload/v1754416289/poster1_i7ni22.jpg', alt: 'Event Poster 2' },
    { image: 'https://res.cloudinary.com/dea6wzxd8/image/upload/v1754416289/poster12_dkrqme.jpg', alt: 'Event Poster 3' },
    { image: 'https://res.cloudinary.com/dea6wzxd8/image/upload/v1754416289/poster6_sdpeem.jpg', alt: 'Event Poster 4' },
    { image: 'https://res.cloudinary.com/dea6wzxd8/image/upload/v1754416288/poster9_m9yeue.jpg', alt: 'Event Poster 5' },
    { image: 'https://res.cloudinary.com/dea6wzxd8/image/upload/v1754416288/poster5_z5r0av.jpg', alt: 'Event Poster 6' },
    { image: 'https://res.cloudinary.com/dea6wzxd8/image/upload/v1754416288/poster7_twayha.jpg', alt: 'Event Poster 7' },
    { image: 'https://res.cloudinary.com/dea6wzxd8/image/upload/v1754416287/poster3_iwtvti.jpg', alt: 'Event Poster 8' },
    { image: 'https://res.cloudinary.com/dea6wzxd8/image/upload/v1754416287/poster2_ow5w51.jpg', alt: 'Event Poster 9' },
    { image: 'https://res.cloudinary.com/dea6wzxd8/image/upload/v1754416287/poster10_pclmw3.jpg', alt: 'Event Poster 10' },
    { image: 'https://res.cloudinary.com/dea6wzxd8/image/upload/v1754416287/poster4_dzdtrn.jpg', alt: 'Event Poster 11' },
    { image: 'https://res.cloudinary.com/dea6wzxd8/image/upload/v1754416287/poster11_gqgvpc.jpg', alt: 'Event Poster 12' },
    { image: 'https://res.cloudinary.com/dea6wzxd8/image/upload/v1754416286/poster8_vpyzbv.jpg', alt: 'Event Poster 13' },
  ];

  return (
    <section id="past-events">
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
