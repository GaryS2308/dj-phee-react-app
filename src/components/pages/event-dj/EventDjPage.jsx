'use client';

import Link from 'next/link';
import { getGallerySelection, getOptimizedCloudinaryUrl, usePheeGalleryImages } from '../../shared/usePheeGalleryImages';
import '../service-pages/service-pages.css';
import './EventDjPage.css';

const EVENT_STORIES = [
  {
    kicker: 'Private parties and celebrations',
    title: 'The kind of event DJ who can make a mixed room feel connected',
    paragraphs: [
      'Some private events have a very clear brief. Others are more instinctive. The client just wants the room to feel good, the music to move naturally and the crowd to stay with it. That is where PHEE does some of his best work as an event DJ in Cape Town.',
      'He is comfortable with birthdays, anniversaries, rooftop sessions, private dinners that turn into dance floors, launch parties and celebrations that sit somewhere between formal and loose. The thread running through all of them is simple: the music has to feel right for the people in the room, not copied from another booking.'
    ],
    alt: 'DJ PHEE playing to guests at a private event in Cape Town'
  },
  {
    kicker: 'Style and range',
    title: 'Afrotech-led when it suits, wider when the crowd calls for it',
    paragraphs: [
      'PHEE is known for Afrotech, Afro House and deeper groove-led sets, but private events often need more range than a single label suggests. A birthday crowd might want house early, vocal favourites later and a few surprise turns that wake the room up. A brand event may need something more curated and restrained before the energy opens.',
      'That flexibility is part of the service. Requests can be worked in, playlist direction can be discussed ahead of time, and the final shape still gets built live around how the guests are actually responding.'
    ],
    list: [
      'Birthdays and milestone celebrations',
      'Rooftop events, house parties and venue buyouts',
      'Brand activations, gallery openings and curated experiences'
    ],
    alt: 'Cape Town party crowd dancing while DJ PHEE performs'
  },
  {
    kicker: 'Where PHEE plays',
    title: 'Available locally across Cape Town, available for travel around South Africa and internationally',
    paragraphs: [
      'Not every event is in the city centre. PHEE regularly takes bookings across Cape Town, Stellenbosch, Franschhoek, Hermanus and the wider Western Cape, with travel arranged clearly as part of the quote. He adapts comfortably whether the setup is in a private home, a venue courtyard, a restaurant buyout or a large-scale event environment.',
      'If you want a party DJ who can bring energy without turning the event into something generic, this is where the service stands out. It keeps personality in the room, respects the host\'s brief and still leaves space for the night to surprise people.'
    ],
    alt: 'DJ PHEE performing at a lively South African event with guests dancing'
  }
];

const EVENT_SNAPSHOT = [
  ['Best fit', 'Private parties, birthdays, rooftop events, brand activations and one-off celebrations'],
  ['Music style', 'Afrotech, Afro House, Deep House, tech house and crossover requests'],
  ['Coverage', 'Cape Town, Stellenbosch, Franschhoek, Hermanus and surrounding areas'],
  ['Starting rate', 'From R2,000 per hour, depending on timing, location and setup']
];

const EventDjPage = () => {
  const galleryImages = usePheeGalleryImages();
  const storyImages = getGallerySelection(galleryImages, [2, 7, 3]);

  return (
    <section className="service-page event-dj reveal-scope">
      <div className="service-page__inner">
        <div className="service-page__intro" data-reveal data-reveal-order="0">
          <div className="service-page__intro-copy">
            <p className="service-page__eyebrow">Event DJ Cape Town</p>
            <h2 className="service-page__title">Private event DJ sets with more personality and less formula</h2>
            <p className="service-page__lead">
              The best event bookings are usually the ones where people stop thinking about the music and just feel the night working. That takes more than a loud set. It takes timing, range and a DJ who knows how to shape energy without making it obvious.
            </p>
            <p>
              PHEE brings that approach to private events across Cape Town and the Western Cape, from intimate celebrations to bigger rooms that need a stronger performance edge.
            </p>
          </div>

          <aside className="service-page__snapshot">
            <h3 className="service-page__snapshot-title">What this service covers</h3>
            <p className="service-page__snapshot-intro">
              Built for clients who want the night to feel elevated, social and easy to settle into.
            </p>
            <ul className="service-page__snapshot-list">
              {EVENT_SNAPSHOT.map(([label, value]) => (
                <li key={label}>
                  <span className="service-page__snapshot-label">{label}</span>
                  <span className="service-page__snapshot-value">{value}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>

        <div className="service-page__stories">
          {EVENT_STORIES.map((story, index) => {
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
          <h3>Get an event DJ quote</h3>
          <p>
            Send through your date, location, event type and the kind of mood you want to create on the <Link href="/booking">booking form</Link>. PHEE will reply with availability and a quote tailored to the event.
          </p>
          <Link href="/booking#booking" className="cta-button service-page__cta-btn">
            REQUEST A QUOTE
          </Link>
        </div>

        <div className="service-page__crosslinks" data-reveal data-reveal-order="5">
          <h3>Looking for a more specific format?</h3>
          <p>
            If the booking is wedding-led or more brand and corporate focused, the other service pages break down those formats in more detail.
          </p>
          <div className="service-page__link-pills">
            <Link href="/wedding-dj-cape-town" className="service-page__link-pill">
              Wedding DJ
            </Link>
            <Link href="/corporate-dj-cape-town" className="service-page__link-pill">
              Corporate DJ
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

export default EventDjPage;
