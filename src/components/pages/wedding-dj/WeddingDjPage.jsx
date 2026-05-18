'use client';

import Link from 'next/link';
import { getGallerySelection, getOptimizedCloudinaryUrl, usePheeGalleryImages } from '../../shared/usePheeGalleryImages';
import '../service-pages/service-pages.css';
import './WeddingDjPage.css';

const WEDDING_STORIES = [
  {
    kicker: 'Planning with the couple',
    title: 'Music that follows the day instead of forcing it',
    paragraphs: [
      'A strong wedding DJ service starts well before the first guest walks in. PHEE works through the shape of the day with each couple, from the ceremony mood to the first dance, the canapes set, the reception and the point where dinner gives way to a proper dance floor.',
      'That planning matters because the room changes every hour. Family members, close friends, older guests and your core party crowd all arrive with different expectations. The goal is to make the whole day feel connected, not to treat each part like a separate playlist.'
    ],
    list: [
      'Ceremony music can be kept warm, elegant and understated',
      'Cocktail hour can lean into Afro House, Deep House or lighter groove-led selections',
      'Reception sets are built live around the crowd rather than locked in ahead of time'
    ],
    alt: 'DJ PHEE performing during a wedding reception in Cape Town'
  },
  {
    kicker: 'For Cape Town and Winelands venues',
    title: 'Comfortable in polished venues, outdoor spaces and long reception nights',
    paragraphs: [
      'Cape Town weddings rarely all look the same. One booking might be in the city with a tighter schedule and a later party crowd. Another might be on a wine farm in Stellenbosch or Franschhoek where the energy builds slowly through sunset drinks and dinner before opening up later.',
      'PHEE adjusts to that naturally. He has played different kinds of rooms, understands how venue flow affects the music, and stays easy to work with for planners, coordinators and couples who want someone calm and prepared on the day.'
    ],
    alt: 'Wedding crowd dancing around DJ PHEE at a south african venue'
  },
  {
    kicker: 'Sound and style',
    title: 'Afrotech at the core, with range where the night needs it',
    paragraphs: [
      'Afrotech and Afro House sit comfortably at the centre of PHEE\'s sound, especially for couples who want the dance floor to feel modern, soulful and rooted in rhythm. That said, weddings are rarely about one lane only. Sometimes the right move is a stretch of deeper grooves, sometimes it is a familiar sing-along moment, and sometimes it is a clean run of commercial favourites that keeps every age group in the room.',
      'What couples usually want is simple: a night that feels like them. That is the brief PHEE works from. The set stays flexible, the transitions stay smooth, and the floor never feels like it has been handed over to autopilot.'
    ],
    alt: 'Wedding guests celebrating while DJ PHEE keeps the dance floor full'
  }
];

const WEDDING_SNAPSHOT = [
  ['Best fit', 'Ceremony music, canapes, reception and full evening celebrations'],
  ['Music style', 'Afrotech, Afro House, Deep House and crossover favourites on request'],
  ['Service area', 'Cape Town, Stellenbosch, Franschhoek, Hermanus and the wider Western Cape'],
  ['Starting rate', 'From R2,000 per hour, quoted around your venue, timing and setup']
];

const WeddingDjPage = () => {
  const galleryImages = usePheeGalleryImages();
  const storyImages = getGallerySelection(galleryImages, [0, 5, 2]);

  return (
    <section className="service-page wedding-dj reveal-scope">
      <div className="service-page__inner">
        <div className="service-page__intro" data-reveal data-reveal-order="0">
          <div className="service-page__intro-copy">
            <p className="service-page__eyebrow">Wedding DJ Cape Town</p>
            <h2 className="service-page__title">Wedding music that feels personal from the first song to the last dance</h2>
            <p className="service-page__lead">
              Booking a wedding DJ in Cape Town is not only about finding someone who can fill a dance floor. It is about trusting someone with the tone of the day, the rhythm of the reception and the moments your guests will remember long after the venue clears out.
            </p>
            <p>
              PHEE brings warmth, timing and real crowd awareness to weddings across Cape Town and the Western Cape. He is known for reading a room properly, keeping communication easy, and building nights that feel natural rather than over-rehearsed.
            </p>
          </div>

          <aside className="service-page__snapshot">
            <h3 className="service-page__snapshot-title">What couples can expect</h3>
            <p className="service-page__snapshot-intro">
              A calm booking process, a clean setup, and a set that grows with the room instead of rushing it.
            </p>
            <ul className="service-page__snapshot-list">
              {WEDDING_SNAPSHOT.map(([label, value]) => (
                <li key={label}>
                  <span className="service-page__snapshot-label">{label}</span>
                  <span className="service-page__snapshot-value">{value}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>

        <div className="service-page__stories">
          {WEDDING_STORIES.map((story, index) => {
            const image = storyImages[index];

            return (
              <article
                key={story.title}
                className={`service-page__story${index % 2 === 1 ? ' is-reversed' : ''}`}
                data-reveal
                data-reveal-order={index + 1}
              >
                <div className="service-page__story-copy">
                  <p className="service-page__story-kicker">{story.kicker}</p>
                  <h3 className="service-page__story-title">{story.title}</h3>
                  {story.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {story.list ? (
                    <ul className="service-page__story-list">
                      {story.list.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                <div className="service-page__media">
                  {image ? (
                    <img
                      src={getOptimizedCloudinaryUrl(image.src, { width: 1100, height: 1200 })}
                      srcSet={`${getOptimizedCloudinaryUrl(image.src, { width: 480, height: 560 })} 480w, ${getOptimizedCloudinaryUrl(image.src, { width: 720, height: 840 })} 720w, ${getOptimizedCloudinaryUrl(image.src, { width: 1100, height: 1200 })} 1100w`}
                      sizes="(max-width: 980px) 100vw, 46vw"
                      alt={image.alt || story.alt}
                      loading="lazy"
                      width="1100"
                      height="1200"
                    />
                  ) : (
                    <div className="service-page__media-placeholder" aria-hidden="true" />
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <div className="service-page__cta" data-reveal data-reveal-order="4">
          <h3>Get a wedding DJ quote</h3>
          <p>
            Share your date, venue, expected timing and any music notes on the <Link href="/booking">booking form</Link>. PHEE will reply with availability and a tailored quote. For peak-season Saturdays, it is worth getting in touch early.
          </p>
          <Link href="/booking#booking" className="cta-button service-page__cta-btn">
            REQUEST A WEDDING QUOTE
          </Link>
        </div>

        <div className="service-page__crosslinks" data-reveal data-reveal-order="5">
          <h3>Also planning another kind of event?</h3>
          <p>
            If you are comparing services, you can also view the corporate and private event pages for a clearer sense of how PHEE approaches each booking style.
          </p>
          <div className="service-page__link-pills">
            <Link href="/corporate-dj-cape-town" className="service-page__link-pill">
              Corporate DJ
            </Link>
            <Link href="/event-dj-cape-town" className="service-page__link-pill">
              Event DJ
            </Link>
            <Link href="/gallery" className="service-page__link-pill">
              View Gallery
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WeddingDjPage;
