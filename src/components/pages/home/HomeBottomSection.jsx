import './HomeBottomSection.css';

const faqs = [
  {
    q: 'How much does it cost to book DJ PHEE?',
    a: 'Rates start at R2,000 per hour. Select your date and duration on the booking form to see an instant estimate before submitting.'
  },
  {
    q: 'What types of events does DJ PHEE perform at?',
    a: 'Weddings, private parties, year-end functions, brand launches, club nights, festivals and corporate events across South Africa and internationally.'
  },
  {
    q: 'What is Afrotech and how does it differ from Afro House?',
    a: 'Afrotech layers traditional African percussion and instruments over modern house and techno production for a high-energy sound. Afro House leans into groove, soul and vocal-led arrangements. PHEE performs both and reads the room to decide which fits the moment.'
  },
  {
    q: 'Does DJ PHEE play other genres besides Afrotech?',
    a: 'Yes. Sets are built around the event and the crowd, drawing from Deep House, hip-hop, Top 40 and more. The Afrotech expertise is the foundation, but the set list is always shaped by what the room needs.'
  },
  {
    q: 'Does DJ PHEE travel for gigs?',
    a: 'Yes. DJ PHEE is based in Cape Town and available for bookings across South Africa and internationally. Travel costs are quoted separately and covered by the client. International touring enquiries are welcome.'
  },
  {
    q: 'How far in advance should I book?',
    a: '4 to 8 weeks is recommended for most events. For weddings and large festivals, earlier is better as peak dates fill up quickly.'
  }
];

const HomeBottomSection = () => {
  return (
    <section id="home-faq" className="home-faq reveal-scope">
      <div className="home-faq__inner">
        <h2 className="home-faq__heading" data-reveal data-reveal-order="0">COMMON QUESTIONS</h2>
        <div className="home-faq__list" data-reveal data-reveal-order="1">
          {faqs.map(({ q, a }) => (
            <details key={q} className="home-faq__item">
              <summary className="home-faq__question">
                <span>{q}</span>
                <span className="home-faq__icon" aria-hidden="true" />
              </summary>
              <p className="home-faq__answer">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeBottomSection;
