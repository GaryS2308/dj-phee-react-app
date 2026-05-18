'use client';

import Link from 'next/link';
import { getGallerySelection, getOptimizedCloudinaryUrl, usePheeGalleryImages } from '../../shared/usePheeGalleryImages';
import '../service-pages/service-pages.css';
import './CorporateDjPage.css';

const CORPORATE_STORIES = [
  {
    kicker: 'Easy for planners',
    title: 'Professional enough for the schedule, relaxed enough for the room',
    paragraphs: [
      'Corporate events move through different gears. There can be guest arrivals, presentations, awards, dinner service and a late shift into celebration. The DJ has to understand each stage without forcing attention onto the booth when the event should still feel polished.',
      'That is where PHEE is strong. He is responsive in the lead-up, clear about setup needs, punctual on the day and dependable once the programme starts. Event planners do not need to manage him through every transition because he understands timing, reads cues quickly and keeps the room feeling under control.'
    ],
    alt: 'DJ PHEE performing at a polished corporate event in Cape Town'
  },
  {
    kicker: 'Company parties and launches',
    title: 'The brief can stay tight while the energy still opens up later',
    paragraphs: [
      'Some corporate bookings want music that sits neatly in the background until the formalities are done. Others want a fuller entertainment arc where the dance floor becomes part of the event story. PHEE can do both, whether the booking is a year-end function, a conference after-party, a client event or a product launch.',
      'He works around the brand, the audience and the tone of the evening. That can mean clean edits and restrained dinner music early on, then a confident move into Afro House, Afrotech, commercial favourites or a blend that fits the crowd once the room is ready.'
    ],
    list: [
      'Year-end functions that need a later dance-floor lift',
      'Brand activations where music supports the experience without overpowering it',
      'Formal events that still want personality once the programme is complete'
    ],
    alt: 'Cape Town corporate guests enjoying a DJ PHEE set after the formal programme'
  },
  {
    kicker: 'Cape Town and beyond',
    title: 'A clean setup, flexible music policy and clear communication',
    paragraphs: [
      'Corporate clients usually care about the same three things: reliability, suitability and ease. PHEE brings professional equipment unless venue production is already in place, adapts to in-house sound where needed, and confirms details clearly before the booking is locked in.',
      'If your team has music boundaries, a brand tone, or a specific crowd mix to consider, that gets handled upfront. The result is a corporate event DJ service in Cape Town that feels premium but still warm, with enough flexibility to make the night enjoyable rather than rigid.'
    ],
    alt: 'DJ PHEE playing to a dressed-up corporate crowd in the Western Cape'
  }
];

const CORPORATE_SNAPSHOT = [
  ['Best fit', 'Year-end functions, launches, networking events, dinners and after-parties'],
  ['Music style', 'Clean edits, Afro House, Afrotech, Deep House and curated crossover sets'],
  ['Planner value', 'Punctual, easy to brief, low management on the day'],
  ['Starting rate', 'From R2,000 per hour, with quotes shaped around timing and technical needs']
];

const CorporateDjPage = () => {
  const galleryImages = usePheeGalleryImages();
  const storyImages = getGallerySelection(galleryImages, [1, 4, 6]);

  return (
    <section className="service-page corporate-dj reveal-scope">
      <div className="service-page__inner">
        <div className="service-page__intro" data-reveal data-reveal-order="0">
          <div className="service-page__intro-copy">
            <p className="service-page__eyebrow">Corporate Event DJ Cape Town</p>
            <h2 className="service-page__title">Corporate DJ sets that feel polished, current and easy to trust</h2>
            <p className="service-page__lead">
              Corporate entertainment works best when it supports the event rather than fighting for attention. Guests should feel looked after, the energy should move at the right pace, and the music should sound intentional from the first arrival drink to the point the room finally lets go.
            </p>
            <p>
              PHEE brings that balance to corporate events across Cape Town. He knows when to stay subtle, when to add warmth, and when to turn a formal room into a real celebration without making it feel forced.
            </p>
          </div>

          <aside className="service-page__snapshot">
            <h3 className="service-page__snapshot-title">What makes the service work</h3>
            <p className="service-page__snapshot-intro">
              This is built for organisers who want a DJ they can brief clearly and then trust to handle the room.
            </p>
            <ul className="service-page__snapshot-list">
              {CORPORATE_SNAPSHOT.map(([label, value]) => (
                <li key={label}>
                  <span className="service-page__snapshot-label">{label}</span>
                  <span className="service-page__snapshot-value">{value}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>

        <div className="service-page__stories">
          {CORPORATE_STORIES.map((story, index) => {
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
          <h3>Request a corporate DJ quote</h3>
          <p>
            Use the <Link href="/booking">booking form</Link> to share your date, venue, running order and anything the brand or client needs the music to respect. PHEE will come back with availability, setup notes and a quote shaped around the event.
          </p>
          <Link href="/booking#booking" className="cta-button service-page__cta-btn">
            REQUEST A CORPORATE QUOTE
          </Link>
        </div>

        <div className="service-page__crosslinks" data-reveal data-reveal-order="5">
          <h3>Need a different event profile?</h3>
          <p>
            If the booking is more personal or more party-led, the wedding and event pages will give you a better sense of how the approach shifts with the room.
          </p>
          <div className="service-page__link-pills">
            <Link href="/wedding-dj-cape-town" className="service-page__link-pill">
              Wedding DJ
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

export default CorporateDjPage;
