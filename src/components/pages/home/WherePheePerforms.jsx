import React from 'react';
import Link from 'next/link';

const performanceSpots = [
  {
    title: 'Corporate Events',
    description: 'Professional DJ for corporate functions, company parties and year-end events across Cape Town.',
    href: '/corporate-dj-cape-town',
    linkLabel: 'Corporate DJ info'
  },
  {
    title: 'Clubs & Nightlife',
    description: "Regularly performing at Cape Town's top clubs and venues with deep, energetic Afrotech sets.",
    href: null
  },
  {
    title: 'Festivals',
    description: 'Festival-ready sound with dynamic sets built for large crowds and outdoor stages.',
    href: null
  },
  {
    title: 'Private Events',
    description: 'Available for weddings, birthday celebrations and intimate private parties.',
    href: '/event-dj-cape-town',
    linkLabel: 'Event DJ info'
  }
];

const WherePheePerforms = () => {
  return (
    <section id="where-phee-performs" className="reveal-scope">
      <h2 data-reveal data-reveal-order="0">WHERE PHEE PERFORMS</h2>
      <p className="where-intro" data-reveal data-reveal-order="1">
        From corporate events to Cape Town&apos;s nightlife and festival stages, DJ PHEE brings a high-energy Afrotech sound to every environment.
      </p>

      <div className="where-grid">
        {performanceSpots.map((spot, index) => (
          <div
            key={spot.title}
            className="where-card"
            data-reveal
            data-reveal-order={index + 2}
          >
            <h3>{spot.title}</h3>
            <p>{spot.description}</p>
            {spot.href ? (
              <Link href={spot.href} className="where-card__link">
                {spot.linkLabel}
              </Link>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
};

export default WherePheePerforms;
